// background.js - Handles downloads with proper MIME types

function sanitizeFilename(name) {
  // Remove illegal characters for Windows/Linux/Mac filesystems
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download_single") {
    // Get user setting for download prompt
    chrome.storage.sync.get({ askLocation: true }, (settings) => {
      const downloadUrl = request.isDataUrl ? request.data : null;
      const safeFilename = sanitizeFilename(request.filename);

      // If it's a data URL, download directly
      if (downloadUrl) {
        chrome.downloads.download({
          url: downloadUrl,
          filename: safeFilename,
          saveAs: settings.askLocation
        }, (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error('Download error:', chrome.runtime.lastError.message);
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon-128.png',
              title: 'Download Failed',
              message: chrome.runtime.lastError.message
            });
          }
        });
      } else {
        // Otherwise, use FileReader for blobs
        try {
          const mimeType = request.mimeType || 'text/plain';
          const blob = new Blob([request.data], { type: mimeType });
          const reader = new FileReader();

          reader.onload = function () {
            chrome.downloads.download({
              url: reader.result,
              filename: safeFilename,
              saveAs: settings.askLocation
            }, (downloadId) => {
              if (chrome.runtime.lastError) {
                console.error('Download error:', chrome.runtime.lastError.message);
                chrome.notifications.create({
                  type: 'basic',
                  iconUrl: 'icons/icon-128.png',
                  title: 'Download Failed',
                  message: chrome.runtime.lastError.message
                });
              }
            });
          };

          reader.onerror = function () {
            console.error('FileReader error');
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon-128.png',
              title: 'Download Error',
              message: 'Failed to read file data.'
            });
          };

          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Download handler error:', error);
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon-128.png',
            title: 'Download Error',
            message: error.message
          });
        }
      }
    });
  }

  return true; // Keep channel open for async response
});
