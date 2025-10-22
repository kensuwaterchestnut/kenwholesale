# 🔄 更新 GAS 選單 - 加入「手動更新商品」按鈕

## 問題
啃酥面板中沒有「🔄 手動更新商品到前端」按鈕。

## 解決方案

### 方法 1：只更新 onOpen 函數（最快）✅

1. **打開 GAS 編輯器**
   - 試算表 → 擴充功能 → Apps Script

2. **找到 `onOpen` 函數**（在最上面）

3. **替換成以下程式碼：**

```javascript
function onOpen() {
  ensureSheets_();
  SpreadsheetApp.getUi()
    .createMenu('啃酥面板')
      .addItem('📊 打開面板（側邊欄）', 'showDashboard')
      .addSeparator()
      .addItem('授權並安裝', 'installAll_')
      .addSeparator()
      .addItem('🔄 手動更新商品到前端', 'manualRefreshProducts')  // ← 新增這一行
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
```

4. **儲存** 💾

5. **重新整理試算表頁面**

6. **測試**
   - 點選「啃酥面板」→ 應該會看到「🔄 手動更新商品到前端」

---

### 方法 2：重新複製完整的 Part1（如果方法 1 失敗）

如果您不確定如何修改，可以重新複製整個 `Part1_常數和基礎函數.gs` 的內容到 GAS 編輯器。

---

## 完成後

1. 重新整理試算表
2. 點選「啃酥面板」
3. 應該會看到：
   ```
   📊 打開面板（側邊欄）
   ─────────────────
   授權並安裝
   ─────────────────
   🔄 手動更新商品到前端  ← 新按鈕！
   ─────────────────
   寄【出貨信】(選取列)
   寄【催款信】(選取列)
   ...
   ```

---

## 使用方式

修改試算表的商品資料或圖片檔名後：
1. 點選「啃酥面板」→「🔄 手動更新商品到前端」
2. 會跳出提示：「✅ 商品資料已手動更新！版本號: xxxxx」
3. 回到網頁按 Ctrl+F5 重新整理
4. 商品資料和圖片就會更新了！

---

**現在就去更新 GAS 吧！** 更新完後記得重新整理試算表頁面。
