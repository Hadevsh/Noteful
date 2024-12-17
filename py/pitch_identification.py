from flask import Blueprint, render_template, request, jsonify
from cryptography.fernet import Fernet
import random
import os

# Define the blueprint
pitch_identification_bp = Blueprint('pitch_identification', __name__, template_folder='../templates')

# Encryption key (ensure this remains consistent for decryption)
ENCRYPTION_KEY = b'JVSTm10SsesvejoUiW2d2rtdWqC2PyBQfajQvOWl_WI='  # Replace with an actual Fernet key
fernet = Fernet(ENCRYPTION_KEY)

# File path for storing the score
SCORE_FILE = "data/score.dat"

# Available pitches
PITCHES = ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", 
           "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5"]

# Avaiable instruments / sounds
INSTRUMENTS = ["piano-keys", "sine-bell", "synth-lead", "synth-pluck", "synth-string"]

# Route for the pitch identification page
@pitch_identification_bp.route('/pitch_identification')
def pitch_identification():
    return render_template('pitch_identification.html')

# Endpoint to generate a random pitch with the selected instrument
@pitch_identification_bp.route('/generate_pitch', methods=['POST'])
def generate_pitch():
    data = request.get_json()
    pitch = random.choice(PITCHES)
    instrument = data.get('instrument', INSTRUMENTS[0])  # Default to the first instrument
    sound_path = f"static/audio/{instrument}/{pitch}.wav"
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

# Endpoint to fetch available instruments
@pitch_identification_bp.route('/get_instruments', methods=['GET'])
def get_instruments():
    return jsonify({"instruments": INSTRUMENTS})

# Helper functions
def save_encrypted_score(score):
    """Save the encrypted score to disk."""
    if not os.path.exists('data'):
        os.makedirs('data')
    encrypted_score = fernet.encrypt(str(score).encode())
    with open(SCORE_FILE, 'wb') as file:
        file.write(encrypted_score)

def load_encrypted_score():
    """Load and decrypt the score from disk."""
    if not os.path.exists(SCORE_FILE):
        return 0  # Default score if no file exists
    with open(SCORE_FILE, 'rb') as file:
        encrypted_score = file.read()
    return int(fernet.decrypt(encrypted_score).decode())

# Route to save the score
@pitch_identification_bp.route('/save_score', methods=['POST'])
def save_score():
    data = request.json
    score = data.get('score', 0)
    save_encrypted_score(score)
    return jsonify({"status": "success"})

# Route to get the current score
@pitch_identification_bp.route('/get_score', methods=['GET'])
def get_score():
    score = load_encrypted_score()
    return jsonify({"score": score})