let correctChord = null;
let audioContext = null; // Declare globally to avoid multiple instances

// Update the volume display based on the slider value
document.getElementById('volume-slider').addEventListener('input', function () {
    const volume = this.value;
    const volumePercentage = Math.round(volume * 100); // Convert to percentage
    document.getElementById('volume-display').innerText = `${volumePercentage}%`; // Update the text with percentage
});

// Generate a random chord
async function generateChord() {
    const volume = document.getElementById('volume-slider').value; // Get the current volume

    const response = await fetch('/generate_chord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume: volume, instrument: selectedInstrument }), // Send selected instrument
    });

    const data = await response.json();
    correctChord = data.chord;
    const soundPaths = data.sound_paths;
    
    soundPaths.forEach(path => {
        const audio = new Audio(path.replace('#', 'sharp'));
        audio.volume = volume;
        audio.play();
    });

    // Reset result
    document.getElementById('result').innerText = "Press \"Start\" to generate a chord!";
}

// Sound selection
let selectedInstrument = "piano-keys"; // Default instrument