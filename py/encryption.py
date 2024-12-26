from cryptography.fernet import Fernet
import os
import json

# Encryption key (ensure this remains consistent for decryption)
ENCRYPTION_KEY = b'JVSTm10SsesvejoUiW2d2rtdWqC2PyBQfajQvOWl_WI='
fernet = Fernet(ENCRYPTION_KEY)

# File path for storing the score
DATA_FILE = "data/scores.dat"

# Helper functions
def save_encrypted_data(data_name, data_value):
    """Save or update the encrypted data for a specific variable."""
    if not os.path.exists('data'):
        os.makedirs('data')
    
    # Load existing data
    existing_data = {}
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'rb') as file:
            encrypted_data = file.read()
            if encrypted_data:  # Avoid decrypting empty files
                decrypted_data = fernet.decrypt(encrypted_data).decode()
                existing_data = json.loads(decrypted_data)
    
    # Update or add the variable
    existing_data[data_name] = data_value

    # Encrypt and save the updated data
    encrypted_data = fernet.encrypt(json.dumps(existing_data).encode())
    with open(DATA_FILE, 'wb') as file:
        file.write(encrypted_data)

def load_encrypted_data(data_name):
    """Load and decrypt the value of a specific variable."""
    if not os.path.exists(DATA_FILE):
        return None  # Return None if the file doesn't exist
    
    with open(DATA_FILE, 'rb') as file:
        encrypted_data = file.read()
        if not encrypted_data:  # Handle empty files
            return None
        decrypted_data = fernet.decrypt(encrypted_data).decode()
        print(decrypted_data)
        existing_data = json.loads(decrypted_data)
    
    # Return the requested variable
    return existing_data.get(data_name, None)

def load_all_data():
    """Load and decrypt all stored data."""
    if not os.path.exists(DATA_FILE):
        return {}  # Return empty dict if the file doesn't exist
    
    with open(DATA_FILE, 'rb') as file:
        encrypted_data = file.read()
        if not encrypted_data:  # Handle empty files
            return {}
        decrypted_data = fernet.decrypt(encrypted_data).decode()
        return json.loads(decrypted_data)
