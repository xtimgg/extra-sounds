let audioContext;
let currentSource = null;
let currentGainNode = null;

const CACHE_NAME = 'audio-cache-v1';

async function getCachedAudio(url) {
  try {
    // Only cache HTTP(S) URLs
    if (url.startsWith('http')) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(url);
      if (cached) return cached.arrayBuffer();
      
      const response = await fetch(url);
      await cache.put(url, response.clone());
      return response.arrayBuffer();
    }
    
    // Handle chrome-extension:// and file:// directly
    const response = await fetch(url);
    return response.arrayBuffer();
    
  } catch (error) {
    console.error('Caching failed, falling back to direct fetch:', error);
    const response = await fetch(url);
    return response.arrayBuffer();
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
            // stop any currently playing sound
            if (currentSource && message.stop) {
                try {
                    currentSource.stop();
                    currentSource.disconnect();
                    currentGainNode.disconnect();
                } finally {
                    currentSource = null;
                    currentGainNode = null;
                }
            }

            if (!audioContext) {
                audioContext = new AudioContext();
                await audioContext.resume();
            }

            let arrayBuffer;
            if (message.caching) {
                arrayBuffer = await getCachedAudio(message.url);
            } else {
                const response = await fetch(message.url);
                arrayBuffer = await response.arrayBuffer();   
            }
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // create new nodes
            currentSource = audioContext.createBufferSource();
            currentGainNode = audioContext.createGain();
            
            currentGainNode.gain.value = message.vol ?? 1;
            
            currentSource.buffer = audioBuffer;
            currentSource.connect(currentGainNode);
            currentGainNode.connect(audioContext.destination);
            currentSource.start(0);

            // clean up when sound naturally ends
            currentSource.addEventListener('ended', () => {
                currentSource = null;
                currentGainNode = null;
            });

        } catch (error) {
            if(error.message.includes("fetch")) return; // ignore fetch errors
            console.error('Audio playback error:', error);
            currentSource = null;
            currentGainNode = null;
        }
    }
    return true;
});
