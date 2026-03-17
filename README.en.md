# YouTube Chinese Reading Assistant

<div align="center">

![Version](https://img.shields.io/badge/version-5.3.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/Chrome-Extension-yellow)
![Manifest](https://img.shields.io/badge/Manifest-V3-orange)

**Chinese subtitle text-to-speech + on-screen English OCR translation overlay**

[中文说明](README.md)

</div>

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Third-party Dependencies](#third-party-dependencies)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Chinese Subtitle TTS** — Automatically extracts Chinese subtitles from YouTube and reads them aloud using Google Web Speech API
- **Precise timeline sync** — Triggers speech at exact subtitle timestamps; supports "complete reading" and "follow video" modes
- **Multi-voice / speed control** — Lists all Chinese voices available in the browser; adjustable speed and pitch
- **SRT / VTT subtitle upload** — Import local subtitle files
- **OCR English translation** — Captures the YouTube video frame, recognizes English text with Tesseract.js, translates via MyMemory API
- **Translation overlay** — Renders translated text as a semi-transparent overlay on the video
- **Completely free** — No API key or account required

---

## Installation

> Developer Mode (Load Unpacked)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/YangLi-AlgForce/YouTube-Voice-Translator.git
   ```
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **"Load unpacked"** and select the repository root folder
5. The extension is installed and its icon will appear in the toolbar

> **OCR note**: `tesseract.min.js` is already bundled in the repository — no extra download needed.

---

## Usage

### Chinese TTS

| Step | Action |
|------|--------|
| 1 | Open any YouTube video and enable **Chinese subtitles** |
| 2 | The floating panel appears on the right; click **"Grab Subtitles"** |
| 3 | Optional: check "Mute original video" to avoid audio overlap |
| 4 | Click **"Start Reading"** and wait for the progress bar to complete |

### OCR Translation

| Step | Action |
|------|--------|
| 1 | Open a YouTube video with on-screen English text (slides, whiteboards, captions) |
| 2 | In the floating panel, scroll to the **OCR section** |
| 3 | Click **"Start OCR"** to begin recognition |
| 4 | The translated text overlay will appear above the video |

### Voice Settings

- Select a Chinese voice from the dropdown at the top of the panel (recommended: Google Mandarin)
- Use sliders to adjust speech rate (0.5x – 2.0x) and pitch
- After changing voice or speed, click "Start Reading" again to apply

---

## Project Structure

```
YouTube-Voice-Translator/
├── icons/
│   ├── icon16.png          # Extension icon (16×16)
│   ├── icon48.png          # Extension icon (48×48)
│   └── icon128.png         # Extension icon (128×128)
├── background.js           # Background service worker — injects Tesseract
├── content.js              # Main content script — TTS panel & subtitle logic
├── ocr.js                  # OCR translation overlay module
├── panel.css               # Floating panel stylesheet
├── popup.html              # Extension popup UI
├── tesseract.min.js        # Tesseract.js v2 (bundled, minified OCR library)
├── manifest.json           # Chrome Extension Manifest V3 config
├── LICENSE                 # MIT License
└── README.en.md            # This file (English)
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Chrome Extension API (MV3) | Browser extension framework |
| Web Speech API (`SpeechSynthesis`) | Chinese TTS playback |
| Tesseract.js v2 (local `.min.js`) | Video frame OCR recognition |
| MyMemory Translation API | Free English-to-Chinese translation |
| Canvas API | Video frame capture |

---

## Third-party Dependencies

| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| Tesseract.js | v2 (minified) | OCR text recognition | [tesseract.js](https://github.com/naptha/tesseract.js) |
| MyMemory API | — | Free machine translation | [mymemory.translated.net](https://mymemory.translated.net/) |

`tesseract.min.js` is bundled directly within the extension in minified form to bypass YouTube's Content Security Policy (CSP) restrictions, ensuring OCR functionality works within the sandboxed environment.

---

## FAQ

**Q: Why are no Chinese voices available?**

Check if Chinese TTS voices are installed on your system. On Windows, go to Settings → Time & Language → Speech to add Chinese language packs. macOS typically includes Mandarin voices by default.

**Q: How accurate is the OCR?**

Tesseract.js performs well on clear printed English text (slides, captions). Accuracy is limited for handwriting or complex backgrounds. Best suited for static content like slides and whiteboards.

**Q: Does the extension collect my data?**

No. The extension runs entirely locally. The only network request is sending OCR-recognized text to the public MyMemory API for translation. No user data is collected or stored.

---

## Contributing

Issues and Pull Requests are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

---

## License

This project is open-sourced under the [MIT License](LICENSE).

Copyright (c) 2026 YangLi-AlgForce
