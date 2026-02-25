import { useElements } from '../composables/useElements.js';
const GOOGLE_DRIVE_CSS = `
  iframe {
    position: absolute;
    inset: 0;
    border: none;
  }
`;

export class googleDriveService {
  constructor(element, videoData) {
    this.element = element;
    this.videoData = videoData;
    this.elements = useElements(element);
  }
  #createPlayer() {
    const { videoId, title } = this.videoData;
    const { iframeContainer } = this.elements;
    if (!iframeContainer) return;

    iframeContainer.innerHTML = '';
    const el = document.createElement('iframe');
    el.src = `https://drive.google.com/file/d/${videoId}/preview`;
    el.width = '100%';
    el.height = '100%';
    el.allow = 'autoplay; encrypted-media';
    el.setAttribute('allowfullscreen', 'true');
    el.setAttribute('title', title);

    const style = document.createElement('style');
    style.textContent = GOOGLE_DRIVE_CSS;
    iframeContainer.appendChild(style);
    iframeContainer.appendChild(el);
  }

  // === 掛載與銷毀 ===
  async mount() {
    this.#createPlayer();
  }
  destroy() {
    const { iframeContainer } = this.elements;
    if (!iframeContainer) return;
    iframeContainer.innerHTML = '';
  }
}