const TITLE_TEMPLATE = `
<div class="video-modal-header">
  <h3 class="video-modal-title" id="video-modal-title"></h3>
</div>
`;

const DESCRIPTION_TEMPLATE = `
<div class="video-modal-description" id="video-modal-description"></div>
`;

const RELATED_SECTION_TEMPLATE = `
  <div class="video-modal-related-section" id="related-section">
    <h4 class="related-title">相關影片</h4>
    <div class="video-modal-related-videos" id="video-modal-related-videos">
    </div>
  </div>`

const RELATED_ITEM_TEMPLATE = `
  <template id="related-video-item-template">
    <div class="related-video-item" data-id="">
      <div class="related-video-cover">
        <img class="related-video-thumbnail" src="" alt="">
        <div class="related-video-play-icon">
          <div class="play-icon-triangle"></div>
        </div>
      </div>
      <p class="related-video-title"></p>
    </div>
  </template>
`;

export const MODAL_TEMPLATE = ({showTitle, showDescription, showRelated}) => `
<div class="video-modal-overlay" id="video-modal">
  <div class="video-modal-container">
    <button class="video-modal-close" id="video-modal-close" aria-label="關閉視窗">&times;</button>
    <div class="video-modal-content">
      ${showTitle ? TITLE_TEMPLATE : ''}
      <div class="video-modal-body">
        <div class="video-iframe-container" id="video-iframe-container">
        </div>
        ${showDescription ? DESCRIPTION_TEMPLATE : ''}
        ${showRelated ? RELATED_SECTION_TEMPLATE : ''}
      </div>
      ${showRelated ? RELATED_ITEM_TEMPLATE : ''}
    </div>
  </div>
</div>
`;