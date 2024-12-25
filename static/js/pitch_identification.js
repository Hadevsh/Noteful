let correctPitch = null;
let audioContext = null; // Declare globally to avoid multiple instances
let analyser = null;
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

// Function to visualize frequencies
function visualizeFrequencies(audio) {
    if (!audioContext) {
        // Create a new AudioContext if one doesn't exist
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
    }

    const src = audioContext.createMediaElementSource(audio);
    src.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 2048/2;

    const bufferLength = analyser.frequencyBinCount; // Half of fftSize
    const dataArray = new Uint8Array(bufferLength);

    const canvas = document.getElementById("visualizer");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    const WIDTH = canvas.width = 800;
    const HEIGHT = canvas.height = 300;

    const barWidth = WIDTH / bufferLength; // Smaller bar width to fit more bars

    // Function to draw the frequency scale
    function drawFrequencyScale() {
        const scaleHeight = 40; // Height reserved for the scale
        const freqMarkers = [20, 50, 100, 200, 500, 1000, 2000, 5000, 9000]; // Frequencies to mark

        ctx.fillStyle = "#272727";
        ctx.fillRect(0, HEIGHT - scaleHeight, WIDTH, scaleHeight);

        ctx.fillStyle = "#8f8f8f";
        ctx.textAlign = "center";
        ctx.font = "12px Arial";

        const minFrequency = 20;
        const maxFrequency = 10000;

        const logMinFreq = Math.log10(minFrequency); // Logarithmic start
        const logMaxFreq = Math.log10(maxFrequency); // Logarithmic end
    
        freqMarkers.forEach(freq => {
            if (freq < minFrequency || freq > maxFrequency) return;
    
            // Convert frequency to its logarithmic position
            const logFreq = Math.log10(freq);
            let position = (logFreq - logMinFreq) / (logMaxFreq - logMinFreq);
            
            let x = 0;
            // Calculate X position on canvas
            if (freq === 20) {  // Adjust the position of the 20Hz label
                x = 20; // Add a small offset (20px) to move it slightly right
            }
            else if (freq === 9000) {  // Adjust the position of the 9kHz label
                x = WIDTH - 20; // Add a small offset (-20px) to move it slightly left
            } else {
                const logFreq = Math.log10(freq);
                position = (logFreq - logMinFreq) / (logMaxFreq - logMinFreq);
                x = position * WIDTH;
            }
            
            // Draw label
            ctx.fillText(freq >= 2000 ? `${freq / 1000}kHz` : `${freq}Hz`, x, HEIGHT - 5);
        });
    }

    function renderFrame() {
        requestAnimationFrame(renderFrame);
        analyser.getByteFrequencyData(dataArray);
    
        // Clear canvas
        ctx.fillStyle = "#272727";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
        let previousX = null; // Store previous bar's X position
        let previousY = null; // Store previous bar's top position
    
        for (let i = 0; i < bufferLength; i++) {
            // Calculate the actual frequency corresponding to this bin
            const frequency = (i / bufferLength) * (audioContext.sampleRate / 2);
    
            // Only visualize frequencies within the desired range (20Hz - 10kHz)
            if (frequency < 20 || frequency > 10000) continue;
    
            // Map the frequency to a position on the canvas
            const barHeight = dataArray[i] / 255 * (HEIGHT - 30); // Scale height minus reserved scale area
    
            // Calculate X position based on frequency (logarithmic scaling)
            const logMinFreq = Math.log10(20);   // Minimum frequency (20Hz)
            const logMaxFreq = Math.log10(10000); // Maximum frequency (10kHz)
            const logFrequency = Math.log10(frequency);
            const normalizedPosition = (logFrequency - logMinFreq) / (logMaxFreq - logMinFreq);
            const posX = normalizedPosition * WIDTH;

            // Color scheme: Violet and blue tones
            const red = 100;
            const green = Math.max(255 - barHeight, 0);
            const blue = 255;
    
            // Draw the bar
            ctx.fillStyle = `rgb(${red},${green},${blue})`;
            ctx.fillRect(posX, HEIGHT - barHeight - 30, barWidth, barHeight);
    
            // Draw connecting lines between the tops of adjacent bars
            const topY = HEIGHT - barHeight - 30; // Top position of the current bar
            if (previousX !== null && previousY !== null) {
                ctx.beginPath();
                ctx.moveTo(previousX + barWidth / 2, previousY); // Center of the previous bar's top
                ctx.lineTo(posX + barWidth / 2, topY); // Center of the current bar's top
                ctx.strokeStyle = `rgba(${red},${green},${blue},0.5)`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
    
            // Update previous positions for the next bar
            previousX = posX;
            previousY = topY;
        }
    
        // Draw the frequency scale after rendering the bars
        drawFrequencyScale();
    }

    renderFrame();
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
    for (word of arr) {
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