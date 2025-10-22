/************************************
 * KenSu 批發 - Part 4 / 4（寄信函數）
 * 複製此檔案全部內容 → 貼到 Part3 下面
 * 這是之前遺漏的寄信函數！
 ************************************/

function sendMailSafe_(to, subject, html, text){
  try{
    MailApp.sendEmail({to, subject, htmlBody: html, body: text||subject});
    return true;
  }catch(err){ 
    Logger.log(err); 
    return err && err.message ? err.message : String(err); 
  }
}

function emailShell_({title, subtitle, bodyHtml, ctaText, ctaUrl, boss=false}){
  const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const bossBtn = boss ? `
    <tr><td align="center" style="padding:0 0 12px 0">
      <a href="${sheetUrl}" target="_blank"
         style="display:inline-block;padding:10px 16px;border-radius:999px;background:#ffffff;color:#111;
                text-decoration:none;font-weight:800;border:1px solid #e5e7eb">
        開啟試算表
      </a>
    </td></tr>` : '';

  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff">
    <tr>
      <td align="center" style="padding:16px 12px;background:#f7f7f5">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:720px;background:#ffffff;border:1px solid #eee;border-radius:16px">
          ${bossBtn}
          <tr><td style="padding:18px 16px 10px;border-bottom:1px solid #f1f1f1" align="center">
            <img src="${LOGO_URL}" alt="logo" width="72" style="display:block;width:72px;height:auto;border-radius:12px;border:1px solid #eee;margin:0 auto">
            <div style="font:800 20px/1.2 system-ui,-apple-system,Segoe UI,Roboto,'Noto Sans TC',sans-serif;margin-top:8px">${safe_(BRAND.name)}</div>
            <div style="color:#6b7280;font:12px/1.4 system-ui,-apple-system,Segoe UI,Roboto,'Noto Sans TC',sans-serif;margin-top:2px">${safe_(subtitle||'')}</div>
          </td></tr>

          <tr><td style="padding:16px">
            <div style="font:800 22px/1.35 system-ui,-apple-system,Segoe UI,Roboto,'Noto Sans TC',sans-serif;margin:0 0 12px">${safe_(title)}</div>
            ${bodyHtml||''}
            ${ctaText && ctaUrl ? `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:16px">
              <tr><td align="center">
                <a href="${ctaUrl}" target="_blank"
                   style="display:inline-block;background:#16a34a;border:1px solid #15803d;color:#fff;
                          text-decoration:none;font-weight:800;border-radius:12px;padding:12px 18px">
                  ${safe_(ctaText)}
                </a>
              </td></tr>
            </table>`:``}
          </td></tr>

          <tr><td style="border-top:1px solid #f1f1f1;padding:14px 16px;background:#fafafa">
            <div style="font:12px/1.7 system-ui,-apple-system,Segoe UI,Roboto,'Noto Sans TC',sans-serif;color:#374151">
              <p style="margin:0 0 8px">© 酥味香企業社｜統編 ${COMPANY_TAX_ID}<br>
              地址：${safe_(BRAND.address)}<br>
              連絡電話：${safe_(BRAND.phone)}</p>
              <p style="margin:0">任何問題歡迎詢問 LINE：
                <a href="${LINE_URL}" target="_blank" style="color:#111">點我聯絡</a>
              </p>
            </div>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>`.trim();
}

function customerBlockHtml_({name,email,phone,shipWay,addr,remark}){
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin:2px 0 10px">
    <tbody>
      <tr><td style="width:120px;color:#6b7280;padding:6px 0">客戶</td><td style="padding:6px 0">${safe_(name||'')}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0">Email</td><td style="padding:6px 0">${safe_(email||'')}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0">電話</td><td style="padding:6px 0">${safe_(phone||'')}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0">收件方式</td><td style="padding:6px 0">${safe_(shipWay||'')}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0">收件地址</td><td style="padding:6px 0">${safe_(addr||'')}</td></tr>
      <tr><td style="color:#6b7280;padding:6px 0">備註</td><td style="padding:6px 0">${safe_(remark||'（無）')}</td></tr>
    </tbody>
  </table>`;
}

function orderTableHtml_({items,total}){
  const safeItems = (items||[]).map(i=>({
    title: i.title||'', weight: i.weight||'', size: i.size||'',
    price: Number(i.price)||0, qty:Number(i.qty)||0
  }));
  const calc = safeItems.reduce((s,i)=>s + i.price*i.qty, 0);
  const final = (isFinite(Number(total)) && Number(total)>0) ? Number(total) : calc;
  const finalTotal = Math.abs(final);

  const rows = safeItems.map(i=>{
    const amt=i.price*i.qty;
    return `
      <tr>
        <td style="padding:8px;border:1px solid #eee">${safe_(i.title)}</td>
        <td style="padding:8px;border:1px solid #eee;text-align:center">${safe_(i.weight)}</td>
        <td style="padding:8px;border:1px solid #eee;text-align:center">${safe_(i.size)}</td>
        <td style="padding:8px;border:1px solid #eee;text-align:right;white-space:nowrap">NT$ ${fmtNum_(i.price)}</td>
        <td style="padding:8px;border:1px solid #eee;text-align:center">${i.qty}</td>
        <td style="padding:8px;border:1px solid #eee;text-align:right;white-space:nowrap">NT$ ${fmtNum_(amt)}</td>
      </tr>`;
  }).join('');

  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;margin-top:10px">
    <thead>
      <tr style="background:#fff7ed">
        <th style="padding:8px;border:1px solid #eee;text-align:left">品名</th>
        <th style="padding:8px;border:1px solid #eee">溫層</th>
        <th style="padding:8px;border:1px solid #eee">規格</th>
        <th style="padding:8px;border:1px solid #eee;text-align:right">單價</th>
        <th style="padding:8px;border:1px solid #eee">數量</th>
        <th style="padding:8px;border:1px solid #eee;text-align:right">小計</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="5" style="padding:8px;border:1px solid #eee;text-align:right"><b>應付金額</b></td>
        <td style="padding:8px;border:1px solid #eee;text-align:right;white-space:nowrap"><b>NT$ ${fmtNum_(finalTotal)}</b></td>
      </tr>
    </tfoot>
  </table>`;
}

function shippingReminderHtml_(shipDate){
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px">
    <tr><td style="border:1px dashed #e5e7eb;border-radius:10px;padding:12px;background:#fafafa">
      <div style="font-weight:800;margin-bottom:6px">物流提醒</div>
      <div style="color:#374151;font-size:14px;line-height:1.6">
        <div>• 已於 <b>${safe_(shipDate||$.today())}</b> 交寄，約 <b>1–3 個工作天</b> 送達（節慶量大順延）。</div>
        <div>• 不同溫層會拆單配送；收貨請<b>全程開箱錄影</b>。</div>
        <div>• 冷凍/冷藏商品到貨請立即入庫，避免失溫。</div>
      </div>
    </td></tr>
  </table>`;
}

function sendOrderCreatedMail_({ orderNo, name, email, phone, total, items, addr, ship, remark }, {boss=false}={}){
  const headInfo = `<div style="font:13px/1.6 system-ui,-apple-system,Segoe UI,Roboto,'Noto Sans TC',sans-serif;color:#6b7280;margin:0 0 8px">訂單編號：<b>${safe_(orderNo)}</b></div>`;
  const customer = customerBlockHtml_({name,email,phone,shipWay:ship,addr,remark});
  const bankInfo = boss ? '' : `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:10px 0">
    <tr><td style="border:1px dashed #e5e7eb;border-radius:10px;padding:10px;background:#fffced">
      <div style="font-weight:700;margin-bottom:6px">匯款資訊</div>
      <div>${BANK.bank}　戶名：${BANK.holder}　帳號：${BANK.no}</div>
    </td></tr>
  </table>`;
  const table = orderTableHtml_({items,total});
  const body = headInfo + customer + bankInfo + table;

  const subject = boss ? `啃酥批發 新訂單｜${orderNo}` : `啃酥批發｜訂單成立＆匯款資訊｜${orderNo}`;
  const html = emailShell_({
    title: boss ? '新訂單' : '訂單成立＆匯款資訊',
    subtitle: '完成匯款後即安排出貨',
    bodyHtml: body,
    ctaText: '若需協助，點我用 LINE 聯繫',
    ctaUrl: LINE_URL,
    boss
  });
  return sendMailSafe_(boss?NOTIFY_TO:email, subject, html, subject);
}

function sendPaymentReminderMail_({ orderNo, name, email, total }){
  const order = getOrderWithItems_(orderNo);
  const use = {
    name: name||order.name, email: email||order.email,
    items: order.items, total: isFinite(total)?total:order.total
  };
  const headInfo = `
    <div style="font:13px/1.6 system-ui,-apple-system,Segoe UI,Roboto,'Noto Sans TC',sans-serif;color:#6b7280;margin:0 0 8px">
      訂單編號：<b>${safe_(orderNo)}</b>
    </div>
    <p style="margin:6px 0 10px">親愛的 ${safe_(use.name)} 您好：我們尚未收到此訂單款項，完成匯款後將立即安排出貨。</p>`;
  const bank = `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:6px">
    <tr><td style="border:1px dashed #e5e7eb;border-radius:10px;padding:10px;background:#fffced">
      <div style="font-weight:700;margin-bottom:6px">匯款資訊</div>
      <div>${BANK.bank}　戶名：${BANK.holder}　帳號：${BANK.no}</div>
    </td></tr>
  </table>`;
  const table = orderTableHtml_({items:use.items,total:use.total});
  const html = emailShell_({
    title:'款項提醒', subtitle:'完成匯款後即安排出貨',
    bodyHtml: headInfo + bank + table,
    ctaText:'回信或用 LINE 聯繫我們', ctaUrl: LINE_URL
  });
  const subject = `啃酥批發｜款項提醒｜${orderNo}`;
  return sendMailSafe_(use.email, subject, html, subject);
}

function sendShippedMail_({ orderNo, name, email, total, shipDate }){
  const order = getOrderWithItems_(orderNo);
  const use = {
    name: name||order.recipient||order.name, email: email||order.email,
    items: order.items, total: isFinite(total)?total:order.total,
    shipDate: shipDate || order.shipDate || $.today()
  };
  const headInfo = `
    <div style="font:13px/1.6 system-ui,-apple-system,Segoe UI,Roboto,'Noto Sans TC',sans-serif;color:#6b7280;margin:0 0 8px">
      訂單編號：<b>${safe_(orderNo)}</b>
    </div>
    <p style="margin:6px 0 10px">親愛的 ${safe_(use.name)} 您好：您的訂單已出貨。</p>`;
  const reminder = shippingReminderHtml_(use.shipDate);
  const table = orderTableHtml_({items:use.items,total:use.total});
  const html = emailShell_({
    title:'出貨通知', subtitle:'到貨請全程開箱錄影',
    bodyHtml: headInfo + reminder + table,
    ctaText:'若需協助，點我用 LINE 聯繫', ctaUrl: LINE_URL
  });
  const subject = `啃酥批發｜您的訂單已出貨｜${orderNo}`;
  return sendMailSafe_(use.email, subject, html, subject);
}
