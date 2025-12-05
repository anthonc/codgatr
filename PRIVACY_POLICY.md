# CodGatr Privacy Policy

**Last Updated:** November 2025

## Overview

CodGatr ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how our Chrome extension handles your data.

## Data Collection

**We do NOT collect, store, or transmit any personal data.**

### What We Don't Do:
- ❌ We do not collect any personal information
- ❌ We do not track your browsing activity
- ❌ We do not send data to external servers
- ❌ We do not use analytics or telemetry
- ❌ We do not store your code or conversations
- ❌ We do not access your files or system beyond what's necessary for downloads

### What We Do:
- ✅ All processing happens locally in your browser
- ✅ Code detection runs entirely on your device
- ✅ Downloads are handled by Chrome's native download API
- ✅ Settings are stored locally using Chrome's storage API (syncs to your Google account if enabled)

## Permissions Explained

### Required Permissions:
- **`activeTab`**: Allows the extension to access the current tab to detect code blocks
- **`scripting`**: Enables code injection for detection functionality
- **`downloads`**: Required to save detected code files to your computer
- **`storage`**: Stores your extension settings (theme, preferences) locally
- **`webNavigation`**: Used to detect code in iframes (e.g., Gemini Canvas previews)

### Host Permissions:
The extension only requests access to AI chat platforms where it can detect code:
- ChatGPT, Gemini, Claude, Grok, Perplexity, and other AI chat platforms

These permissions are necessary for the extension to function. We do not access any data beyond what's needed to detect and download code blocks.

## Local Storage

The extension uses Chrome's `chrome.storage.sync` API to store your preferences:
- Theme settings (light/dark/auto)
- Detection preferences
- File naming preferences

This data is stored locally and synced to your Google account (if Chrome sync is enabled). We have no access to this data.

## Third-Party Services

**We do not use any third-party services, analytics, or tracking tools.**

## Data Security

Since we don't collect or transmit any data, there's no data to secure. All code detection and file processing happens entirely on your device.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date.

## Contact

If you have questions about this Privacy Policy, please contact us at:
- Website: https://labs.anthoncauper.com
- Email: (Contact information available on website)

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)

---

**CodGatr** - Developed by [Anthon Cauper Labs](https://labs.anthoncauper.com)  
© All rights reserved

