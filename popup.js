import { SimpleZip } from './zip.js';
function sanitizeFilename(name) {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();
}

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('snippet-list');
    const emptyState = document.getElementById('empty-state');
    const downloadZipBtn = document.getElementById('download-zip');
    const clearBtn = document.getElementById('clear-btn');
    const settingsBtn = document.getElementById('settings-btn');

    let currentSnippets = [];

    // Settings button handler
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            chrome.runtime.openOptionsPage(() => {
                if (chrome.runtime.lastError) {
                    chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
                }
            });
        });
    }

    // --- Multi-frame Scanning Logic ---
    // This allows us to catch code inside iframes (like Gemini Canvas or preview windows)
    function loadSnippets() {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tabId = tabs[0]?.id;
            if (!tabId) {
                emptyState.textContent = "No active tab found.";
                return;
            }

            // 1. Get all frames in the tab (Main page + All Iframes)
            chrome.webNavigation.getAllFrames({ tabId: tabId }, (frames) => {
                if (!frames || frames.length === 0) {
                    showEmpty();
                    return;
                }

                const promises = frames.map(frame => {
                    return new Promise((resolve) => {
                        // Send message to specific frameId
                        chrome.tabs.sendMessage(
                            tabId,
                            { action: "get_snippets" },
                            { frameId: frame.frameId },
                            (response) => {
                                // Ignore errors (e.g. if frame is restricted or hasn't loaded script)
                                if (chrome.runtime.lastError || !response || !response.snippets) {
                                    resolve([]);
                                } else {
                                    resolve(response.snippets || []);
                                }
                            }
                        );
                    });
                });

                // 2. Wait for all frames to answer
                Promise.all(promises).then(results => {
                    // Flatten results (array of arrays -> single array)
                    const allSnippets = results.flat();

                    // 3. Deduplicate (Combine results from main page and iframes)
                    const uniqueSnippets = [];
                    const seenHashes = new Set();

                    allSnippets.forEach(snip => {
                        if (snip && snip.id && !seenHashes.has(snip.id)) {
                            seenHashes.add(snip.id);
                            uniqueSnippets.push(snip);
                        }
                    });

                    console.log(`CodGatr: Collected ${uniqueSnippets.length} unique snippets from ${frames.length} frame(s)`);

                    if (uniqueSnippets.length > 0) {
                        currentSnippets = uniqueSnippets;
                        renderList(uniqueSnippets);
                    } else {
                        showEmpty();
                    }
                });
            });
        });
    }

    // Load snippets on popup open
    loadSnippets();

    // Reload when popup regains focus
    window.addEventListener('focus', () => {
        setTimeout(loadSnippets, 100);
    });

    function showEmpty() {
        emptyState.style.display = 'flex';
        listContainer.style.display = 'none';
        downloadZipBtn.disabled = true;
        downloadZipBtn.innerText = "Download as ZIP";
    }

    function renderList(snippets) {
        emptyState.style.display = 'none';
        listContainer.style.display = 'block';
        listContainer.innerHTML = '';
        downloadZipBtn.disabled = false;

        // Update download button safely
        downloadZipBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
        const zipCount = document.createTextNode(` Download ZIP (${snippets.length})`);
        downloadZipBtn.appendChild(zipCount);

        snippets.forEach((snip, index) => {
            const item = document.createElement('div');
            item.className = 'file-item';

            // Clean preview of code (first 50 chars)
            const preview = snip.content.trim().substring(0, 50).replace(/\n/g, ' ') + '...';

            // Use safe DOM creation instead of innerHTML
            const fileIcon = document.createElement('div');
            fileIcon.className = 'file-icon';
            fileIcon.textContent = snip.extension.toUpperCase();

            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';

            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.contentEditable = 'true';
            fileName.spellcheck = false;
            fileName.textContent = snip.filename;

            const filePreview = document.createElement('div');
            filePreview.className = 'file-preview';
            filePreview.textContent = preview;

            fileInfo.appendChild(fileName);
            fileInfo.appendChild(filePreview);

            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'download-one-btn';
            downloadBtn.title = 'Download File';
            downloadBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/></svg>';

            item.appendChild(fileIcon);
            item.appendChild(fileInfo);
            item.appendChild(downloadBtn);

            // Rename Logic
            fileName.addEventListener('input', (e) => {
                currentSnippets[index].filename = e.target.textContent.trim();
            });

            // Download Single Logic
            downloadBtn.addEventListener('click', () => {
                chrome.runtime.sendMessage({
                    action: "download_single",
                    data: snip.content,
                    filename: sanitizeFilename(currentSnippets[index].filename)
                });
            });

            listContainer.appendChild(item);
        });
    }

    // Clear List Logic (Broadcasts clear to all frames)
    clearBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0]?.id;
            if (!tabId) return;

            chrome.webNavigation.getAllFrames({ tabId: tabId }, (frames) => {
                if (frames) {
                    frames.forEach(frame => {
                        chrome.tabs.sendMessage(tabId, { action: "clear_snippets" }, { frameId: frame.frameId });
                    });
                }
                currentSnippets = [];
                showEmpty();
            });
        });
    });

    // ZIP Download Logic
    downloadZipBtn.addEventListener('click', async () => {
        const originalHTML = downloadZipBtn.innerHTML;
        downloadZipBtn.innerHTML = '';
        downloadZipBtn.textContent = "Zipping...";
        downloadZipBtn.disabled = true;

        // Get user setting for download prompt
        chrome.storage.sync.get({ askLocation: true }, (settings) => {
            try {
                const zipper = new SimpleZip();
                const nameCounts = {};

                currentSnippets.forEach(snip => {
                    let finalName = sanitizeFilename(snip.filename);
                    if (nameCounts[finalName]) {
                        nameCounts[finalName]++;
                        const parts = finalName.split('.');
                        const ext = parts.pop();
                        const base = parts.join('.');
                        finalName = `${base}_${nameCounts[finalName]}.${ext}`;
                    } else {
                        nameCounts[finalName] = 1;
                    }
                    zipper.addFile(finalName, snip.content);
                });

                const blob = zipper.generate();
                const reader = new FileReader();

                reader.onload = function () {
                    // Send to background script for download
                    chrome.runtime.sendMessage({
                        action: "download_single", // Re-use the same download logic
                        data: reader.result, // This is a data URL
                        filename: `CodGatr_Bundle_${Date.now()}.zip`,
                        isDataUrl: true // Flag to prevent re-reading
                    });

                    downloadZipBtn.innerHTML = originalHTML;
                    downloadZipBtn.disabled = false;
                };

                reader.readAsDataURL(blob);

            } catch (e) {
                console.error(e);
                downloadZipBtn.textContent = "Error";
                setTimeout(() => {
                    downloadZipBtn.innerHTML = originalHTML;
                    downloadZipBtn.disabled = false;
                }, 2000);
            }
        });
    });
});
