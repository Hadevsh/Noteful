let correctPitch = null;

// Update the volume display based on the slider value
document.getElementById('volume-slider').addEventListener('input', function() {
    const volume = this.value;
    const volumePercentage = Math.round(volume * 100);  // Convert to percentage
    document.getElementById('volume-display').innerText = `${volumePercentage}%`;  // Update the text with percentage
});

// Generate a random pitch
async function generatePitch() {
    const volume = document.getElementById('volume-slider').value; // Get the current volume from the slider

    // Fetch pitch and audio file from the backend
    const response = await fetch('/generate_pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume: volume }),
    });

    // Parse the response
    const data = await response.json();
    correctPitch = data.pitch;
    const soundPath = data.sound_path;
    console.log(soundPath);

    // Clear previous result
    document.getElementById('result').innerText = "";

    // Play the audio and visualize its frequencies
    const audio = new Audio(soundPath.replace('#', 'sharp'));  // Rename the sharp notes for compatibility
    audio.volume = volume; // Adjust volume based on slider
    audio.play();
}

// Submit the user's guess
async function submitPitch() {
    const userPitch = document.getElementById('pitch').value;
    const response = await fetch('/check_pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch: userPitch, correct_pitch: correctPitch })
    });
    const result = await response.json();
    document.getElementById('result').innerText = result.is_correct
        ? "Correct! 🎉"
        : `Incorrect. The correct pitch was ${correctPitch}.`;
}

// Display keys to choose from
async function keysChoose() {
    const response = await fetch('/get_keys');
    const data = await response.json();
    const keys = data.keys;

    // Group keys by their octave
    const groupedKeys = keys.reduce((acc, key) => {
        const octave = key.slice(-1); // Get the last character (octave)
        if (!acc[octave]) {
            acc[octave] = [];
        }
        acc[octave].push(key);
        return acc;
    }, {});

    // Create the HTML content with new lines for each octave
    const keysDisplay = Object.values(groupedKeys)
        .map(octaveKeys => octaveKeys.join(', '))
        .join('<br>');

    // Display the grouped keys in the 'keysChoose' element
    document.getElementById('keysChoose').innerHTML = keysDisplay;
}

// Call the function to display the keys when the page loads
document.addEventListener('DOMContentLoaded', keysChoose);
