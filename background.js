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

let spBypass = false;
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
      let stopPrevious;
      if (spBypass) {
        stopPrevious = false;
        spBypass = false;
      } else {
        stopPrevious = result.stopPrevious ?? true;
      }
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

chrome.storage.local.get(['preset'], (result) => {
  if (!result.preset) chrome.storage.local.set({ preset: 'sounds/clean/' });
});


// keep existing event listeners
let skipSwitch = false;
let start = 0;
let end = 0;

// Unified sound handler for tab events
const handleTabEvent = (soundKey, volumeKey, fileName) => () => {
  start = Date.now();
  skipSwitch = true;
  chrome.storage.local.get([soundKey, volumeKey, 'preset'], (result) => {
    const sound = result[soundKey] || `${result.preset}${fileName}.ogg`;
    if (sound) playSound(sound, result[volumeKey]);
  });
};

// Tab event listeners
chrome.tabs.onCreated.addListener(handleTabEvent('tabOpenSound', 'tabOpenVolume', 'tabOpen'));
chrome.tabs.onRemoved.addListener(handleTabEvent('tabCloseSound', 'tabCloseVolume', 'tabClose'));

// Tab activation handler
chrome.tabs.onActivated.addListener(() => {
  end = Date.now();
  chrome.storage.local.get(['muteSwitchOnActions', 'tabSwitchSound', 'tabSwitchVolume', 'preset'], (result) => {
    const muteSwitchOnActions = result.muteSwitchOnActions ?? true;
    if (skipSwitch && muteSwitchOnActions && end - start < 100) {
      skipSwitch = false;
      return;
    }
    const sound = result.tabSwitchSound || `${result.preset}tabSwitch.ogg`;
    if (sound) playSound(sound, result.tabSwitchVolume);
  });
});

// Message type configuration
const messageHandlers = {
  MOUSE_DOWN: { soundKey: 'mouseDownSound', volumeKey: 'mouseDownVolume', file: 'mouseDown.ogg' },
  MOUSE_UP: { 
    soundKey: 'mouseUpSound', 
    volumeKey: 'mouseUpVolume', 
    file: 'mouseUp.ogg',
    prePlay: () => { spBypass = true; }
  },
  KEY_PRESS: { soundKey: 'keyPressSound', volumeKey: 'keyPressVolume', file: 'keyPress.ogg' },
  COPY: { soundKey: 'copySound', volumeKey: 'copyVolume', file: 'copy.ogg' },
  PASTE: { soundKey: 'pasteSound', volumeKey: 'pasteVolume', file: 'paste.ogg' },
  SUBMIT: { soundKey: 'submitSound', volumeKey: 'submitVolume', file: 'submit.ogg' }
};

// Content script message handler
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'content-script') {
    port.onMessage.addListener(({ type }) => {
      const handler = messageHandlers[type];
      if (!handler) return;

      chrome.storage.local.get([handler.soundKey, handler.volumeKey, 'preset'], (result) => {
        const sound = result[handler.soundKey] || `${result.preset}${handler.file}`;
        if (sound) {
          if (handler.prePlay) handler.prePlay();
          playSound(sound, result[handler.volumeKey]);
        }
      });
    });
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
  }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
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
