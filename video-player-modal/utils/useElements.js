export function useElements(element) {
  const root = element.shadowRoot;
  return {
    modal: root.querySelector('#video-modal'),
    closeBtn: root.querySelector('#video-modal-close'),
    title: root.querySelector('#video-modal-title'),
    iframeContainer: root.querySelector('#video-iframe-container'),
    body: root.querySelector('.video-modal-body'),
    description: root.querySelector('#video-modal-description'),
    relatedSection: root.querySelector('#related-section'),
    relatedContainer: root.querySelector('#video-modal-related-videos'),
    relatedItemTemplate: root.querySelector('#related-video-item-template')
  };
}