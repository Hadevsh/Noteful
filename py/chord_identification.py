from flask import Blueprint, render_template, request, jsonify
from cryptography.fernet import Fernet
import random
import os

# Define the blueprint
chord_identification_bp = Blueprint('chord_identification', __name__, template_folder='../templates')

# Avaiable chords
CHORDS = {
    "Cmaj": ["C5", "E5", "G5"],
    
    "Cmin": ["C5", "D#5", "G5"],
    "C#min": ["C#5", "E5", "G#5"],
    "Dmin": ["D5", "F5", "A5"],
    "D#min": ["D#5", "F#5", "A#5"],
    "Emin": ["E5", "G5", "B5"],
    "Fmin": ["F5", "G#5", "C6"],
    "F#min": ["F#5", "A5", "C#6"],
    "Gmin": ["G5", "A#5", "D6"],
    "G#min": ["G#5", "B5", "D#6"],
    "Amin": ["A5", "C6", "E6"],
    "A#min": ["A#5", "C#6", "F6"],
    "Bmin": ["B5", "D6", "F#6"]
}
chord, notes = random.choice(list(CHORDS.items()))

# Route for the chord identification page
@chord_identification_bp.route('/chord_identification')
def pitch_identification():
    return render_template('chord_identification.html')

# Endpoint to generate a random pitch with the selected instrument
@chord_identification_bp.route('/generate_chord', methods=['POST'])
def generate_chord():
    data = request.get_json()
    instrument = data.get("instrument")
    
    chord, notes = random.choice(list(CHORDS.items()))  # Random chord
    sound_paths = [f"static/audio/{instrument}/{note}.wav" for note in notes]
    
    return jsonify({"chord": chord, "sound_paths": sound_paths})

# Endpoint to check user input against the correct chord
@chord_identification_bp.route('/check_chord', methods=['POST'])
def check_chord():
    data = request.json
    user_chord = data.get('chord')
    correct_chord = data.get('correct_chord')
    is_correct = user_chord == correct_chord
    return jsonify({"is_correct": is_correct})