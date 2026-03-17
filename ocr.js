// ============================================================
// YouTube 中文朗读助手 — OCR 翻译叠加模块 v2
// 修复：从插件本地加载 Tesseract，绕过 CSP 限制
// ============================================================
(function () {
  'use strict';

  let ocrActive   = false;
  let ocrTimer    = null;
  let worker      = null;   // Tesseract Worker
  let lastOcrText = '';
  let overlayEl   = null;
  let ocrInterval = 2500;
  let isProcessing = false;
  let translateCache = new Map();
  let tesseractReady = false;

  // ── 面板注入 ─────────────────────────────────────────────────
  function injectOCRSection() {
    const body = document.getElementById('yt-cn-body');
    if (!body || document.getElementById('yc-ocr-sec')) return;

    const sec = document.createElement('div');
    sec.className = 'yc-sec';
    sec.id = 'yc-ocr-sec';
    sec.innerHTML = `
      <div class="yc-sec-t">🔎 画面英文识别翻译</div>
      <div class="yc-ocr-status">
        <span class="yc-ocr-dot yc-ocr-dot-idle" id="yc-ocr-dot"></span>
        <span id="yc-ocr-msg">点击开启</span>
      </div>
      <div class="yc-row" style="margin-top:8px">
        <button class="yc-btn-ocr-start" id="yc-ocr-start">▶ 开启识别</button>
        <button class="yc-btn-ocr-stop"  id="yc-ocr-stop" disabled>■ 停止</button>
      </div>
      <div id="yc-ocr-setup" style="display:none">
        <div class="yc-ocr-setup-box">
          <div class="yc-ocr-setup-title">⚠️ 需要下载 OCR 引擎</div>
          <div class="yc-ocr-setup-desc" id="yc-ocr-setup-desc">首次使用需下载 Tesseract.js v2（约 500KB），文件名必须是 <b>tesseract.min.js</b>（若之前下载了请重新下载 v2 版）</div>
          <button class="yc-ocr-dl-btn" id="yc-ocr-dl">📥 下载 tesseract.min.js</button>
          <div class="yc-ocr-setup-steps">
            1. 点击上方按钮下载文件<br>
            2. 将文件移动到插件文件夹（与 manifest.json 同级）<br>
            3. 在 chrome://extensions 刷新插件<br>
            4. 重新点击「开启识别」
          </div>
        </div>
      </div>
      <div id="yc-ocr-result" class="yc-ocr-result" style="display:none">
        <div class="yc-ocr-orig" id="yc-ocr-orig"></div>
        <div class="yc-ocr-arrow">↓ 翻译</div>
        <div class="yc-ocr-zh"   id="yc-ocr-zh"></div>
      </div>
      <div class="yc-set-row" style="margin-top:8px">
        <label>间隔 <span id="yc-ocr-iv-lbl">2.5s</span></label>
        <input type="range" id="yc-ocr-iv" min="1" max="6" step="0.5" value="2.5"/>
      </div>
      <div class="yc-ocr-hint">适合板书、PPT、题目等静态内容</div>
      <div class="yc-badge-row" style="margin-top:8px">
        <span class="yc-badge">Tesseract.js OCR</span>
        <span class="yc-badge-free">完全免费</span>
      </div>
    `;
    body.appendChild(sec);
    bindOCR();
  }

  function bindOCR() {
    document.getElementById('yc-ocr-start').onclick = startOCR;
    document.getElementById('yc-ocr-stop').onclick  = stopOCR;
    document.getElementById('yc-ocr-dl').onclick    = downloadTesseract;
    document.getElementById('yc-ocr-iv').oninput = e => {
      ocrInterval = parseFloat(e.target.value) * 1000;
      document.getElementById('yc-ocr-iv-lbl').textContent = e.target.value + 's';
      if (ocrActive) { stopOCRTimer(); startOCRTimer(); }
    };
  }

  // ── 下载引导（fetch→Blob 强制保存，不在浏览器内打开）────────
  async function downloadTesseract() {
    const btn = document.getElementById('yc-ocr-dl');
    if (btn) { btn.textContent = '⏳ 下载中（约500KB）请稍候…'; btn.disabled = true; }
    try {
      const url = 'https://cdn.jsdelivr.net/npm/tesseract.js@2.1.5/dist/tesseract.min.js';
      const res  = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob    = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl; a.download = 'tesseract.min.js';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      if (btn) { btn.textContent = '✅ 下载完成！放入插件文件夹后刷新'; btn.disabled = false; }
    } catch (e) {
      console.error('[OCR dl]', e);
      if (btn) { btn.textContent = '❌ 下载失败，请右键链接另存为'; btn.disabled = false; }
      window.open('https://cdn.jsdelivr.net/npm/tesseract.js@2.1.5/dist/tesseract.min.js', '_blank');
    }
  }

  // ── 启动（tesseract.min.js 已由 manifest 预注入，直接用全局 Tesseract）──
  async function startOCR() {
    if (ocrActive) return;

    // 检查 Tesseract 是否已由 background 注入成功
    if (typeof Tesseract === 'undefined') {
      document.getElementById('yc-ocr-setup').style.display = 'block';
      setOCRStatus('error', '需要先安装 OCR 引擎');
      // 更新提示文字，帮用户排查常见问题
      const desc = document.getElementById('yc-ocr-setup-desc');
      if (desc) desc.innerHTML = '未检测到 tesseract.min.js，常见原因：<br>① 文件名含 <b>(1)</b> 等后缀，需重命名为 <b>tesseract.min.js</b><br>② 文件未放在插件文件夹根目录<br>③ 放好后需刷新插件并重新打开页面';
      return;
    }

    document.getElementById('yc-ocr-setup').style.display = 'none';
    ocrActive = true;
    setOCRStatus('loading', '正在初始化 OCR 引擎…');
    document.getElementById('yc-ocr-start').disabled = true;
    document.getElementById('yc-ocr-stop').disabled  = false;
    createOverlay();

    try {
      if (!tesseractReady) {
        setOCRStatus('loading', '创建 Worker…');
        worker = Tesseract.createWorker({
          logger: m => {
            if (m.status) {
              const p = Math.round((m.progress || 0) * 100);
              const msgs = {
                'loading tesseract core':      `加载核心 ${p}%`,
                'initializing tesseract':      `初始化 ${p}%`,
                'loading language traineddata':`下载语言包 ${p}%（约10MB，仅首次）`,
                'initializing api':            `准备就绪 ${p}%`,
              };
              setOCRStatus('loading', msgs[m.status] || `${m.status} ${p}%`);
            }
          }
        });
        await worker.load();
        setOCRStatus('loading', '加载语言包（约10MB，仅首次下载）…');
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        await worker.setParameters({
          tessedit_pageseg_mode: '6',
        });
        tesseractReady = true;
      }
      setOCRStatus('active', '识别中…');
      startOCRTimer();
    } catch (e) {
      console.error('[OCR init]', e);
      ocrActive = false;
      document.getElementById('yc-ocr-start').disabled = false;
      setOCRStatus('error', '初始化失败：' + e.message);
    }
  }

  function stopOCR() {
    ocrActive = false; stopOCRTimer();
    setOCRStatus('idle', '已停止');
    document.getElementById('yc-ocr-start').disabled = false;
    document.getElementById('yc-ocr-stop').disabled  = true;
    clearOverlay();
  }

  function startOCRTimer() { ocrTimer = setInterval(runOCR, ocrInterval); runOCR(); }
  function stopOCRTimer()  { if (ocrTimer) { clearInterval(ocrTimer); ocrTimer = null; } }

  // ── 核心：截图 → OCR → 翻译 → 显示 ──────────────────────────
  async function runOCR() {
    if (!ocrActive || isProcessing || !worker) return;
    const video = document.querySelector('video');
    if (!video || video.paused || video.readyState < 2) return;

    isProcessing = true;
    try {
      // 截取视频帧
      const canvas = document.createElement('canvas');
      const scale  = Math.min(1, 1280 / video.videoWidth);
      canvas.width  = Math.round(video.videoWidth  * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

      // OCR
      const result = await worker.recognize(canvas);
      const data = result.data;
      const text = filterText(data.text, data.words);
      if (!text || text === lastOcrText) { isProcessing = false; return; }
      lastOcrText = text;

      setOCRStatus('active', '翻译中…');
      showOriginal(text);

      // 翻译
      const zh = await translate(text);
      if (zh) { showResult(text, zh); showOverlay(zh); setOCRStatus('active', '已翻译 ✓'); }
      else setOCRStatus('active', '识别中…');

    } catch (e) { console.warn('[OCR run]', e); }
    isProcessing = false;
  }

  // ── 文字过滤 ─────────────────────────────────────────────────
  function filterText(raw, words) {
    // 高置信度英文词
    const good = (words || []).filter(w =>
      w.confidence > 55 && /[a-zA-Z]{2,}/.test(w.text)
    );
    if (good.length < 2) return '';

    const lines = raw.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 4 && /[a-zA-Z]{2,}/.test(l) && !/^[\W\d\s]+$/.test(l))
      .slice(0, 10);

    const joined = lines.join(' ').replace(/\s+/g, ' ').trim();
    return joined.length > 8 ? joined : '';
  }

  // ── 翻译 API ─────────────────────────────────────────────────
  async function translate(text) {
    if (!text) return '';
    if (translateCache.has(text)) return translateCache.get(text);
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0,500))}&langpair=en|zh`;
      const d   = await fetch(url).then(r => r.json());
      if (d.responseStatus === 200) {
        const zh = d.responseData.translatedText;
        translateCache.set(text, zh);
        if (translateCache.size > 150) translateCache.delete(translateCache.keys().next().value);
        return zh;
      }
    } catch (e) { console.warn('[translate]', e); }
    return '';
  }

  // ── 视频叠加层 ───────────────────────────────────────────────
  function createOverlay() {
    if (overlayEl && document.contains(overlayEl)) return;
    overlayEl = document.createElement('div');
    overlayEl.id = 'yt-ocr-overlay';
    Object.assign(overlayEl.style, {
      position: 'absolute', bottom: '72px', left: '50%',
      transform: 'translateX(-50%)', maxWidth: '78%',
      background: 'rgba(0,0,0,0.82)', color: '#fff',
      fontSize: '17px', lineHeight: '1.6', padding: '8px 18px',
      borderRadius: '8px', textAlign: 'center', pointerEvents: 'none',
      zIndex: '9998', fontFamily: "'PingFang SC','Microsoft YaHei',sans-serif",
      fontWeight: '500', letterSpacing: '0.04em',
      border: '1px solid rgba(255,255,255,0.15)',
      display: 'none', transition: 'opacity 0.4s',
    });

    const target =
      document.querySelector('.html5-video-container') ||
      document.querySelector('#movie_player') ||
      document.querySelector('video')?.parentElement;

    if (target) {
      if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
      target.appendChild(overlayEl);
    }
  }

  function showOverlay(text) {
    if (!overlayEl || !document.contains(overlayEl)) createOverlay();
    if (!overlayEl) return;
    overlayEl.textContent = text;
    overlayEl.style.display = 'block';
    overlayEl.style.opacity = '1';
    clearTimeout(overlayEl._t);
    overlayEl._t = setTimeout(() => {
      overlayEl.style.opacity = '0';
      setTimeout(() => { if (overlayEl) overlayEl.style.display = 'none'; }, 400);
    }, 8000);
  }

  function clearOverlay() {
    if (overlayEl) { overlayEl.style.display = 'none'; overlayEl.textContent = ''; }
  }

  function showOriginal(t) {
    const el = document.getElementById('yc-ocr-orig');
    const r  = document.getElementById('yc-ocr-result');
    if (el) el.textContent = t.slice(0, 150) + (t.length > 150 ? '…' : '');
    if (r)  r.style.display = 'block';
  }

  function showResult(_, zh) {
    const el = document.getElementById('yc-ocr-zh');
    if (el) el.textContent = zh;
  }

  function setOCRStatus(type, msg) {
    const dot = document.getElementById('yc-ocr-dot');
    const m   = document.getElementById('yc-ocr-msg');
    if (dot) dot.className = `yc-ocr-dot yc-ocr-dot-${type}`;
    if (m)   m.textContent = msg;
  }

  // ── 等待面板、注入区块 ────────────────────────────────────────
  function waitAndInject() {
    const t = setInterval(() => {
      if (document.getElementById('yt-cn-body')) { clearInterval(t); injectOCRSection(); }
    }, 300);
  }

  // ── SPA 监听 ─────────────────────────────────────────────────
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (ocrActive) stopOCR();
      lastOcrText = ''; overlayEl = null;
      if (location.search.includes('watch')) setTimeout(waitAndInject, 2000);
    }
  }).observe(document, { subtree: true, childList: true });

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => setTimeout(waitAndInject, 2000))
    : setTimeout(waitAndInject, 2000);

})();
