# Contributing / 贡献指南

感谢你对本项目的兴趣！以下是参与贡献的指南。

*Thank you for your interest in contributing! Here are the guidelines for participating.*

---

## 行为准则 / Code of Conduct

请阅读并遵守 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。

*Please read and follow our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).*

---

## 如何贡献 / How to Contribute

### 报告 Bug / Reporting Bugs

1. 先搜索 [Issues](https://github.com/YangLi-AlgForce/YouTube-Voice-Translator/issues) 确认问题未被报告过
2. 使用 **Bug Report** 模板新建 Issue
3. 请提供：
   - Chrome 版本
   - 操作系统
   - 重现步骤
   - 预期行为 vs 实际行为
   - 控制台错误信息（`F12` → Console）

*1. Search [Issues](https://github.com/YangLi-AlgForce/YouTube-Voice-Translator/issues) first to avoid duplicates*
*2. Use the **Bug Report** issue template*
*3. Please include: Chrome version, OS, steps to reproduce, expected vs actual behavior, console errors*

### 提交功能请求 / Feature Requests

使用 **Feature Request** 模板提交 Issue，描述使用场景和期望行为。

*Use the **Feature Request** issue template. Describe the use case and desired behavior.*

---

## 开发流程 / Development Workflow

### 环境准备 / Setup

```bash
# 克隆仓库 / Clone the repository
git clone https://github.com/YangLi-AlgForce/YouTube-Voice-Translator.git
cd YouTube-Voice-Translator
```

在 Chrome 中加载扩展（开发者模式）：

1. 打开 `chrome://extensions`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」，选择项目根目录

*Load the extension in Chrome (developer mode):*
*1. Open `chrome://extensions`*
*2. Enable "Developer mode"*
*3. Click "Load unpacked" and select the project root*

### 分支策略 / Branching

| 分支 / Branch | 用途 / Purpose |
|---------------|----------------|
| `main` | 稳定发布版 / Stable release |
| `develop` | 开发集成 / Development integration |
| `feature/<name>` | 新功能开发 / New features |
| `fix/<name>` | Bug 修复 / Bug fixes |

### 提交规范 / Commit Convention

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

类型 / Types:
  feat     新功能 / New feature
  fix      Bug 修复 / Bug fix
  docs     文档变更 / Documentation
  style    代码格式（不影响逻辑）/ Code style (no logic change)
  refactor 重构 / Refactoring
  perf     性能优化 / Performance improvement
  chore    构建/工具变更 / Build/tooling changes
```

示例 / Examples:
```
feat(ocr): add adjustable OCR capture interval
fix(tts): resolve voice list empty on Chrome startup
docs: update README installation steps
```

### Pull Request 流程 / PR Process

1. Fork 本仓库
2. 从 `develop` 分支创建你的功能分支：`git checkout -b feature/my-feature`
3. 提交你的修改（遵循提交规范）
4. Push 到你的 Fork：`git push origin feature/my-feature`
5. 向 `develop` 分支提交 Pull Request
6. 在 PR 描述中清楚说明变更内容和测试方法

*1. Fork the repository*
*2. Create your branch from `develop`: `git checkout -b feature/my-feature`*
*3. Commit your changes (follow commit conventions)*
*4. Push to your fork: `git push origin feature/my-feature`*
*5. Open a Pull Request targeting `develop`*
*6. Clearly describe the changes and how to test them*

---

## 代码规范 / Code Style

- 使用 2 空格缩进
- 使用单引号字符串
- 函数和变量使用 camelCase 命名
- 常量使用 UPPER_SNAKE_CASE
- 注释使用中文（核心逻辑）或英文均可
- 避免修改 `tesseract.min.js`（第三方压缩库）

*Use 2-space indentation, single quotes, camelCase for functions/variables, UPPER_SNAKE_CASE for constants. Do not modify `tesseract.min.js` (third-party minified library).*

---

## 测试 / Testing

由于本项目是 Chrome 扩展，请在以下环境中手动测试：

- Chrome 最新稳定版
- 至少一个有中文字幕的 YouTube 视频
- 至少一个有英文画面文字的 YouTube 视频（用于 OCR 测试）

*Since this is a Chrome extension, please manually test in:*
*- Latest stable Chrome*
*- At least one YouTube video with Chinese subtitles*
*- At least one YouTube video with on-screen English text (for OCR testing)*

---

## 许可证 / License

向本项目贡献代码即表示你同意你的贡献将以 [MIT 许可证](LICENSE) 发布。

*By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).*
