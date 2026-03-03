// --- 控制層 ---
import { Modal } from './components/VideoPlayerModal.js'; // 彈窗控制器
import { useFetchData } from './utils/useFetch.js'; // 獲取影片資訊

// 預設配置
const DEFAULT_CONFIG = {
  SHOW_TITLE: true,
  SHOW_DESCRIPTION: true,
  SHOW_RELATED: true,
  PLAYER_SERVICES: 'liteYoutube',
};

// 播放器服務
import { liteYoutubeService } from './services/liteYoutubeService.js';
import { googleDriveService } from './services/googleDriveService.js';
const PLAYER_SERVICES = {
  liteYoutube: liteYoutubeService,
  googleDrive: googleDriveService
};

export class VideoPlayerModal {
  constructor(elementId , apiPath, config) {
    this.instance = document.querySelector(elementId);
    this.modalName = config.modalName || '';
    this.triggers = document.querySelectorAll('[data-player-id]');
    this.apiPath = apiPath;
    this.player = null;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this._ready = this.instance.init(this.config);
    this.#initEventListeners();
  }

  #initEventListeners() {
    this.triggers.forEach(trigger => {
      const modalName = trigger.dataset.modalName;
      if (this.modalName && modalName !== this.modalName) return; // 有指定 modalName 但與按鈕不相符
      if (!this.modalName && modalName) return; // 沒有指定 modalName 但按鈕有 data-modal-name
      trigger.addEventListener('click', (event) => {
        const playerId = event.currentTarget.dataset.playerId;
        if (!playerId) return;
        this.initPlayer(playerId);
      });
    });

    this.instance.addEventListener('openModal', () => {
      document.body.style.overflow = 'hidden';
    });

    this.instance.addEventListener('closeModal', () => {
      document.body.style.overflow = '';
      this.player?.destroy();
    });

    this.instance.addEventListener('changeVideo', (event) => {
      const newVideoId = event.detail;
      this.player?.destroy();
      this.initPlayer(newVideoId);
    });
  }

  async initPlayer(playerId) {
    await this._ready;
    // 渲染影片資訊
    const data = await useFetchData(this.apiPath, playerId);
    if (!data.status) return;
    await this.instance.openModal(data);

    // 動態建立 lite-youtube 播放器
    this.player = new PLAYER_SERVICES[this.config.PLAYER_SERVICES](this.instance,data.video);
    this.player.mount();
    // 渲染相關影片
    if (this.config.SHOW_RELATED) this.instance.renderRelatedVideos(data.related);
  }
}

// 註冊自定義元素
if (!customElements.get('video-player-modal')) {
  customElements.define('video-player-modal', Modal);
}