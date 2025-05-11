document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.sound').forEach((sound) => {
    sound.querySelector('input[type="text"]').id = sound.id + 'Sound';
    sound.querySelector('span[contenteditable]').id = sound.id + 'Volume';
    sound.querySelector('input[type="range"]').id = sound.id + 'VolumeSlider';
  });
  
  let presetTransition = false;
  const presetNames = ['clean (<a href="https://youtu.be/AD1JUStm-2Q" target="_blank">by @zapocan</a>)', 'wooden (<a href="https://youtu.be/F7NP-Q0REZ8" target="_blank">by @zapocan</a>)', 'minecraft sfx (<a href="https://minecraft.wiki/w/Category:Sound_effects" target="_blank">source</a>)'];
  const presetPaths = ['sounds/clean/', 'sounds/wooden/', 'sounds/minecraft/'];
  const actionNames = Array.from(document.querySelectorAll('.sound')).map(el => el.id);
  const soundInputs = actionNames.map(action => document.getElementById(`${action}Sound`));
  const volumeInputs = actionNames.map(action => document.getElementById(`${action}Volume`));
  function loadSettings() {
    chrome.storage.local.get(
      [
        'preset',
        ...actionNames.map(action => `${action}Sound`),
        ...actionNames.map(action => `${action}Volume`),
        'muteSwitchOnActions',
        'stopPrevious',
        'cacheAudio'
      ],
      (result) => {
        soundInputs.forEach(input => {
          input.value = result[input.id] || '';
        });
        volumeInputs.forEach(input => {
          input.textContent = parseVolume(result[input.id]) || 1.0;
        });
        document.getElementById('muteSwitchOnActions').checked = result.muteSwitchOnActions !== undefined ? result.muteSwitchOnActions : true;
        document.getElementById('stopPrevious').checked = result.stopPrevious !== undefined ? result.stopPrevious : true;
        document.getElementById('cacheAudio').checked = result.cacheAudio !== undefined ? result.cacheAudio : true;
        const presetIndex = presetPaths.indexOf(result.preset);
        if (presetIndex !== -1) {
          document.getElementById('preset').dataset.index = presetIndex;
          if (!presetTransition) document.getElementById('preset').innerHTML = presetNames[presetIndex];
        } else {
          document.getElementById('preset').dataset.index = 0;
          if (!presetTransition) document.getElementById('preset').innerHTML = presetNames[0];
        }
        soundInputs.forEach(input => {
            input.placeholder = presetPaths[presetIndex].replace("sounds", "").replaceAll("/", "") + " (paste url of file path)";
        });
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

  document.querySelectorAll('#prNext, #prPrev').forEach(button => {
    button.onclick = () => {
      presetTransition = true;
      const direction = button.id === 'prNext' ? 1 : -1;
      const presetIndex = (parseInt(document.getElementById('preset').dataset.index) + direction + presetNames.length) % presetNames.length;
      document.getElementById('preset').dataset.index = presetIndex;
      const presetElement = document.getElementById('preset');
      presetElement.animate([
        { translate: '0 0', opacity: '1' },
        { translate: `${50 * direction}px 0`, opacity: '0' }
      ], {
        duration: 100,
        easing: 'cubic-bezier(1, 0, 1, 0)',
        fill: 'forwards'
      });
      setTimeout(() => {
        presetElement.innerHTML = presetNames[presetIndex];
        presetElement.animate([
          { translate: `${-50 * direction}px 0`, opacity: '0' },
          { translate: '0 0', opacity: '1' }
        ], {
          duration: 400,
          easing: 'cubic-bezier(.05, 1.3, .1, 1)',
          fill: 'forwards'
        });
      }, 100);
      chrome.storage.local.set({ preset: presetPaths[presetIndex] });
      loadSettings();
    };
  });

  function updateCacheDisplay() {
    chrome.runtime.sendMessage({ type: 'GET_CACHE_SIZE' }, (response) => {
      const size = response?.sizeKB || 0;
      document.getElementById('cc').querySelector('span').textContent = 
        `${size} KB`;
    });
  }

  loadSettings();

  document.querySelectorAll('input, .vol span, #presetSelector button').forEach(input => {
    input.addEventListener('input', function() {
      updateVolumeDisplay();
      setTimeout(() => {
        const settings = {
          preset: presetPaths[document.getElementById('preset').dataset.index],
          ...Object.fromEntries(Array.from(soundInputs, input => [input.id, input.value])),
          ...Object.fromEntries(actionNames.map((action, i) => [`${action}Volume`, parseFloat(volumeInputs[i].textContent)])),
          muteSwitchOnActions: document.getElementById('muteSwitchOnActions').checked,
          stopPrevious: document.getElementById('stopPrevious').checked,
          cacheAudio: document.getElementById('cacheAudio').checked
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
    if (Array.from(soundInputs).every(input => input.value === '') &&
      volumeInputs.every(input => input.textContent === '1.0') &&
      document.getElementById('muteSwitchOnActions').checked === true &&
      document.getElementById('stopPrevious').checked === true &&
      document.getElementById('cacheAudio').checked === true) {
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
      chrome.storage.local.clear(() => {
      });
      soundInputs.forEach(input => input.value = '');
      volumeInputs.forEach(input => input.textContent = '1.0');
      document.getElementById('muteSwitchOnActions').checked = true;
      document.getElementById('stopPrevious').checked = true;
      document.getElementById('cacheAudio').checked = true;
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
    document.getElementById('cc').classList.add('clicked');
    document.getElementById('cc').disabled = true;
    setTimeout(() => {
      document.getElementById('cc').classList.remove('clicked');
      document.getElementById('cc').disabled = false;
    }, 1500);
    updateCacheDisplay();
  });
  
  volumeInputs.forEach((input, index) => {
    document.getElementById(`${actionNames[index]}VolumeSlider`).addEventListener('input', function() {
      input.textContent = parseFloat(this.value).toFixed(1);
    });
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
      const allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
      if (allInputs.some(input => /^https?:\/\/.+/.test(input.value))) {
        document.getElementById('cacheLabel').style.height = '';
        document.body.style.height = '565px'
        pp.style.height = '555px';
      } else {
        document.getElementById('cacheLabel').style.height = '0px';
        document.body.style.height = '535px'
        pp.style.transition = 'none';
        pp.style.height = '525px';
        setTimeout(() => {
          pp.style.transition = '';
        }, 0);
        chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' });
        updateCacheDisplay();
      }
      if (this.value.includes('"C:\\')) {
        this.value = this.value.replace(/"/g, "");
      }
      let url = this.value
      if (!url) url = `${presetPaths[document.getElementById('preset').dataset.index] + this.id.replace('Sound', '')}.ogg`
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
              { transform: 'scale(0)' },
              { transform: 'scale(1)' }
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

  const pages = Array.from(document.querySelectorAll('.page')).map(page => page.id);
  const pageNav = document.getElementById('pages');
  const title = document.getElementById('sTitle');
  let currentPage = 0;

  pages.forEach((_, index) => {
    const pageButton = document.createElement('button');
    pageButton.className = 'pageButton';
    if (index === 0) {
      pageButton.classList.add('active');
    }
    pageNav.appendChild(pageButton);
    pageButton.onclick = () => pageSwitch(index);
    if (index === 0) {
      const animPb = pageButton.cloneNode(true);
      animPb.style.pointerEvents = 'none';
      animPb.style.position = 'absolute';
      animPb.classList.add('anim');
      animPb.onclick = '';
      pageNav.appendChild(animPb);
        animPb.style.left = `0px`;
    }
  });

  function pageSwitch(index) {
    posBefore = pageNav.querySelector('.pageButton.active:not(.anim)').offsetLeft;
    pageBefore = currentPage;
    currentPage = index;
    direction = index > pageBefore ? 1 : -1;
    document.querySelectorAll('.page').forEach(page => {
      page.style.transform = `translateX(calc(${-index * 100}% - ${index*10}px))`;
    });
    document.querySelectorAll('.pageButton:not(.anim)').forEach((button, i) => {
      button.classList.toggle('active', i === index);
    });
    const animPb = document.querySelector('.anim');
    animPb.style.background = `linear-gradient(${170*-direction}deg, white 50%, transparent)`
    if (direction === -1) animPb.style.left = `${document.querySelector('.pageButton.active:not(.anim)').offsetLeft-2}px`;
    animPb.style.width = `${Math.min(Math.abs(document.querySelector('.pageButton.active:not(.anim)').offsetLeft - posBefore) + (parseFloat(animPb.style.width) || 12), Math.abs(document.querySelector(direction === 1 ? ".anim" : ".pageButton.active:not(.anim)").offsetLeft - document.querySelectorAll('.pageButton')[pages.length].offsetLeft) + 12)}px`;
    if (animPb.timeoutId) clearTimeout(animPb.timeoutId);
    animPb.timeoutId = setTimeout(() => {
      animPb.style.width = `12px`;
      if (direction === 1) animPb.style.left = `${document.querySelector('.pageButton.active:not(.anim)').offsetLeft-2}px`;
      animPb.timeoutId = null;
    }, 400);
    title.animate([
      { translate: '0 0', opacity: '1' },
      { translate: `${-50*direction}px 0`, opacity: '0' }
    ], {
      duration: 100,
      easing: 'cubic-bezier(1, 0, 1, 0)',
      fill: 'forwards'
    });
    setTimeout(() => {
      title.textContent = pages[index].replaceAll("-", " ");
      title.animate([
        { translate: `${50*direction}px 0`, opacity: '0' },
        { translate: '0 0', opacity: '1' }
      ], {
        duration: 400,
        easing: 'cubic-bezier(.05, 1.3, .1, 1)',
        fill: 'forwards'
      });
    }, 100);
  }

  document.getElementById('next').onclick = () => pageSwitch((currentPage + 1) % pages.length);
  document.getElementById('prev').onclick = () => pageSwitch((currentPage - 1 + pages.length) % pages.length);

  document.querySelectorAll('*:not(#sounds, .hidden, .hidden *, #info *:not(h4))').forEach((element, index) => {
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
        updateVolumeDisplay();
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

  function updateVolumeDisplay() {
    document.querySelectorAll('.vol').forEach(input => {
      textInp = document.getElementById(input.querySelector('span').id.replace('Volume', 'Sound'));
      textInpWidth = textInp.clientWidth;
      textInpWidth += textInp.parentNode.querySelector('button') ? 28 : 0

      input.style.width = textInpWidth + 'px';
    });
  }
  
});
