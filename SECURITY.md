# Security Policy / 安全政策

## 支持的版本 / Supported Versions

我们为以下版本提供安全补丁支持：

*We provide security patch support for the following versions:*

| 版本 / Version | 支持状态 / Supported |
|----------------|----------------------|
| 5.3.x          | ✅ 当前支持 / Active support |
| 4.x            | ⚠️ 仅严重漏洞 / Critical only |
| < 4.0          | ❌ 不再支持 / No longer supported |

---

## 报告安全漏洞 / Reporting a Vulnerability

**请勿通过公开 Issue 报告安全漏洞。**

*Please do NOT report security vulnerabilities through public Issues.*

### 联系方式 / Contact

如果你发现安全漏洞，请通过以下方式私下告知我们：

*If you discover a security vulnerability, please disclose it privately via:*

1. **GitHub Security Advisories**（推荐 / Recommended）：
   前往仓库 → Security → Advisories → "Report a vulnerability"

   *Go to repository → Security → Advisories → "Report a vulnerability"*

2. **Email**：如 GitHub Advisory 不可用，请联系仓库维护者

   *If GitHub Advisory is unavailable, contact the repository maintainer*

### 报告内容 / What to Include

请在报告中提供：

*Please include in your report:*

- 漏洞类型描述 / Vulnerability type description
- 受影响的文件和代码行 / Affected files and line numbers
- 重现步骤 / Steps to reproduce
- 潜在影响分析 / Potential impact analysis
- 可能的修复建议（可选）/ Suggested fix (optional)

---

## 响应流程 / Response Process

| 时间节点 / Timeline | 操作 / Action |
|---------------------|---------------|
| 收到报告后 48 小时内 / Within 48h of receipt | 确认收到报告 / Acknowledge receipt |
| 7 天内 / Within 7 days | 评估严重性，提供初步反馈 / Assess severity, provide initial feedback |
| 30 天内 / Within 30 days | 发布修复版本（视严重程度）/ Release fix (depending on severity) |

---

## 安全设计说明 / Security Design Notes

本扩展的安全相关设计决策：

*Security-relevant design decisions in this extension:*

1. **无远程代码加载** — 所有脚本（包括 `tesseract.min.js`）均本地打包，不从 CDN 或远程服务器动态加载可执行代码

   *No remote code loading — All scripts (including `tesseract.min.js`) are bundled locally. No executable code is loaded from CDN or remote servers at runtime.*

2. **最小权限原则** — 仅申请必要的 Chrome 权限（`activeTab`, `storage`, `scripting`, `tabs`）

   *Principle of least privilege — Only necessary Chrome permissions are requested.*

3. **数据不离开设备**（除翻译请求外）— OCR 识别在本地完成；唯一的外发数据是通过 MyMemory 公共 API 发送的 OCR 识别文字（用于翻译）

   *Data stays local (except translation requests) — OCR processing is done locally. The only outbound data is OCR-recognized text sent to the public MyMemory API for translation.*

4. **Host permissions 最小化** — 仅请求 `youtube.com`、`mymemory.translated.net` 和 `cdn.jsdelivr.net` 的访问权限

   *Minimal host permissions — Only `youtube.com`, `mymemory.translated.net`, and `cdn.jsdelivr.net` are requested.*
