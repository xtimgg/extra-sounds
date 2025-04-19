document.addEventListener('DOMContentLoaded', () => {
  const tabOpenSoundInput = document.getElementById('tabOpenSound');
  const tabCloseSoundInput = document.getElementById('tabCloseSound');
  const tabSwitchSoundInput = document.getElementById('tabSwitchSound');
  const vo = document.getElementById('vo');
  const vc = document.getElementById('vc');
  const vs = document.getElementById('vs');
  
  function loadSettings() {
    chrome.storage.local.get(
      [
        'tabOpenSound',
        'tabCloseSound',
        'tabSwitchSound',
        'muteSwitchOnActions',
        'stopPrevious',
        'cacheAudio',
        'volumeOpen',
        'volumeClose',
        'volumeSwitch'
      ],
      (result) => {
        tabOpenSoundInput.value = result.tabOpenSound || '';
        tabCloseSoundInput.value = result.tabCloseSound || '';
        tabSwitchSoundInput.value = result.tabSwitchSound || '';
        document.getElementById('muteSwitchOnActions').checked = result.muteSwitchOnActions !== undefined ? result.muteSwitchOnActions : true;
        document.getElementById('stopPrevious').checked = result.stopPrevious !== undefined ? result.stopPrevious : true;
        document.getElementById('cacheAudio').checked = result.cacheAudio !== undefined ? result.cacheAudio : true;
        vo.textContent = parseVolume(result.volumeOpen) || 1.0;
        vc.textContent = parseVolume(result.volumeClose) || 1.0;
        vs.textContent = parseVolume(result.volumeSwitch) || 1.0;
      }
    );
    setTimeout(() => {
      document.querySelectorAll('input[type="range"]').forEach(input => {
        input.value = parseFloat(input.parentNode.querySelector('span').textContent).toFixed(1);
      });
      document.querySelectorAll('input[type="text"]').forEach(input => {
        input.dispatchEvent(new Event('input'));
      });
    }, 10);
    updateCacheDisplay();
  }

  
function updateCacheDisplay() {
  chrome.runtime.sendMessage({ type: 'GET_CACHE_SIZE' }, (response) => {
    const size = response?.sizeKB || 0;
    document.getElementById('cc').querySelector('span').textContent = 
      `(${size} KB)`;
  });
}

  loadSettings();

  document.querySelectorAll('input, .vol span').forEach(input => {
    input.addEventListener('input', function() {
      setTimeout(() => {
        const settings = {
          tabOpenSound: tabOpenSoundInput.value,
          tabCloseSound: tabCloseSoundInput.value,
          tabSwitchSound: tabSwitchSoundInput.value,
          muteSwitchOnActions: document.getElementById('muteSwitchOnActions').checked,
          stopPrevious: document.getElementById('stopPrevious').checked,
          cacheAudio: document.getElementById('cacheAudio').checked,
          volumeOpen: parseFloat(vo.textContent),
          volumeClose: parseFloat(vc.textContent),
          volumeSwitch: parseFloat(vs.textContent)
        };
        chrome.storage.local.set(settings);
      }, 0);
    });
  });

  const reset = document.getElementById('reset');
  const rtext = document.getElementById('rtext');
  let sure = false;
  reset.addEventListener('click', () => {
    if (sure) reset.disabled = true;
    // check if inputs already have default values (yeah the if statement has to be this long lol)
    if (tabOpenSoundInput.value === '' && tabCloseSoundInput.value === '' && tabSwitchSoundInput.value === '' && document.getElementById('muteSwitchOnActions').checked === true && document.getElementById('stopPrevious').checked === true && document.getElementById('cacheAudio').checked === true && vo.textContent === '1.0' && vc.textContent === '1.0' && vs.textContent === '1.0') {
    } else {
      if (!sure) {
        rtext.textContent = "sure?";
        reset.classList.add('unsure');
        sure = true;
        setTimeout(() => {
          if (sure) {
            rtext.textContent = "reset";
            reset.classList.remove('unsure');
            sure = false;
          }
        }, 2000);
        return;
      }
      sure = false;
      rtext.textContent = "reset";
      reset.classList.remove('unsure');
      reset.classList.add('sure');
      tabOpenSoundInput.value = '';
      tabCloseSoundInput.value = '';
      tabSwitchSoundInput.value = '';
      document.getElementById('muteSwitchOnActions').checked = true;
      document.getElementById('stopPrevious').checked = true;
      document.getElementById('cacheAudio').checked = true;
      vo.textContent = '1.0';
      vc.textContent = '1.0';
      vs.textContent = '1.0';
      document.querySelectorAll('input[type="range"]').forEach(input => {
        input.value = 1;
      });
      document.querySelectorAll('input[type="text"]').forEach(input => {
        input.dispatchEvent(new Event('input'));
      });
      chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' });
      updateCacheDisplay();
    }
    setTimeout(() => {
      reset.disabled = false;
      reset.querySelector('svg').style.transition = 'none';
      reset.classList.remove('sure');
      setTimeout(() => {
        reset.querySelector('svg').style.transition = '';
      }, 10);
    }, 700);
  });
  
  document.getElementById('cc').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' });
    updateCacheDisplay();
  });

  document.getElementById('volumeOpen').addEventListener('input', function() {
    vo.textContent = parseFloat(this.value).toFixed(1);
  });

  document.getElementById('volumeClose').addEventListener('input', function() {
    vc.textContent = parseFloat(this.value).toFixed(1);
  });

  document.getElementById('volumeSwitch').addEventListener('input', function() {
    vs.textContent = parseFloat(this.value).toFixed(1);
  });

  document.querySelectorAll('.vol span').forEach(input => {
    input.addEventListener('input', function() {
      if(this.textContent.length > 3) {
        this.textContent = this.textContent.slice(0, 3);
      }
      this.parentNode.parentNode.querySelector('input').value = this.textContent;
    });
    input.addEventListener('focusout', function() {
      this.textContent = parseVolume(this.textContent);
    });
    input.addEventListener('click', function() {
      this.textContent = "";
    });
  });

  function parseVolume(value) {
    const parsedValue = parseFloat(value);
    if (parsedValue < 10) {
      return parsedValue.toFixed(1);
    } else if (parsedValue < 1000) {
      return parsedValue.toFixed(0);
    } else {
      return "1.0";
    }
  }

  document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('input', function() {
      if (this.value.includes('"C:\\')) {
        this.value = this.value.replace(/"/g, "");
      }
      let url = this.value
      if (!url) url = `sounds/${this.id.replace('Sound', '')}.ogg`
      const audio = new Audio(url);
      audio.volume = 0;
      audio.play()
        .then(() => {
          this.parentNode.querySelector('.playButton')?.remove(); // checks if exists with '?'
          const playButton = document.createElement('button');
          const playIcon = document.createElement('span');
          playIcon.innerText = '▲';
          playIcon.style.display = 'inline-block';
          playIcon.style.transform = 'rotate(90deg)';
          playButton.className = 'playButton';
          playButton.appendChild(playIcon);
          playButton.onclick = () => {
          const audio = new Audio(url);
          audio.volume = 1.0;
          playButton.disabled = true;
          playIcon.innerText = '❚❚';
          playIcon.style.transform = 'rotate(0deg)';
          audio.play()
            .then(() => {
            audio.onended = () => {
              playButton.disabled = false;
              playIcon.innerText = '▲';
              playIcon.style.transform = 'rotate(90deg)';
            };
            })
            .catch(err => console.error('Error playing sound:', err));
          };
          this.parentNode.appendChild(playButton);
          if(this.classList.contains('valid')) {
            playButton.style.transform = 'scaleX(1)';
          } else {
            playButton.animate([
              { transform: 'scaleX(0)' },
              { transform: 'scaleX(0)' },
              { transform: 'scaleX(1)' }
            ], {
              duration: 200,
              easing: 'cubic-bezier(0, 1, 0, 1)',
              fill: 'forwards'
            });
          }
          this.className = 'valid';
          if(!this.value == '') this.className = 'valid green'
        })
        .catch(() => {
        this.parentNode.querySelector('.playButton')?.remove(); // checks if exists with '?'
        this.className = 'red';
      });
    });
  });

  document.querySelectorAll('*:not(.hidden, #info *:not(h4))').forEach((element, index) => {
    if(document.body.offsetHeight <= 600) {
      element.style.display = 'none';
      setTimeout(() => {
        if(element.id !== 'info') {
          element.animate([
            { translate: '0 -50px', opacity: '0' },
            { translate: '0 0', opacity: '1' }
          ], {
            duration: 500,
            easing: 'cubic-bezier(0, 1, 0, 1)',
            fill: 'forwards'
          });
        } else {
          element.animate([
            { scale: '1 0', opacity: '0', transformOrigin: 'bottom' },
            { scale: '1', opacity: '1', transformOrigin: 'bottom'  }
          ], {
            duration: 500,
            easing: 'cubic-bezier(0, 1, 0, 1)',
            fill: 'forwards'
          });
        }
        element.style.display = '';
      }, index>=10 ? (index-9) * 10 : 0);
    } 
  });


  const pp = document.querySelector('#privacy-policy');
  const ppBack = document.querySelector('#ppClose');
  document.getElementById('ppOpen').addEventListener('click', () => {
    togglePrivacyPolicy(true);
  });

  ppBack.addEventListener('click', () => {
    togglePrivacyPolicy(false);
  });

  function togglePrivacyPolicy(open) {
    if (open) {
      pp.classList.add('visible')
      ppBack.classList.add('visible')
      document.getElementById('info').style.pointerEvents = 'none';
    } else {
      pp.classList.remove('visible')
      ppBack.classList.remove('visible')
      document.getElementById('info').style.pointerEvents = 'all';
    }
  }

  const settings = document.getElementById('settings');
  const settingsBackup = document.getElementById('settings-backup');

  document.getElementById('backup').addEventListener('click', () => {
    settings.style.display = 'none';
    settingsBackup.style.display = 'flex';
    settingsBackup.querySelector('h4').animate([
      { left: '40%'},
      { left: '10px'}
    ], {
      duration: 500,
      easing: 'cubic-bezier(0, 1, 0, 1)',
      fill: 'forwards'
    });
    settingsBackup.querySelector('#export').animate(
    [
      { transform: 'scale(0) translateX(50px)', opacity: '0' },
      { transform: 'scale(1) translateX(0)', opacity: '1' }
    ],
    {
      duration: 500,
      easing: 'cubic-bezier(0, 1, 0, 1)',
      fill: 'forwards'
    }
    );
    settingsBackup.querySelector('#import').animate(
    [
      { transform: 'scale(0)', opacity: '0' },
      { transform: 'scale(1)', opacity: '1' }
    ],
    {
      duration: 500,
      easing: 'cubic-bezier(0, 1, 0, 1)',
      fill: 'forwards'
    }
    );
  });

  const closeImport = () => {
    settingsBackup.style.display = 'none';
    settings.style.display = 'flex';
    settings.querySelector('h4').animate([
      { left: '50px'},
      { left: '50%'}
    ], {
      duration: 500,
      easing: 'cubic-bezier(0, 1, 0, 1)',
      fill: 'forwards'
    });
    if (importSection.innerHTML) {
      importSection.innerHTML = importContent;
    }
    settings.querySelectorAll('span').forEach(span => {
      span.animate(
      [
        { transform: 'scale(0)', opacity: '0' },
        { transform: 'scale(1)', opacity: '1' }
      ],
      {
        duration: 500,
        easing: 'cubic-bezier(0, 1, 0, 1)',
        fill: 'forwards'
      }
      );
    });
    loadSettings();
  };

  function handleBackupAnimation(element = document.getElementById('backup'), icon = document.getElementById('backupIcon').querySelector('svg')) {
    if (element.classList.contains('red') || element.classList.contains('green')) {
      setTimeout(() => {
        icon.animate(
          [
            { transform: 'rotate(0)' },
            { transform: 'rotate(720deg)' }
          ],
          {
            duration: 1000,
            easing: 'cubic-bezier(1, 0, 0, 1)',
            fill: 'backwards'
          }
        );
      }, 1000);

      const originalText = element.childNodes[2].textContent.trim();

      setTimeout(() => {
        [...originalText].forEach((_, index) => {
          setTimeout(() => {
        element.childNodes[2].textContent = element.childNodes[2].textContent.slice(0, -2) + "▌"; // Remove last char one by one
          }, index * 20);
        });
      }, 800 + originalText.length * 50);

      setTimeout(() => {
        element.childNodes[2].textContent = ''; // Clear the text again
        [...'backup'].forEach((char, index) => {
          setTimeout(() => {
            if (index < 4) {
              element.childNodes[2].textContent = element.childNodes[2].textContent.slice(0, -1) + char + "▌"; // Write 'backup' char by char
            } else {
              element.childNodes[2].textContent = element.childNodes[2].textContent + char; // Write 'backup' char by char
              element.childNodes[2].textContent = element.childNodes[2].textContent.replace("▌", "");
            }
          }, index * 50);
        });
        element.classList.remove('red', 'green');
      }, 1500);
    }
  }

  document.getElementById('sbBack').addEventListener('click', () => {
    closeImport();
  });

  document.getElementById('export').addEventListener('click', () => {
    chrome.storage.local.get(null, (settings) => {
      const settingsString = JSON.stringify(settings, null, 2);
      const exportButton = document.getElementById('export');
      const originalText = exportButton.childNodes[1].textContent.trim();
      navigator.clipboard.writeText(settingsString)
        .then(() => {
          exportButton.childNodes[1].textContent = '  copied';
          setTimeout(() => {
        exportButton.childNodes[1].textContent = '  ' + originalText;
          }, 2000);
        })
        .catch(err => console.error('Failed to copy settings to clipboard:', err));
    });
  });

  const importSection = document.getElementById('import');
  const importContent = importSection.innerHTML;
  document.getElementById('import').addEventListener('click', () => {
    importSection.innerHTML = ''; // Clear previous content
  
    const importInput = document.createElement('textarea');
    importInput.placeholder = '(ctrl+v)';
    importSection.appendChild(importInput);
    importInput.focus();
  
    importInput.addEventListener('input', () => {
      const clipboardContent = importInput.value.trim();
      let settings;
      try {
        settings = JSON.parse(clipboardContent);
      } catch (parseError) {
        importInput.blur();
        document.getElementById('backup').classList.add('red');
        document.getElementById('backup').childNodes[2].textContent = 'failed :<';
        handleBackupAnimation();
        return;
      }
  
      chrome.storage.local.set(settings, () => {
        importInput.blur();
        document.getElementById('backup').classList.add('green');
        document.getElementById('backup').childNodes[2].textContent = 'loaded!';
        handleBackupAnimation();
      });
    });

    importInput.addEventListener('focusout', () => {
      setTimeout(() => {
        if (!importInput.matches(':focus')) {
          closeImport();
        }
      }, 10);
    });
  });
  
});
