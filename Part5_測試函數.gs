/************************************
 * 測試函數 - 加到 Part5 最下面
 ************************************/

// 測試訪客記錄功能
function testVisitorTracking() {
  const testData = {
    subType: 'VISIT',
    visitorId: 'TEST_V' + new Date().getTime(),
    device: 'Desktop',
    browser: 'Chrome',
    os: 'Windows',
    referrer: 'test',
    screen: '1920x1080'
  };
  
  Logger.log('📤 測試訪客追蹤...');
  const result = logVisitor_(testData);
  Logger.log('📥 結果: ' + JSON.stringify(result));
  
  if (result.ok) {
    SpreadsheetApp.getUi().alert('✅ 訪客追蹤測試成功！\n訪客ID: ' + result.visitorId + '\n\n請檢查「訪客記錄」工作表');
  } else {
    SpreadsheetApp.getUi().alert('❌ 訪客追蹤測試失敗！\n錯誤: ' + (result.error || '未知錯誤'));
  }
  
  return result;
}

// 測試事件記錄功能
function testEventTracking() {
  const testData = {
    subType: 'EVENT',
    visitorId: 'TEST_V' + new Date().getTime(),
    eventType: '測試事件',
    productName: '測試商品',
    productId: 'test_001',
    quantity: 1,
    amount: 100
  };
  
  Logger.log('📤 測試事件追蹤...');
  const result = logEvent_(testData);
  Logger.log('📥 結果: ' + JSON.stringify(result));
  
  if (result.ok) {
    SpreadsheetApp.getUi().alert('✅ 事件追蹤測試成功！\n\n請檢查「事件記錄」工作表');
  } else {
    SpreadsheetApp.getUi().alert('❌ 事件追蹤測試失敗！\n錯誤: ' + (result.error || '未知錯誤'));
  }
  
  return result;
}

// 測試完整追蹤流程
function testFullTracking() {
  const testData = {
    type: 'TRACKING',
    subType: 'VISIT',
    visitorId: 'TEST_V' + new Date().getTime(),
    device: 'Desktop',
    browser: 'Chrome',
    os: 'Windows',
    referrer: 'test',
    screen: '1920x1080'
  };
  
  Logger.log('📤 測試完整追蹤流程...');
  Logger.log('測試數據: ' + JSON.stringify(testData));
  
  const result = handleTracking_(testData);
  Logger.log('📥 結果: ' + JSON.stringify(result));
  
  if (result.ok) {
    SpreadsheetApp.getUi().alert('✅ 完整追蹤流程測試成功！\n訪客ID: ' + result.visitorId + '\n\n請檢查「訪客記錄」工作表');
  } else {
    SpreadsheetApp.getUi().alert('❌ 完整追蹤流程測試失敗！\n錯誤: ' + (result.msg || result.error || '未知錯誤'));
  }
  
  return result;
}

// 檢查工作表是否存在
function checkTrackingSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = {
    '訪客記錄': ss.getSheetByName(SHEET_VISITOR_LOG),
    '事件記錄': ss.getSheetByName(SHEET_EVENT_LOG),
    '每日統計': ss.getSheetByName(SHEET_DAILY_STATS),
    '每年統計': ss.getSheetByName(SHEET_YEARLY_STATS)
  };
  
  let msg = '📊 追蹤工作表檢查結果：\n\n';
  let allExists = true;
  
  Object.entries(sheets).forEach(([name, sheet]) => {
    if (sheet) {
      const rows = sheet.getLastRow();
      msg += `✅ ${name}: 存在 (${rows} 列)\n`;
    } else {
      msg += `❌ ${name}: 不存在\n`;
      allExists = false;
    }
  });
  
  if (!allExists) {
    msg += '\n建議執行 ensureTrackingSheets_() 建立缺失的工作表';
  }
  
  Logger.log(msg);
  SpreadsheetApp.getUi().alert(msg);
}

// 強制建立追蹤工作表
function forceCreateTrackingSheets() {
  try {
    ensureTrackingSheets_();
    SpreadsheetApp.getUi().alert('✅ 追蹤工作表已建立或確認存在！\n\n請檢查工作表列表');
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ 建立失敗：' + error.toString());
  }
}
