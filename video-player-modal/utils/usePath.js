/*
* 【實例路徑】
* 1. 實例路徑：從元素的 base-path 屬性中獲取
* 2. 工廠路徑：從 import.meta.url 中獲取
* 3. 正規化路徑：將路徑正規化
* 4. 適合 網站使用此套件時，依實例有不同樣式、不同影片格式者
* 【工廠路徑】
* 1. 從 import.meta.url 中獲取
* 2. 正規化路徑：將路徑正規化
* 3. 適合 網站使用此套件者皆為同樣式、同影片格式者
*/

// 創建實例路徑
export function getInstanceBasePath(element) {
  const attrPath = element.getAttribute('base-path');
  const globalPath = window.VIDEO_PLAYER_MODAL_PATH;
  const basePath = attrPath || globalPath;
  return normalizePath(basePath);
}

// 創建工廠路徑
export function getStaticBasePath() {
  try {
    const path = new URL('..', import.meta.url).href;
    return normalizePath(path);
  } catch (_) {
    return '';
  }
}

// 正規化路徑
function normalizePath(path) {
  if (!path) return '';
  const isAbsolute = /^(https?:)?\/\//.test(path) || path.startsWith('/');
  const resolved = isAbsolute ? path : new URL(path, window.location.href).href;
  return resolved.replace(/\/+$/, '');
}