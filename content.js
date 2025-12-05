// content.js - Fixes Incomplete Downloads, Noise, and Line Numbers

const ALLOWED_HOSTS = [
    "chatgpt.com", "gemini.google.com", "grok.x.ai", "claude.ai",
    "www.bing.com", "perplexity.ai", "chat.deepseek.com", "poe.com",
    "huggingface.co", "chat.mistral.ai", "notebooklm.google.com",
    "chat.openai.com", "bard.google.com", "grok.x.com", "x.com",
    "anthropic.com", "you.com", "copilot.microsoft.com"
];

const currentHostname = window.location.hostname;
const isAllowed = ALLOWED_HOSTS.some(host => currentHostname.includes(host));

let settings = {};

// --- Settings Loader ---
function loadSettings(callback) {
    chrome.storage.sync.get([
        'autoDetect', 'streamDetect', 'removeLineNumbers', 'smartNaming',
        'defaultExtension', 'dedupContent', 'autoExtension', 'detectLang', 'minContentLen'
    ], (result) => {
        settings = {
            autoDetect: result.autoDetect !== false,
            streamDetect: result.streamDetect !== false,
            removeLineNumbers: result.removeLineNumbers !== false,
            smartNaming: result.smartNaming !== false,
            defaultExtension: result.defaultExtension || 'txt',
            dedupContent: result.dedupContent !== false,
            autoExtension: result.autoExtension !== false,
            detectLang: result.detectLang !== false,
            minContentLen: result.minContentLen || 200
        };
        if (callback) callback();
    });
}

if (!isAllowed) {
    // Still listen for messages even if not on an allowed site
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "settings_updated") {
            loadSettings();
        }
        return true;
    });
} else {
    run();
}

function run() {
    const languageMap = {
        javascript: 'js', js: 'js',
        typescript: 'ts', ts: 'ts',
        jsx: 'jsx', tsx: 'tsx',
        html: 'html', css: 'css',
        python: 'py', py: 'py',
        java: 'java',
        c: 'c', cpp: 'cpp', 'c++': 'cpp',
        csharp: 'cs', 'c#': 'cs',
        go: 'go',
        rust: 'rs',
        php: 'php',
        ruby: 'rb',
        swift: 'swift',
        kotlin: 'kt',
        sql: 'sql',
        json: 'json',
        xml: 'xml',
        yaml: 'yaml', yml: 'yaml',
        markdown: 'md', md: 'md',
        shell: 'sh', bash: 'sh', sh: 'sh',
        powershell: 'ps1',
        dockerfile: 'dockerfile',
        plaintext: 'txt', text: 'txt'
    };

    const downloadIcon = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    `;

    const checkIcon = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    `;

    let capturedSnippets = [];
    let ignoredHashes = new Set(); // To store hashes of cleared items
    const inIframe = window.self !== window.top;

    // Simple hash function to detect duplicates
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    // --- Noise Filter ---
    function isNoise(content) {
        const trimmed = content.trim();

        // 1. Short garbage
        if (trimmed.length < settings.minContentLen) return true;

        // 2. Aggressive Codicon check
        const codiconMatches = trimmed.match(/\.codicon-/g) || [];
        const codiconCount = codiconMatches.length;

        if (codiconCount > 2) return true;

        const nonWhitespaceLength = trimmed.replace(/\s/g, '').length;
        const codiconTextLength = codiconCount * '.codicon-'.length;
        if (nonWhitespaceLength > 0 && codiconTextLength / nonWhitespaceLength > 0.3) {
            return true;
        }

        const lines = trimmed.split('\n').filter(line => line.trim().length > 0);
        if (lines.length > 3) {
            const codiconLines = lines.filter(line => line.trim().includes('.codicon-'));
            if (codiconLines.length > lines.length * 0.5) {
                return true;
            }
        }

        if (trimmed.includes('.codicon-') && (trimmed.includes('content:') || trimmed.includes(':before'))) return true;
        if (trimmed.includes('--vscode-')) return true;
        if (trimmed.includes('.monaco-editor')) return true;

        if (codiconCount > 0) {
            const hasCodeStructure = /(function|const|let|var|class|import|export|return|if|for|while|=>|{|}|\(|\))/.test(trimmed);
            if (!hasCodeStructure && codiconCount >= 1) {
                return true;
            }
        }

        return false;
    }

    // --- Line Number Remover ---
    function removeLineNumbers(text) {
        if (!settings.removeLineNumbers) return text;

        const lines = text.split('\n');
        let numberCount = 0;
        let validLines = 0;

        for (let i = 0; i < Math.min(lines.length, 15); i++) {
            const line = lines[i];
            if (line.trim().length === 0) continue;

            validLines++;
            if (/^\s*\d+\s/.test(line)) numberCount++;
        }

        if (validLines > 0 && numberCount > validLines / 2) {
            return lines.map(line => line.replace(/^\s*\d+\s+/, '')).join('\n');
        }

        return text;
    }

    function getCorrectCodeContent(container) {
        const codeElement = container.querySelector('code') || container;
        let rawContent = codeElement.innerText || codeElement.textContent;

        if (!container.querySelector('code') && rawContent.match(/^\s*1\s*\n\s*2\s*\n/)) {
            rawContent = rawContent.replace(/^\s*\d+\s*/gm, '');
        }

        return removeLineNumbers(rawContent);
    }

    function detectFilename(container, codeContent, extension) {
        if (!settings.smartNaming) return null;

        const firstLine = codeContent.split('\n')[0].trim();
        const commentMatch = firstLine.match(/^(?:\/\/|#|<!--|;)\s*([a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9]+)\b/);
        if (commentMatch) {
            const foundExt = commentMatch[1].split('.').pop();
            if (foundExt === extension) return commentMatch[1];
        }

        let prev = container.previousElementSibling;
        let attempts = 3;

        if (inIframe && !prev) {
            const parentHeader = container.closest('.code-header, .header');
            if (parentHeader) prev = parentHeader;
        }

        while (prev && attempts > 0) {
            const text = prev.innerText || "";
            const extRegex = new RegExp(`\\b([\\w\\-\\.]+\\.${extension})\\b`, 'i');
            const match = text.match(extRegex);
            if (match) return match[1];

            if (text.includes(':')) {
                const parts = text.split(':');
                const candidate = parts[parts.length - 1].trim();
                if (candidate.toLowerCase().endsWith('.' + extension)) {
                    return candidate;
                }
            }
            prev = prev.previousElementSibling;
            attempts--;
        }
        return null;
    }

    function sanitizeFilename(name) {
        return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();
    }

    function detectAndInject() {
        if (!settings.autoDetect) return;

        const codeContainers = document.querySelectorAll('pre, div.code-block, div[class*="highlight"], div[class*="code"], div[class*="Code"], [class*="code-viewer"], [class*="CodeViewer"], [class*="code-container"], [class*="monaco"]');

        let tempSnippets = [];
        let seenContent = new Set();

        codeContainers.forEach((container, index) => {
            if (container.tagName === 'DIV' && container.innerText.length < 20) return;

            const codeElement = container.querySelector('code') || container;
            let extension = settings.defaultExtension;
            if (settings.detectLang) {
                const classes = (codeElement.className || "").split(' ');
                const parentClasses = (container.className || "").split(' ');
                const allClasses = [...classes, ...parentClasses];
                for (let cls of allClasses) {
                    if (cls.startsWith('language-') || cls.startsWith('lang-')) {
                        const rawLang = cls.replace('language-', '').replace('lang-', '');
                        if (languageMap[rawLang]) {
                            extension = languageMap[rawLang];
                            break;
                        }
                    }
                }
            }

            let cleanContent = getCorrectCodeContent(container);

            if (!cleanContent.trim()) return;
            if (isNoise(cleanContent)) return;

            const contentHash = hashCode(cleanContent.trim());
            if (settings.dedupContent && seenContent.has(contentHash)) return;
            seenContent.add(contentHash);
            if (ignoredHashes.has(contentHash)) return;

            let filename = detectFilename(container, cleanContent, extension);
            if (filename) filename = sanitizeFilename(filename);
            if (!filename) filename = `snippet_${index + 1}.${extension}`;

            tempSnippets.push({
                id: contentHash,
                filename: filename,
                extension: extension,
                content: cleanContent
            });

            if (!container.querySelector('.codecatcher-container')) {
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'codecatcher-container';

                if (inIframe) {
                    buttonContainer.style.position = 'absolute';
                    buttonContainer.style.top = '10px';
                    buttonContainer.style.right = '10px';
                }

                const btn = document.createElement('button');
                btn.className = 'codecatcher-btn';
                const btnLabel = filename.startsWith('snippet_') ? `.${extension}` : filename;

                btn.innerHTML = downloadIcon;
                const span = document.createElement('span');
                span.textContent = btnLabel;
                btn.appendChild(span);
                btn.title = `Download ${filename}`;

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();

                    const finalContent = getCorrectCodeContent(container);

                    chrome.runtime.sendMessage({
                        action: "download_single",
                        data: finalContent,
                        filename: filename
                    });

                    const originalIcon = btn.firstChild.cloneNode(true);
                    const originalSpan = btn.lastChild.cloneNode(true);
                    btn.innerHTML = checkIcon;
                    const savedSpan = document.createElement('span');
                    savedSpan.textContent = 'Saved!';
                    btn.appendChild(savedSpan);
                    btn.classList.add('saved');
                    setTimeout(() => {
                        btn.innerHTML = '';
                        btn.appendChild(originalIcon);
                        btn.appendChild(originalSpan);
                        btn.classList.remove('saved');
                    }, 2000);
                });

                buttonContainer.appendChild(btn);

                const style = window.getComputedStyle(container);
                if (style.position === 'static') {
                    container.style.position = 'relative';
                }
                container.appendChild(buttonContainer);
            }
        });

        capturedSnippets = tempSnippets;
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "get_snippets") {
            sendResponse({ snippets: capturedSnippets });
        } else if (request.action === "clear_snippets") {
            capturedSnippets.forEach(s => ignoredHashes.add(s.id));
            capturedSnippets = [];
            sendResponse({ status: "cleared" });
        } else if (request.action === "settings_updated") {
            loadSettings(detectAndInject);
        }
        return true;
    });

    function initDetection() {
        if (!document.body) {
            const bodyObserver = new MutationObserver((mutations, obs) => {
                if (document.body) {
                    detectAndInject();
                    obs.disconnect();
                }
            });
            bodyObserver.observe(document.documentElement, { childList: true });
        } else {
            detectAndInject();
        }

        if (document.body && settings.streamDetect) {
            const observer = new MutationObserver(() => {
                clearTimeout(observer.timeout);
                observer.timeout = setTimeout(detectAndInject, 500);
            });

            observer.observe(document.body, { childList: true, subtree: true });
            console.log('CodGatr: Stream detection initialized');
        }
    }

    loadSettings(() => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initDetection);
        } else {
            initDetection();
        }
    });
}
