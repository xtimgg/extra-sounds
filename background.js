let offscreenReady = false;

async function setupOffscreen() {
  if (await chrome.offscreen.hasDocument()) {
    offscreenReady = true;
    return;
  }
  
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Play tab sound effects'
    });
    offscreenReady = true;
  } catch (error) {
    console.error('Failed to create offscreen document:', error);
  }
}

async function playSound(url, volume = 1.0) {
  if (!offscreenReady) await setupOffscreen();
  
  try {
    chrome.runtime.sendMessage({
      type: "PLAY_SOUND",
      url: url,
      volume: volume // Optional volume parameter
    });
  } catch (error) {
    console.error('Error sending audio message:', error);
    offscreenReady = false; // Reset state on error
  }
}

// Initialize offscreen document when extension loads
setupOffscreen();

// Keep existing event listeners
let recentTabEvent = null;

chrome.tabs.onCreated.addListener((tab) => {
  recentTabEvent = 'created';
  chrome.storage.sync.get(['tabOpenSound', 'volumeOpen'], (result) => {
    const tabOpenSound = result.tabOpenSound || 'sounds/tabOpen.ogg';
    if (tabOpenSound) playSound(tabOpenSound, result.volumeOpen);
  });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  recentTabEvent = 'removed';
  chrome.storage.sync.get(['tabCloseSound', 'volumeClose'], (result) => {
    const tabCloseSound = result.tabCloseSound || 'sounds/tabClose.ogg';
    if (tabCloseSound) playSound(tabCloseSound, result.volumeClose);
  });
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.sync.get(['muteSwitchOnActions', 'tabSwitchSound', 'volumeSwitch'], (result) => {
    const muteSwitchOnActions = result.muteSwitchOnActions || true;
    if ((recentTabEvent === 'created' || recentTabEvent === 'removed') && muteSwitchOnActions) { //not working for now
      recentTabEvent = null; // Reset to avoid blocking future activations
      return; // Skip playing switch sound
    }
    recentTabEvent = 'activated';
      const tabSwitchSound = result.tabSwitchSound || 'sounds/tabSwitch.ogg';
      if (tabSwitchSound) playSound(tabSwitchSound, result.volumeSwitch);
  });
});