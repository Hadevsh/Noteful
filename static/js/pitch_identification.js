let correctPitch = null;
let audioContext = null; // Declare globally to avoid multiple instances
let analyser = null;

// Update the volume display based on the slider value
document.getElementById('volume-slider').addEventListener('input', function () {
    const volume = this.value;
    const volumePercentage = Math.round(volume * 100); // Convert to percentage
    document.getElementById('volume-display').innerText = `${volumePercentage}%`; // Update the text with percentage
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
    const soundPath = data.sound_path.replace('#', 'sharp'); // Rename the sharp notes for compatibility

    // Reset previous result
    document.getElementById('result').innerText = "Press \"Start\" to generate a pitch!";

    // Play the audio and visualize its frequencies
    const audio = new Audio(soundPath);
    audio.volume = volume; // Adjust volume based on slider
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

    analyser.fftSize = 2048;

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
    
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            // Calculate the actual frequency corresponding to this bin
            const frequency = (i / bufferLength) * (audioContext.sampleRate / 2);
    
            // Convert the frequency to a logarithmic scale
            const logFrequency = Math.log10(frequency);
    
            // Only visualize frequencies within the desired range (20Hz - 10kHz)
            if (frequency < 20 || frequency > 10000) continue;
    
            // Map the frequency to a position on the canvas
            const barHeight = dataArray[i] / 255 * (HEIGHT - 30); // Scale height minus reserved scale area
    
            // Color scheme: Violet and blue tones
            const r = Math.min(163 + (barHeight / HEIGHT) * 40, 90);
            const g = Math.max(50 - (barHeight / HEIGHT) * 30, 0);
            const b = Math.min(200, 200 + (barHeight / HEIGHT) * 65);
    
            // Calculate X position based on frequency (logarithmic scaling)
            const logMinFreq = Math.log10(20);   // Minimum frequency (20Hz)
            const logMaxFreq = Math.log10(10000); // Maximum frequency (10kHz)
            const normalizedPosition = (logFrequency - logMinFreq) / (logMaxFreq - logMinFreq);
            const posX = normalizedPosition * WIDTH;
    
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(posX, HEIGHT - barHeight - 30, barWidth, barHeight);
    
            x += barWidth + 1;
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
