document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(
    [
      'tabOpenSound',
      'tabCloseSound',
      'tabSwitchSound',
      'muteSwitchOnActions',
      'volumeOpen',
      'volumeClose',
      'volumeSwitch'
    ],
    (result) => {
      document.getElementById('tabOpenSound').value = result.tabOpenSound || '';
      document.getElementById('tabCloseSound').value = result.tabCloseSound || '';
      document.getElementById('tabSwitchSound').value = result.tabSwitchSound || '';
      document.getElementById('muteSwitchOnActions').checked = result.muteSwitchOnActions !== undefined ? result.muteSwitchOnActions : true;
      document.getElementById('volumeOpen').value = result.volumeOpen || 1;
      document.getElementById('volumeClose').value = result.volumeClose || 1;
      document.getElementById('volumeSwitch').value = result.volumeSwitch || 1;
    }
  );

  document.getElementById('save').addEventListener('click', () => {
    const settings = {
      tabOpenSound: document.getElementById('tabOpenSound').value,
      tabCloseSound: document.getElementById('tabCloseSound').value,
      tabSwitchSound: document.getElementById('tabSwitchSound').value,
      muteSwitchOnActions: document.getElementById('muteSwitchOnActions').checked,
      volumeOpen: parseFloat(document.getElementById('volumeOpen').value),
      volumeClose: parseFloat(document.getElementById('volumeClose').value),
      volumeSwitch: parseFloat(document.getElementById('volumeSwitch').value)
    };
    chrome.storage.sync.set(settings, () => {
      document.getElementById('save').textContent = 'Saved!';
      document.getElementById('save').classList.add('green');
      setTimeout(() => {
        document.getElementById('save').textContent = 'Save :3';
        document.getElementById('save').classList.remove('green');
      }, 2000);
    });
  });
});


document.getElementById('volumeOpen').addEventListener('input', function() {
  document.getElementById('vo').innerHTML = parseFloat(this.value).toFixed(1);
});

document.getElementById('volumeClose').addEventListener('input', function() {
  document.getElementById('vc').innerHTML = parseFloat(this.value).toFixed(1);
});

document.getElementById('volumeSwitch').addEventListener('input', function() {
  document.getElementById('vs').innerHTML = parseFloat(this.value).toFixed(1);
});

// Simulate input events after the page loads
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('volumeOpen').dispatchEvent(new Event('input'));
    document.getElementById('volumeClose').dispatchEvent(new Event('input'));
    document.getElementById('volumeSwitch').dispatchEvent(new Event('input'));
  }, 0);
});