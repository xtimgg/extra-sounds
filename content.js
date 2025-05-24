let port;

function connectPort() {
    port = chrome.runtime.connect({ name: 'content-script' });

    port.onDisconnect.addListener(() => {
        if (chrome.runtime.lastError) {
            console.warn('Port disconnected:', chrome.runtime.lastError.message);
        }
        console.log('Reconnecting port...');
        connectPort(); // Reconnect immediately
    });
}

// Connect the port initially
connectPort();

// Reconnect the port when the page is restored from the back/forward cache
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        console.log('Page restored from back/forward cache. Reconnecting port...');
        connectPort();
    }
});

document.addEventListener('pointerdown', (event) => {
    let el = event.target;
    while (el) {
        if (el.classList && el.classList.contains('playButton')) {
            return;
        }
        el = el.parentElement;
    }
    if (port) port.postMessage({ type: 'MOUSE_DOWN' });
});

document.addEventListener('pointerup', (event) => {
    let el = event.target;
    while (el) {
        if (el.classList && el.classList.contains('playButton')) {
            return;
        }
        el = el.parentElement;
    }
    if (port) port.postMessage({ type: 'MOUSE_UP' });
});

document.addEventListener('keydown', (event) => {
    if (!event.repeat) {
        const ignoredKeys = ['Control', 'Shift', 'Alt', 'Meta', 'AltGraph'];
        if (!ignoredKeys.includes(event.key)) {
            if (port) port.postMessage({ type: 'KEY_PRESS' });
        }
    }
});

document.addEventListener('copy', () => {
    if (port) port.postMessage({ type: 'COPY' });
});

document.addEventListener('paste', () => {
    if (port) port.postMessage({ type: 'PASTE' });
});

document.addEventListener('submit', () => {
    if (port) port.postMessage({ type: 'SUBMIT' });
});