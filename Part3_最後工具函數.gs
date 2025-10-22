/************************************
 * KenSu 批發 - Part 3 / 3（最後部分 - 工具函數）
 * 複製此檔案全部內容 → 貼到 Part2 下面
 ************************************/

const $ = {
  ss(){ return SpreadsheetApp.getActiveSpreadsheet(); },
  sheet(n){ return this.ss().getSheetByName(n) || this.ss().insertSheet(n); },
  now(){ return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'); },
  today(){ return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
};

function json_(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function fmtNum_(n){ return (Number(n)||0).toLocaleString('en-US'); }
function safe_(s){ return String(s||'').replace(/[<>&]/g, c=>({ '<':'&lt;','>':'&gt;','&':'&amp;' }[c])); }
function buildOrderNo_(){
  const d=new Date(); const yy=(d.getFullYear()%100).toString().padStart(2,'0');
  const ymd=Utilities.formatDate(d,TZ,'yyyyMMdd');
  const rand4=Math.floor(1000 + Math.random()*9000);
  return `K${yy}-${ymd}-${rand4}`;
}
function stampNote_(ok, okMsg, failMsg){ return (ok===true?okMsg:(failMsg+'：'+ok)) + ' ' + $.now(); }

function generateSpecCountsTodayAll(){ buildSpecCount_({scope:'day', shippedOnly:false}); }
function generateSpecCountsThisMonthAll(){ buildSpecCount_({scope:'month', shippedOnly:false}); }
function generateSpecCountsThisYearAll(){ buildSpecCount_({scope:'year', shippedOnly:false}); }
function generateSpecCountsTodayShipped(){ buildSpecCount_({scope:'day', shippedOnly:true}); }
function generateSpecCountsThisMonthShipped(){ buildSpecCount_({scope:'month', shippedOnly:true}); }
function generateSpecCountsThisYearShipped(){ buildSpecCount_({scope:'year', shippedOnly:true}); }

function buildSpecCount_({scope, shippedOnly}){
  ensureSheets_();
  const sh=$.sheet(SHEET_ITEM);
  const lastRow=sh.getLastRow(); if(lastRow<2){ SpreadsheetApp.getUi().alert('〈明細〉沒有資料'); return; }
  const head=getHeader_(sh), vals=sh.getRange(2,1,lastRow-1,head.length).getValues();
  const ix={ created: head.indexOf('建立時間'), title: head.indexOf('品名'), weight: head.indexOf('溫層'), spec: head.indexOf('規格'), qty: head.indexOf('數量'), shipState: head.indexOf('出貨狀態'), shipDate: head.indexOf('出貨日期') };
  const today=new Date(); const y=Utilities.formatDate(today,TZ,'yyyy'); const ym=Utilities.formatDate(today,TZ,'yyyy-MM'); const ymd=Utilities.formatDate(today,TZ,'yyyy-MM-dd');
  const hit = d => !d ? false : scope==='day'? d===ymd : scope==='month'? d.startsWith(ym) : d.startsWith(y);
  const bySpec=new Map(), bySku=new Map(); let totalQty=0;
  vals.forEach(r=>{
    const created=toDateStr_(r[ix.created]); const spec=(r[ix.spec]||'')+''; const qty=Number(r[ix.qty])||0; const title=(r[ix.title]||'')+''; const weight=(r[ix.weight]||'')+'';
    const shipState=ix.shipState>=0 ? (r[ix.shipState]||'')+'' : ''; const shipDate=ix.shipDate>=0 ? toDateStr_(r[ix.shipDate]) : '';
    if (shippedOnly){ if(!/已出貨/.test(shipState) || !hit(shipDate)) return; } else { if(!hit(created)) return; }
    if (!spec || qty<=0) return;
    bySpec.set(spec,(bySpec.get(spec)||0)+qty);
    const key=[title,weight,spec].join('|'); bySku.set(key,(bySku.get(key)||0)+qty);
    totalQty+=qty;
  });
  const out=$.sheet(shippedOnly?SHEET_SPEC_SHIPPED:SHEET_SPEC_ALL); out.clear();
  const title=`啃酥批發｜規格件數統計（${scope==='day'?'本日':scope==='month'?'本月':'本年'}｜${shippedOnly?'僅已出貨':'全部'}）`;
  const header=[[title,''],['產生時間', $.now()],['總件數', totalQty],['',''],['按規格彙總',''],['規格','件數']];
  out.getRange(1,1,header.length,2).setValues(header);
  const specRows = Array.from(bySpec.entries()).sort((a,b)=>{
    const na=parseInt(a[0]), nb=parseInt(b[0]); if(!isNaN(na)&&!isNaN(nb)) return na-nb; return a[0].localeCompare(b[0],'zh-Hant');
  }).map(([s,q])=>[s,q]);
  let row = header.length+1;
  if (specRows.length){ out.getRange(row,1,specRows.length,2).setValues(specRows); row += specRows.length; } else { out.getRange(row,1,1,2).setValues([['（無資料）','0']]); row+=1; }
  out.getRange(row,1,1,4).setValues([['','','','']]); row++;
  out.getRange(row,1,1,4).setValues([['按品名/溫層/規格 彙總','','','']]); row++;
  out.getRange(row,1,1,4).setValues([['品名','溫層','規格','件數']]); row++;
  const skuRows = Array.from(bySku.entries()).map(([k,q])=>{ const [t,w,s]=k.split('|'); return [t||'',w||'',s||'',q]; });
  if (skuRows.length){ out.getRange(row,1,skuRows.length,4).setValues(skuRows); }
  out.getRange(1,1,1,2).setFontWeight('bold').setFontSize(14);
  out.getRange(5,1,1,2).setFontWeight('bold').setBackground('#fef3c7');
  out.autoResizeColumns(1,6);
}

function generateThisWeekSummaryCreated(){ buildWeeklySummary_({useShipDate:false}); }
function generateThisWeekSummaryShipped(){ buildWeeklySummary_({useShipDate:true}); }
function buildWeeklySummary_({useShipDate}){
  ensureSheets_();
  const shItem=$.sheet(SHEET_ITEM);
  const lastRow=shItem.getLastRow();
  if (lastRow<2){ SpreadsheetApp.getUi().alert('〈明細〉沒有資料可統計'); return; }
  const head=getHeader_(shItem);
  const ix = {
    created: head.indexOf('建立時間'),
    shipDate: head.indexOf('出貨日期'),
    shipState: head.indexOf('出貨狀態'),
    title: head.indexOf('品名'),
    weight: head.indexOf('溫層'),
    size: head.indexOf('規格'),
    price: head.indexOf('單價'),
    qty: head.indexOf('數量'),
    amount: head.indexOf('小計')
  };
  const today=new Date(); const wd=today.getDay(); const diff=(wd+6)%7;
  const mon=new Date(today); mon.setDate(today.getDate()-diff);
  const sun=new Date(mon);   sun.setDate(mon.getDate()+6);
  const start=Utilities.formatDate(mon,TZ,'yyyy-MM-dd');
  const end  =Utilities.formatDate(sun,TZ,'yyyy-MM-dd');
  const inRange = d => d>=start && d<=end;
  const vals=shItem.getRange(2,1,lastRow-1,head.length).getValues();
  const bySku=new Map(); let totalQty=0, totalAmt=0;
  vals.forEach(r=>{
    const dateStr = useShipDate ? toDateStr_(r[ix.shipDate]) : toDateStr_(r[ix.created]);
    if (!dateStr || !inRange(dateStr)) return;
    if (useShipDate && !/已出貨/.test(String(r[ix.shipState]||''))) return;
    const title=(r[ix.title]||'')+'', weight=(r[ix.weight]||'')+'', size=(r[ix.size]||'')+'';
    const price=Number(r[ix.price])||0, qty=Number(r[ix.qty])||0, amt=Number(r[ix.amount])||(price*qty);
    const key=[title,weight,size].join('|');
    if(!bySku.has(key)) bySku.set(key,{title,weight,size,qty:0,amt:0});
    const o=bySku.get(key); o.qty+=qty; o.amt+=amt; totalQty+=qty; totalAmt+=amt;
  });
  const sh=$.sheet(SHEET_WEEK_SUMMARY); sh.clear();
  const title = `啃酥批發｜週出貨統計（${start} ~ ${end}｜${useShipDate?'依出貨日／僅已出貨':'依建立時間'}）`;
  const header=[[title,'','','',''],['產生時間', $.now(),'','',''],['','','','',''],['品名','溫層','規格','件數','金額']];
  sh.getRange(1,1,header.length,5).setValues(header);
  const rows = Array.from(bySku.values()).map(o=>[o.title,o.weight,o.size,o.qty,o.amt]);
  if (rows.length){
    sh.getRange(header.length+1,1,rows.length,5).setValues(rows);
    sh.getRange(header.length+rows.length+1,1,1,5).setValues([['合計','','',totalQty,totalAmt]]);
  }else{
    sh.getRange(header.length+1,1,1,5).setValues([['（本週無資料）','','','0','0']]);
  }
  sh.getRange(1,1,1,5).setFontWeight('bold').setFontSize(14);
  sh.getRange(header.length,1,1,5).setFontWeight('bold').setBackground('#fef3c7');
  sh.getRange(header.length+1,4,Math.max(1,rows.length+1),2).setNumberFormat('#,##0');
  sh.autoResizeColumns(1,5);
}
