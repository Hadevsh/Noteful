import { visualizeFrequencies } from "./utils.js"

let correctPitch = null;
let currentScore = 1000;

// Update the score display
async function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('score');
    scoreDisplay.textContent = `${currentScore}`;

    // Save the updated score
    await fetch('/save_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: currentScore })
    });
}

// Update the volume display based on the slider value
document.getElementById('volume-slider').addEventListener('input', function () {
    const volume = this.value;
    const volumePercentage = Math.round(volume * 100); // Convert to percentage
    document.getElementById('volume-display').innerText = `${volumePercentage}%`; // Update the text with percentage
});

// Generate a random pitch
async function generatePitch() {
    const volume = document.getElementById('volume-slider').value; // Get the current volume

    const response = await fetch('/generate_pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume: volume, instrument: selectedInstrument }), // Send selected instrument
    });

    const data = await response.json();
    correctPitch = data.pitch;
    const soundPath = data.sound_path.replace('#', 'sharp');

    currentScore -= 10; // Deduct 10 points for generating a new sound
    updateScoreDisplay(); // Update the score display

    // Reset result and play the sound
    document.getElementById('result').innerText = "Press \"Start\" to generate a pitch!";
    const audio = new Audio(soundPath);
    audio.volume = volume;
    audio.play();

    visualizeFrequencies(audio);
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

    if (result.is_correct) {
        currentScore += 50; // Add 50 points for a correct guess
    } else {
        currentScore -= 60; // Deduct 60 points for an incorrect guess
    }
    updateScoreDisplay(); // Update the score display
    
    document.getElementById('result').innerHTML = result.is_correct
        ? `<span style="color: #69e95e">Correct!</span> 🎉`
        : `<span style="color: ##ff4f4f">Incorrect</span>. The correct pitch was <span style="color: #a362ff">${correctPitch}</span>.`;
}

// Submit the answer using the Enter key
const ansInput = document.getElementsByClassName("answer-input")[0];
ansInput.addEventListener("keyup", ({key}) => {
    if (key === "Enter") {
        submitPitch();
    }
})

// Event listener for the Spacebar key
document.addEventListener("keydown", function(event) {
    if (event.code === "Space") { // Check if the pressed key is Spacebar
        generatePitch();
    }
});

// Display piano keys reference
const piano_keys_ref = document.getElementById("piano-keys-ref");
const piano_keys = document.getElementById("piano-keys");

piano_keys_ref.addEventListener("click", () => {
    if (piano_keys.style.display === "none") {
        piano_keys.style.display = "inline";
        piano_keys_ref.style.transform = "rotate(180deg)";
    } else {
        piano_keys.style.display = "none";
        piano_keys_ref.style.transform = "rotate(0deg)";
    }
})

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

// Function to capitialize each letter in a new word
function capitalizeAsTitle(val) {
    let final = "";
    let arr = val.split(" ");
    for (let word of arr) {
        final += String(word).charAt(0).toUpperCase() + String(word).slice(1) + " ";
    }
    return final.substring(0, final.length - 1);
}

// Sound selection
let selectedInstrument = "piano-keys"; // Default instrument

// Fetch and display the available instruments
async function fetchInstruments() {
    const response = await fetch('/get_instruments'); // New backend endpoint
    const data = await response.json();
    const instrumentSelect = document.getElementById("instrument");

    // Populate the dropdown menu
    instrumentSelect.innerHTML = "";
    data.instruments.forEach(instrument => {
        const option = document.createElement("option");
        option.value = instrument;
        option.textContent = capitalizeAsTitle(instrument.replace("-", " ")); // Format text
        instrumentSelect.appendChild(option);
    });
    selectedInstrument = data.instruments[0]; // Set default instrument
}

// Update the selected instrument when dropdown changes
function updateInstrument() {
    selectedInstrument = document.getElementById("instrument").value;
}

// Fetch instruments on page load
document.addEventListener('DOMContentLoaded', fetchInstruments);

// Initialize score on page load
document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/get_score');
    const data = await response.json();
    currentScore = data.score;
    updateScoreDisplay();
});

window.updateInstrument = updateInstrument;
window.generatePitch = generatePitch
window.submitPitch = submitPitch;