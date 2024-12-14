from flask import Blueprint, render_template, request, jsonify
import random

# Define the blueprint
pitch_identification_bp = Blueprint('pitch_identification', __name__, template_folder='../templates')

# Available pitches
PITCHES = ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", 
           "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5"]

# Route for the pitch identification page
@pitch_identification_bp.route('/pitch_identification')
def pitch_identification():
    return render_template('pitch_identification.html')

# Endpoint to generate a random pitch
@pitch_identification_bp.route('/generate_pitch', methods=['POST'])
def generate_pitch():
    data = request.get_json()
    pitch = random.choice(PITCHES)
    sound_path = f"static/audio/piano-keys/{pitch}.wav"
    return jsonify({"pitch": pitch, "sound_path": sound_path})

# Endpoint to check user input against the correct pitch
@pitch_identification_bp.route('/check_pitch', methods=['POST'])
def check_pitch():
    data = request.json
    user_pitch = data.get('pitch')
    correct_pitch = data.get('correct_pitch')
    is_correct = user_pitch == correct_pitch
    return jsonify({"is_correct": is_correct})

@pitch_identification_bp.route('/get_keys', methods=['GET'])
def get_keys():
    return jsonify({"keys": PITCHES})