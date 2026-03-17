# YouTube 中文朗读助手 / YouTube Chinese Reading Assistant

<div align="center">

![Version](https://img.shields.io/badge/version-5.3.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/Chrome-Extension-yellow)
![Manifest](https://img.shields.io/badge/Manifest-V3-orange)

**中文字幕朗读 + 画面英文 OCR 翻译叠加**

*Chinese subtitle text-to-speech + on-screen English OCR translation overlay*

</div>

---

## 目录 / Table of Contents

- [功能特性 / Features](#功能特性--features)
- [安装方法 / Installation](#安装方法--installation)
- [使用说明 / Usage](#使用说明--usage)
- [项目结构 / Project Structure](#项目结构--project-structure)
- [技术栈 / Tech Stack](#技术栈--tech-stack)
- [第三方依赖 / Third-party Dependencies](#第三方依赖--third-party-dependencies)
- [常见问题 / FAQ](#常见问题--faq)
- [贡献 / Contributing](#贡献--contributing)
- [许可证 / License](#许可证--license)

---

## 功能特性 / Features

### 中文

- **中文字幕朗读** — 自动提取 YouTube 页面中文字幕，通过 Google Web Speech API 进行高质量 TTS 朗读
- **精准时间轴同步** — 严格按字幕时间戳触发，支持「完整朗读」和「跟随视频」两种模式
- **多语音 / 语速调节** — 动态列出浏览器中所有中文语音，支持语速、音调调整
- **SRT / VTT 字幕上传** — 支持本地字幕文件导入
- **OCR 英文识别翻译** — 截取 YouTube 视频画面，使用 Tesseract.js 识别英文文字，通过 MyMemory API 翻译为中文
- **叠加字幕显示** — 翻译结果以半透明浮层形式叠加在视频上方
- **完全免费** — 无需 API Key，无需注册账号

### English

- **Chinese Subtitle TTS** — Automatically extracts Chinese subtitles from YouTube and reads them aloud using Google Web Speech API
- **Precise timeline sync** — Triggers speech at exact subtitle timestamps; supports "complete reading" and "follow video" modes
- **Multi-voice / speed control** — Lists all Chinese voices available in the browser; adjustable speed and pitch
- **SRT / VTT subtitle upload** — Import local subtitle files
- **OCR English translation** — Captures the YouTube video frame, recognizes English text with Tesseract.js, translates via MyMemory API
- **Translation overlay** — Renders translated text as a semi-transparent overlay on the video
- **Completely free** — No API key or account required

---

## 安装方法 / Installation

### 中文（开发者模式加载）

1. 克隆或下载本仓库到本地：
   ```bash
   git clone https://github.com/YangLi-AlgForce/YouTube-Voice-Translator.git
   ```
2. 打开 Chrome 浏览器，进入 `chrome://extensions`
3. 开启右上角 **「开发者模式」**
4. 点击 **「加载已解压的扩展程序」**，选择仓库根目录
5. 扩展安装完成，图标会出现在工具栏

> **OCR 功能说明**：`tesseract.min.js` 已包含在仓库中，无需额外下载。

### English (Developer Mode)

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

## 使用说明 / Usage

### 中文朗读 / Chinese TTS

| 步骤 | 操作 |
|------|------|
| 1 | 打开任意 YouTube 视频，开启 **中文字幕** |
| 2 | 右侧悬浮面板自动弹出，点击 **「抓取页面字幕」** |
| 3 | 可选：勾选「关闭原视频声音」以避免双声道 |
| 4 | 点击 **「开始朗读」**，等待进度条完成后自动播放 |

### OCR 翻译 / OCR Translation

| Step | Action |
|------|--------|
| 1 | Open a YouTube video with on-screen English text (slides, subtitles, captions) |
| 2 | In the floating panel, scroll to the **「画面英文识别翻译」** section |
| 3 | Click **「开启识别」** to start OCR |
| 4 | The translated overlay will appear above the video |

### 语音设置 / Voice Settings

- 在面板顶部下拉菜单选择中文语音（推荐：Google 普通话）
- 使用滑块调整语速（0.5x – 2.0x）和音调
- 切换语音或语速后需重新点击「开始朗读」

---

## 项目结构 / Project Structure

```
YouTube-Voice-Translator/
├── icons/
│   ├── icon16.png          # Extension icon (16×16)
│   ├── icon48.png          # Extension icon (48×48)
│   └── icon128.png         # Extension icon (128×128)
├── background.js           # Background service worker — injects Tesseract
├── content.js              # Main content script — TTS panel & subtitle logic
├── ocr.js                  # OCR translation module
├── panel.css               # Floating panel stylesheet
├── popup.html              # Extension popup UI
├── tesseract.min.js        # Tesseract.js v2 (bundled, minified OCR library)
├── manifest.json           # Chrome Extension Manifest V3
├── LICENSE                 # MIT License
└── README.md               # This file
```

---

## 技术栈 / Tech Stack

| 技术 / Technology | 用途 / Purpose |
|-------------------|----------------|
| Chrome Extension API (MV3) | 浏览器扩展框架 / Browser extension framework |
| Web Speech API (`SpeechSynthesis`) | 中文 TTS 朗读 / Chinese TTS playback |
| Tesseract.js v2 (local `.min.js`) | 视频帧 OCR 识别 / Video frame OCR |
| MyMemory Translation API | 英译中翻译 / English-to-Chinese translation |
| Canvas API | 视频帧截图 / Video frame capture |

---

## 第三方依赖 / Third-party Dependencies

| 库 / Library | 版本 / Version | 用途 / Purpose | 来源 / Source |
|--------------|----------------|----------------|---------------|
| Tesseract.js | v2 (minified) | OCR 文字识别 / OCR text recognition | [tesseract.js](https://github.com/naptha/tesseract.js) |
| MyMemory API | — | 免费机器翻译 / Free machine translation | [mymemory.translated.net](https://mymemory.translated.net/) |

`tesseract.min.js` 以压缩形式直接打包在扩展内，以绕过 YouTube 页面的 CSP（Content Security Policy）限制，保证 OCR 功能在沙盒环境下正常运行。

*`tesseract.min.js` is bundled directly within the extension in minified form to bypass YouTube's Content Security Policy (CSP) restrictions, ensuring OCR functionality works within the sandboxed environment.*

---

## 常见问题 / FAQ

**Q: 为什么没有中文语音可选？/ Why are no Chinese voices available?**

A: 请检查系统是否安装了中文 TTS 引擎。在 Windows 上可到「设置 → 时间和语言 → 语音」添加中文语言包；macOS 通常自带普通话语音。

*Check if Chinese TTS voices are installed on your system. On Windows, go to Settings → Time & Language → Speech to add Chinese language packs. macOS typically includes Mandarin voices by default.*

**Q: OCR 识别准确率如何？/ How accurate is OCR?**

A: Tesseract.js 对清晰的英文印刷体（如 PPT、字幕）识别效果良好，对手写体或复杂背景效果有限。建议在静态内容（板书、幻灯片）上使用。

*Tesseract.js performs well on clear printed English text (slides, captions). Accuracy is limited for handwriting or complex backgrounds. Best suited for static content like slides and whiteboards.*

**Q: 扩展会收集我的数据吗？/ Does the extension collect my data?**

A: 不会。本扩展完全在本地运行，唯一的网络请求是向 MyMemory 公共 API 发送 OCR 识别到的文字进行翻译。不收集、不存储任何用户数据。

*No. The extension runs entirely locally. The only network request is sending OCR-recognized text to the public MyMemory API for translation. No user data is collected or stored.*

---

## 贡献 / Contributing

欢迎提交 Issue 和 Pull Request！请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

*Issues and Pull Requests are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.*

---

## 许可证 / License

本项目基于 [MIT 许可证](LICENSE) 开源。

*This project is open-sourced under the [MIT License](LICENSE).*

Copyright (c) 2026 YangLi-AlgForce
