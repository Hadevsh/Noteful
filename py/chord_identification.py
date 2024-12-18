from flask import Blueprint, render_template, request, jsonify
from cryptography.fernet import Fernet
import random
import os

# Define the blueprint
chord_identification_bp = Blueprint('chord_identification', __name__, template_folder='../templates')

# Avaiable chords
CHORDS = {
    "Cmaj": ["C5", "E5", "G5"],
    "Cmin": ["C5", "D#5", "G5"]
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