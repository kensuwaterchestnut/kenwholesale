/************************************
 * KenSu 批發 - Part 2 / 3
 * 複製此檔案全部內容 → 貼到 Part1 下面
 ************************************/

function handleOrderQuery_(data){
  const orderIdRaw = (data.orderId || data.order_no || data.no || '').toString();
  const orderId = normalizeOrderId_(orderIdRaw);
  const email = (data.email || '').toString().trim().toLowerCase();
  if (!orderId && !email) return {ok:false, msg:'缺少查詢條件（訂單編號或 Email）'};
  const shO=$.sheet(SHEET_ORDER);
  const head=getHeader_(shO);
  const ix = {
    id: head.indexOf('訂單編號'),
    name: head.indexOf('姓名'),
    email: head.indexOf('Email'),
    created: head.indexOf('建立時間'),
    total: head.indexOf('應付金額'),
    pay: head.indexOf('款項狀態'),
    shipState: head.indexOf('出貨狀態'),
    shipDate: head.indexOf('出貨日期')
  };
  const last=shO.getLastRow();
  if (last<2) return {ok:true, orders:[]};
  const vals = shO.getRange(2,1,last-1,head.length).getValues();
  const matched = [];
  for (let i=0;i<vals.length;i++){
    const id = normalizeOrderId_(vals[i][ix.id]||'');
    const em = String(vals[i][ix.email]||'').trim().toLowerCase();
    const hit = orderId ? (id===orderId) : (email && em===email);
    if (!hit) continue;
    matched.push({
      id, name: String(vals[i][ix.name]||''), email: em,
      ts: toDateTimeStr_(vals[i][ix.created]),
      total: Number(vals[i][ix.total])||0,
      status: buildStatus_(String(vals[i][ix.pay]||''), String(vals[i][ix.shipState]||'')),
      shipDate: toDateStr_(vals[i][ix.shipDate])
    });
  }
  if (matched.length){
    const shI=$.sheet(SHEET_ITEM);
    const hi=getHeader_(shI);
    const ixI={
      id: hi.indexOf('訂單編號'),
      name: hi.indexOf('品名'),
      type: hi.indexOf('類型'),
      weight: hi.indexOf('溫層'),
      spec: hi.indexOf('規格'),
      price: hi.indexOf('單價'),
      qty: hi.indexOf('數量')
    };
    const valsI = shI.getDataRange().getValues();
    matched.forEach(m=>{
      const items=[];
      for (let r=1; r<valsI.length; r++){
        if (normalizeOrderId_(valsI[r][ixI.id]||'') === m.id){
          items.push({
            name: valsI[r][ixI.name]||'',
            type: valsI[r][ixI.type]||'',
            shipGroup: valsI[r][ixI.weight]||'',
            spec: valsI[r][ixI.spec]||'',
            price: Number(valsI[r][ixI.price])||0,
            qty: Number(valsI[r][ixI.qty])||0
          });
        }
      }
      m.items = items;
    });
  }
  return {ok:true, orders: matched};
}

function buildStatus_(pay, ship){
  const sPay = (pay||'').trim();
  const sShip = (ship||'').trim();
  if (/已出貨/.test(sShip)) return '已出貨';
  if (/已匯款|已收款/.test(sPay)) return '已收款（待出貨）';
  if (/待匯款|未匯款/.test(sPay)) return '待匯款';
  return sShip || sPay || '處理中';
}

function normalizeOrderId_(s){
  return String(s||'').trim().replace(/^#/,'').toUpperCase();
}

function toDateTimeStr_(v){
  if (!v && v!==0) return '';
  if (Object.prototype.toString.call(v)==='[object Date]') return Utilities.formatDate(v, TZ, 'yyyy-MM-dd HH:mm:ss');
  const s=String(v).trim();
  if (!s) return '';
  if (/^\d{4}[/-]\d{1,2}[/-]\d{1,2}\s+\d{1,2}:\d{2}(:\d{2})?$/.test(s)) return s.length===16 ? s+':00' : s;
  if (/^\d{4}[/-]\d{1,2}[/-]\d{1,2}/.test(s)) return s.replace(/\//g,'-').slice(0,10) + ' 00:00:00';
  if (/^\d{10,13}$/.test(s)){ const n=Number(s.length===13?Number(s):Number(s)*1000); return Utilities.formatDate(new Date(n), TZ, 'yyyy-MM-dd HH:mm:ss'); }
  return s;
}

function toDateStr_(v){
  if (!v && v!==0) return '';
  if (Object.prototype.toString.call(v)==='[object Date]') return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  const s=String(v).trim(); if(!s) return '';
  if (/^\d{4}[/-]\d{1,2}[/-]\d{1,2}/.test(s)){ const part=s.replace(/\//g,'-').slice(0,10); const [y,m,d]=part.split('-').map(x=>x.padStart(2,'0')); return `${y}-${m}-${d}`; }
  if (/^\d{10,13}$/.test(s)){ const n=Number(s.length===13?Number(s):Number(s)*1000); return Utilities.formatDate(new Date(n), TZ, 'yyyy-MM-dd'); }
  return s.replace(/\//g,'-').slice(0,10);
}

function onEdit(e){
  try{
    if(!e || !e.range) return;
    const sh = e.source.getActiveSheet();
    if (sh.getName() !== SHEET_ORDER || e.range.getRow()===1) return;
    const head = getHeader_(sh);
    const col = name => head.indexOf(name)+1;
    const r = e.range.getRow();
    const c = {
      orderNo: col('訂單編號'),
      name: col('姓名'),
      recipient: col('收件人'),
      email: col('Email'),
      total: col('應付金額'),
      pay: col('款項狀態'),
      shippedFlag: col('已出貨'),
      shipState: col('出貨狀態'),
      shipDate: col('出貨日期'),
      mail: col('寄信狀態')
    };
    const gv = n => String(sh.getRange(r,n).getValue()||'').trim();
    if (e.range.getColumn()===c.pay && c.pay>0){
      const val = (e.value||'').trim();
      const orderNo = gv(c.orderNo);
      if (/已匯款|已收款/.test(val)){
        updateDetailByOrder_(orderNo, {'付款狀態':'已匯款'});
        if (c.mail>0) sh.getRange(r,c.mail).setValue('已記錄為已匯款 '+$.now());
      } else if (/待匯款|未匯款/.test(val)){
        const name = gv(c.name);
        const email = gv(c.email);
        const total = Number(gv(c.total))||0;
        if (SEND_MAIL && orderNo && email){
          const ok = sendPaymentReminderMail_({ orderNo, name, email, total });
          if (c.mail>0) sh.getRange(r,c.mail).setValue(stampNote_(ok,'已寄信(催款)','寄信失敗(催款)'));
        }
        updateDetailByOrder_(orderNo, {'付款狀態':'待匯款'});
      }
      return;
    }
    const isShippedCol = [c.shipState,c.shippedFlag].includes(e.range.getColumn());
    if (isShippedCol){
      const shipVal = (e.value||'').trim();
      if (/已出貨|已寄出|是|Yes|yes/.test(shipVal)){
        if (c.shipDate>0) sh.getRange(r,c.shipDate).setValue($.today());
        if (c.shippedFlag>0 && e.range.getColumn()!==c.shippedFlag) sh.getRange(r,c.shippedFlag).setValue('是');
        if (c.shipState>0 && e.range.getColumn()!==c.shipState) sh.getRange(r,c.shipState).setValue('已出貨');
        const orderNo = gv(c.orderNo);
        const name = gv(c.name);
        const recipient = gv(c.recipient);
        const email = gv(c.email);
        const total = Number(gv(c.total))||0;
        updateDetailByOrder_(orderNo, {'出貨狀態':'已出貨','出貨日期':$.today(),'收件人':recipient});
        if (SEND_MAIL && orderNo && email){
          const ok = sendShippedMail_({ orderNo, name, email, total, shipDate: $.today() });
          if (c.mail>0) sh.getRange(r,c.mail).setValue(stampNote_(ok,'已寄信(出貨)','寄信失敗(出貨)'));
        }
      }
    }
  }catch(err){ Logger.log(err); }
}

function sendShippedForSelection(){ batchMail_('shipped'); }
function sendPayRemindForSelection(){ batchMail_('remind'); }
function batchMail_(type){
  const ui = SpreadsheetApp.getUi();
  const sh = $.sheet(SHEET_ORDER);
  const range = sh.getActiveRange();
  if(!range){ ui.alert('請先選取要處理的列'); return; }
  const head=getHeader_(sh); const col=n=>head.indexOf(n)+1;
  const c = {
    orderNo: col('訂單編號'), name: col('姓名'), recipient: col('收件人'), email: col('Email'),
    total: col('應付金額'), shipDate: col('出貨日期'), shipState: col('出貨狀態'),
    shippedFlag: col('已出貨'), mail: col('寄信狀態')
  };
  const values = range.getValues();
  values.forEach((row,i)=>{
    const r = range.getRow()+i;
    const get = C => String(sh.getRange(r,C).getValue()||'').trim();
    const orderNo = get(c.orderNo), name=get(c.name), recipient=get(c.recipient), email=get(c.email);
    const total = Number(get(c.total))||0; if(!orderNo||!email) return;
    let note='';
    if(type==='remind'){
      const ok = sendPaymentReminderMail_({ orderNo, name, email, total });
      updateDetailByOrder_(orderNo, {'付款狀態':'待匯款','收件人':recipient});
      note = stampNote_(ok,'已寄信(催款)','寄信失敗(催款)');
    }else{
      if (c.shipDate>0) sh.getRange(r,c.shipDate).setValue($.today());
      if (c.shipState>0) sh.getRange(r,c.shipState).setValue('已出貨');
      if (c.shippedFlag>0) sh.getRange(r,c.shippedFlag).setValue('是');
      updateDetailByOrder_(orderNo, {'出貨狀態':'已出貨','出貨日期':$.today(),'收件人':recipient});
      const ok = sendShippedMail_({ orderNo, name, email, total, shipDate: $.today() });
      note = stampNote_(ok,'已寄信(出貨)','寄信失敗(出貨)');
    }
    if (c.mail>0) sh.getRange(r,c.mail).setValue(note);
  });
  ui.alert('批次完成');
}

function getOrderWithItems_(orderNo){
  const shO=$.sheet(SHEET_ORDER), shI=$.sheet(SHEET_ITEM);
  const ho=getHeader_(shO), map={}; ORDER_HEADERS_EXACT.forEach(h=>map[h]=ho.indexOf(h));
  let order={orderNo, name:'', email:'', phone:'', shipWay:'', addr:'', remark:'', total:0, shipDate:''};
  const oVals=shO.getDataRange().getValues();
  for(let r=1;r<oVals.length;r++){
    if(String(oVals[r][map['訂單編號']]||'').trim()===orderNo){
      order.name   = oVals[r][map['姓名']]||'';
      order.email  = oVals[r][map['Email']]||'';
      order.phone  = oVals[r][map['手機']]||'';
      order.shipWay= oVals[r][map['物流方式']]||'';
      order.addr   = oVals[r][map['收件地址']]||'';
      order.remark = oVals[r][map['備註']]||'';
      order.total  = Number(oVals[r][map['應付金額']])||0;
      order.shipDate = oVals[r][map['出貨日期']]||'';
      break;
    }
  }
  const hi=getHeader_(shI);
  const ix={ no: hi.indexOf('訂單編號'), title: hi.indexOf('品名'), weight: hi.indexOf('溫層'), size: hi.indexOf('規格'), price: hi.indexOf('單價'), qty: hi.indexOf('數量') };
  const iVals=shI.getDataRange().getValues(); order.items=[];
  for(let r=1;r<iVals.length;r++){
    if(String(iVals[r][ix.no]||'').trim()===orderNo){
      order.items.push({
        title:iVals[r][ix.title]||'', weight:iVals[r][ix.weight]||'',
        size:iVals[r][ix.size]||'', price:Number(iVals[r][ix.price])||0,
        qty:Number(iVals[r][ix.qty])||0
      });
    }
  }
  return order;
}

function ensureSheets_(){
  const sO=$.sheet(SHEET_ORDER), sI=$.sheet(SHEET_ITEM);
  if (sO.getLastRow()===0 && sO.getLastColumn()===0){
    sO.getRange(1,1,1,ORDER_HEADERS_EXACT.length).setValues([ORDER_HEADERS_EXACT]);
  }
  if (sI.getLastRow()===0 && sI.getLastColumn()===0){
    sI.getRange(1,1,1,ITEM_HEADERS.length).setValues([ITEM_HEADERS]);
  }
}

function getHeader_(sh){ return sh.getRange(1,1,1,Math.max(1,sh.getLastColumn())).getValues()[0]; }
function appendRowByHeader_(sheetName, obj){
  const sh=$.sheet(sheetName); const head=getHeader_(sh);
  const row=head.map(h=> obj.hasOwnProperty(h) ? obj[h] : '');
  sh.appendRow(row);
  
  // 強制設定應付金額為數字格式（避免被解析為日期）
  if(sheetName === SHEET_ORDER){
    const lastRow = sh.getLastRow();
    const amountCol = head.indexOf('應付金額') + 1;
    if(amountCol > 0){
      sh.getRange(lastRow, amountCol).setNumberFormat('#,##0');
    }
  }
}
function appendManyByHeader_(sheetName, rows){
  if (!rows.length) return;
  const sh=$.sheet(sheetName); const head=getHeader_(sh);
  const arr=rows.map(o=> head.map(h=> o.hasOwnProperty(h)?o[h]:'' ));
  sh.getRange(sh.getLastRow()+1,1,arr.length,head.length).setValues(arr);
}
function updateDetailByOrder_(orderNo, patch){
  const sh=$.sheet(SHEET_ITEM); const head=getHeader_(sh);
  const cNo=head.indexOf('訂單編號')+1; if(cNo<1) return;
  const idx={}; Object.keys(patch).forEach(k=> idx[k]=head.indexOf(k)+1 );
  const last=sh.getLastRow(); if(last<2) return;
  const range=sh.getRange(2,1,last-1,head.length); const vals=range.getValues();
  for(let i=0;i<vals.length;i++){
    if (String(vals[i][cNo-1]).trim()===orderNo){
      for(const k in patch){ const c=idx[k]; if(c>0) vals[i][c-1]=patch[k]; }
    }
  }
  range.setValues(vals);
}
function markMailStateByOrderNo_(orderNo, note){
  const sh=$.sheet(SHEET_ORDER); const head=getHeader_(sh);
  const cNo=head.indexOf('訂單編號')+1, cMail=head.indexOf('寄信狀態')+1;
  if(cNo<1||cMail<1) return;
  const last=sh.getLastRow(); if(last<2) return;
  const vals=sh.getRange(2,cNo,last-1,1).getValues();
  for(let i=0;i<vals.length;i++){
    if(String(vals[i][0]).trim()===orderNo){
      sh.getRange(i+2,cMail).setValue((note||'')+' '+$.now()); break;
    }
  }
}
