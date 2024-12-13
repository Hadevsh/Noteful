let correctPitch = null;

// Generate a random pitch
async function generatePitch() {
    const response = await fetch('/generate_pitch');
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