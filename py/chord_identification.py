from flask import Blueprint, render_template, request, jsonify
from cryptography.fernet import Fernet
import random
import os

# Define the blueprint
chord_identification_bp = Blueprint('chord_identification', __name__, template_folder='../templates')

# Route for the chord identification page
@chord_identification_bp.route('/chord_identification')
def pitch_identification():
    return render_template('chord_identification.html')