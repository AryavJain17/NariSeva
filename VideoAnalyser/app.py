# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import numpy as np
from ultralytics import YOLO
import threading
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load model once at startup
model = YOLO("yolov8n.pt")

def compute_distance(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))

def process_frame_batch(frames_data):
    """Process multiple frames in parallel"""
    results = []
    for frame_info in frames_data:
        frame, frame_number, fps = frame_info
        timestamp = frame_number / fps
        
        # YOLO detection
        detections = model(frame)[0]
        person_boxes = [b for b in detections.boxes.data.cpu().numpy() if int(b[5]) == 0]
        
        if len(person_boxes) >= 2:
            centers = []
            boxes_info = []
            
            for box in person_boxes:
                x1, y1, x2, y2, conf, cls = box
                cx = int((x1 + x2) / 2)
                cy = int((y1 + y2) / 2)
                centers.append((cx, cy))
                boxes_info.append({
                    'x1': int(x1), 'y1': int(y1),
                    'x2': int(x2), 'y2': int(y2),
                    'confidence': float(conf)
                })
            
            # Check for harassment (close proximity)
            harassment_detected = False
            HARASSMENT_THRESHOLD = 100  # pixels
            
            for i in range(len(centers)):
                for j in range(i + 1, len(centers)):
                    dist = compute_distance(centers[i], centers[j])
                    if dist < HARASSMENT_THRESHOLD:
                        harassment_detected = True
                        break
                if harassment_detected:
                    break
            
            if harassment_detected:
                results.append({
                    'timestamp': timestamp,
                    'frame_number': frame_number,
                    'boxes': boxes_info,
                    'video_width': frame.shape[1],
                    'video_height': frame.shape[0]
                })
    
    return results

def detect_harassment_optimized(video_path):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Process every 3rd frame for speed (adjust as needed)
    FRAME_SKIP = 3
    BATCH_SIZE = 10
    
    all_detections = []
    frames_batch = []
    frame_number = 0
    
    with ThreadPoolExecutor(max_workers=4) as executor:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_number % FRAME_SKIP == 0:
                # Resize frame for faster processing
                frame_resized = cv2.resize(frame, (640, 480))
                frames_batch.append((frame_resized, frame_number, fps))
                
                if len(frames_batch) >= BATCH_SIZE:
                    # Process batch
                    future = executor.submit(process_frame_batch, frames_batch)
                    batch_results = future.result()
                    all_detections.extend(batch_results)
                    frames_batch = []
            
            frame_number += 1
        
        # Process remaining frames
        if frames_batch:
            batch_results = process_frame_batch(frames_batch)
            all_detections.extend(batch_results)
    
    cap.release()
    return all_detections

@app.route('/predict', methods=['POST'])
def predict():
    if 'video' not in request.files:
        return jsonify({'error': 'No video uploaded'}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(path)

    try:
        detections = detect_harassment_optimized(path)
        
        # Clean up uploaded file
        os.remove(path)
        
        return jsonify({
            'detections': detections,
            'total_incidents': len(detections),
            'message': f'Analysis complete. Found {len(detections)} potential harassment incidents.'
        })
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(path):
            os.remove(path)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, threaded=True, port=5001)