import { useElements } from '../utils/useElements.js';
const LITE_YOUTUBE_SCRIPT_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/lite-youtube-embed/0.3.3/lite-yt-embed.js';
const LITE_YOUTUBE_CSS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/lite-youtube-embed/0.3.3/lite-yt-embed.css';
const LITE_YOUTUBE_SCRIPT_INTEGRITY = 'sha512-WKiiKu2dHNBXgIad9LDYeXL80USp6v+PmhRT5Y5lIcWonM2Avbn0jiWuXuh7mL2d5RsU3ZmIxg5MiWMEMykghA==';
const PLAYER_VARS = {
  autoplay: 1,       // 點擊後自動播放
  controls: 1,       // 顯示播放器控制項
  rel: 0,            // 相關影片只顯示同頻道
  playsinline: 1,    // iOS 內嵌播放
  modestbranding: 0, // 顯示 YouTube 品牌
  enablejsapi: 0,    // 啟用 YouTube IFrame Player API（配合 js-api 屬性使用）
  iv_load_policy: 3, // 不顯示影片註解
  jsApi: false  // ← 必須設為 true 才能啟用完整功能
};

const ELEMENT_ATTRS = {
  jsApi: true  // ← 必須設為 true 才能啟用完整功能
};

export class liteYoutubeService {
  constructor(element, videoData) {
    this.element = element;
    this.cssText = '';
    this.videoData = videoData;
    this.elements = useElements(element);
  }

  // === 快取與 Promise 管理 ===
  static resourcePromise = null;
  static cssCache = null;


  async #loadResource() {
    if (liteYoutubeService.resourcePromise) return liteYoutubeService.resourcePromise;

    liteYoutubeService.resourcePromise = (async () => {
      const scriptExists = document.querySelector(
        `script[src="${LITE_YOUTUBE_SCRIPT_SRC}"]`
      );

      if (!scriptExists) {
        const script = document.createElement('script');
        script.src = LITE_YOUTUBE_SCRIPT_SRC;
        script.integrity = LITE_YOUTUBE_SCRIPT_INTEGRITY;
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';

        document.head.append(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () =>
            reject(new Error('lite-youtube-embed 腳本載入失敗'));
        });
      }
      await customElements.whenDefined('lite-youtube');

    })();
    return liteYoutubeService.resourcePromise;
  }
  async #loadCSS() {
    if (liteYoutubeService.cssCache) return liteYoutubeService.cssCache;
    try {
      const response = await fetch(LITE_YOUTUBE_CSS_SRC);
      if (response.ok) {
          const cssText = await response.text();
          liteYoutubeService.cssCache = cssText;
          return cssText;
      }
      return '';
    } catch (error) {
        console.error('載入 lite-youtube CSS 失敗:', error);
        return '';
    }
  }

  #createPlayer() {
    const { videoId, title } = this.videoData;
    const { iframeContainer } = this.elements;
    if (!iframeContainer) return;

    iframeContainer.innerHTML = '';

    // 播放器元素
    const el = document.createElement('lite-youtube');
    const params = new URLSearchParams(PLAYER_VARS).toString();
    const playlabel = title && title.trim()
      ? `播放：${title.trim()}`
      : '播放影片';
    el.setAttribute('videoid', videoId);
    el.setAttribute('params', params);
    el.setAttribute('playlabel', playlabel);
    if (ELEMENT_ATTRS.jsApi) {
      el.setAttribute('js-api', '');
    };

    // 播放器 CSS
    const style = document.createElement('style');
    style.textContent = this.cssText;

    el.appendChild(style);
    iframeContainer.appendChild(el);
  }

  // === 掛載與銷毀 ===
  async mount() {
    await this.#loadResource();
    this.cssText = await this.#loadCSS();
    this.#createPlayer();
  }

  destroy() {
    const { iframeContainer } = this.elements;
    if (!iframeContainer) return;
    iframeContainer.innerHTML = '';
  }
}