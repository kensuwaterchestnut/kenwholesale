/************************************
 * KenSu 批發 - Part 1 / 3
 * 複製此檔案全部內容 → 貼到 GAS 編輯器
 ************************************/
const TZ = 'Asia/Taipei';
const SHEET_ORDER = '訂單';
const SHEET_ITEM  = '明細';
const SHEET_SPEC_ALL = '規格統計';
const SHEET_SPEC_SHIPPED = '規格統計(已出貨)';
const SHEET_WEEK_SUMMARY = '週出貨統計';
const SHEET_PRODUCTS = '商品資料';

const ORDER_HEADERS_EXACT = [
  '訂單編號','姓名','Email','手機','LINE','收件人','款項狀態','已出貨',
  '物流方式','收件地址','備註','建立時間','應付金額','物流單號','出貨日期','寄信狀態','出貨狀態'
];
// 〈明細〉表頭（空表時才建立）
const ITEM_HEADERS = [
  '建立時間','訂單編號','收件人','Email','品名','類型','溫層','規格','單價','數量','小計',
  '付款狀態','出貨狀態','出貨日期','物流單號'
];

const NOTIFY_TO = 'kensu.water.chestnut@gmail.com';
const SEND_MAIL = true;
const BRAND = { name: '啃酥批發', address: '台中市石岡區石岡街61號', phone: '0933-721-978' };
const COMPANY_TAX_ID = '93428964';
const LINE_URL = 'https://line.me/R/ti/p/@174vwkhs?ts=09250145&oat_content=url';
const LOGO_URL = 'https://raw.githubusercontent.com/kensuwaterchestnut/kenwholesale/main/%E5%95%83%E9%85%A5%20Ken-01.png';
const BANK  = { bank:'連線銀行(824)', holder:'酥味香企業社', no:'111013782313' };

const FOLDER_MAP = {
  hero: '1lzkIBXSeIgizJf8K6NT54B9cPoaZRhFV',
  logo: '1cRQPgc1XuwFMXzpepfrSGsNJG3TOF3oT',
  常溫: '14X6WbIQd6mAiLOEE_h73mkXdQL1gu0mM',
  冷藏: '1vo3Zbwt008r684mAm9nakghTO2zojWmf',
  冷凍: '1IETjj7n9nlQGsrCho_zxF81p4OWLCvWZ',
};

const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'];
const CACHE_KEY_VERSION = 'PRODUCTS_VERSION';

function onOpen() {
  ensureSheets_();
  SpreadsheetApp.getUi()
    .createMenu('啃酥面板')
      .addItem('📊 打開面板（側邊欄）', 'showDashboard')
      .addSeparator()
      .addItem('授權並安裝', 'installAll_')
      .addSeparator()
      .addItem('🔄 手動更新商品到前端', 'manualRefreshProducts')
      .addItem('🖼️ 批次設定圖片權限', 'setAllImagesPublic')
      .addSeparator()
      .addItem('寄【出貨信】(選取列)', 'sendShippedForSelection')
      .addItem('寄【催款信】(選取列)', 'sendPayRemindForSelection')
      .addSeparator()
      .addSubMenu(SpreadsheetApp.getUi().createMenu('規格件數（全部）')
        .addItem('本日', 'generateSpecCountsTodayAll')
        .addItem('本月', 'generateSpecCountsThisMonthAll')
        .addItem('本年', 'generateSpecCountsThisYearAll'))
      .addSubMenu(SpreadsheetApp.getUi().createMenu('規格件數（僅已出貨）')
        .addItem('本日', 'generateSpecCountsTodayShipped')
        .addItem('本月', 'generateSpecCountsThisMonthShipped')
        .addItem('本年', 'generateSpecCountsThisYearShipped'))
      .addSubMenu(SpreadsheetApp.getUi().createMenu('週出貨統計')
        .addItem('本週（依出貨日｜僅已出貨）', 'generateThisWeekSummaryShipped')
        .addItem('本週（依建立時間）', 'generateThisWeekSummaryCreated'))
    .addToUi();
}

function showDashboard(){
  const html = HtmlService.createHtmlOutput(`<html><head><meta charset="UTF-8"><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,'Noto Sans TC',sans-serif;margin:0;padding:12px;background:#fff}h2{margin:0 0 10px}.sec{border:1px solid #e5e7eb;border-radius:12px;padding:10px;margin:10px 0}.ttl{font-weight:800;margin-bottom:6px}button{display:inline-block;margin:5px 6px 0 0;padding:8px 10px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;cursor:pointer}button:hover{background:#f3f4f6}.hint{color:#6b7280;font-size:12px;margin-top:6px}</style></head><body><h2>啃酥面板</h2><div class="sec"><div class="ttl">🔄 商品資料管理</div><button onclick="google.script.run.manualRefreshProducts()">🚀 手動更新商品到前端</button><div class="hint">點擊後，前端會在 30 秒內自動更新商品資料。</div></div><div class="sec"><div class="ttl">批次寄信（先選取〈訂單〉的列）</div><button onclick="google.script.run.sendShippedForSelection()">寄【出貨信】</button><button onclick="google.script.run.sendPayRemindForSelection()">寄【催款信】</button></div><div class="sec"><div class="ttl">規格件數統計</div><div><b>全部</b>：<button onclick="google.script.run.generateSpecCountsTodayAll()">本日</button><button onclick="google.script.run.generateSpecCountsThisMonthAll()">本月</button><button onclick="google.script.run.generateSpecCountsThisYearAll()">本年</button></div><div style="margin-top:6px"><b>僅已出貨</b>：<button onclick="google.script.run.generateSpecCountsTodayShipped()">本日</button><button onclick="google.script.run.generateSpecCountsThisMonthShipped()">本月</button><button onclick="google.script.run.generateSpecCountsThisYearShipped()">本年</button></div></div><div class="sec"><div class="ttl">週出貨統計</div><button onclick="google.script.run.generateThisWeekSummaryShipped()">本週（依出貨日｜僅已出貨）</button><button onclick="google.script.run.generateThisWeekSummaryCreated()">本週（依建立時間）</button></div><div class="hint">報表會產生在：〈規格統計〉/〈規格統計(已出貨)〉/〈週出貨統計〉工作表。</div></body></html>`);
  html.setTitle('啃酥面板');
  SpreadsheetApp.getUi().showSidebar(html);
}

function installAll_(){
  const ssId = SpreadsheetApp.getActive().getId();
  ScriptApp.getProjectTriggers().forEach(t=>ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('onEdit').forSpreadsheet(ssId).onEdit().create();
  ScriptApp.newTrigger('onSheetEdit_').forSpreadsheet(ssId).onEdit().create();
  MailApp.sendEmail(Session.getActiveUser().getEmail() || NOTIFY_TO, 'KenSu 安裝測試', 'OK');
  SpreadsheetApp.getUi().alert('已安裝觸發器並完成授權。');
}

function doGet(e) {
  try {
    ensureSheets_();
    const result = { images: {}, products: [], version: getProductsVersion_(), timestamp: new Date().getTime() };
    for (const [key, folderId] of Object.entries(FOLDER_MAP)) {
      if (folderId && folderId !== '') result.images[key] = getImagesFromFolder_(folderId);
    }
    result.products = getProductsFromSheet_();
    Logger.log('✅ API 回傳: ' + result.products.length + ' 個商品，版本: ' + result.version);
    return json_(result);
  } catch (error) {
    Logger.log('❌ doGet 錯誤: ' + error);
    return json_({ error: error.toString() });
  }
}

function getImagesFromFolder_(folderId) {
  const images = [];
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      const ext = fileName.split('.').pop().toLowerCase();
      if (SUPPORTED_FORMATS.includes(ext)) {
        images.push({ name: fileName, url: 'https://drive.google.com/uc?export=view&id=' + file.getId(), id: file.getId(), ts: file.getLastUpdated().getTime() });
      }
    }
    images.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      const numA = parseInt(nameA.match(/^(\d+)/)?.[1] || '999999');
      const numB = parseInt(nameB.match(/^(\d+)/)?.[1] || '999999');
      if (numA !== numB) return numA - numB;
      return nameA.localeCompare(nameB);
    });
  } catch (error) {
    Logger.log('❌ 讀取資料夾失敗 (' + folderId + '): ' + error);
  }
  return images;
}

function getProductsFromSheet_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_PRODUCTS);
    if (!sheet) { Logger.log('⚠️ 找不到工作表: ' + SHEET_PRODUCTS); return []; }
    const data = sheet.getDataRange().getValues();
    const products = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
      products.push({
        id: String(row[0]), tag: String(row[1] || ''), name: String(row[2]), type: String(row[3]), spec: String(row[4]),
        price: Number(row[5]) || 0, shipGroup: String(row[6]), shipFee: Number(row[7]) || 0, freeQty: Number(row[8]) || 0,
        minOrder: Number(row[9]) || 1, soldOut: row[10] === '是', soldCount: Number(row[11]) || 0,
        shelfLife: String(row[12]), storage: String(row[13]), imgFilename: String(row[14]), note: String(row[15] || '')
      });
    }
    Logger.log('✅ 讀取 ' + products.length + ' 個商品');
    return products;
  } catch (error) {
    Logger.log('⚠️ 讀取商品資料失敗: ' + error);
    return [];
  }
}

function getProductsVersion_() {
  const cache = CacheService.getScriptCache();
  let version = cache.get(CACHE_KEY_VERSION);
  if (!version) { version = String(new Date().getTime()); cache.put(CACHE_KEY_VERSION, version, 86400); }
  return version;
}

function onSheetEdit_(e) {
  try {
    if (!e || !e.range) return;
    const sh = e.source.getActiveSheet();
    if (sh.getName() !== SHEET_PRODUCTS) return;
    const newVersion = new Date().getTime();
    const cache = CacheService.getScriptCache();
    cache.put(CACHE_KEY_VERSION, String(newVersion), 86400);
    Logger.log('✅ 商品資料已更新，版本號: ' + newVersion);
  } catch (err) {
    Logger.log('❌ 錯誤: ' + err);
  }
}

function manualRefreshProducts() {
  const newVersion = new Date().getTime();
  const cache = CacheService.getScriptCache();
  cache.put(CACHE_KEY_VERSION, String(newVersion), 86400);
  SpreadsheetApp.getUi().alert('✅ 商品資料已手動更新！\n版本號: ' + newVersion);
  Logger.log('✅ 手動更新商品資料，版本號: ' + newVersion);
}

function doPost(e){
  try{
    ensureSheets_();
    const raw = (e && e.postData && e.postData.contents) || '{}';
    const data = JSON.parse(raw || '{}');
    const typ = String(data.type || '').toUpperCase();
    if (typ === 'ORDER_QUERY'){ return json_(handleOrderQuery_(data)); }
    if (!data || !Array.isArray(data.items) || data.items.length===0){ return json_({ok:false,msg:'空的訂單內容'}); }
    const now = $.now();
    const orderNo = buildOrderNo_();
    const buyer   = (data.buyer||data.name||'').trim();
    const email   = (data.email||'').trim();
    const phone   = (data.phone||'').trim();
    const line    = (data.line||'').trim();
    const recipient = (data.recipient||'').trim();
    const shipWay  = (data.ship_note||data.ship||'').trim();
    const addr     = (data.address||data.addr||'').trim();
    const remark   = (data.memo||data.remark||'').trim();
    const calcTotal = (data.items||[]).reduce((s,it)=> s + (Number(it.price)||0)*(Number(it.qty)||0), 0);
    const ship = Number(data.ship)||0;
    const total = Number(data.total)>0 ? Number(data.total) : (calcTotal + ship);
    const orderObj = {
      '訂單編號': orderNo, '姓名': buyer, 'Email': email, '手機': phone, 'LINE': line,
      '收件人': recipient, '款項狀態': '待匯款', '已出貨': '否',
      '物流方式': shipWay, '收件地址': addr, '備註': remark,
      '建立時間': String(now), '應付金額': Number(total) || 0,
      '物流單號': '', '出貨日期': '', '寄信狀態': '', '出貨狀態': '待出貨'
    };
    appendRowByHeader_(SHEET_ORDER, orderObj);
    const rows = (data.items||[]).map(it=>{
      const price=Number(it.price)||0, qty=Number(it.qty)||0;
      return {
        '建立時間': now, '訂單編號': orderNo, '收件人': recipient, 'Email': email,
        '品名': it.name||'', '類型': it.type||'', '溫層': it.shipGroup||'',
        '規格': it.spec||'', '單價': price, '數量': qty, '小計': price*qty,
        '付款狀態':'待匯款','出貨狀態':'待出貨','出貨日期':'','物流單號':''
      };
    });
    if (rows.length) appendManyByHeader_(SHEET_ITEM, rows);
    if (SEND_MAIL){
      const payload = {
        orderNo, name:buyer, email, phone, total,
        items: (data.items||[]).map(x=>({title:x.name||'',weight:x.shipGroup||'',size:x.spec||'',price:x.price,qty:x.qty})),
        addr, ship:shipWay, remark
      };
      const okC = sendOrderCreatedMail_(payload, {boss:false});
      const okB = sendOrderCreatedMail_(payload, {boss:true});
      markMailStateByOrderNo_(orderNo, (okC===true && okB===true) ? '已寄信(成立)' : '寄信失敗(成立)');
    }
    return json_({ok:true, order_no:orderNo, orderId:orderNo});
  }catch(err){
    return json_({ok:false, msg: err.message||String(err)});
  }
}
