// options.js - Settings page logic

document.addEventListener('DOMContentLoaded', () => {
    const autoDetect = document.getElementById('auto-detect');
    const streamDetect = document.getElementById('stream-detect');
    const askLocation = document.getElementById('ask-location');
    const removeLineNumbers = document.getElementById('remove-line-numbers');
    const smartNaming = document.getElementById('smart-naming');
    const defaultExtension = document.getElementById('default-extension');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');
    const statusMessage = document.getElementById('status-message');
    const dedupContent = document.getElementById('dedup-content');
    const autoExtension = document.getElementById('auto-extension');
    const detectLang = document.getElementById('detect-lang');
    const minContent = document.getElementById('min-content');
    const minContentValue = document.getElementById('min-content-value');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const statsList = document.getElementById('stats-list');

    // Load saved settings
    function loadSettings() {
        chrome.storage.sync.get([
            'autoDetect',
            'streamDetect',
            'askLocation',
            'removeLineNumbers',
            'smartNaming',
            'defaultExtension',
            'dedupContent',
            'autoExtension',
            'detectLang',
            'minContentLen'
        ], (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error loading settings:', chrome.runtime.lastError);
                return;
            }

            // Set values from storage or use defaults
            autoDetect.checked = result.autoDetect !== false;
            streamDetect.checked = result.streamDetect !== false;
            askLocation.checked = result.askLocation !== false;
            removeLineNumbers.checked = result.removeLineNumbers !== false;
            smartNaming.checked = result.smartNaming !== false;
            defaultExtension.value = result.defaultExtension || 'txt';
            dedupContent.checked = result.dedupContent !== false;
            autoExtension.checked = result.autoExtension !== false;
            detectLang.checked = result.detectLang !== false;
            minContent.value = result.minContentLen || 200;
            minContentValue.textContent = (result.minContentLen || 200) + ' chars';
        });
    }

    // Save settings
    function saveSettings() {
        const settings = {
            autoDetect: autoDetect.checked,
            streamDetect: streamDetect.checked,
            askLocation: askLocation.checked,
            removeLineNumbers: removeLineNumbers.checked,
            smartNaming: smartNaming.checked,
            defaultExtension: defaultExtension.value,
            dedupContent: dedupContent.checked,
            autoExtension: autoExtension.checked,
            detectLang: detectLang.checked,
            minContentLen: parseInt(minContent.value)
        };

        chrome.storage.sync.set(settings, () => {
            if (chrome.runtime.lastError) {
                showStatus('Error saving settings. Please try again.', 'error');
                console.error('Error saving settings:', chrome.runtime.lastError);
            } else {
                showStatus('Settings saved successfully!', 'success');
                // Send a message to content scripts to update
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, { action: "settings_updated" });
                    }
                });
            }
        });
    }

    // Reset to defaults
    function resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            autoDetect.checked = true;
            streamDetect.checked = true;
            askLocation.checked = true;
            removeLineNumbers.checked = true;
            smartNaming.checked = true;
            defaultExtension.value = 'txt';
            dedupContent.checked = true;
            autoExtension.checked = true;
            detectLang.checked = true;
            minContent.value = 200;
            
            saveSettings();
            showStatus('Settings reset to defaults.', 'success');
        }
    }

    // Show status message
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        
        setTimeout(() => {
            statusMessage.className = 'status-message';
            statusMessage.style.display = 'none';
        }, 3000);
    }

    // Range handler
    minContent.addEventListener('input', () => {
      minContentValue.textContent = minContent.value + ' chars';
    });

    // Export
    exportBtn.addEventListener('click', () => {
      chrome.storage.sync.get(null, (allSettings) => {
        const dataStr = JSON.stringify(allSettings, null, 2);
        const blob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
          url, filename: 'codgatr-settings.json', saveAs: true
        });
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
    });

    // Import
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const settings = JSON.parse(ev.target.result);
          chrome.storage.sync.set(settings, () => {
            loadSettings();
            showStatus('Settings imported!', 'success');
          });
        } catch(err) {
          showStatus('Invalid JSON', 'error');
        }
      };
      reader.readAsText(file);
    });

    // Stats
    function loadStats() {
      chrome.storage.local.get(['stats'], (result) => {
        const stats = result.stats || { filesDetected: 0, downloads: 0, zips: 0 };
        statsList.innerHTML = `
          <div class="stat-item">Files Detected: ${stats.filesDetected || 0}</div>
          <div class="stat-item">Downloads: ${stats.downloads || 0}</div>
          <div class="stat-item">ZIPs Created: ${stats.zips || 0}</div>
        `;
      });
    }
    loadStats();

    // Event listeners
    saveBtn.addEventListener('click', saveSettings);
    resetBtn.addEventListener('click', resetSettings);

    // Load settings on page load
    loadSettings();
});
