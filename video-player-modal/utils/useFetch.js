/**
 * 使用 fetch 取得影片資料
 * @param {string} playerId - 資料庫序號
 * @returns {Promise<Object>} - 影片資料
 * @returns {Object} - 影片資料
 * @returns {boolean} - 是否成功
 * @returns {string} - 錯誤訊息
 */
export async function useFetchData(apiPath, playerId) {
  // 取得影片詳細資料
  try {
    const response = await fetch(`${apiPath}?id=${encodeURIComponent(playerId)}`);
    const data = await response.json();

    if (!data.status || !data.video) {
      return { status: false, message: '載入影片資料失敗' };
    }
    const { videoId } = data.video;
    if (!videoId) {
      return { status: false, message: '此影片沒有 videoId' };
    }
    return data;
  } catch (error) {
    console.error('載入影片資料失敗:', error);
    return {
      status: false,
      message: '載入影片資料失敗',
    };
  }
}