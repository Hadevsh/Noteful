// Note-to-audio mapping
const audioFiles = {
    "C5": "./static/audio/piano-keys/C5.wav",
    "C#5": "./static/audio/piano-keys/Csharp5.wav",
    "D5": "./static/audio/piano-keys/D5.wav",
    "D#5": "./static/audio/piano-keys/Dsharp5.wav",
    "E5": "./static/audio/piano-keys/E5.wav",
    "F5": "./static/audio/piano-keys/F5.wav",
    "F#5": "./static/audio/piano-keys/Fsharp5.wav",
    "G5": "./static/audio/piano-keys/G5.wav",
    "G#5": "./static/audio/piano-keys/Gsharp5.wav",
    "A5": "./static/audio/piano-keys/A5.wav",
    "A#5": "./static/audio/piano-keys/Asharp5.wav",
    "B5": "./static/audio/piano-keys/B5.wav",
    "C6": "./static/audio/piano-keys/C6.wav"
};

// Add event listeners to keys
document.querySelectorAll(".white-key, .black-key").forEach(key => {
    key.addEventListener("click", () => {
        const note = key.dataset.note;
        playNote(note);
    });
});

// Play the corresponding audio
function playNote(note) {
    if (audioFiles[note]) {
        const audio = new Audio(audioFiles[note]);
        audio.volume = 0.2;
        audio.play();
    }
}