import librosa
import numpy as np
import soundfile as sf
import os

# Constants for BPM and TPB
TPB = 480  # Ticks per beat (this can be adjusted if necessary)
BPM = 140  # Beats per minute (this can be adjusted if necessary)

# Calculate duration per tick in milliseconds
duration_per_tick_ms = (60_000) / (BPM * TPB)
print(duration_per_tick_ms)

# Calculate the duration of each note (480*2 ticks)
note_ticks = 480 * 2  # Note duration in ticks
note_duration_ms = note_ticks * duration_per_tick_ms  # Duration in milliseconds
print(note_duration_ms)

fade_duration_ms = 100

# Define the list of notes (use the same note list as in the MIDI)
note_names = [
    "C0", "C#0", "D0", "D#0", "E0", "F0", "F#0", "G0", "G#0", "A0", "A#0", "B0",
    "C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1",
    "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
    "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
    "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
    "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6",
    "C7", "C#7", "D7", "D#7", "E7", "F7", "F#7", "G7", "G#7", "A7", "A#7", "B7",
    "C8", "C#8", "D8", "D#8", "E8", "F8", "F#8", "G8", "G#8", "A8", "A#8", "B8",
    "C9", "C#9", "D9", "D#9", "E9", "F9", "F#9", "G9", "G#9", "A9", "A#9", "B9"
]

# Load the audio file using librosa (it will automatically resample to the default rate)
audio, sr = librosa.load("keys.mp3", sr=None)

# Function to split audio into notes, apply fading, and cut 10ms from the start
def split_and_fade(audio, sr, note_names, note_duration_ms, fade_duration_ms, cut_duration_ms=50):
    fade_samples = int(fade_duration_ms * sr / 1000)  # Convert fade duration to samples
    note_duration_samples = int(note_duration_ms * sr / 1000)  # Convert note duration to samples
    cut_samples = int(cut_duration_ms * sr / 1000)  # Convert cut duration to samples

    # Ensure the output directory exists
    if not os.path.exists("notes"):
        os.makedirs("notes")

    for i, note_name in enumerate(note_names):
        start_sample = i * note_duration_samples  # Calculate start sample for each note
        end_sample = start_sample + note_duration_samples  # Calculate end sample for each note
        note_segment = audio[start_sample:end_sample]  # Extract the note segment
        
        # Cut 10ms from the start of each note segment
        note_segment = note_segment[cut_samples:]  # Skip the first 10ms (cut_samples)

        # Apply fade-out (multiply the last part of the note by a fade curve)
        fade_out_curve = np.linspace(1, 0, fade_samples)
        note_segment[-fade_samples:] *= fade_out_curve

        # Export the note as a separate WAV file
        output_path = f"notes/{note_name}.wav"
        sf.write(output_path, note_segment, sr)
        print(f"Exported {note_name}.wav")

# Call the function to split the audio into individual notes with fade-out and cut
split_and_fade(audio, sr, note_names, note_duration_ms, fade_duration_ms)
