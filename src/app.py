from flask import Flask, request, send_from_directory, render_template, jsonify
import os
from werkzeug.utils import secure_filename
import secrets
from utils import cleanup_old_files
import threading
import time

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'zip'}
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB max file size
MAX_STORAGE = 10 * 1024 * 1024 * 1024  # 10GB

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Background cleanup task
def cleanup_task():
    while True:
        cleanup_old_files(UPLOAD_FOLDER, MAX_STORAGE)
        time.sleep(3600)  # Run every hour

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_task, daemon=True)
cleanup_thread.start()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        random_prefix = secrets.token_urlsafe(8)
        filename = f"{random_prefix}_{filename}"
        
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        file_url = request.host_url + 'uploads/' + filename
        return jsonify({'url': file_url})
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
