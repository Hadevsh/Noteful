from flask import Flask, render_template
from py.pitch_identification import pitch_identification_bp  # Import the blueprint
from py.chord_identification import chord_identification_bp

# Initialize the Flask app
app = Flask(__name__)

# Register the blueprint
app.register_blueprint(pitch_identification_bp)
app.register_blueprint(chord_identification_bp)

# Home page route
@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)