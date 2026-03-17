// Background service worker — 条件注入 tesseract.min.js
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url || !tab.url.includes('youtube.com/watch')) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['tesseract.min.js']
    });
    console.log('[CnReader] Tesseract injected OK');
  } catch (e) {
    // 文件不存在时静默，OCR 面板会显示安装引导
    console.log('[CnReader] Tesseract not found:', e.message);
  }
});
