# YouTube 中文朗读助手

<div align="center">

![Version](https://img.shields.io/badge/版本-5.3.0-blue)
![License](https://img.shields.io/badge/许可证-MIT-green)
![Chrome](https://img.shields.io/badge/Chrome-扩展程序-yellow)
![Manifest](https://img.shields.io/badge/Manifest-V3-orange)

**中文字幕朗读 + 画面英文 OCR 翻译叠加**

[English README](README.en.md)

</div>

---

## 目录

- [功能特性](#功能特性)
- [安装方法](#安装方法)
- [使用说明](#使用说明)
- [项目结构](#项目结构)
- [技术栈](#技术栈)
- [第三方依赖](#第三方依赖)
- [常见问题](#常见问题)
- [贡献](#贡献)
- [许可证](#许可证)

---

## 功能特性

- **中文字幕朗读** — 自动提取 YouTube 页面中文字幕，通过 Google Web Speech API 进行高质量 TTS 朗读
- **精准时间轴同步** — 严格按字幕时间戳触发，支持「完整朗读」和「跟随视频」两种模式
- **多语音 / 语速调节** — 动态列出浏览器中所有中文语音，支持语速、音调调整
- **SRT / VTT 字幕上传** — 支持本地字幕文件导入
- **OCR 英文识别翻译** — 截取 YouTube 视频画面，使用 Tesseract.js 识别英文文字，通过 MyMemory API 翻译为中文
- **叠加字幕显示** — 翻译结果以半透明浮层形式叠加在视频上方
- **完全免费** — 无需 API Key，无需注册账号

---

## 安装方法

> 开发者模式加载（Developer Mode）

1. 克隆或下载本仓库到本地：
   ```bash
   git clone https://github.com/YangLi-AlgForce/YouTube-Voice-Translator.git
   ```
2. 打开 Chrome 浏览器，进入 `chrome://extensions`
3. 开启右上角 **「开发者模式」**
4. 点击 **「加载已解压的扩展程序」**，选择仓库根目录
5. 扩展安装完成，图标会出现在工具栏

> **OCR 功能说明**：`tesseract.min.js` 已包含在仓库中，无需额外下载。

---

## 使用说明

### 中文字幕朗读

| 步骤 | 操作 |
|------|------|
| 1 | 打开任意 YouTube 视频，开启 **中文字幕** |
| 2 | 右侧悬浮面板自动弹出，点击 **「抓取页面字幕」** |
| 3 | 可选：勾选「关闭原视频声音」以避免双声道 |
| 4 | 点击 **「开始朗读」**，等待进度条完成后自动播放 |

### OCR 画面翻译

| 步骤 | 操作 |
|------|------|
| 1 | 打开含有英文画面文字的 YouTube 视频（如幻灯片、板书） |
| 2 | 在悬浮面板中找到 **「画面英文识别翻译」** 区域 |
| 3 | 点击 **「开启识别」** 启动 OCR |
| 4 | 翻译结果以叠加层形式显示在视频上方 |

### 语音设置

- 在面板顶部下拉菜单选择中文语音（推荐：Google 普通话）
- 使用滑块调整语速（0.5x – 2.0x）和音调
- 切换语音或语速后需重新点击「开始朗读」

---

## 项目结构

```
YouTube-Voice-Translator/
├── icons/
│   ├── icon16.png          # 扩展图标 16×16
│   ├── icon48.png          # 扩展图标 48×48
│   └── icon128.png         # 扩展图标 128×128
├── background.js           # 后台 Service Worker — 注入 Tesseract
├── content.js              # 主内容脚本 — TTS 面板与字幕逻辑
├── ocr.js                  # OCR 翻译叠加模块
├── panel.css               # 悬浮面板样式表
├── popup.html              # 扩展弹出页 UI
├── tesseract.min.js        # Tesseract.js v2（本地打包，压缩版 OCR 库）
├── manifest.json           # Chrome 扩展 Manifest V3 配置
├── LICENSE                 # MIT 许可证
└── README.md               # 本文件（中文）
```

---

## 技术栈

| 技术 | 用途 |
|------|------|
| Chrome Extension API (MV3) | 浏览器扩展框架 |
| Web Speech API (`SpeechSynthesis`) | 中文 TTS 朗读 |
| Tesseract.js v2（本地 `.min.js`） | 视频帧 OCR 识别 |
| MyMemory Translation API | 英译中免费翻译 |
| Canvas API | 视频帧截图 |

---

## 第三方依赖

| 库 | 版本 | 用途 | 来源 |
|----|------|------|------|
| Tesseract.js | v2（压缩版） | OCR 文字识别 | [tesseract.js](https://github.com/naptha/tesseract.js) |
| MyMemory API | — | 免费机器翻译 | [mymemory.translated.net](https://mymemory.translated.net/) |

`tesseract.min.js` 以压缩形式直接打包在扩展内，以绕过 YouTube 页面的 CSP（Content Security Policy）限制，保证 OCR 功能在沙盒环境下正常运行。

---

## 常见问题

**Q：为什么没有中文语音可选？**

请检查系统是否安装了中文 TTS 引擎。在 Windows 上可到「设置 → 时间和语言 → 语音」添加中文语言包；macOS 通常自带普通话语音。

**Q：OCR 识别准确率如何？**

Tesseract.js 对清晰的英文印刷体（如 PPT、字幕）识别效果良好，对手写体或复杂背景效果有限。建议在静态内容（板书、幻灯片）上使用。

**Q：扩展会收集我的数据吗？**

不会。本扩展完全在本地运行，唯一的网络请求是向 MyMemory 公共 API 发送 OCR 识别到的文字进行翻译。不收集、不存储任何用户数据。

---

## 贡献

欢迎提交 Issue 和 Pull Request！请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

Copyright (c) 2026 YangLi-AlgForce
