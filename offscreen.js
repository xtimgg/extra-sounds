let audioContext;
let currentSource = null;
let currentGainNode = null;

const CACHE_NAME = 'audio-cache-v1';

async function getCachedAudio(urlOrBuffer) {
  try {
    const cache = await caches.open(CACHE_NAME);

    // Handle ArrayBuffer input
    if (urlOrBuffer instanceof ArrayBuffer) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', urlOrBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const cacheKey = `arraybuffer://${hashHex}`;

      const cached = await cache.match(cacheKey);
      if (cached) return cached.arrayBuffer();

      const response = new Response(urlOrBuffer);
      await cache.put(cacheKey, response.clone());
      return urlOrBuffer;
    }

    // Handle string URL input
    const url = String(urlOrBuffer);
    const isLocalFile = url.startsWith('file:') || url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('chrome-extension:') || url.startsWith('sounds/');

    if (isLocalFile) {
      // Skip cache for local file and chrome-extension URLs
      const response = await fetch(url);
      return response.arrayBuffer();
    }

    const cacheKey = url;
    const cached = await cache.match(cacheKey);
    if (cached) return cached.arrayBuffer();

    const response = await fetch(url);
    const arrayBuffer = await response.clone().arrayBuffer();
    await cache.put(cacheKey, new Response(arrayBuffer));
    return arrayBuffer;

  } catch (error) {
    console.error('Caching failed, falling back to direct fetch:', error);

    if (urlOrBuffer instanceof ArrayBuffer) {
      return urlOrBuffer;
    }

    try {
      const response = await fetch(urlOrBuffer);
      return response.arrayBuffer();
    } catch {
      return null; // silent fallback in case of failure
    }
  }
}

async function getCacheSize() {
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      
      let totalSize = 0;
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
      return Math.round(totalSize / 1024); // Convert to KB
    } catch (error) {
      console.error('Cache size error:', error);
      return 0;
    }
  }
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CALCULATE_CACHE_SIZE') {
      getCacheSize().then(sizeKB => sendResponse({ sizeKB }));
      return true; // Keep message channel open
    }
  });
  

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === "PLAY_SOUND") {
    try {
      if (currentSource && message.stop) {
        // remove the onended handler to prevent interference
        currentSource.onended = null;
        currentSource.stop();
        currentSource.disconnect();
        currentGainNode.disconnect();
        currentSource = currentGainNode = null;
      }

      audioContext = audioContext || new AudioContext();
      await audioContext.resume();

      const arrayBuffer = message.caching
        ? await getCachedAudio(message.url)
        : await (await fetch(message.url)).arrayBuffer();

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      currentSource = audioContext.createBufferSource();
      currentGainNode = audioContext.createGain();

      currentGainNode.gain.value = message.vol ?? 1;
      currentSource.detune.value = isFinite(message.pitch) ? message.pitch * 1200 : 0;
      currentSource.buffer = audioBuffer;

      currentSource.connect(currentGainNode).connect(audioContext.destination);
      currentSource.start();

      currentSource.onended = () => currentSource = currentGainNode = null;
    } catch (e) {
      if (e.message?.includes("fetch")) return;
      console.error('Audio playback error:', e);
      currentSource = currentGainNode = null;
    }
  }
  return true;
});