let audioContext;

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === "PLAY_SOUND") {
        try {
            if (!audioContext) {
                audioContext = new AudioContext();
                await audioContext.resume(); // Required for recent Chrome versions
            }

            const response = await fetch(message.url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;

            const gainNode = audioContext.createGain();
            gainNode.gain.value = message.volume ?? 1; // Default to full volume if not provided

            source.connect(gainNode);
            gainNode.connect(audioContext.destination);

            source.start(0);
        } catch (error) {
            console.error('Audio playback error:', error);
        }
    }
});