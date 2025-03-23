let audioContext = null; // Declare globally to avoid multiple instances
let analyser = null;

// Function to visualize frequencies
export function visualizeFrequencies(audio) {
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
            const logMinFreq = Math.log10(40);   // Minimum frequency (20Hz)
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