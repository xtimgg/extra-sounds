let offscreenReady = false;
const CACHE_NAME = 'audio-cache-v1';

async function setupOffscreen() {
  if (await chrome.offscreen.hasDocument()) {
    offscreenReady = true;
    return;
  }
  
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK', 'BLOBS'],
      justification: 'Persistent audio playback, audio caching'
    });
    offscreenReady = true;
  } catch (error) {
    console.error('Offscreen setup failed:', error);
    offscreenReady = false;
  }
}

async function playSound(url, volume) {
  if (!offscreenReady || !(await chrome.offscreen.hasDocument())) {
    await setupOffscreen();
    if (!offscreenReady || !(await chrome.offscreen.hasDocument())) {
      console.error('Offscreen document setup failed or unavailable.');
      return;
    }
  }

  try {
    chrome.storage.local.get(['stopPrevious', 'cacheAudio'], (result) => {
      const stopPrevious = result.stopPrevious ?? true;
      const cacheAudio = result.cacheAudio ?? true;
      chrome.runtime.sendMessage({
        type: "PLAY_SOUND",
        url: url,
        vol: volume,
        stop: stopPrevious,
        caching: cacheAudio
      });
    });
  } catch (error) {
    console.error('Playback failed:', error);
    offscreenReady = false;
    await setupOffscreen(); // re-init on failure
  }
}

// initialize on extension load
setupOffscreen();

// keep existing event listeners
let recentTabEvent = null;

chrome.tabs.onCreated.addListener(() => {
  recentTabEvent = 'created';
  chrome.storage.local.get(['tabOpenSound', 'volumeOpen'], (result) => {
    const tabOpenSound = result.tabOpenSound || 'sounds/tabOpen.ogg';
    if (tabOpenSound) playSound(tabOpenSound, result.volumeOpen);
  });
});

chrome.tabs.onRemoved.addListener(() => {
  recentTabEvent = 'removed';
  chrome.storage.local.get(['tabCloseSound', 'volumeClose', 'stopPrevious'], (result) => {
    const tabCloseSound = result.tabCloseSound || 'sounds/tabClose.ogg';
    if (tabCloseSound) playSound(tabCloseSound, result.volumeClose);
  });
});

chrome.tabs.onActivated.addListener(() => {
  chrome.storage.local.get(['muteSwitchOnActions', 'tabSwitchSound', 'volumeSwitch'], (result) => {
    const muteSwitchOnActions = result.muteSwitchOnActions ?? true;
    if ((recentTabEvent === 'created' || recentTabEvent === 'removed') && muteSwitchOnActions) {
      recentTabEvent = null;
      return; // skip playing switch sound
    }
    recentTabEvent = 'activated';
      const tabSwitchSound = result.tabSwitchSound || 'sounds/tabSwitch.ogg';
      if (tabSwitchSound) playSound(tabSwitchSound, result.volumeSwitch);
  });
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_CACHE_SIZE') {
    chrome.offscreen.hasDocument().then(hasDoc => {
      if (!hasDoc) return sendResponse({ sizeKB: 0 });
      
      // Forward to offscreen document
      chrome.runtime.sendMessage(
        { type: 'CALCULATE_CACHE_SIZE' },
        (response) => sendResponse(response)
      );
    });
    return true; // Keep message channel open
  }
});
