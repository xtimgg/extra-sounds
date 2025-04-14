document.addEventListener('DOMContentLoaded', () => {
  const tabOpenSoundInput = document.getElementById('tabOpenSound');
  const tabCloseSoundInput = document.getElementById('tabCloseSound');
  const tabSwitchSoundInput = document.getElementById('tabSwitchSound');
  const vo = document.getElementById('vo');
  const vc = document.getElementById('vc');
  const vs = document.getElementById('vs');
  
  chrome.storage.sync.get(
    [
      'tabOpenSound',
      'tabCloseSound',
      'tabSwitchSound',
      'muteSwitchOnActions',
      'stopPrevious',
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
      vo.textContent = parseVolume(result.volumeOpen) || 1.0;
      vc.textContent = parseVolume(result.volumeClose) || 1.0;
      vs.textContent = parseVolume(result.volumeSwitch) || 1.0;
    }
  );

  document.querySelectorAll('input, .vol span').forEach(input => {
    input.addEventListener('input', function() {
      setTimeout(() => {
        const settings = {
          tabOpenSound: tabOpenSoundInput.value,
          tabCloseSound: tabCloseSoundInput.value,
          tabSwitchSound: tabSwitchSoundInput.value,
          muteSwitchOnActions: document.getElementById('muteSwitchOnActions').checked,
          stopPrevious: document.getElementById('stopPrevious').checked,
          volumeOpen: parseFloat(vo.textContent),
          volumeClose: parseFloat(vc.textContent),
          volumeSwitch: parseFloat(vs.textContent)
        };
        chrome.storage.sync.set(settings);
      }, 0);
    });
  });

  const reset = document.getElementById('reset');
  let sure = false;
  reset.addEventListener('click', () => {
    if (sure) reset.disabled = true;
    // check if inputs already have default values (yeah the if statement has to be this long lol)
    if (tabOpenSoundInput.value === '' && tabCloseSoundInput.value === '' && tabSwitchSoundInput.value === '' && document.getElementById('muteSwitchOnActions').checked === true && document.getElementById('stopPrevious').checked === true && vo.textContent === '1.0' && vc.textContent === '1.0' && vs.textContent === '1.0') {
      reset.textContent = "why you click me? >.<";
      reset.classList.add('red');
      reset.disabled = true;
    } else {
      if (!sure) {
        reset.textContent = "are you sure? o_o";
        sure = true;
        setTimeout(() => {
          if (sure) {
            reset.textContent = "restore default settings :3";
            sure = false;
          }
        }, 2000);
        return;
      }
      sure = false;
      reset.textContent = "defaults restored!";
      reset.classList.add('green');
      tabOpenSoundInput.value = '';
      tabCloseSoundInput.value = '';
      tabSwitchSoundInput.value = '';
      document.getElementById('muteSwitchOnActions').checked = true;
      document.getElementById('stopPrevious').checked = true;
      vo.textContent = '1.0';
      vc.textContent = '1.0';
      vs.textContent = '1.0';
      document.querySelectorAll('input[type="range"]').forEach(input => {
        input.value = 1;
      });
      document.querySelectorAll('input[type="text"]').forEach(input => {
        input.dispatchEvent(new Event('input'));
      });
    }
    setTimeout(() => {
      reset.disabled = false;
      reset.textContent = 'restore default settings :3';
      reset.className = '';
    }, 2000);
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

  window.addEventListener('load', () => {
    setTimeout(() => {
      document.querySelectorAll('input[type="range"]').forEach(input => {
        input.value = parseFloat(input.parentNode.querySelector('span').textContent).toFixed(1);
      });
      document.querySelectorAll('input[type="text"]').forEach(input => {
        input.dispatchEvent(new Event('input'));
      });
    }, 0);
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
      const audio = new Audio(this.value);
      audio.volume = 0;
      audio.play()
        .then(() => {
          this.className = 'green';
          if (this.parentNode.querySelector('.playButton')) return;
          const playButton = document.createElement('button');
          playButton.innerHTML = '&#9654;';
          playButton.className = 'playButton';
          playButton.onclick = () => {
            const audio = new Audio(this.value);
            audio.volume = 1.0;
            audio.play().catch(err => console.error('Error playing sound:', err));
          };
          this.parentNode.appendChild(playButton);
          playButton.animate([
            { transform: 'scaleX(0)' },
            { transform: 'scaleX(0)' },
            { transform: 'scaleX(1)' }
          ], {
            duration: 200,
            easing: 'cubic-bezier(0, 1, 0, 1)',
            fill: 'forwards'
          });
        })
        .catch(() => {
        if (this.parentNode.querySelector('.playButton')) {
          this.parentNode.querySelector('.playButton').remove();
        }
        this.className = '';
        if (this.value == '') return;
        this.className = 'red';
      });
    });
  });
});
