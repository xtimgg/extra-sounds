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
async function playSound(url, volume, pitch) {
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
        stopPrevious = result.stopPrevious ?? false;
      }
      const cacheAudio = result.cacheAudio ?? true;
      chrome.runtime.sendMessage({
        type: "PLAY_SOUND",
        url: url,
        vol: volume,
        pitch: pitch,
        stop: stopPrevious,
        caching: cacheAudio
      });
    });
  } catch (error) {
    console.error('Playback failed:', error);
    offscreenReady = false;
    await setupOffscreen();
  }
}

setupOffscreen();

chrome.storage.local.get(['preset'], (result) => {
  if (!result.preset) chrome.storage.local.set({ preset: 'sounds/clean/' });
});

let skipSwitch = false;
let start = 0;
let end = 0;

const handleTabEvent = (soundKey, fileName) => () => {
  start = Date.now();
  skipSwitch = true;
  chrome.storage.local.get([soundKey, 'preset'], (result) => {
    const soundObj = result[soundKey];
    let url;
    let volume = 1.0;
    let pitch = 0.0;
    
    if (soundObj) {
      switch (soundObj.type) {
        case 'preset':
          url = chrome.runtime.getURL(`${soundObj.preset}${fileName}.ogg`);
          break;
        case 'text':
          url = soundObj.url;
          break;
        case 'file':
          url = soundObj.file?.dataUrl;
          break;
        default:
          url = null;
      }
      volume = parseFloat(soundObj.volume) ?? 1.0;
      pitch = parseFloat(soundObj.pitch) ?? 0.0;
    } else {
      url = chrome.runtime.getURL(`${result.preset || 'sounds/clean/'}${fileName}.ogg`);
    }
    
    if (url) playSound(url, volume, pitch);
  });
};

chrome.tabs.onCreated.addListener(handleTabEvent('tabOpenSound', 'tabOpen'));
chrome.tabs.onRemoved.addListener(handleTabEvent('tabCloseSound', 'tabClose'));

chrome.tabs.onActivated.addListener(() => {
  end = Date.now();
  chrome.storage.local.get(['muteSwitchOnActions', 'tabSwitchSound', 'preset'], (result) => {
    const muteSwitchOnActions = result.muteSwitchOnActions ?? true;
    if (skipSwitch && muteSwitchOnActions && end - start < 100) {
      skipSwitch = false;
      return;
    }

    const soundObj = result.tabSwitchSound;
    let url;
    let volume = 1.0;
    let pitch = 0.0;
    
    if (soundObj) {
      switch (soundObj.type) {
        case 'preset':
          url = chrome.runtime.getURL(`${soundObj.preset}tabSwitch.ogg`);
          break;
        case 'text':
          url = soundObj.url;
          break;
        case 'file':
          url = soundObj.file?.dataUrl;
          break;
        default:
          url = null;
      }
      volume = parseFloat(soundObj.volume) ?? 1.0;
      pitch = parseFloat(soundObj.pitch) ?? 0.0;
    } else {
      url = chrome.runtime.getURL(`${result.preset || 'sounds/clean/'}tabSwitch.ogg`);
      
    }
    
    if (url) playSound(url, volume, pitch);
  });
});

const messageHandlers = {
  MOUSE_DOWN: { soundKey: 'mouseDownSound', file: 'mouseDown' },
  MOUSE_UP: { 
    soundKey: 'mouseUpSound', 
    file: 'mouseUp',
    prePlay: () => { spBypass = true; }
  },
  KEY_PRESS: { soundKey: 'keyPressSound', file: 'keyPress' },
  COPY: { soundKey: 'copySound', file: 'copy' },
  PASTE: { soundKey: 'pasteSound', file: 'paste' },
  SUBMIT: { soundKey: 'submitSound', file: 'submit' }
};

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'content-script') {
    port.onMessage.addListener(({ type }) => {
      const handler = messageHandlers[type];
      if (!handler) return;

      chrome.storage.local.get([handler.soundKey, 'preset'], (result) => {
        const soundObj = result[handler.soundKey];
        let url;
        let volume = 1.0;
        let pitch = 0.0;
        
        if (soundObj) {
          switch (soundObj.type) {
            case 'preset':
              url = chrome.runtime.getURL(`${soundObj.preset}${handler.file}.ogg`);
              break;
            case 'text':
              url = soundObj.url;
              break;
            case 'file':
              url = soundObj.file?.dataUrl;
              break;
            default:
              url = null;
          }
          volume = parseFloat(soundObj.volume) ?? 1.0;
          pitch = parseFloat(soundObj.pitch) ?? 0.0;
        } else {
          url = chrome.runtime.getURL(`${result.preset || 'sounds/clean/'}${handler.file}.ogg`);
        }
        
        if (url) {
          if (handler.prePlay) handler.prePlay();
          playSound(url, volume, pitch);
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
      
      chrome.runtime.sendMessage(
        { type: 'CALCULATE_CACHE_SIZE' },
        (response) => sendResponse(response)
      );
    });
    return true;
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const manifest = chrome.runtime.getManifest();
  for (const cs of manifest.content_scripts) {
    for (const tab of await chrome.tabs.query({url: cs.matches})) {
      if (tab.url.match(/^(chrome|chrome-extension):\/\//i)) {
        continue;
      }
      const target = {tabId: tab.id, allFrames: cs.all_frames};
      if (cs.js && cs.js.includes('content.js')) {
        chrome.scripting.executeScript({
          files: ['content.js'],
          injectImmediately: cs.run_at === 'document_start',
          world: cs.world, // requires Chrome 111+
          target,
        });
      }
      if (cs.css && cs.css.length > 0) {
        chrome.scripting.insertCSS({
          files: cs.css,
          origin: cs.origin,
          target,
        });
      }
    }
  }
});