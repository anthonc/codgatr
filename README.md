# CodGatr 🐊

**Smart AI Code Downloader for Chrome**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-2.3-green)](https://github.com/yourusername/codgatr)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/anthoncauper)

CodGatr is an open-source Chrome extension that intelligently detects and downloads code snippets from AI chat conversations. Works seamlessly with ChatGPT, Gemini, Claude, Grok, and other AI platforms.

## ✨ Features

- 🎯 **Smart Code Detection** - Automatically detects code blocks in AI conversations
- 📁 **Individual Downloads** - Download single files with one click
- 📦 **ZIP Bundles** - Download all detected code as a ZIP file
- 🏷️ **Intelligent Filenames** - Automatically detects and suggests filenames
- ✏️ **Editable Filenames** - Rename files before downloading
- 🖼️ **Iframe Support** - Works with Gemini Canvas and preview windows
- 🔒 **Privacy First** - All processing happens locally, zero data collection
- ⚡ **Lightweight** - Minimal resource usage, fast performance
- 🧹 **Noise Filtering** - Automatically filters out editor CSS and non-code content
- 🔢 **Line Number Removal** - Automatically removes line numbers from code blocks

## 🌐 Supported Platforms

- ✅ ChatGPT (chat.openai.com, chatgpt.com)
- ✅ Google Gemini (gemini.google.com, bard.google.com)
- ✅ Claude (claude.ai, anthropic.com)
- ✅ Grok (grok.x.com, x.com/i/grok*)
- ✅ Perplexity AI
- ✅ Poe
- ✅ DeepSeek Chat
- ✅ Hugging Face Chat
- ✅ Mistral AI
- ✅ NotebookLM
- ✅ Microsoft Copilot
- ✅ Bing AI
- ✅ You.com

## 🚀 Installation

### From Chrome Web Store

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore) (link coming soon)
2. Click "Add to Chrome"
3. Confirm installation

### Manual Installation (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/codgatr.git
   cd codgatr
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked"

5. Select the `codgatr` folder

## 📖 Usage

1. **Open an AI chat** (ChatGPT, Gemini, Claude, etc.)
2. **Generate code** in your conversation
3. **Click the CodGatr icon** in your browser toolbar
4. **View detected files** in the popup
5. **Download individually** or as a ZIP bundle

### Features:
- **Individual Download**: Click the download button next to each file
- **ZIP Download**: Click "Download ZIP" to get all files at once
- **Rename Files**: Click on any filename to edit it
- **Clear List**: Click the trash icon to clear the detected files list
- **Settings**: Click the settings icon to customize behavior

## 🔒 Privacy

**CodGatr does NOT collect any data.**

- ✅ All processing happens locally in your browser
- ✅ No network requests to external servers
- ✅ No analytics or tracking
- ✅ No data collection or storage
- ✅ Settings stored locally only

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for complete details.

## 🛠️ Development

### Project Structure

```
codgatr/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for downloads
├── content.js            # Code detection script
├── popup.html            # Popup UI
├── popup.js              # Popup logic
├── popup.css             # Popup styling
├── injected.css           # Button styles
├── zip.js                # ZIP file creation utility
├── options/              # Settings page
│   ├── options.html
│   ├── options.js
│   └── options.css
└── icons/                # Extension icons
```

### Building

No build process required! The extension uses vanilla JavaScript and can be loaded directly.

### Testing

1. Load the extension in developer mode
2. Test on multiple AI platforms:
   - ChatGPT
   - Gemini (including Canvas/iframes)
   - Claude
   - Grok
3. Test features:
   - Code detection
   - Individual downloads
   - ZIP downloads
   - Filename editing
   - Settings page

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Areas for Contribution

- Support for new AI platforms
- Improved code detection algorithms
- Better filename detection
- UI/UX improvements
- Performance optimizations
- Bug fixes
- Documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Developed by [Anthon Cauper Labs](https://labs.anthoncauper.com)
- Built for developers who work with AI-generated code
- Inspired by the need for better code extraction tools
- Supported by the open source community

**Special thanks to all contributors and supporters!** 🎉

## 💝 Support the Project

CodGatr is free and open source. If you find it useful, please consider supporting the project:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/anthoncauper)

**Support Options:**
- ☕ [Buy Me a Coffee](https://buymeacoffee.com/anthoncauper) - One-time or monthly support
- ⭐ Star the project on GitHub
- 🐛 Report bugs and issues
- 💡 Suggest new features
- 🔧 Contribute code improvements

Your support helps keep the project maintained and free for everyone!

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/codgatr/issues)
- **Website**: [Anthon Cauper Labs](https://labs.anthoncauper.com)
- **Donate**: [Buy Me a Coffee](https://buymeacoffee.com/anthoncauper)
- **Email**: (Contact information available on website)

## 🗺️ Roadmap

- [ ] Support for more AI platforms
- [ ] Improved code detection accuracy
- [ ] Custom file naming patterns
- [ ] Export/import settings
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts
- [ ] Batch operations

## ⭐ Star History

If you find CodGatr useful, please consider giving it a star on GitHub!

---

**Made with ❤️ by the open source community**

*CodGatr - Smart code detection for AI conversations*
