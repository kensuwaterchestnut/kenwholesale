# 📸 Google Drive 圖片載入系統

> 將您的靜態網站改造為「後端供圖、前端自動載入」模式  
> 後端：Google Apps Script + Google Drive  
> 前端：原生 JavaScript（無需框架）

---

## ✨ 特色功能

- ✅ **零後端成本** - 使用免費的 Google Drive 和 Apps Script
- ✅ **自動更新** - 上傳圖片到 Drive 即可自動顯示在網站
- ✅ **檔名排序** - 支援 `01_`、`02_` 數字前綴自動排序
- ✅ **快取機制** - 智慧快取，減少 API 請求
- ✅ **響應式支援** - 可設定手機/桌機不同圖片
- ✅ **無需修改版型** - 只需加入容器和載入器
- ✅ **完整除錯** - 詳細的錯誤訊息和日誌

---

## 📦 文件清單

| 文件 | 說明 | 用途 |
|------|------|------|
| **Code.gs** | Google Apps Script 後端 | 從 Drive 讀取圖片並回傳 JSON |
| **loader.js** | 前端載入器 | 自動載入圖片到指定容器 |
| **demo.html** | 示例頁面 | 完整可用的範例 HTML |
| **SETUP_GUIDE.md** | 📘 設定指南 | **從零開始的完整教學** |
| **INTEGRATION_GUIDE.md** | 🔗 整合指南 | **整合到現有網站（index.html）** |
| **ADVANCED_FEATURES.md** | 🚀 進階功能 | 響應式、Manifest、延遲載入等 |
| **TROUBLESHOOTING.md** | 🔧 故障排除 | 常見問題解決方法 |
| **CHECKLIST.md** | ✅ 檢查清單 | 逐步驗收測試 |

---

## 🚀 快速開始（5 步驟）

### 1️⃣ 準備 Google Drive 資料夾

```
我的雲端硬碟/
└── 網站圖片/
    ├── hero/        （首頁大圖）
    ├── about/       （關於我們）
    └── products/    （產品圖片）
```

- 設定權限：「知道連結的任何人」+ 「檢視者」
- 複製資料夾 ID（URL 中 `/folders/` 後面的那串）

### 2️⃣ 部署 Google Apps Script

1. 前往 https://script.google.com
2. 新專案 → 貼上 `Code.gs` 內容
3. 填入資料夾 ID：
   ```javascript
   const FOLDER_MAP = {
     hero: '您的資料夾ID',
     about: '您的資料夾ID',
   };
   ```
4. 部署 → 新增部署 → 網頁應用程式
5. 執行身分選「我」，存取權限選「任何人」
6. 複製 Web App URL

### 3️⃣ 設定前端載入器

1. 將 `loader.js` 放入您的網站資料夾
2. 開啟 `loader.js`，填入 API URL：
   ```javascript
   const API_URL = '您的GAS_URL';
   ```

### 4️⃣ 在 HTML 中加入容器

```html
<!-- 容器 ID 必須對應 FOLDER_MAP 的 key -->
<section id="hero"></section>
<section id="about"></section>

<!-- 載入器（放在 </body> 之前） -->
<script src="loader.js"></script>
```

### 5️⃣ 測試

1. 在 Drive 資料夾上傳一張圖片（建議檔名：`01_test.jpg`）
2. 開啟網頁，應該看到圖片自動載入
3. 完成！🎉

---

## 📖 詳細文檔

### 🔰 新手必讀
👉 **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - 完整的圖文設定教學

### 🚀 進階使用
👉 **[ADVANCED_FEATURES.md](ADVANCED_FEATURES.md)** - 學習更多功能：
- 手機/桌機分流載入
- 使用 Google Sheets 管理圖片屬性
- 延遲載入優化
- 自訂載入動畫
- Lightbox 燈箱效果

### 🔧 遇到問題？
👉 **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - 常見問題解決：
- 圖片不顯示
- CORS 錯誤
- 權限問題
- 快取問題
- 效能優化

---

## 🎯 使用規則

### 資料夾 = 區塊
```
Drive 資料夾     FOLDER_MAP      HTML 容器
    hero/    →      hero     →   <div id="hero">
```

### 檔名排序
```
✅ 01_first.jpg   → 第 1 張
✅ 02_second.jpg  → 第 2 張
✅ 10_tenth.jpg   → 第 10 張

❌ 1_first.jpg    → 排序錯亂（1, 10, 2, 3...）
```

### 支援格式
JPG、PNG、WEBP、SVG、GIF

---

## 🔄 工作流程

```
┌─────────────┐
│ 上傳圖片到   │
│ Google Drive │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ GAS 自動讀取 │
│ 回傳 JSON    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 前端載入器   │
│ 顯示圖片     │
└─────────────┘
```

更新圖片只需：上傳到 Drive → 重新整理網頁 → 完成！

---

## 📝 需要替換的變數

### Code.gs（後端）
```javascript
const FOLDER_MAP = {
  hero: 'YOUR_HERO_FOLDER_ID',          // ← 填入 Drive 資料夾 ID
  about: 'YOUR_ABOUT_FOLDER_ID',        // ← 填入 Drive 資料夾 ID
  products: 'YOUR_PRODUCTS_FOLDER_ID',  // ← 填入 Drive 資料夾 ID
};
```

### loader.js（前端）
```javascript
const API_URL = 'YOUR_GAS_WEB_APP_URL_HERE';  // ← 填入 GAS 部署的 URL
```

---

## 🎨 範例展示

開啟 `demo.html` 可以看到完整的範例頁面，包含：
- Hero 首頁大圖區
- About 關於我們區
- Products 產品展示區
- Gallery 圖庫區

每個區塊都會自動從對應的 Drive 資料夾載入圖片。

---

## ⚡ 效能建議

1. **圖片大小優化**
   - Hero 大圖：< 500KB
   - 產品圖：< 200KB
   - 使用 WebP 格式

2. **啟用延遲載入**
   ```javascript
   const LOADER_CONFIG = {
     lazyLoad: true,
   };
   ```

3. **使用響應式圖片**
   - 手機版：750x1334
   - 桌面版：1920x1080

---

## 🔒 安全性

- ✅ Drive 資料夾設為「檢視者」權限（唯讀）
- ✅ GAS 只讀取圖片，不會修改或刪除
- ✅ API 回傳公開資料，不含敏感資訊
- ✅ 前端載入器不收集使用者資料

---

## 📱 瀏覽器支援

- ✅ Chrome / Edge（最新版）
- ✅ Firefox（最新版）
- ✅ Safari（最新版）
- ✅ 手機瀏覽器（iOS Safari、Android Chrome）

---

## 🤝 常見問題 FAQ

**Q: 免費嗎？**  
A: 是的！使用 Google Drive 和 Apps Script 完全免費。

**Q: 圖片數量有限制嗎？**  
A: Drive 儲存空間限制（免費 15GB），GAS 每日執行次數有配額。

**Q: 可以用在商業網站嗎？**  
A: 可以，但建議評估流量，高流量網站建議使用付費 CDN。

**Q: 如何更新圖片？**  
A: 直接在 Drive 上傳/刪除/重新命名圖片，網頁重新整理即可。

**Q: 支援影片嗎？**  
A: 目前只支援圖片，影片需額外修改程式碼。

---

## 📞 取得協助

遇到問題？按照以下順序：

1. 查看 **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**
2. 檢查瀏覽器 Console（F12）
3. 檢查 GAS 執行記錄
4. 使用 `demo.html` 測試基本功能

---

## 📄 授權

本專案採用 MIT 授權，可自由使用和修改。

---

## 🎉 開始使用

準備好了嗎？開始閱讀 **[SETUP_GUIDE.md](SETUP_GUIDE.md)** 吧！

**預計時間：30 分鐘**  
**難度：⭐⭐☆☆☆（簡單）**

---

Made with ❤️ for 柑心果園
