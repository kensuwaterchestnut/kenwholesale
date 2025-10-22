/**
 * Google Drive 圖片載入器
 * 用途：從 GAS API 取得圖片清單，自動載入到指定容器
 * 版本：1.0
 */

// ====== 設定區：請填入您的 GAS Web App URL ======
const API_URL = 'YOUR_GAS_WEB_APP_URL_HERE';
// 範例：'https://script.google.com/macros/s/AKfycbx.../exec'

// ====== 設定：載入選項 ======
const LOADER_CONFIG = {
  showLoadingText: true,        // 是否顯示載入中文字
  showErrorMessage: true,        // 是否顯示錯誤訊息
  lazyLoad: false,              // 是否啟用延遲載入
  fadeInAnimation: true,        // 是否使用淡入動畫
  retryOnError: true,           // 圖片載入失敗時是否重試
  maxRetries: 3,                // 最大重試次數
  cacheTimeout: 300000,         // 快取時間（毫秒，預設 5 分鐘）
};

// ====== 全域變數 ======
let imagesData = null;          // 快取的圖片資料
let lastFetchTime = 0;          // 上次取得資料的時間

/**
 * 初始化載入器
 * 在 DOM 載入完成後自動執行
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎨 圖片載入器初始化...');
  
  // 檢查 API URL 是否已設定
  if (!API_URL || API_URL === 'YOUR_GAS_WEB_APP_URL_HERE') {
    console.error('❌ 錯誤：請先設定 API_URL！');
    showError('API URL 未設定，請在 loader.js 中填入您的 GAS Web App URL');
    return;
  }
  
  // 開始載入圖片
  loadAllImages();
});

/**
 * 主要函數：載入所有圖片
 */
async function loadAllImages() {
  try {
    // 顯示載入狀態
    showLoadingStatus();
    
    // 取得圖片資料
    const data = await fetchImagesData();
    
    if (!data) {
      throw new Error('無法取得圖片資料');
    }
    
    // 遍歷每個區塊，載入圖片
    let totalLoaded = 0;
    for (const [key, images] of Object.entries(data)) {
      if (Array.isArray(images) && images.length > 0) {
        const loaded = await renderImages(key, images);
        totalLoaded += loaded;
        console.log(`✅ ${key}: 載入 ${loaded} 張圖片`);
      }
    }
    
    console.log(`🎉 完成！總共載入 ${totalLoaded} 張圖片`);
    hideLoadingStatus();
    
  } catch (error) {
    console.error('❌ 載入失敗:', error);
    showError('圖片載入失敗：' + error.message);
  }
}

/**
 * 從 API 取得圖片資料
 * @return {Promise<Object>} 圖片資料
 */
async function fetchImagesData() {
  try {
    // 檢查快取
    const now = Date.now();
    if (imagesData && (now - lastFetchTime) < LOADER_CONFIG.cacheTimeout) {
      console.log('📦 使用快取資料');
      return imagesData;
    }
    
    console.log('🌐 從 API 取得資料...');
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 檢查是否有錯誤
    if (data.error) {
      throw new Error(data.message || '未知錯誤');
    }
    
    // 更新快取
    imagesData = data;
    lastFetchTime = now;
    
    return data;
    
  } catch (error) {
    console.error('取得資料失敗:', error);
    throw error;
  }
}

/**
 * 渲染圖片到指定容器
 * @param {string} containerKey - 容器 ID 或選擇器
 * @param {Array} imagesList - 圖片清單
 * @return {number} 成功載入的圖片數量
 */
async function renderImages(containerKey, imagesList) {
  // 尋找容器
  const container = document.getElementById(containerKey) || document.querySelector(containerKey);
  
  if (!container) {
    console.warn(`⚠️ 找不到容器: ${containerKey}`);
    return 0;
  }
  
  // 清空容器（可選）
  // container.innerHTML = '';
  
  let loadedCount = 0;
  
  // 遍歷圖片清單
  for (const imageData of imagesList) {
    try {
      const imgElement = createImageElement(imageData);
      container.appendChild(imgElement);
      loadedCount++;
    } catch (error) {
      console.error(`載入圖片失敗: ${imageData.name}`, error);
    }
  }
  
  return loadedCount;
}

/**
 * 創建圖片元素
 * @param {Object} imageData - 圖片資料
 * @return {HTMLElement} 圖片元素
 */
function createImageElement(imageData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'drive-image-wrapper';
  
  const img = document.createElement('img');
  
  // 設定圖片 URL，加上時間戳避免快取
  img.src = `${imageData.url}&v=${imageData.ts}`;
  img.alt = imageData.name.replace(/\.[^/.]+$/, ''); // 移除副檔名
  img.dataset.fileId = imageData.id;
  img.dataset.timestamp = imageData.ts;
  
  // 延遲載入
  if (LOADER_CONFIG.lazyLoad) {
    img.loading = 'lazy';
  }
  
  // 淡入動畫
  if (LOADER_CONFIG.fadeInAnimation) {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease-in';
    img.onload = function() {
      this.style.opacity = '1';
    };
  }
  
  // 錯誤處理
  if (LOADER_CONFIG.retryOnError) {
    let retryCount = 0;
    img.onerror = function() {
      if (retryCount < LOADER_CONFIG.maxRetries) {
        retryCount++;
        console.log(`🔄 重試載入: ${imageData.name} (${retryCount}/${LOADER_CONFIG.maxRetries})`);
        setTimeout(() => {
          this.src = `${imageData.url}&v=${Date.now()}`;
        }, 1000 * retryCount);
      } else {
        console.error(`❌ 載入失敗: ${imageData.name}`);
        this.style.display = 'none';
      }
    };
  }
  
  wrapper.appendChild(img);
  return wrapper;
}

/**
 * 顯示載入中狀態
 */
function showLoadingStatus() {
  if (!LOADER_CONFIG.showLoadingText) return;
  
  const containers = document.querySelectorAll('[id]');
  containers.forEach(container => {
    if (FOLDER_MAP && FOLDER_MAP[container.id]) {
      const loader = document.createElement('div');
      loader.className = 'drive-loader';
      loader.textContent = '載入中...';
      container.appendChild(loader);
    }
  });
}

/**
 * 隱藏載入中狀態
 */
function hideLoadingStatus() {
  document.querySelectorAll('.drive-loader').forEach(el => el.remove());
}

/**
 * 顯示錯誤訊息
 * @param {string} message - 錯誤訊息
 */
function showError(message) {
  if (!LOADER_CONFIG.showErrorMessage) return;
  
  console.error(message);
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'drive-error';
  errorDiv.innerHTML = `
    <strong>⚠️ 錯誤</strong><br>
    ${message}<br>
    <small>請檢查瀏覽器控制台以獲取更多資訊</small>
  `;
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    max-width: 400px;
  `;
  
  document.body.appendChild(errorDiv);
  
  // 5 秒後自動關閉
  setTimeout(() => errorDiv.remove(), 5000);
}

/**
 * 手動重新載入圖片
 */
function reloadImages() {
  imagesData = null;
  lastFetchTime = 0;
  loadAllImages();
}

/**
 * 清除快取
 */
function clearImageCache() {
  imagesData = null;
  lastFetchTime = 0;
  console.log('✅ 快取已清除');
}

// ====== 進階功能：響應式圖片載入 ======

/**
 * 根據螢幕寬度載入不同圖片
 * @param {string} desktopKey - 桌面版圖片區塊
 * @param {string} mobileKey - 手機版圖片區塊
 * @param {string} containerKey - 容器 ID
 */
async function loadResponsiveImages(desktopKey, mobileKey, containerKey) {
  const isMobile = window.innerWidth < 768;
  const key = isMobile ? mobileKey : desktopKey;
  
  const data = await fetchImagesData();
  if (data && data[key]) {
    await renderImages(containerKey, data[key]);
  }
}

// ====== 樣式（可選） ======
const style = document.createElement('style');
style.textContent = `
  .drive-image-wrapper {
    display: inline-block;
    margin: 10px;
  }
  
  .drive-image-wrapper img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .drive-loader {
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 18px;
  }
  
  .drive-error {
    line-height: 1.6;
  }
`;
document.head.appendChild(style);

// ====== 匯出函數供外部使用 ======
window.DriveImageLoader = {
  reload: reloadImages,
  clearCache: clearImageCache,
  renderImages: renderImages,
  loadResponsive: loadResponsiveImages
};
