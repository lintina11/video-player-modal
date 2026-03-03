# video-player-modal

影片播放彈窗元件，基於 Web Component（Shadow DOM）實作，支援 YouTube（lite-youtube-embed）與 Google Drive 兩種播放器服務。
點擊觸發按鈕後，以彈窗形式載入影片，並可選擇性顯示標題、描述與相關影片列表。

---

## 檔案結構

```
video-player-modal/
├── main.js                       # 進入點
├── guide.md
├── components/
│   └── VideoPlayerModal.js        # 元件主體
├── services/
│   ├── liteYoutubeService.js     # YouTube 播放器
│   └── googleDriveService.js     # Google Drive 播放器
├── utils/
│   ├── useFetch.js               # API 資料取得
│   ├── useElements.js            # DOM 元素查詢
│   ├── usePath.js                # 資源路徑解析
│   └── useUtilities.js           # 工具函式（XSS 防護等）
├── templates/
│   └── template.js               # HTML 模板 (未使用)
├── styles/
│   └── video-player-modal.css    # 元件樣式
├── images/
│   └── default-cover.jpg         # 相關影片預設封面圖
```

---

## 安裝

```javascript
import { VideoPlayerModal } from '/{路徑}/video-player-modal/main.js';
```

> 須使用 ES Module，`<script>` 標籤需加上 `type="module"`。

---

## 使用方式

### 1. 添加元件

在 HTML 中放置元件，通常置於頁面最下方，需指定 `id` 屬性：

```html
<video-player-modal id="{elementId}" />
```

### 2. 添加觸發按鈕

任何 HTML 元素皆可作為觸發器，僅需添加 `data-player-id` 屬性，值為 API 使用的影片 id。
若頁面有多個播放器實例，需額外添加 `data-modal-name` 屬性來指定歸屬的實例（詳見[多實例使用](#多實例使用)）：

```html
<button data-player-id="1">影片1</button>
<button data-player-id="2">影片2</button>

<!-- 非 button 元素同樣適用 -->
<div data-player-id="3">影片3</div>

<!-- 指定歸屬實例 -->
<button data-player-id="4" data-modal-name="YTplayer">影片4</button>
```

### 3. 註冊實例

在 JavaScript 中建立實例：

```html
<script type="module">
  import { VideoPlayerModal } from '/{路徑}/video-player-modal/main.js';

  new VideoPlayerModal('#{elementId}', '{apiPath}', {
    SHOW_TITLE: true,
    SHOW_DESCRIPTION: true,
    SHOW_RELATED: true,
    PLAYER_SERVICES: 'liteYoutube'
  });
</script>
```

#### 建構式參數

| 參數 | 類型 | 說明 | 必填 |
|---|---|---|---|
| `elementId` | string | 元素選擇器（如 `#my-modal`） | O |
| `apiPath` | string | API 路徑 | O |
| `config` | object | 配置選項 | X |

#### Config 選項

| 參數 | 類型 | 說明 | 預設值 |
|---|---|---|---|
| `SHOW_TITLE` | boolean | 是否顯示影片標題 | `true` |
| `SHOW_DESCRIPTION` | boolean | 是否顯示影片描述 | `true` |
| `SHOW_RELATED` | boolean | 是否顯示相關影片列表 | `true` |
| `PLAYER_SERVICES` | string | 播放器服務，見下方說明 | `'liteYoutube'` |
| `modalName` | string | 實例名稱，用於多實例時綁定對應觸發按鈕 | `''`（空字串） |

**`PLAYER_SERVICES` 可選值：**

| 值 | 說明 | `videoId` 格式 |
|---|---|---|
| `'liteYoutube'` | 使用 [lite-youtube-embed](https://www.npmjs.com/package/lite-youtube-embed) 播放器（從 CDN 動態載入） | YouTube 影片 ID，如 `Gy3NW69KOFA` |
| `'googleDrive'` | 使用 Google Drive iframe 播放器（無額外依賴） | Google Drive 檔案 ID |

---

## 多實例使用

同一頁面可建立多個獨立的播放器實例，透過 `modalName` 與 `data-modal-name` 將觸發按鈕與對應實例綁定。

**綁定規則：**

| 情境 | 觸發按鈕條件 | 說明 |
|---|---|---|
| 設定 `modalName` | 需有 `data-modal-name="{modalName}"` | 僅綁定名稱相符的按鈕 |
| 未設定 `modalName` | 有 `data-player-id` 但**沒有** `data-modal-name` | 綁定未被任何實例指名的按鈕 |

**範例：** YouTube 與 Google Drive 播放器各自獨立

```html
<!-- YouTube 觸發按鈕：透過 data-modal-name 綁定到 YTplayer 實例 -->
<button data-player-id="1" data-modal-name="YTplayer">YouTube 影片1</button>
<button data-player-id="2" data-modal-name="YTplayer">YouTube 影片2</button>

<!-- Google Drive 觸發按鈕：無 data-modal-name，綁定到未設定 modalName 的實例 -->
<div data-player-id="6" data-modal-name="GDplayer">Google Drive 影片1</div>
<div data-player-id="7" data-modal-name="GDplayer">Google Drive 影片2</div>

<!-- 各自獨立的元件 -->
<video-player-modal id="YTplayer-modal"></video-player-modal>
<video-player-modal id="GDplayer-modal"></video-player-modal>

<script type="module">
  import { VideoPlayerModal } from '/{路徑}/video-player-modal/main.js';
  const apiPath = '{apiPath}';

  // YouTube 實例：設定 modalName，只會綁定 data-modal-name="YTplayer" 的按鈕
  new VideoPlayerModal('#YTplayer-modal', apiPath, {
    SHOW_RELATED: true,
    PLAYER_SERVICES: 'liteYoutube',
    modalName: 'YTplayer',
  });

  // Google Drive 實例：未設定 modalName，綁定所有沒有 data-modal-name 的按鈕
  new VideoPlayerModal('#GDplayer-modal', apiPath, {
    SHOW_RELATED: true,
    PLAYER_SERVICES: 'googleDrive',
    modalName: 'GDplayer',
  });
</script>
```

---

## 彈窗互動

彈窗開啟後，支援以下關閉方式：

- 點擊右上角 **關閉按鈕**（×）
- 點擊 **彈窗外背景**（overlay 區域）
- 按下鍵盤 **ESC** 鍵

開啟彈窗時會自動鎖定頁面捲動（`body overflow: hidden`），關閉後恢復。

---

## 自訂事件

元件會觸發以下自訂事件，可透過 `addEventListener` 監聽：

| 事件名稱 | 觸發時機 | `event.detail` |
|---|---|---|
| `openModal` | 彈窗開啟時 | 無 |
| `closeModal` | 彈窗關閉時 | 無 |
| `changeVideo` | 點擊相關影片時 | 新影片的 `playerId` |

```javascript
const modal = document.querySelector('#my-modal');
modal.instance.addEventListener('closeModal', () => {
  console.log('彈窗已關閉');
});
```

---

## 路徑配置

元件會自動透過 `import.meta.url` 推導資源路徑（CSS、預設封面圖等），通常無需手動設定。
若部署路徑與元件所在路徑不同，可使用以下方式覆寫：

| 方式 | 說明 | 優先順序 |
|---|---|---|
| `base-path` 屬性 | 在 HTML 元素上指定 | 最高 |
| `window.VIDEO_PLAYER_MODAL_PATH` | 全域 JS 變數 | 次之 |
| 自動偵測 | 透過 `import.meta.url` 推導 | 最低 |

```html
<!-- 透過屬性指定 -->
<video-player-modal id="my-modal" base-path="/custom/assets/video-player-modal" />
```

### CSS 版本控制

元件載入自身 CSS 時，會附加時間戳避免瀏覽器快取。可透過全域變數指定版本號：

```javascript
window.APP_TIMESTAMP = '20260225';
```

若未設定，預設使用 `Date.now()`。

---

## API 說明

### Request

```
GET {apiPath}?id={playerId}
```

`playerId` 對應觸發按鈕上的 `data-player-id` 值。

### Response — 成功

回傳格式為 JSON：

| 參數 | 類型 | 說明 |
|---|---|---|
| `status` | boolean | 是否成功 |
| `video` | object | 影片資訊 |
| `video.id` | number | 資料庫序號 |
| `video.videoId` | string | 影片 ID（YouTube ID 或 Google Drive 檔案 ID） |
| `video.title` | string | 影片標題 |
| `video.description` | string | 影片描述 |
| `video.coverImage` | string | 封面圖片 URL |
| `related` | array | 相關影片列表（結構同 `video`） |

```json
{
  "status": true,
  "video": {
    "id": 1,
    "videoId": "Gy3NW69KOFA",
    "title": "測試影片標題",
    "description": "這是測試影片的描述",
    "coverImage": "https://img.youtube.com/vi/Gy3NW69KOFA/maxresdefault.jpg"
  },
  "related": [
    {
      "id": 5,
      "videoId": "nSO6SsmAagU",
      "title": "測試影片標題",
      "description": "這是測試影片的描述",
      "coverImage": "https://img.youtube.com/vi/nSO6SsmAagU/maxresdefault.jpg"
    }
  ]
}
```

### Response — 失敗

當 API 回傳 `status: false` 或缺少 `video` / `videoId` 時，彈窗不會開啟。

---

## 注意事項

- **Shadow DOM**：元件使用 Shadow DOM 封裝，外部 CSS 無法直接影響元件內部樣式。
- **觸發器作用範圍**：未設定 `modalName` 的實例會綁定所有**沒有** `data-modal-name` 屬性的 `[data-player-id]` 元素。若有多個未設定 `modalName` 的實例，這些觸發按鈕會同時觸發所有未命名實例。建議多實例時皆設定 `modalName` 以避免衝突。
- **外部依賴**：`liteYoutube` 服務會從 CDN 動態載入 [lite-youtube-embed v0.3.3](https://cdnjs.cloudflare.com/ajax/libs/lite-youtube-embed/0.3.3/lite-yt-embed.js)，需確保網路環境可存取該資源。
- **預設封面圖**：相關影片若缺少 `coverImage`，會使用 `{basePath}/images/default-cover.jpg` 作為預設封面。
