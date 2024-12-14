import os

def rename_files_in_directory(directory):
    # List all files in the directory
    for filename in os.listdir(directory):
        if filename.endswith(".wav"):
            # Extract the note name from the filename
            parts = filename.split('_')
            if len(parts) == 3:  # This assumes the filename format is FL Keys_<Note>_<Number>.wav
                note_name = parts[1]  # The note is the second part
                note_name = note_name.replace('#', 'sharp')  # Rename the sharp notes for compatibility
                new_filename = f"{note_name}.wav"  # Create new filename with only the note name

                # Construct full file paths
                old_path = os.path.join(directory, filename)
                new_path = os.path.join(directory, new_filename)

                # Rename the file
                os.rename(old_path, new_path)
                print(f"Renamed {filename} to {new_filename}")
            else:

                print(f"Skipping file with unexpected format: {filename}")

# Example usage
if __name__ == "__main__":
    directory = "./static/audio/piano-keys"  # Replace with the path to your directory
    rename_files_in_directory(directory)
