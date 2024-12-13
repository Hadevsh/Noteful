from mido import MidiFile, MidiTrack, Message

# Mapping of note names to MIDI note numbers
note_to_number = {
    "C0": 0, "C#0": 1, "D0": 2, "D#0": 3, "E0": 4, "F0": 5, "F#0": 6, "G0": 7, "G#0": 8, "A0": 9, "A#0": 10, "B0": 11,
    "C1": 12, "C#1": 13, "D1": 14, "D#1": 15, "E1": 16, "F1": 17, "F#1": 18, "G1": 19, "G#1": 20, "A1": 21, "A#1": 22, "B1": 23,
    "C2": 24, "C#2": 25, "D2": 26, "D#2": 27, "E2": 28, "F2": 29, "F#2": 30, "G2": 31, "G#2": 32, "A2": 33, "A#2": 34, "B2": 35,
    "C3": 36, "C#3": 37, "D3": 38, "D#3": 39, "E3": 40, "F3": 41, "F#3": 42, "G3": 43, "G#3": 44, "A3": 45, "A#3": 46, "B3": 47,
    "C4": 48, "C#4": 49, "D4": 50, "D#4": 51, "E4": 52, "F4": 53, "F#4": 54, "G4": 55, "G#4": 56, "A4": 57, "A#4": 58, "B4": 59,
    "C5": 60, "C#5": 61, "D5": 62, "D#5": 63, "E5": 64, "F5": 65, "F#5": 66, "G5": 67, "G#5": 68, "A5": 69, "A#5": 70, "B5": 71,
    "C6": 72, "C#6": 73, "D6": 74, "D#6": 75, "E6": 76, "F6": 77, "F#6": 78, "G6": 79, "G#6": 80, "A6": 81, "A#6": 82, "B6": 83,
    "C7": 84, "C#7": 85, "D7": 86, "D#7": 87, "E7": 88, "F7": 89, "F#7": 90, "G7": 91, "G#7": 92, "A7": 93, "A#7": 94, "B7": 95,
    "C8": 96, "C#8": 97, "D8": 98, "D#8": 99, "E8": 100, "F8": 101, "F#8": 102, "G8": 103, "G#8": 104, "A8": 105, "A#8": 106, "B8": 107,
    "C9": 108, "C#9": 109, "D9": 110, "D#9": 111, "E9": 112, "F9": 113, "F#9": 114, "G9": 115, "G#9": 116, "A9": 117, "A#9": 118, "B9": 119
}

# Function to get MIDI number from note name
def note_name_to_number(note_name):
    return note_to_number.get(note_name, None)  # Returns None if note is not found

# List of all MIDI notes (for example, C4, D4, etc.)
# The following contains some notes for illustration, but you can add more as needed
# Standard 88-key piano range from A0 to C8
notes = [
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

# Create a new MIDI file and track
mid = MidiFile()
track = MidiTrack()
mid.tracks.append(track)

# Add note-on and note-off messages for each note in the list
i = 0
for note_name in notes:
    note = note_name_to_number(note_name)  # Convert note name to MIDI note number
    if note is not None:  # Make sure the note is valid
        track.append(Message('note_on', note=note, velocity=64, time=0))  # Start note
        track.append(Message('note_off', note=note, velocity=64, time=480*2))  # End note (duration in ticks)

# Save the MIDI file
mid.save('instrument_keys.mid')
