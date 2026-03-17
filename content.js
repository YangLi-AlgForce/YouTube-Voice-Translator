// ============================================================
// YouTube 中文朗读助手 v4.0
// TTS：Chrome 内置 Google Web Speech API（最自然中文）
// 策略：时间轴精准触发 + 智能队列 + 防抖防重
// ============================================================
(function () {
  'use strict';

  // ── 语音列表（动态从浏览器获取）─────────────────────────────
  let ZH_VOICES = [];         // 运行时填充
  let selectedVoice = null;   // SpeechSynthesisVoice 对象
  let speechRate = 1.0;
  let speechPitch = 1.0;

  // ── 状态 ────────────────────────────────────────────────────
  let panel = null;
  let subtitles = [];          // [{start, end, text}]
  let isReading = false;
  let isMuted = false;
  let currentIdx = -1;
  let syncTimer = null;
  let liveMode = false;
  let lastLiveText = '';
  let captionObserver = null;

  // TTS 播放队列
  let speakQueue = [];         // 待播文字队列
  let isSpeaking = false;
  let currentUtterance = null;
  let readMode = 'complete';   // 'complete'=说完为止  'sync'=跟随视频强制切换

  // ── 初始化 ───────────────────────────────────────────────────
  function init() {
    if (document.getElementById('yt-cn-panel')) return;
    buildPanel();
    loadVoices();
    // Chrome 有时异步加载语音列表
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  // ── 加载中文语音 ─────────────────────────────────────────────
  function loadVoices() {
    const all = speechSynthesis.getVoices();
    ZH_VOICES = all.filter(v =>
      v.lang.startsWith('zh') || v.lang.startsWith('cmn')
    );
    // 优先选 Google 普通话
    selectedVoice =
      ZH_VOICES.find(v => v.name.includes('Google') && v.lang === 'zh-CN') ||
      ZH_VOICES.find(v => v.lang === 'zh-CN') ||
      ZH_VOICES[0] || null;

    updateVoiceSelect();
  }

  function updateVoiceSelect() {
    const sel = document.getElementById('yc-voice');
    if (!sel || ZH_VOICES.length === 0) return;
    const prev = sel.value;
    sel.innerHTML = ZH_VOICES.map((v, i) =>
      `<option value="${i}" ${selectedVoice === v ? 'selected' : ''}>${v.name.replace(/Microsoft|（.*?）|\(.*?\)/g,'').trim()} · ${v.lang}</option>`
    ).join('');
    sel.value = prev || '0';
  }

  // ── 面板 HTML ────────────────────────────────────────────────
  function buildPanel() {
    panel = document.createElement('div');
    panel.id = 'yt-cn-panel';
    panel.innerHTML = `
      <div id="yt-cn-hdr">
        <span id="yt-cn-htitle">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z"/>
          </svg>
          中文朗读助手
        </span>
        <div id="yt-cn-hbts">
          <button id="yt-cn-min" title="最小化">─</button>
          <button id="yt-cn-cls" title="关闭">✕</button>
        </div>
      </div>

      <div id="yt-cn-body">

        <!-- 字幕来源 -->
        <div class="yc-sec">
          <div class="yc-sec-t">📥 获取字幕</div>
          <div class="yc-row">
            <button class="yc-btn-sec" id="yc-fetch">🔍 抓取页面字幕</button>
            <label class="yc-btn-sec">
              📂 上传 SRT
              <input type="file" id="yc-srt" accept=".srt,.vtt" style="display:none">
            </label>
          </div>
          <div id="yc-status" class="yc-hint-bar">请先获取字幕</div>
        </div>

        <!-- 字幕显示 -->
        <div class="yc-sec">
          <div class="yc-sec-t">📝 实时字幕</div>
          <div id="yc-sub-text">—</div>
        </div>

        <!-- 朗读控制 -->
        <div class="yc-sec">
          <div class="yc-sec-t">🔊 朗读控制</div>
          <div class="yc-row">
            <button id="yc-play" class="yc-btn-pri" disabled>▶ 开始朗读</button>
            <button id="yc-stop" class="yc-btn-dng" disabled>■ 停止</button>
          </div>
          <div class="yc-mode-row">
            <span class="yc-mode-label">朗读模式</span>
            <div class="yc-mode-btns">
              <button class="yc-mode-btn active" id="yc-mode-complete" title="每句说完再说下一句">说完为止</button>
              <button class="yc-mode-btn" id="yc-mode-sync" title="严格跟随视频字幕时间轴">跟随视频</button>
            </div>
          </div>
          <label class="yc-tog" style="margin-top:9px">
            <input type="checkbox" id="yc-mute"/>
            <span class="yc-tog-sl"></span>
            🔇 关闭原视频声音
          </label>
        </div>

        <!-- 语音设置 -->
        <div class="yc-sec">
          <div class="yc-sec-t">⚙️ 语音设置</div>
          <div class="yc-set-row">
            <label>语音</label>
            <select id="yc-voice"><option>加载中…</option></select>
          </div>
          <div class="yc-set-row">
            <label>语速 <span id="yc-rate-lbl">1.0x</span></label>
            <input type="range" id="yc-rate" min="0.5" max="2.0" step="0.1" value="1.0"/>
          </div>
          <div class="yc-set-row">
            <label>音调 <span id="yc-pitch-lbl">1.0</span></label>
            <input type="range" id="yc-pitch" min="0.5" max="2.0" step="0.1" value="1.0"/>
          </div>
          <div class="yc-badge-row">
            <span class="yc-badge">🌐 Google Web Speech</span>
            <span class="yc-badge-free">完全免费</span>
          </div>
        </div>

      </div>

      <!-- 迷你条 -->
      <div id="yt-cn-mini" style="display:none">
        <span id="yc-mini-txt">—</span>
        <button id="yc-mini-play">▶</button>
        <button id="yc-mini-stop">■</button>
        <button id="yc-expand">↗</button>
      </div>
    `;
    document.body.appendChild(panel);
    drag(panel, document.getElementById('yt-cn-hdr'));
    bindAll();
  }

  // ── 事件绑定 ─────────────────────────────────────────────────
  function bindAll() {
    $('yt-cn-cls').onclick = () => { stopAll(); panel.remove(); };
    $('yt-cn-min').onclick = mini;
    $('yc-expand').onclick = mini;

    $('yc-fetch').onclick = fetchSubs;
    $('yc-srt').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const fr = new FileReader();
      fr.onload = ev => { subtitles = parseSRT(ev.target.result); onLoaded(); };
      fr.readAsText(f, 'utf-8');
    };

    $('yc-play').onclick = startAll;
    $('yc-stop').onclick = stopAll;
    $('yc-mini-play').onclick = startAll;
    $('yc-mini-stop').onclick = stopAll;

    $('yc-mute').onchange = e => {
      isMuted = e.target.checked;
      const v = vid(); if (v) v.muted = isMuted;
    };

    $('yc-voice').onchange = e => {
      selectedVoice = ZH_VOICES[parseInt(e.target.value)] || null;
    };

    $('yc-rate').oninput = e => {
      speechRate = parseFloat(e.target.value);
      $('yc-rate-lbl').textContent = speechRate.toFixed(1) + 'x';
    };

    $('yc-pitch').oninput = e => {
      speechPitch = parseFloat(e.target.value);
      $('yc-pitch-lbl').textContent = speechPitch.toFixed(1);
    };

    // 朗读模式切换
    $('yc-mode-complete').onclick = () => setMode('complete');
    $('yc-mode-sync').onclick     = () => setMode('sync');
  }

  function setMode(mode) {
    readMode = mode;
    $('yc-mode-complete').classList.toggle('active', mode === 'complete');
    $('yc-mode-sync').classList.toggle('active', mode === 'sync');
  }

  function $(id) { return document.getElementById(id); }
  function vid()  { return document.querySelector('video'); }

  // ── 最小化 ───────────────────────────────────────────────────
  function mini() {
    const b = $('yt-cn-body'), m = $('yt-cn-mini');
    const isMin = b.style.display === 'none';
    b.style.display = isMin ? 'block' : 'none';
    m.style.display = isMin ? 'none' : 'flex';
  }

  // ── 抓取字幕 ─────────────────────────────────────────────────
  async function fetchSubs() {
    setStatus('正在抓取字幕…', 'loading');
    try {
      let tracks = [];
      for (const s of document.querySelectorAll('script')) {
        if (!s.textContent.includes('ytInitialPlayerResponse')) continue;
        const m = s.textContent.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
        if (m) {
          const d = JSON.parse(m[1]);
          tracks = d?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
          break;
        }
      }
      if (tracks.length) {
        const tr =
          tracks.find(t => ['zh-Hans','zh-CN','zh'].includes(t.languageCode)) ||
          tracks.find(t => t.languageCode.startsWith('zh')) ||
          tracks[0];
        const xml = await fetch(tr.baseUrl + '&fmt=srv3').then(r => r.text());
        subtitles = parseXML(xml);
        if (subtitles.length) { onLoaded(); return; }
      }
    } catch (e) { console.warn('[CnReader]', e); }
    startLiveObserver();
  }

  function parseXML(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    return Array.from(doc.querySelectorAll('text')).map(n => ({
      start: parseFloat(n.getAttribute('start') || '0'),
      end:   parseFloat(n.getAttribute('start') || '0') + parseFloat(n.getAttribute('dur') || '2'),
      text:  htmlDec(n.textContent).trim(),
    })).filter(s => s.text);
  }

  function parseSRT(raw) {
    return raw.replace(/\r\n/g,'\n').split(/\n\n+/).map(b => {
      const ls = b.trim().split('\n'); if (ls.length < 3) return null;
      const m = ls[1].match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
      if (!m) return null;
      const t = (h,mi,s,ms) => +h*3600 + +mi*60 + +s + +ms/1000;
      return {
        start: t(m[1],m[2],m[3],m[4]),
        end:   t(m[5],m[6],m[7],m[8]),
        text:  ls.slice(2).join(' ').replace(/<[^>]+>/g,'').trim(),
      };
    }).filter(Boolean);
  }

  function htmlDec(s) {
    const el = document.createElement('textarea'); el.innerHTML = s; return el.value;
  }

  // ── 实时 DOM 监听（降级）────────────────────────────────────
  function startLiveObserver() {
    liveMode = true;
    setStatus('🔴 实时模式：开启 YouTube 中文字幕后点「开始朗读」', 'live');
    $('yc-play').disabled = false;

    captionObserver = new MutationObserver(() => {
      const seg = document.querySelector(
        '.ytp-caption-window-container .ytp-caption-segment, .caption-window .ytp-caption-segment'
      );
      if (!seg) return;
      const text = seg.textContent.trim();
      if (!text || text === lastLiveText) return;
      lastLiveText = text;
      showSub(text);
      if (isReading) enqueueLive(text); // 实时模式：新字幕打断旧的
    });
    captionObserver.observe(document.body, { childList:true, subtree:true, characterData:true });
  }

  function onLoaded() {
    setStatus(`✅ 已获取 ${subtitles.length} 条字幕，可以开始朗读`, 'ok');
    $('yc-play').disabled = false;
    liveMode = false;
    if (captionObserver) { captionObserver.disconnect(); captionObserver = null; }
  }

  // ── 开始 / 停止 ───────────────────────────────────────────────
  function startAll() {
    if (isReading) return;
    isReading = true;
    currentIdx = -1;
    speakQueue = [];
    speechSynthesis.cancel();
    playBtn(true);
    const v = vid(); if (v && isMuted) v.muted = true;
    if (liveMode) { setStatus('🔴 实时朗读中…', 'live'); return; }
    syncTimer = setInterval(syncPlay, 120);
  }

  function stopAll() {
    isReading = false;
    isSpeaking = false;
    speakQueue = [];
    speechSynthesis.cancel();
    currentUtterance = null;
    if (syncTimer) { clearInterval(syncTimer); syncTimer = null; }
    playBtn(false);
    const v = vid(); if (v) v.muted = false;
  }

  // ── 时间同步核心 ─────────────────────────────────────────────
  // 策略：
  //   - 不按字幕时间窗口截断，说完为止
  //   - 队列积压超过2条时，丢弃中间的，只保留最新一条（跳过不重要的）
  //   - 每句自动计算最低语速（字幕窗口 → 推算 rate），长句自动加速
  //   - 队列里已有同文本则去重
  function syncPlay() {
    const v = vid(); if (!v) return;
    const t = v.currentTime;

    // 向前多找一点：当前时间落在字幕窗口内，或者距下一条字幕开始不足0.3s
    let idx = subtitles.findIndex(s => t >= s.start && t < s.end);
    if (idx < 0) {
      // 视频当前在字幕间隙，预判下一条
      idx = subtitles.findIndex(s => s.start > t && s.start - t < 0.3);
    }
    if (idx < 0 || idx === currentIdx) return;
    currentIdx = idx;

    const sub = subtitles[idx];
    showSub(sub.text);

    // 计算需要的语速
    // 中文在 rate=1.0 时约 4.2 字/秒
    const dur = Math.max(sub.end - sub.start, 0.8);
    const needed = (sub.text.length / 4.2) / dur;
    // 取用户设置和计算值的较大者，上限 2.5（超过会不清晰）
    const autoRate = Math.min(2.5, Math.max(speechRate, needed));

    // 跟随视频模式：强制打断当前句，立刻说新句
    if (readMode === 'sync' && isSpeaking) {
      speakQueue = [];
      speechSynthesis.cancel();
      isSpeaking = false;
      currentUtterance = null;
    }

    enqueue(sub.text, autoRate);
  }

  // ── 队列入队 ─────────────────────────────────────────────────
  function enqueue(text, rate) {
    // 去重
    if (speakQueue.some(q => q.text === text)) return;

    // 队列积压 > 2：丢弃中间项，只保留头部（正在播）+ 新来的
    // 这样在视频快进时不会读一堆旧字幕
    if (speakQueue.length > 2) {
      speakQueue = speakQueue.slice(0, 1);
    }

    speakQueue.push({ text, rate });
    if (!isSpeaking) drainQueue();
  }

  // ── 播放队列 ─────────────────────────────────────────────────
  function drainQueue() {
    if (!isReading || speakQueue.length === 0) { isSpeaking = false; return; }
    isSpeaking = true;
    const { text, rate } = speakQueue.shift();

    const u = new SpeechSynthesisUtterance(text);
    u.lang  = 'zh-CN';
    u.rate  = rate;
    u.pitch = speechPitch;
    if (selectedVoice) u.voice = selectedVoice;
    currentUtterance = u;

    u.onend = () => { currentUtterance = null; isSpeaking = false; drainQueue(); };
    u.onerror = e => {
      if (e.error !== 'interrupted') console.warn('[CnReader] TTS:', e.error);
      currentUtterance = null; isSpeaking = false; drainQueue();
    };

    speechSynthesis.speak(u);
  }

  // ── 实时模式（DOM监听）：新字幕直接打断 ────────────────────
  function enqueueLive(text) {
    speakQueue = [];
    speechSynthesis.cancel();
    isSpeaking = false;
    currentUtterance = null;
    enqueue(text, speechRate);
  }

  // ── 字幕显示 ─────────────────────────────────────────────────
  function showSub(text) {
    const el = $('yc-sub-text'); if (el) el.textContent = text;
    const m  = $('yc-mini-txt'); if (m)  m.textContent = text.slice(0,18) + (text.length>18?'…':'');
  }

  function setStatus(msg, type) {
    const el = $('yc-status'); if (!el) return;
    el.textContent = msg;
    el.className = 'yc-hint-bar' + (type ? ' yc-st-'+type : '');
  }

  function playBtn(on) {
    const p=$('yc-play'), mp=$('yc-mini-play'), s=$('yc-stop');
    if (p)  p.textContent  = on ? '⏸ 朗读中…' : '▶ 开始朗读';
    if (mp) mp.textContent = on ? '⏸' : '▶';
    if (s)  s.disabled     = !on;
  }

  // ── 拖拽 ─────────────────────────────────────────────────────
  function drag(el, hdr) {
    let ox=0,oy=0,mx=0,my=0;
    hdr.style.cursor='grab';
    hdr.onmousedown = e => {
      e.preventDefault(); mx=e.clientX; my=e.clientY;
      document.onmousemove = e2 => {
        ox=mx-e2.clientX; oy=my-e2.clientY; mx=e2.clientX; my=e2.clientY;
        el.style.top  = (el.offsetTop-oy)+'px';
        el.style.left = (el.offsetLeft-ox)+'px';
        el.style.right='auto';
      };
      document.onmouseup = () => {
        document.onmousemove=null; document.onmouseup=null; hdr.style.cursor='grab';
      };
      hdr.style.cursor='grabbing';
    };
  }

  // ── Chrome speechSynthesis 卡顿修复 ─────────────────────────
  // Chrome 有个 bug：超过 ~15s 不说话后 synthesis 会暂停
  // 每 10s 检查一次，如果卡了就 resume
  setInterval(() => {
    if (!isReading || !isSpeaking) return;
    if (speechSynthesis.paused) speechSynthesis.resume();
  }, 10000);

  // ── YouTube SPA 路由监听 ─────────────────────────────────────
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      stopAll();
      subtitles=[]; currentIdx=-1; liveMode=false;
      if (location.search.includes('watch')) setTimeout(init, 1500);
    }
  }).observe(document, {subtree:true, childList:true});

  // ── 启动 ─────────────────────────────────────────────────────
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1500))
    : setTimeout(init, 1500);

})();
