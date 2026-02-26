// --- UI層 ---
import { MODAL_TEMPLATE } from '../templates/template.js';
import { getInstanceBasePath, getStaticBasePath } from '../utils/usePath.js';
import { useElements } from '../utils/useElements.js';
import { escapeHtml } from '../utils/useUtilities.js';

export class Modal extends HTMLElement {

    // === 元件資源根路徑 ===
    static BASE_PATH = getStaticBasePath();

    // === 快取與 Promise 管理 ===
    static cssCache = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.elements = null;
        this.config = {};
        this._initialized = false;
        this.basePath = getInstanceBasePath(this) || Modal.BASE_PATH;
        this._handleEscapeKey = (e) => {
          if (e.key === 'Escape' && this.isOpen()) this.#closeModal();
      };
    }

    disconnectedCallback () {
      document.removeEventListener('keydown', this._handleEscapeKey);
    }

    // 顯式初始化
    async init(config) {
      if (this._initialized) return;
      this.config = config;
      await this.#render();
      this.elements = useElements(this);
      this.#initEventListeners();
      this._initialized = true;
    }

    // === 載入元件自身的 CSS ===
    async #loadCSS() {
        if (Modal.cssCache) {
            return Modal.cssCache;
        }
        // 取得 timestamp 用於版本控制（避免瀏覽器快取）
        const timestamp = window.APP_TIMESTAMP || Date.now();
        const cssPath = `${this.basePath}/styles/video-player-modal.css?v=${timestamp}`;
        try {
            const response = await fetch(cssPath);
            if (response.ok) {
                const cssText = await response.text();
                Modal.cssCache = cssText;
                return cssText;
            }
            return '';
        } catch (error) {
            console.error('載入 YouTube Modal CSS 失敗:', error);
            return '';
        }
    }

    // === 渲染組件（注入 CSS 和 HTML 框架(不含資料內容))===
    async #render() {
        const css = await this.#loadCSS();
        const template = MODAL_TEMPLATE({
            showTitle: this.config.SHOW_TITLE,
            showDescription: this.config.SHOW_DESCRIPTION,
            showRelated: this.config.SHOW_RELATED
          });
        this.shadowRoot.innerHTML = `<style>${css}</style>${template}`;
        await new Promise(resolve => requestAnimationFrame(resolve));
    }

    // === 初始化事件監聽 ===
    #initEventListeners() {
        const { closeBtn, modal, relatedContainer } = this.elements;
        // 關閉按鈕
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.#closeModal());
        }
        // 點擊背景關閉
        if (modal) {
            modal.addEventListener('click', (e) => {
              if (e.target === modal) this.#closeModal();
            });
        }
        // ESC 鍵關閉
        document.addEventListener('keydown', this._handleEscapeKey);
        // 監聽相關影片點擊 (使用事件委派)
        if (relatedContainer) {
            relatedContainer.addEventListener('click', (e) => {
                const item = e.target.closest('.related-video-item');
                if (item) {
                    const newVideoId = item.dataset.id;
                    this.dispatchEvent(new CustomEvent('changeVideo', { detail: newVideoId }));
                }
            });
        }
    }

    // === 渲染相關影片列表 (注入資料內容) ===
    renderRelatedVideos(relatedData) {
        if (!relatedData || relatedData.length === 0) return;
        const { relatedSection, relatedContainer, relatedItemTemplate } = this.elements;
        if (!relatedItemTemplate) return;
        const defaultCover = `${this.basePath}/images/default-cover.jpg`;
        const templateRoot = relatedItemTemplate.content.firstElementChild;
        const fragment = document.createDocumentFragment();
        relatedData.forEach((video) => {
            if (!templateRoot) return;
            const item = templateRoot.cloneNode(true);
            item.dataset.id = video.id || '';
            const thumbnail = item.querySelector('.related-video-thumbnail');
            if (thumbnail) {
                thumbnail.src = video.coverImage || defaultCover;
                thumbnail.alt = escapeHtml(video.title);
            }
            const title = item.querySelector('.related-video-title');
            if (title) title.textContent = video.title || '';
            fragment.appendChild(item);
        });
        relatedContainer.replaceChildren(fragment);
        if (relatedSection) relatedSection.style.display = 'flex';
        // this.#updateBodyVisibility();
    }


    // 更新 body 顯示狀態
    #updateBodyVisibility() {
        const { body, description, relatedSection } = this.elements;
        if (!body) return;
        const descriptionVisible = description && description.style.display !== 'none';
        const relatedVisible = relatedSection && relatedSection.style.display !== 'none';
        body.style.display = (descriptionVisible || relatedVisible) ? '' : 'none';
    }

    // 開啟彈窗
    async openModal(data) {
      const { title, description, relatedSection, modal } = this.elements;
      // 顯示載入狀態
      if (title && this.config.SHOW_TITLE) title.textContent = data.video.title || '載入中...';
      if (description && this.config.SHOW_DESCRIPTION) description.textContent = data.video.description || '';
      if (relatedSection) relatedSection.style.display = 'none';
      if (modal) modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // this.#updateBodyVisibility();
    }

    // 關閉彈窗並清理播放器
    #closeModal() {
        const { modal } = this.elements;
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
        this.dispatchEvent(new CustomEvent('closeModal'));
    }

    // 檢查彈窗是否開啟
    isOpen() {
        const { modal } = this.elements;
        if (modal) {
            return modal.classList.contains('active');
        }
        return false;
    }
}
