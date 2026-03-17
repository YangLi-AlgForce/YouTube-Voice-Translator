# Changelog / 更新日志

All notable changes to this project will be documented in this file.

本文件记录项目所有重要版本变更。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.3.0] - 2026-03

### Added / 新增
- OCR 翻译叠加模块（`ocr.js`）：截取视频帧，使用本地 Tesseract.js 识别英文，通过 MyMemory API 翻译为中文
- OCR 识别间隔滑块控制（1s – 6s）
- 翻译结果叠加层，半透明显示在视频上方
- 本地打包 `tesseract.min.js`，绕过 YouTube CSP 限制
- Background service worker 条件注入 Tesseract 引擎

### Changed / 变更
- 升级至 Chrome Extension Manifest V3
- 面板 UI 全面重设计，采用深色主题 + 紫色渐变配色
- 语音列表动态从浏览器获取，优先选 Google 普通话

### Fixed / 修复
- 修复语音列表在 Chrome 异步加载时为空的问题
- 修复字幕时间轴同步在快速跳转后错位的问题

---

## [4.0.0] - 2025

### Added / 新增
- 中文字幕 TTS 朗读核心功能
- 「完整朗读」与「跟随视频」两种同步模式
- 语速（0.5x – 2.0x）和音调调节
- SRT / VTT 本地字幕文件上传
- 「关闭原视频声音」选项
- TTS 智能队列 + 防抖防重机制
- 可拖动、可最小化悬浮控制面板

### Changed / 变更
- 使用 Google Web Speech API 替代第三方 TTS 服务，实现完全免费

---

## [3.x] - 历史版本 / Legacy

早期版本功能历史未完整记录，以 v4.0.0 为新的稳定基线。

*Early version history is not fully documented. v4.0.0 is treated as the new stable baseline.*

---

[5.3.0]: https://github.com/YangLi-AlgForce/YouTube-Voice-Translator/releases/tag/v5.3.0
[4.0.0]: https://github.com/YangLi-AlgForce/YouTube-Voice-Translator/releases/tag/v4.0.0
