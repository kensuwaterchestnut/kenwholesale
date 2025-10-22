/************************************
 * KenSu 批發 - Part 5（訪客追蹤系統）
 * 複製此檔案全部內容 → 貼到 Part4 下面
 ************************************/

const SHEET_VISITOR_LOG = '訪客記錄';
const SHEET_EVENT_LOG = '事件記錄';
const SHEET_DAILY_STATS = '每日統計';
const SHEET_YEARLY_STATS = '每年統計';

const VISITOR_LOG_HEADERS = [
  '時間', '訪客ID', 'IP地址', '裝置類型', '瀏覽器', '作業系統', '來源頁面', '螢幕解析度'
];

const EVENT_LOG_HEADERS = [
  '時間', '訪客ID', '事件類型', '商品名稱', '商品ID', '數量', '金額', '訂單編號', '詳細資料'
];

const DAILY_STATS_HEADERS = [
  '日期', '總瀏覽次數', '獨立訪客數', '新訪客數', '回訪客數', 
  '查看商品次數', '加入購物車次數', '送出訂單次數', '轉換率(%)', '平均停留時間(分)'
];

const YEARLY_STATS_HEADERS = [
  '年份', '總瀏覽次數', '獨立訪客數', '總訂單數', '總營業額', 
  '平均客單價', '轉換率(%)', '最熱門商品', '最佳月份'
];

// 確保追蹤相關工作表存在
function ensureTrackingSheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 訪客記錄表
  let visitorSheet = ss.getSheetByName(SHEET_VISITOR_LOG);
  if (!visitorSheet) {
    visitorSheet = ss.insertSheet(SHEET_VISITOR_LOG);
    visitorSheet.appendRow(VISITOR_LOG_HEADERS);
    visitorSheet.getRange(1, 1, 1, VISITOR_LOG_HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#fff7ed');
  }
  
  // 事件記錄表
  let eventSheet = ss.getSheetByName(SHEET_EVENT_LOG);
  if (!eventSheet) {
    eventSheet = ss.insertSheet(SHEET_EVENT_LOG);
    eventSheet.appendRow(EVENT_LOG_HEADERS);
    eventSheet.getRange(1, 1, 1, EVENT_LOG_HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#dbeafe');
  }
  
  // 每日統計表
  let dailySheet = ss.getSheetByName(SHEET_DAILY_STATS);
  if (!dailySheet) {
    dailySheet = ss.insertSheet(SHEET_DAILY_STATS);
    dailySheet.appendRow(DAILY_STATS_HEADERS);
    dailySheet.getRange(1, 1, 1, DAILY_STATS_HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#dcfce7');
  }
  
  // 每年統計表
  let yearlySheet = ss.getSheetByName(SHEET_YEARLY_STATS);
  if (!yearlySheet) {
    yearlySheet = ss.insertSheet(SHEET_YEARLY_STATS);
    yearlySheet.appendRow(YEARLY_STATS_HEADERS);
    yearlySheet.getRange(1, 1, 1, YEARLY_STATS_HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#fef3c7');
  }
}

// 記錄訪客進入網頁
function logVisitor_(data) {
  try {
    ensureTrackingSheets_();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_VISITOR_LOG);
    
    const now = $.now();
    const visitorId = data.visitorId || generateVisitorId_();
    const ip = data.ip || 'unknown';
    const device = data.device || 'unknown';
    const browser = data.browser || 'unknown';
    const os = data.os || 'unknown';
    const referrer = data.referrer || 'direct';
    const screen = data.screen || 'unknown';
    
    sheet.appendRow([
      now,
      visitorId,
      ip,
      device,
      browser,
      os,
      referrer,
      screen
    ]);
    
    return { ok: true, visitorId };
  } catch (error) {
    Logger.log('❌ 記錄訪客失敗: ' + error);
    return { ok: false, error: error.toString() };
  }
}

// 記錄事件（查看商品、加入購物車、送出訂單等）
function logEvent_(data) {
  try {
    ensureTrackingSheets_();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_EVENT_LOG);
    
    const now = $.now();
    const visitorId = data.visitorId || 'unknown';
    const eventType = data.eventType || 'unknown';
    const productName = data.productName || '';
    const productId = data.productId || '';
    const quantity = Number(data.quantity) || 0;
    const amount = Number(data.amount) || 0;
    const orderId = data.orderId || '';
    const details = data.details || '';
    
    sheet.appendRow([
      now,
      visitorId,
      eventType,
      productName,
      productId,
      quantity,
      amount,
      orderId,
      details
    ]);
    
    return { ok: true };
  } catch (error) {
    Logger.log('❌ 記錄事件失敗: ' + error);
    return { ok: false, error: error.toString() };
  }
}

// 生成唯一訪客ID
function generateVisitorId_() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return 'V' + timestamp + '_' + random;
}

// 統計今日數據
function updateDailyStats() {
  try {
    ensureTrackingSheets_();
    const today = $.today();
    
    // 讀取今日訪客記錄
    const visitorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_VISITOR_LOG);
    const visitorData = visitorSheet.getDataRange().getValues();
    const visitorHeaders = visitorData[0];
    const timeIdx = visitorHeaders.indexOf('時間');
    const idIdx = visitorHeaders.indexOf('訪客ID');
    
    // 讀取今日事件記錄
    const eventSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_EVENT_LOG);
    const eventData = eventSheet.getDataRange().getValues();
    const eventHeaders = eventData[0];
    const eventTimeIdx = eventHeaders.indexOf('時間');
    const eventTypeIdx = eventHeaders.indexOf('事件類型');
    const eventIdIdx = eventHeaders.indexOf('訪客ID');
    
    // 過濾今日數據
    const todayVisitors = visitorData.slice(1).filter(row => {
      const dateStr = String(row[timeIdx]).split(' ')[0];
      return dateStr === today;
    });
    
    const todayEvents = eventData.slice(1).filter(row => {
      const dateStr = String(row[eventTimeIdx]).split(' ')[0];
      return dateStr === today;
    });
    
    // 統計數據
    const totalViews = todayVisitors.length;
    const uniqueVisitorIds = new Set(todayVisitors.map(row => row[idIdx]));
    const uniqueVisitors = uniqueVisitorIds.size;
    
    // 計算新訪客vs回訪客（簡化版：只看今天之前是否有記錄）
    const allVisitorIds = new Set(visitorData.slice(1)
      .filter(row => String(row[timeIdx]).split(' ')[0] < today)
      .map(row => row[idIdx]));
    
    let newVisitors = 0;
    let returningVisitors = 0;
    uniqueVisitorIds.forEach(vid => {
      if (allVisitorIds.has(vid)) {
        returningVisitors++;
      } else {
        newVisitors++;
      }
    });
    
    // 事件統計
    const viewProductCount = todayEvents.filter(row => row[eventTypeIdx] === '查看商品').length;
    const addToCartCount = todayEvents.filter(row => row[eventTypeIdx] === '加入購物車').length;
    const checkoutCount = todayEvents.filter(row => row[eventTypeIdx] === '送出訂單').length;
    
    // 轉換率
    const conversionRate = totalViews > 0 ? ((checkoutCount / totalViews) * 100).toFixed(2) : '0.00';
    
    // 平均停留時間（簡化版）
    const avgStayTime = totalViews > 0 ? (totalViews * 2.5).toFixed(1) : '0.0'; // 假設值
    
    // 更新每日統計表
    const dailySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DAILY_STATS);
    const dailyData = dailySheet.getDataRange().getValues();
    
    // 檢查今日是否已有記錄
    let updated = false;
    for (let i = 1; i < dailyData.length; i++) {
      if (dailyData[i][0] === today) {
        // 更新現有記錄
        dailySheet.getRange(i + 1, 1, 1, 10).setValues([[
          today, totalViews, uniqueVisitors, newVisitors, returningVisitors,
          viewProductCount, addToCartCount, checkoutCount, conversionRate, avgStayTime
        ]]);
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      // 新增記錄
      dailySheet.appendRow([
        today, totalViews, uniqueVisitors, newVisitors, returningVisitors,
        viewProductCount, addToCartCount, checkoutCount, conversionRate, avgStayTime
      ]);
    }
    
    Logger.log('✅ 每日統計更新完成: ' + today);
    return { ok: true, date: today, stats: { totalViews, uniqueVisitors, checkoutCount } };
  } catch (error) {
    Logger.log('❌ 更新每日統計失敗: ' + error);
    return { ok: false, error: error.toString() };
  }
}

// 統計年度數據
function updateYearlyStats(year) {
  try {
    ensureTrackingSheets_();
    year = year || new Date().getFullYear();
    
    // 讀取該年度的每日統計
    const dailySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_DAILY_STATS);
    const dailyData = dailySheet.getDataRange().getValues();
    
    const yearData = dailyData.slice(1).filter(row => {
      const dateStr = String(row[0]);
      return dateStr.startsWith(String(year));
    });
    
    if (yearData.length === 0) {
      return { ok: false, msg: '該年度無資料' };
    }
    
    // 統計年度數據
    const totalViews = yearData.reduce((sum, row) => sum + Number(row[1] || 0), 0);
    const totalUniqueVisitors = yearData.reduce((sum, row) => sum + Number(row[2] || 0), 0);
    const totalOrders = yearData.reduce((sum, row) => sum + Number(row[7] || 0), 0);
    
    // 從訂單表取得總營業額
    const orderSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ORDER);
    const orderData = orderSheet.getDataRange().getValues();
    const orderHeaders = orderData[0];
    const timeIdx = orderHeaders.indexOf('建立時間');
    const amountIdx = orderHeaders.indexOf('應付金額');
    
    const yearOrders = orderData.slice(1).filter(row => {
      const dateStr = String(row[timeIdx]).split(' ')[0];
      return dateStr.startsWith(String(year));
    });
    
    const totalRevenue = yearOrders.reduce((sum, row) => sum + Number(row[amountIdx] || 0), 0);
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : '0';
    const conversionRate = totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(2) : '0.00';
    
    // 找出最熱門商品
    const eventSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_EVENT_LOG);
    const eventData = eventSheet.getDataRange().getValues();
    const eventHeaders = eventData[0];
    const eventTimeIdx = eventHeaders.indexOf('時間');
    const eventTypeIdx = eventHeaders.indexOf('事件類型');
    const productNameIdx = eventHeaders.indexOf('商品名稱');
    
    const yearEvents = eventData.slice(1).filter(row => {
      const dateStr = String(row[eventTimeIdx]).split(' ')[0];
      return dateStr.startsWith(String(year)) && row[eventTypeIdx] === '查看商品';
    });
    
    const productCounts = {};
    yearEvents.forEach(row => {
      const product = row[productNameIdx];
      if (product) {
        productCounts[product] = (productCounts[product] || 0) + 1;
      }
    });
    
    const topProduct = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '無';
    
    // 找出最佳月份
    const monthlyOrders = {};
    yearOrders.forEach(row => {
      const month = String(row[timeIdx]).substring(0, 7); // YYYY-MM
      monthlyOrders[month] = (monthlyOrders[month] || 0) + 1;
    });
    
    const bestMonth = Object.entries(monthlyOrders)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '無';
    
    // 更新年度統計表
    const yearlySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_YEARLY_STATS);
    const yearlyData = yearlySheet.getDataRange().getValues();
    
    let updated = false;
    for (let i = 1; i < yearlyData.length; i++) {
      if (String(yearlyData[i][0]) === String(year)) {
        yearlySheet.getRange(i + 1, 1, 1, 9).setValues([[
          year, totalViews, totalUniqueVisitors, totalOrders, totalRevenue,
          avgOrderValue, conversionRate, topProduct, bestMonth
        ]]);
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      yearlySheet.appendRow([
        year, totalViews, totalUniqueVisitors, totalOrders, totalRevenue,
        avgOrderValue, conversionRate, topProduct, bestMonth
      ]);
    }
    
    Logger.log('✅ 年度統計更新完成: ' + year);
    return { ok: true, year, stats: { totalOrders, totalRevenue } };
  } catch (error) {
    Logger.log('❌ 更新年度統計失敗: ' + error);
    return { ok: false, error: error.toString() };
  }
}

// 處理追蹤請求（從前端呼叫）
function handleTracking_(data) {
  const type = String(data.type || '').toUpperCase();
  
  if (type === 'VISIT') {
    return logVisitor_(data);
  } else if (type === 'EVENT') {
    return logEvent_(data);
  }
  
  return { ok: false, msg: '未知的追蹤類型' };
}

// 在 Part1 的 onOpen 函數中加入以下選單項目：
/*
在 Part1 的 onOpen() 函數的選單中加入：

.addSeparator()
.addSubMenu(SpreadsheetApp.getUi().createMenu('📊 訪客統計')
  .addItem('更新今日統計', 'updateDailyStats')
  .addItem('更新本年統計', 'updateThisYearStats')
  .addItem('查看訪客記錄', 'openVisitorLog')
  .addItem('查看事件記錄', 'openEventLog'))

*/

// 輔助函數：更新當年統計
function updateThisYearStats() {
  const year = new Date().getFullYear();
  const result = updateYearlyStats(year);
  if (result.ok) {
    SpreadsheetApp.getUi().alert('✅ ' + year + ' 年度統計已更新！');
  } else {
    SpreadsheetApp.getUi().alert('❌ 更新失敗：' + (result.msg || result.error || '未知錯誤'));
  }
}

// 輔助函數：開啟訪客記錄
function openVisitorLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_VISITOR_LOG);
  if (sheet) {
    ss.setActiveSheet(sheet);
    SpreadsheetApp.getUi().alert('已切換到「訪客記錄」工作表');
  } else {
    SpreadsheetApp.getUi().alert('找不到「訪客記錄」工作表');
  }
}

// 輔助函數：開啟事件記錄
function openEventLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_EVENT_LOG);
  if (sheet) {
    ss.setActiveSheet(sheet);
    SpreadsheetApp.getUi().alert('已切換到「事件記錄」工作表');
  } else {
    SpreadsheetApp.getUi().alert('找不到「事件記錄」工作表');
  }
}
