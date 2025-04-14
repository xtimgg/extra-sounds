let audioContext;
let currentSource = null;
let currentGainNode = null;

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === "PLAY_SOUND") {
        try {
            // Stop any currently playing sound
            if (currentSource && message.stop) {
                try {
                    currentSource.stop();
                    currentSource.disconnect();
                    currentGainNode.disconnect();
                } finally {
                    currentSource = null;
                    currentGainNode = null;
                }
            }

            if (!audioContext) {
                audioContext = new AudioContext();
                await audioContext.resume();
            }

            const response = await fetch(message.url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Create new nodes
            currentSource = audioContext.createBufferSource();
            currentGainNode = audioContext.createGain();
            
            currentGainNode.gain.value = message.vol ?? 1;
            
            currentSource.buffer = audioBuffer;
            currentSource.connect(currentGainNode);
            currentGainNode.connect(audioContext.destination);
            currentSource.start(0);

            // Clean up when sound naturally ends
            currentSource.addEventListener('ended', () => {
                currentSource = null;
                currentGainNode = null;
            });

        } catch (error) {
            console.error('Audio playback error:', error);
            currentSource = null;
            currentGainNode = null;
        }
    }
});
