from flask import Flask, render_template, request, jsonify
import random
from playsound import playsound

app = Flask(__name__)

# Available pitches for practice
PITCHES = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"]

# Route to serve the frontend
@app.route('/')
def home():
    return render_template('index.html')

# Endpoint to generate a random pitch for the exercise
@app.route('/generate_pitch', methods=['GET'])
def generate_pitch():
    pitch = random.choice(PITCHES)
    playsound(f"static/audio/piano-keys/{pitch}.wav")
    return jsonify({"pitch": pitch})

# Endpoint to check user input against the correct pitch
@app.route('/check_pitch', methods=['POST'])
def check_pitch():
    data = request.json
    user_pitch = data.get('pitch')
    correct_pitch = data.get('correct_pitch')
    is_correct = user_pitch == correct_pitch
    return jsonify({"is_correct": is_correct})

if __name__ == '__main__':
    app.run(debug=True)