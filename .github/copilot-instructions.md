# CodGatr Chrome Extension - Copilot Instructions

## Architecture Overview
CodGatr is a Manifest V3 Chrome extension for downloading AI-generated code files from chats (ChatGPT, Gemini, Claude, etc.). 

**Core Flow**:
1. Content script (`content/content.js`) injects floating panel/UI via `injectPanelHTML()` on `<all_urls>` (all_frames=true).
2. `utils/detector.js` uses MutationObserver to scan DOM changes, parse conversation text via `utils/parser.js` for file patterns (e.g., `src/App.jsx:\n<code>`).
3. Detected files stored in `currentFiles[]`, emitted via `aiFilesDetected` CustomEvent.
4. UI renders editable list; downloads use Chrome `downloads.download()` (primary), FileSaver fallback, clipboard last-resort.
5. Background `background.js` handles icon clicks (`action.onClicked`), shortcuts (`commands.onCommand`), badge updates, context menu.

**Boundaries**:
- Content ↔ Background: `chrome.runtime.sendMessage({action: 'openPanel'})`.
- No external APIs; all local (JSZip/FileSaver in `libs/`).
- Security: `sanitizeFilename()` in `content/content.js` blocks traversal (`../`), limits depth(10)/size(10MB/file,100MB/ZIP).

**Key Files**:
```
manifest.json      # Permissions: downloads,storage; hosts: AI sites
content/content.js # UI injection, downloads, state (currentFiles)
utils/detector.js  # Real-time scanning (debounced MutationObserver)
background.js      # Service worker: messaging, badge
libs/jszip.min.js  # ZIP creation (`downloadAllAsZip()`)
```

## Developer Workflows
- **Load/Test**: `chrome://extensions/` → Developer mode → Load unpacked → select workspace root. Test on `chat.openai.com`: generate code files → 📁 bottom-right → download.
- **Debug**:
  - Content: F12 → Console on AI page ("RGator initialized").
  - Background: `chrome://extensions/` → Inspect service worker.
  - No build/tests; validate via manual load + console.
- **Reload**: Toggle extension off/on in `chrome://extensions/`.
- **Icons/Badges**: `chrome.action.setBadgeText({text: count.toString()})`.

## Conventions & Patterns
- **Globals**: Utils export to `window` (e.g., `window.CodeDetector.init(window.FileParser)`); no imports (Manifest V3 script order).
- **Error Handling**: Try-catch everywhere; fallbacks (e.g., `chrome.downloads` → `saveAs` → clipboard + `confirm()`).
- **Sanitization**: Always `sanitizeFilename(filename)` before ZIP/download; constants: `MAX_FILE_SIZE=10MB`, `MAX_PATH_DEPTH=10`.
- **Notifications**: `showNotification(msg, type)` (success/error/info) as fixed toasts.
- **Events**: CustomEvents for decoupling (e.g., `aiFilesDetected`).
- **Selectors**: AI-specific (Gemini: `[class*=\"code-viewer\"]`); scan conversation containers.
- **No TS/ESM**: Plain JS; avoid `import` (use Manifest `<script>` order).

## Integration Points
- **AI Sites**: `host_permissions` list (add new: update manifest + detector.sites[]).
- **Downloads**: `chrome.downloads.download({url: blobURL, filename})`; revoke `URL.revokeObjectURL()`.
- **Storage**: `chrome.storage.sync.get/set(['autoDetect','theme'])`.
- **Shortcuts**: `commands` in manifest; `Ctrl+Shift+D` → `open-panel`.

Follow existing patterns exactly (e.g., fallback chains, sanitization). Reference `ENHANCEMENTS.md`/`SECURITY_AUDIT.md` for rationale.