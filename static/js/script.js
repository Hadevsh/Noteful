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

    // Send the pitch and volume data to the backend
    const response = await fetch('/generate_pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume: volume })
    });
    
    // Handle the response from the backend
    const data = await response.json();
    correctPitch = data.pitch;
    document.getElementById('result').innerText = ""; // Clear previous result
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
