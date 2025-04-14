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
      justification: 'Persistent audio playback'
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
  }

  try {
    chrome.storage.sync.get(['stopPrevious'], (result) => {
      const stopPrevious = result.stopPrevious ?? true;
      chrome.runtime.sendMessage({
        type: "PLAY_SOUND",
        url: url,
        vol: volume,
        stop: stopPrevious
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
  chrome.storage.sync.get(['tabOpenSound', 'volumeOpen'], (result) => {
    const tabOpenSound = result.tabOpenSound || 'sounds/tabOpen.ogg';
    if (tabOpenSound) playSound(tabOpenSound, result.volumeOpen);
  });
});

chrome.tabs.onRemoved.addListener(() => {
  recentTabEvent = 'removed';
  chrome.storage.sync.get(['tabCloseSound', 'volumeClose', 'stopPrevious'], (result) => {
    const tabCloseSound = result.tabCloseSound || 'sounds/tabClose.ogg';
    if (tabCloseSound) playSound(tabCloseSound, result.volumeClose);
  });
});

chrome.tabs.onActivated.addListener(() => {
  chrome.storage.sync.get(['muteSwitchOnActions', 'tabSwitchSound', 'volumeSwitch'], (result) => {
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
