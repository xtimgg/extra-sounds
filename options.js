document.querySelectorAll('body > *').forEach(element => {
  element.style.filter = 'blur(10px) brightness(30%)';
});
document.addEventListener('DOMContentLoaded', () => {
  if(localStorage.getItem('reload') !== '1') {
    if (localStorage.getItem('timeOpened') === "10") {
      popup("thanks for using this extension :3 <br>i spent a lot of time on it, so maybe <a href='https://chromewebstore.google.com/detail/extra-sounds/ibmbabeddalpanmbopnjlgcgcmdfboco/reviews' target='_blank'>review it for me</a>?");
    }
    (async () => {
      try {
        const url = `https://raw.githubusercontent.com/xtimgg/extra-sounds/refs/heads/privacy-policy/dynamic-popup-info.json?cache_bust=${Date.now()}`;
        const res = await fetch(url, { cache: "no-store" });
        const info = await res.json();
        
        if (info.show && info.message) {
          if(info.index === -1) {
            popup(info.message, info.error);
          } else {
            if(localStorage.getItem("message" + String(info.index)) !== "true") {
              popup(info.message, info.error);
              localStorage.setItem("message" + String(info.index), "true");
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch info:', err);
      }
    })();
    localStorage.setItem('timeOpened', String(Number(localStorage.getItem('timeOpened') || 0) + 1));
  }
  const allDetails = document.querySelectorAll('details')

  document.querySelectorAll('.sound').forEach((sound) => {
    sound.innerHTML = '';
    const summary = document.createElement('summary');
    summary.textContent = sound.id
      .replace(/([A-Z])/g, ' $1')       // Insert space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .toLowerCase()
      .replace(/^./, str => str.toUpperCase()); // Capitalize again after lowering
    summary.textContent += ':';
    sound.appendChild(summary);

    const inputsContainer = document.createElement('div');
    inputsContainer.className = 'mainInput';
    summary.appendChild(inputsContainer);
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'default (paste url or file path)';
    textInput.id = sound.id + 'Sound';
    textInput.style.display = 'none';
    inputsContainer.appendChild(textInput);
    const fileLabel = document.createElement('label');
    fileLabel.className = 'upload';
    fileLabel.innerHTML = '<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zm7-18L5 9h4v6h6V9h4l-7-7z"/></svg> Upload audio file';
    fileLabel.setAttribute('for', sound.id + 'Sound');
    inputsContainer.appendChild(fileLabel);
    const presetSelect = document.createElement('div');
    presetSelect.className = 'presetSelect';
    const presetContainer = document.createElement('span');
    presetContainer.className = 'presetContainer';
    const preset = document.createElement('span');
    preset.innerHTML = 'default';
    preset.dataset.index = '0';
    preset.className = 'preset';
    const prev = document.createElement('button');
    prev.innerHTML = '&lt;';
    prev.className = 'prPrev';
    const next = document.createElement('button');
    next.innerHTML = '&gt;';
    next.className = 'prNext';
    presetSelect.appendChild(prev);
    presetSelect.appendChild(presetContainer);
    presetContainer.appendChild(preset);
    presetSelect.appendChild(next);
    inputsContainer.appendChild(presetSelect)

    // Create 3 radio inputs with different values/labels
    const radioValues = [
      { value: 'preset', label: 'Preset' },
      { value: 'file', label: 'File' },
      { value: 'text', label: 'URL' }
    ];
    const segmentedControl = document.createElement('div');
    segmentedControl.className = 'segmented-control';
    sound.appendChild(segmentedControl);
    radioValues.forEach(({ value, label }, idx) => {
      const radioLabel = document.createElement('label');
      radioLabel.className = 'radioLabel';
      radioLabel.htmlFor = value + sound.id;
      const radioInput = document.createElement('input');
      radioInput.type = 'radio';
      radioInput.name = sound.id + 'RadioGroup';
      radioInput.value = value;
      radioInput.id = value + sound.id;
      segmentedControl.appendChild(radioInput);
      radioLabel.appendChild(document.createTextNode(' ' + label));
      segmentedControl.appendChild(radioLabel);
      if(idx===0) { radioInput.checked = true };
      if(idx===0) { radioInput.click() };
    });
    const slider = document.createElement('div');
    slider.className = 'slider';
    segmentedControl.appendChild(slider);


    // Create volume paragraph
    const volP = document.createElement('p');
    volP.className = 'vol';
    sound.appendChild(volP);

    // Create sup
    const sup = document.createElement('sup');
    sup.innerHTML = 'Volume:';

    // Create span[contenteditable]
    const span = document.createElement('span');
    span.contentEditable = 'true';
    span.textContent = '1.0';
    span.id = sound.id + 'Volume';

    volP.appendChild(sup);

    // Create input[type="range"]
    const rangeInput = document.createElement('input');
    rangeInput.type = 'range';
    rangeInput.min = '0';
    rangeInput.max = '2';
    rangeInput.step = '0.1';
    rangeInput.value = '1';
    rangeInput.id = sound.id + 'VolumeSlider';
    volP.appendChild(rangeInput);
    volP.appendChild(span);



    // Create pitch paragraph
    const pitchP = document.createElement('p');
    pitchP.className = 'pitch';
    sound.appendChild(pitchP);

    // Create sup for pitch
    const pitchSup = document.createElement('sup');
    pitchSup.innerHTML = 'Pitch:';

    // Create span[contenteditable] for pitch
    const pitchSpan = document.createElement('span');
    pitchSpan.contentEditable = 'true';
    pitchSpan.textContent = '1.0';
    pitchSpan.id = sound.id + 'Pitch';

    pitchP.appendChild(pitchSup);

    // Create input[type="range"] for pitch
    const pitchRangeInput = document.createElement('input');
    pitchRangeInput.type = 'range';
    pitchRangeInput.min = '-1';
    pitchRangeInput.max = '1';
    pitchRangeInput.step = '0.1';
    pitchRangeInput.value = '0';
    pitchRangeInput.id = sound.id + 'PitchSlider';
    pitchP.appendChild(pitchRangeInput);
    pitchP.appendChild(pitchSpan);
  });

  allDetails.forEach(deet=>{
    deet.addEventListener('toggle', () => {
      if (deet.open) {
        allDetails.forEach(bye=>{
          if (bye!=deet && bye.open) {
            bye.querySelector('.picking .presetContainer')?.click();
            requestAnimationFrame(() => {
              bye.open = false;
            });
          }
          const input = bye.querySelector('.mainInput');
          const control = bye.querySelector('.segmented-control');

          control.style.transition = 'none';
          control.style.marginLeft = `${input.offsetLeft}px`;
          control.style.width = `${input.offsetWidth - 12 - (input.closest('details').querySelector('.playButton') ? 0 : 25)}px`;
          setTimeout(() => {
            control.style.transition = '';
          }, 0);
        });

      }
    })
    deet.querySelector('summary input, summary button').addEventListener('click', () => {
      if (!deet.open) {
        deet.open = true;
      }
    });
    deet.querySelector('.presetContainer').addEventListener('click', event => {
      if (event.target.closest('a')) return;
      if (deet.open) {
      event.stopPropagation();
      event.preventDefault();
      }
    });
  })

  function handleRadioLabelClick(lbl) {
    requestAnimationFrame(() => {
        const slider = lbl.parentNode.querySelector('.slider');
        slider.style.width = `${lbl.offsetWidth}px`;
        slider.style.left = `${lbl.offsetLeft}px`;
    });
    setTimeout(() => {
      lbl.closest('details').querySelector('.mainInput input').dispatchEvent(new Event('input'));
    });
    const mainInput = lbl.parentNode.parentNode.querySelector('.mainInput input');
    const presetInput = lbl.parentNode.parentNode.querySelector('.presetSelect');
    const inpType = document.getElementById(lbl.htmlFor).value;
    if (inpType == 'preset') {
      mainInput.type = "text";
      mainInput.style.display = 'none';
      mainInput.style.margin = '0';
      presetInput.style.display = '';
    } else {
      mainInput.style.display = '';
      mainInput.style.margin = '';
      mainInput.type = inpType;
      if (inpType == 'file') {
        updateFileLabels();
      } else {
        chrome.storage.local.get(mainInput.id, result => {
          mainInput.value = result[mainInput.id]?.url || '';
          setTimeout(() => {
            mainInput.dispatchEvent(new Event('input'));
          }, 69);
        });
      }
      presetInput.classList.remove('picking');
      presetInput.querySelector('.preset').innerHTML = presetNames[presetInput.querySelector('.preset').dataset.index];
      presetInput.style.display = 'none';
      mainInput.placeholder = "https://site.com/audio.mp3";
    }
  }
  document.querySelectorAll('.radioLabel').forEach(lbl => {
    lbl.addEventListener('click', () => handleRadioLabelClick(lbl));
  });

  setTimeout(() => {
    allDetails.forEach(det => {det.open = true});
    allDetails.forEach(det => {det.open = false});
  });
  setTimeout(() => {
    allDetails.forEach(det => {det.open = true});
    allDetails.forEach(det => {det.open = false});
  }, 500); //fallback

  // Also activate when any details element is opened or closed
  allDetails.forEach(deet => {
    deet.addEventListener('toggle', () => {
      // Find the checked radio label inside thiZzs details
      const checkedRadio = deet.querySelector('input[type="radio"]:checked');
      if (checkedRadio) {
        const lbl = deet.querySelector(`label[for="${checkedRadio.id}"]`);
        if (lbl) handleRadioLabelClick(lbl);
      }
    });
  });

  const presetNames = ['clean (<a href="https://youtu.be/AD1JUStm-2Q" target="_blank">by @zapocan</a>)', 'wooden (<a href="https://youtu.be/F7NP-Q0REZ8" target="_blank">by @zapocan</a>)', 'minecraft sfx (<a href="https://minecraft.wiki/w/Category:Sound_effects" target="_blank">source</a>)'];
  const presetPaths = ['sounds/clean/', 'sounds/wooden/', 'sounds/minecraft/'];
  const actionNames = Array.from(document.querySelectorAll('.sound')).map(el => el.id);
  const soundInputs = actionNames.map(action => document.getElementById(`${action}Sound`));
  let volumeInputs = actionNames.map(action => document.getElementById(`${action}Volume`));
  let pitchInputs = actionNames.map(action => document.getElementById(`${action}Pitch`));
  function loadSettings() {
    chrome.storage.local.get(
      [
        ...actionNames.map(action => `${action}Sound`),
        'muteSwitchOnActions',
        'stopPrevious',
        'cacheAudio'
      ],
      (result) => {
        actionNames.forEach(action => {
          const soundResult = result[action + "Sound"] || {
            type: 'preset',
            preset: presetPaths[0],
            url: '',
            file: '',
            volume: '1.0',
            pitch: '0.0'
          };
          type = soundResult.type || 'preset';
          container = document.getElementById(action);
          mainInput = container.querySelector('input');
          preset = container.querySelector('.preset');
          preset.dataset.index = presetPaths.indexOf(soundResult.preset) !== -1 ? presetPaths.indexOf(soundResult.preset) : 0;
          document.getElementById(type + action).click();
          preset.innerHTML = presetNames[preset.dataset.index];
          mainInput.value = soundResult.url || '';
          mainInput.dataset.fileHandle = soundResult.file || '';
          container.querySelector('.vol span').textContent = parseVolume(soundResult.volume) || '1.0';
          container.querySelector('.pitch span').textContent = parseVolume(soundResult.pitch) || '0.0';
        });
        document.getElementById('muteSwitchOnActions').checked = result.muteSwitchOnActions !== undefined ? result.muteSwitchOnActions : true;
        document.getElementById('stopPrevious').checked = result.stopPrevious !== undefined ? result.stopPrevious : false;
        document.getElementById('cacheAudio').checked = result.cacheAudio !== undefined ? result.cacheAudio : true;
      }
    );
    
    setTimeout(() => {
      document.querySelectorAll('input[type="range"]').forEach(input => {
        input.value = parseFloat(input.parentNode.querySelector('span').textContent).toFixed(1);
      });
    }, 10);
    updateCacheDisplay();
  }

  document.querySelectorAll('.presetContainer').forEach(pcont => {
    const preset = pcont.querySelector('.preset');
    pcont.addEventListener('click', () => {
      preset.parentNode.parentNode.classList.toggle('picking');
      if (preset.parentNode.parentNode.classList.contains('picking')) {
        preset.innerHTML = presetNames[preset.dataset.index].split(' ')[0];
        if (preset.closest('summary').querySelector('.playButton')) preset.closest('summary').querySelector('.playButton').style.display = 'none';
      } else {
        preset.innerHTML = presetNames[preset.dataset.index];
        if (preset.closest('summary').querySelector('.playButton')) preset.closest('summary').querySelector('.playButton').style.display = '';
        preset.closest('summary').querySelector('input').dispatchEvent(new Event('input'));
      }
    });
  });

  document.querySelectorAll('.prNext, .prPrev').forEach(button => {
    button.onclick = () => {
      button.closest('summary').querySelector('input').dispatchEvent(new Event('input'));
      const direction = button.className === 'prNext' ? 1 : -1;
      const presetElement = button.parentNode.querySelector('.preset');
      const presetIndex = (parseInt(presetElement.dataset.index) + direction + presetNames.length) % presetNames.length;
      presetElement.dataset.index = presetIndex;
      presetElement.animate([
        { translate: '0 0', opacity: '1' },
        { translate: `${50 * direction}px 0`, opacity: '0' }
      ], {
        duration: 100,
        easing: 'cubic-bezier(1, 0, 1, 0)',
        fill: 'forwards'
      });
      setTimeout(() => {
        presetElement.innerHTML = presetNames[presetIndex].split(' ')[0];
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

  document.querySelectorAll('input, .vol span, .pitch span, .presetSelect button').forEach(input => {
    input.addEventListener('input', function() {
      setTimeout(async () => {
        const soundEntries = await Promise.all(
          Array.from(soundInputs, async soundInput => {
            const container = soundInput.closest('details');
            const storage = (await chrome.storage.local.get(soundInput.id))[soundInput.id];

            return [
              soundInput.id,
              {
                type: container.querySelector('input[type="radio"]:checked').value,
                preset: presetPaths[container.querySelector('.preset').dataset.index],
                url: soundInput.type === 'text' && soundInput.style.display !== 'none'
                  ? soundInput.value
                  : storage?.url,
                file: storage?.file,
                volume: container.querySelector('.vol span').textContent,
                pitch: container.querySelector('.pitch span').textContent
              }
            ];
          })
        );

        const settings = {
          ...Object.fromEntries(soundEntries),
          muteSwitchOnActions: document.getElementById('muteSwitchOnActions').checked,
          stopPrevious: document.getElementById('stopPrevious').checked,
          cacheAudio: document.getElementById('cacheAudio').checked
        };
        chrome.storage.local.set(settings);
      });
    });
  });

  const reset = document.getElementById('reset');
  const rtext = document.getElementById('rtext');
  let sure = false;
  reset.addEventListener('click', () => {
    if (sure) reset.disabled = true;
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
    chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' });
    document.querySelectorAll('body > *').forEach(element => {
      element.animate([
        { filter: 'blur(0)' },
        { filter: 'blur(10px) brightness(30%)' }
      ], {
        duration: 300,
        easing: 'cubic-bezier(.57,0,.1,1)',
        fill: 'forwards'
      });
    });
    const resetIcon = document.createElement('span');
    resetIcon.id = 'resetIcon';
    resetIcon.innerHTML = '&circlearrowright;'
    document.body.appendChild(resetIcon);
    resetIcon.animate([
      { transform: 'scale(0)' },
      { transform: 'scale(1)' }
    ], {
      duration: 300,
      easing: 'cubic-bezier(.2,1.5,.2,1)',
      fill: 'forwards'
    });
    resetIcon.animate([
      { rotate: '90deg' },
      { rotate: '30deg' }
    ], {
      duration: 300,
      easing: 'cubic-bezier(.2,.5,0,1)',
      fill: 'forwards'
    });

    setTimeout(() => {
      chrome.storage.local.clear();
      localStorage.setItem('reload', '1');
      location.reload();
    }, 300);

    // setTimeout(() => {
    //   reset.disabled = false;
    //   reset.querySelector('svg').style.transition = 'none';
    //   reset.classList.remove('sure');
    //   setTimeout(() => {
    //     reset.querySelector('svg').style.transition = '';
    //   }, 10);
    // }, 700);
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
    document.getElementById(`${actionNames[index]}VolumeSlider`)?.addEventListener('input', function() {
      input.textContent = parseFloat(this.value).toFixed(1);
    });
  });

  pitchInputs.forEach((input, index) => {
    document.getElementById(`${actionNames[index]}PitchSlider`)?.addEventListener('input', function() {
      input.textContent = parseFloat(this.value).toFixed(1);
    });
  });
  

  setTimeout(() => {
    volumeInputs.forEach((input, index) => {
      input.textContent = parseFloat(document.getElementById(`${actionNames[index]}VolumeSlider`).value).toFixed(1);
    });

    pitchInputs.forEach((input, index) => {
      input.textContent = parseFloat(document.getElementById(`${actionNames[index]}PitchSlider`).value).toFixed(1);
    });
  }, 0);

  document.querySelectorAll('.vol span, .pitch span').forEach(input => {
    input.addEventListener('input', function() {
      if(this.textContent.length > 3) {
        this.textContent = this.textContent.slice(0, 3);
      }
      document.getElementById(this.id+"Slider").value = this.textContent;
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


  function updateFileLabels() {
    document.querySelectorAll('.mainInput input[type="file"]').forEach(fileInput => {
      const lbl = fileInput.parentNode.querySelector('label[for="' + fileInput.id + '"]');
      chrome.storage.local.get(fileInput.id, result => {
      const fileObj = result[fileInput.id]?.file;
      if (fileObj && fileObj.name) {
        lbl.innerHTML = fileObj.name;
        lbl.style.filter = `hue-rotate(220deg)`;
        adjustFontSizeToFit(lbl, 14, 10);
      } else {
        lbl.innerHTML = '<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zm7-18L5 9h4v6h6V9h4l-7-7z"/></svg> Upload audio file';
        lbl.style.filter = '';
      }
      });
    });
  }

  document.querySelectorAll('.mainInput input').forEach(fileInput => {
    fileInput.addEventListener('change', async () => {
      if (fileInput.type !== 'file') return;
      lbl = fileInput.parentNode.querySelector('label[for="' + fileInput.id + '"]');
      const result = await storeFileInChromeLocal(fileInput, fileInput.id);
      lbl.innerHTML = result;

      if (result.startsWith('Error')) {
        lbl.style.filter = `hue-rotate(92deg) saturate(1.5)`;
        setTimeout(() => {
          updateFileLabels();
        }, 3000);
      } else {
        lbl.style.filter = `hue-rotate(220deg)`;
        setTimeout(() => {
          fileInput.dispatchEvent(new Event('input'));
        }, 0);
      }
      adjustFontSizeToFit(lbl, 14, 10);
    });
  });

  document.querySelectorAll('.mainInput input').forEach(input => {
    let debounceTimer;
    input.addEventListener('input', async function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const currentPB = this.parentNode.parentNode.querySelector('.playButton');
        if (document.querySelector('input[type="text"]:not([style*="display: none"])')) {
          document.getElementById('cacheLabel').style.height = '';
        } else {
          document.getElementById('cacheLabel').style.height = '0px';
          chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' });
          updateCacheDisplay();
        }
        let url;
        let _dataUrl;
        if (this.type === 'text' && this.style.display !== 'none') {
          url = this.value;
        } else if (this.type === 'file') {
          try {
            const dataUrl = await getStoredDataUrl(this.id);
            url = dataUrl;
            _dataUrl = dataUrl;
          } catch (err) { //do nothing if file missing
            url = null;
          }
        } else {
          url = chrome.runtime.getURL(`${presetPaths[input.parentElement.querySelector('.preset').dataset.index] + this.id.replace('Sound', '')}.ogg`);
        }
        doesItMeow = await isAudioPlayable(url);
        let isNew = false;
        if(doesItMeow) {
          if (currentPB) {
            if (currentPB.dataset.url === url) return;
            isNew = false;
            currentPB.remove();
          } else {
            isNew = true;
          }
          const playButton = document.createElement('button');
          const playIcon = document.createElement('span');
          playIcon.innerText = '▲';
          playIcon.style.display = 'inline-block';
          playIcon.style.transform = 'rotate(90deg)';
          playButton.className = 'playButton';
          playButton.appendChild(playIcon);
          playButton.dataset.url = url;
          playButton.onclick = () => {
            if (source && playIcon.innerText === '❚❚') {
              source.stop();
              source = null;
            } else {
              let vol = parseFloat(this.closest('details').querySelector('.vol span').textContent);
              let pitch = parseFloat(this.closest('details').querySelector('.pitch span').textContent);
              playIcon.innerText = '❚❚';
              playIcon.style.transform = 'rotate(0deg)';
              playAudio(url, {
                v: vol,
                p: pitch,
                e: () => {
                  playIcon.innerText = '▲';
                  playIcon.style.transform = 'rotate(90deg)';
                  source = null;
                }
              });
            }
          };
          if(this.closest('details').querySelector('.picking')) playButton.style.display = 'none';
          this.parentNode.parentNode.append(playButton);
          this.className = 'valid';
          if (isNew) {
            playButton.animate([
              { width: '0px' },
              { width: '24px' }
            ], {
              duration: 200,
              easing: 'cubic-bezier(0,1.5,0,1)'
            });
          }
          if(!this.value == '') this.className = 'valid green'
        } else {
          if (currentPB) {
            currentPB.animate([
              { width: '24px' },
              { width: '0px' }
            ], {
              duration: 100,
              easing: 'cubic-bezier(0,0.75,0,1)'
            });
            setTimeout(() => {
              currentPB.remove();
            }, 50);
          }
          this.className = 'red';
        }
      }, 100);
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
      setTimeout(() => {
        animPb.style.left = `${pageButton.parentNode.querySelector('.active:not(.anim)').offsetLeft-2}px`;
      }, 0);
    }
  });

  let direction = 0;
  function pageSwitch(index) {
    posBefore = pageNav.querySelector('.pageButton.active:not(.anim)').offsetLeft;
    pageBefore = currentPage;
    directionBefore = direction;
    currentPage = index;
    if (pageBefore === index) return;
    allDetails.forEach(deet=>{
      if (deet.open) deet.open = false;
    });
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
    if (direction !== directionBefore) animPb.style.width = '12px';
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

  if (localStorage.getItem('reload') === '1') {
    document.querySelectorAll('body > *').forEach(element => {
      element.animate([
        { filter: 'blur(10px) brightness(30%)' },
        { filter: 'blur(0)' }
      ], {
        duration: 600,
        easing: 'cubic-bezier(.57,0,.1,1)'
      });
      setTimeout(() => {
        element.style.filter = '';
      }, 600);
    });
    const resetIcon = document.createElement('span');
    resetIcon.id = 'resetIcon';
    resetIcon.innerHTML = '&circlearrowright;'
    document.body.appendChild(resetIcon);
    resetIcon.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(0)' }
    ], {
      delay: 300,
      duration: 300,
      easing: 'cubic-bezier(.8,0,.84,-0.53)',
      fill: 'forwards'
    });
    resetIcon.animate([
      { rotate: '30deg' },
      { rotate: '420deg' }
    ], {
      duration: 600,
      easing: 'cubic-bezier(.15,.4,.1,1)',
      fill: 'forwards'
    });
    setTimeout(() => {
      resetIcon.remove();
    }, 600);
    localStorage.setItem('reload', '0');
  } else {
    
    document.querySelectorAll('body > *').forEach(element => {
      element.style.filter = '';
    });
    document.querySelectorAll('*:not(#sounds, .hidden, .hidden *, #info *:not(h4), nav, nav *:not(button), .playButton.anim, details *:not(.segmented-control))').forEach((element, index) => {
      if (index < 6) return;
      element.style.opacity = '0';
      setTimeout(() => {
        if(element.id !== 'info') {
          element.animate([
            { translate: '0 -50px', opacity: '0' },
            { translate: '0 0', opacity: '1' }
          ], {
            duration: 500,
            easing: 'cubic-bezier(0, 1, 0, 1)',
          });
        } else {
          element.animate([
            { scale: '1 0', opacity: '0', transformOrigin: 'bottom' },
            { scale: '1', opacity: '1', transformOrigin: 'bottom'  }
          ], {
            duration: 500,
            easing: 'cubic-bezier(0, 1, 0, 1)',
          });
        }
        element.style.opacity = '';
      }, (index-5) * 20);
    });
  }


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
        loadSettings();
        setTimeout(() => {
          document.querySelectorAll('summary').forEach(summary => {
            summary.click();
            summary.parentNode.open = false;
          });
        }, 10);
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

// some shit from chatgpt for file storing and playing etc that probably works lol

var source;
const ctx   = new (AudioContext||webkitAudioContext)(),
  cache = new Map();

/**
 * Play URL or ArrayBuffer with volume/pitch; returns a stop() fn.
 * @param {string|ArrayBuffer} a
 * @param {object}            [o]
 * @param {number}            [o.v=1]   // gain
 * @param {number}            [o.p=0]   // pitch (semitones, 0 = normal)
 * @param {fn}                [o.e]     // onended
 */
const playAudio = async (a, { v = 1, p = 1, e } = {}) => {
  if(source) {
    source.stop();
    source = null;
  }
  // fetch or reuse raw data
  const raw = a instanceof ArrayBuffer
    ? a
    : await (await fetch(a)).arrayBuffer();

  // decode once
  const buf = cache.get(a)
    ?? await ctx.decodeAudioData(raw).then(b => (cache.set(a, b), b));

  // create nodes
  const s = ctx.createBufferSource(),
    g = ctx.createGain();

  s.buffer = buf;
  g.gain.value = v;

  // p is in range -1 (one octave down) to 1 (one octave up), 0 = normal
  // detune in cents: 1 octave = 1200 cents
  s.detune.value = isFinite(p) ? p * 1200 : 0;

  s.connect(g).connect(ctx.destination);
  if (e) s.onended = e;
  s.start();
  source = s;

  return () => s.stop();
};



/**
 * Read a selected file from <input type="file"> and store it in chrome.storage.local
 * under   [propertyName].file = { name, type, dataUrl }.
 *
 * @param {HTMLInputElement|string} fileInputOrId  
 *        Either the file-input element itself, or its ID in the document.
 * @param {string} propertyName  
 *        The key in chrome.storage.local where your object lives.
 * @returns {Promise<string>}  
 *        Resolves to "uploadedFile.mp3" on success,
 *        or "Error: <message>" on failure.
 */
async function storeFileInChromeLocal(fileInputOrId, propertyName) {
  try {
    // 1) grab the <input type="file">
    const fileInput = typeof fileInputOrId === 'string'
      ? document.getElementById(fileInputOrId)
      : fileInputOrId;
    if (!fileInput || fileInput.tagName !== 'INPUT' || fileInput.type !== 'file') {
      throw new Error('Invalid file input element');
    }

    // 2) pull the File object
    const file = fileInput.files?.[0];
    if (!file) {
      throw new Error('No file selected');
    }
    const { name, type } = file;
    if(file.size > 50 * 1024 * 1024) return `Error: File is over 50MB >_<`;

    if (file.size > 5 * 1024 * 1024) {
      const proceed = confirm("This file is over 5MB. Are you sure you want to continue? (you must know it might be laggy :3 but it should work)");
      if (!proceed) return `Error: File is over 5MB and upload was cancelled`;
    }

    // Check if file is playable audio before proceeding
    const playable = await isAudioPlayable(file);
    if (!playable) {
      return `Error: thats not audio :v`;
    }


    // 3) read it as a base64 data-URL
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload  = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    // 4) fetch whatever you already have (or start fresh)
    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.get([propertyName], res => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(res[propertyName] || {});
        }
      });
    });
    const existing = result;

    // 5) merge in your new file object (no string coercion!)
    const updated = {
      ...existing,
      file: { name, type, dataUrl }
    };

    // 6) write it back
    await new Promise((resolve, reject) => {
      chrome.storage.local.set({ [propertyName]: updated }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });

    // 7) success!
    return name;

  } catch (err) {
    // bubble up a concise error string
    return `Error: ${err.message}`;
  }
}

/**
 * Converts a Base64‐data URL into an ArrayBuffer.
 * @param {string} dataUrl  A string like "data:audio/ogg;base64,T2dnUwAC…"
 * @returns {ArrayBuffer}
 */
function dataUrlToArrayBuffer(dataUrl) {
  // Check if the input is a valid data URL
  if (!/^data:audio\/[a-z0-9.+-]+;base64,/.test(dataUrl)) {
    return;
  }
  // Strip off the "data:*/*;base64," prefix
  const base64 = dataUrl.split(',')[1];
  // Decode to raw binary string
  const binary = atob(base64);
  const len = binary.length;
  // Allocate buffer and write each char code
  const buffer = new ArrayBuffer(len);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < len; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

/**
 * Checks if the given input is playable audio.
 * @param {string|ArrayBuffer|Blob} input  
 *   - URL string to fetch  
 *   - ArrayBuffer of audio data  
 *   - Blob/File  
 * @returns {Promise<boolean>}  
 */
async function isAudioPlayable(input) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  try {
    let buf;
    if (typeof input === 'string') {
      const res = await fetch(input);
      buf = await res.arrayBuffer();
    } else if (input instanceof ArrayBuffer) {
      buf = input;
    } else if (input instanceof Blob) {
      buf = await input.arrayBuffer();
    } else {
      return false;
    }
    await ctx.decodeAudioData(buf);
    return true;
  } catch {
    return false;
  } finally {
    ctx.close();
  }
}

function getStoredDataUrl(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, result => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (!result[key] || !result[key].file) {
        reject(new Error(`No data for key ${key}`));
      } else {
        resolve(result[key].file.dataUrl);
      }
    });
  });
}

function adjustFontSizeToFit(element, defaultFontSize = 16, minFontSize = 8) {
  function isOverflown(el) {
    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
  }

  // Reset to default size first
  element.style.fontSize = `${defaultFontSize}px`;

  // Use RAF to ensure styles are applied
  requestAnimationFrame(() => {
    let fontSize = defaultFontSize;
    while (isOverflown(element) && fontSize > minFontSize) {
      fontSize--;
      element.style.fontSize = `${fontSize}px`;
    }
  });
}

function popup(message, err=false) {
  if (document.querySelector('.tooltip')) {
    setTimeout(() => {
      popup(message, err);
    }, 5400);
    return;
  }
  const tip = document.createElement('div');
  tip.className = 'tooltip';
  document.body.append(tip);

  tip.style.left = '50vw';
  tip.style.bottom = '5vh';
  
  if (err) {
    tip.classList.add('error');
  }
  
  tip.innerHTML = message;
  
  // Force browser to process the newly added element
  tip.offsetHeight;
  
  // Show tooltip
  tip.classList.add('visible');

  tip.addEventListener('click', hide);

  // Remove tooltip after animation
  setTimeout(hide, 5000);

  function hide() {
    tip.classList.remove('visible');
    setTimeout(() => {
      if (tip.parentNode) {
        tip.remove();
      }
    }, 300); // Wait for fade out animation
  }
}