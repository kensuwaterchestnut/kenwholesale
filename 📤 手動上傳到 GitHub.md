# 📤 手動上傳到 GitHub

## ⚠️ Git Push 失敗
權限問題：目前的 Git 帳號是 `GanxinOrchard`，但倉庫屬於 `kensuwaterchestnut`。

---

## 🚀 解決方案

### 方法 1：使用 GitHub Desktop（最簡單）✅

1. **打開 GitHub Desktop**

2. **切換到 kenwholesale 倉庫**

3. **檢查變更**
   - 應該會看到 `index.html` 有修改

4. **填寫 Commit 訊息**
   ```
   更新 GAS 網址並加入圖片配對除錯訊息
   ```

5. **點選「Commit to main」**

6. **點選「Push origin」**

---

### 方法 2：重新設定 Git 帳號

```bash
cd c:\Users\張-1\CascadeProjects\kenwholesale

# 設定正確的 GitHub 帳號
git config user.name "kensuwaterchestnut"
git config user.email "你的 GitHub Email"

# 重新推送
git push
```

---

### 方法 3：直接在 GitHub 網站上傳

1. **打開 GitHub 倉庫**
   https://github.com/kensuwaterchestnut/kenwholesale

2. **點選 `index.html`**

3. **點選「編輯」（鉛筆圖示）**

4. **複製本地檔案內容**
   - 打開 `c:\Users\張-1\CascadeProjects\kenwholesale\index.html`
   - 全選複製（Ctrl+A → Ctrl+C）

5. **貼上到 GitHub 編輯器**
   - 全選刪除原本的內容
   - 貼上新內容（Ctrl+V）

6. **Commit changes**
   - 填寫訊息：`更新 GAS 網址並加入圖片配對除錯訊息`
   - 點選「Commit changes」

---

## ✅ 上傳完成後

### 1. 等待 GitHub Pages 部署（約 1-2 分鐘）

### 2. 打開網站
https://kensuwaterchestnut.github.io/kenwholesale/

### 3. 清除快取並診斷
按 `F12` 打開 Console，執行：
```javascript
localStorage.clear()
location.reload()
```

### 4. 查看 Console 訊息
應該會看到：
```
🌐 從 GAS 載入商品資料...
🔍 配對商品: 啃酥專用粉 (啃酥專用粉), 可用圖片: 6 張
✅ 完全匹配: 啃酥專用粉 → 啃酥專用粉.jpg
✅ 載入 21 個商品，版本: 1761131003451
```

### 5. 檢查圖片
- 如果看到「✅ 完全匹配」但圖片還是沒顯示
- 檢查圖片網址是否可以在新分頁中打開
- 檢查 Google Drive 資料夾權限

---

## 🔍 如果還是沒圖片

在 Console 中執行完整診斷：
```javascript
(async () => {
  console.log('=== 開始診斷 ===');
  localStorage.clear();
  const response = await fetch('https://script.google.com/macros/s/AKfycbx0gEN3TdKb5PI36hpav9YKe0HFDGehEPUJmK7IwEJNdRwn4WV5fHvnmDQBFrN_V-ivQQ/exec');
  const data = await response.json();
  console.log('GAS 回應:', data);
  console.log('圖片總數:', (data.images.常溫?.length || 0) + (data.images.冷藏?.length || 0) + (data.images.冷凍?.length || 0));
  console.log('商品總數:', data.products?.length);
  console.log('第一個商品:', data.products?.[0]);
  console.log('=== 診斷完成 ===');
  location.reload();
})();
```

然後把 Console 的輸出截圖給我看！

---

**請先用上述任一方法上傳 index.html，然後告訴我結果！** 🚀
