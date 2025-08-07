# app.py - Advanced Harassment Detection System
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import numpy as np
from ultralytics import YOLO
import torch
from scipy.spatial.distance import euclidean
from collections import defaultdict, deque
import time
import threading
import json

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load the most accurate YOLO model
print("Loading YOLOv8x model (most accurate)...")
model = YOLO("yolov8x.pt")  # Using the extra-large model for better accuracy
print("Model loaded successfully!")

class AdvancedHarassmentDetector:
    def __init__(self):
        self.model = model
        self.person_tracks = defaultdict(lambda: deque(maxlen=30))  # Track person positions
        self.harassment_incidents = []
        self.frame_cache = {}
        
        # Harassment detection parameters
        self.PROXIMITY_THRESHOLD = 80  # pixels
        self.AGGRESSIVE_MOVEMENT_THRESHOLD = 50  # pixels per frame
        self.SUSTAINED_INTERACTION_FRAMES = 8  # frames
        self.CONFIDENCE_THRESHOLD = 0.6
        
        # Pose analysis for aggressive behavior
        self.AGGRESSIVE_POSES = ['raised_arms', 'pointing', 'close_approach']
        
    def calculate_interaction_score(self, person1_box, person2_box, person1_history, person2_history):
        """Calculate harassment probability based on multiple factors"""
        x1, y1, x2, y2 = person1_box[:4]
        x3, y3, x4, y4 = person2_box[:4]
        
        # Calculate centers
        center1 = ((x1 + x2) / 2, (y1 + y2) / 2)
        center2 = ((x3 + x4) / 2, (y3 + y4) / 2)
        
        # Factor 1: Proximity (closer = higher score)
        distance = euclidean(center1, center2)
        proximity_score = max(0, 1 - (distance / self.PROXIMITY_THRESHOLD))
        
        # Factor 2: Size difference (larger person approaching smaller = higher score)
        area1 = (x2 - x1) * (y2 - y1)
        area2 = (x4 - x3) * (y4 - y3)
        size_ratio = max(area1, area2) / (min(area1, area2) + 1e-6)
        size_score = min(1.0, (size_ratio - 1) / 2)  # Score increases with size difference
        
        # Factor 3: Movement patterns (rapid approach = higher score)
        movement_score = 0
        if len(person1_history) >= 3 and len(person2_history) >= 3:
            # Calculate movement towards each other
            prev_dist = euclidean(person1_history[-3], person2_history[-3])
            curr_dist = distance
            if prev_dist > curr_dist:  # Moving closer
                approach_speed = (prev_dist - curr_dist) / 3  # per frame
                movement_score = min(1.0, approach_speed / 20)
        
        # Factor 4: Sustained interaction (staying close = higher score)
        sustained_score = 0
        if len(person1_history) >= self.SUSTAINED_INTERACTION_FRAMES:
            close_frames = sum(1 for i in range(-self.SUSTAINED_INTERACTION_FRAMES, 0)
                             if len(person2_history) > abs(i) and 
                             euclidean(person1_history[i], person2_history[i]) < self.PROXIMITY_THRESHOLD)
            sustained_score = close_frames / self.SUSTAINED_INTERACTION_FRAMES
        
        # Factor 5: Body language analysis (placeholder for future pose estimation)
        posture_score = self.analyze_body_language(person1_box, person2_box)
        
        # Weighted combination of all factors
        weights = {
            'proximity': 0.3,
            'size': 0.15,
            'movement': 0.25,
            'sustained': 0.2,
            'posture': 0.1
        }
        
        total_score = (
            proximity_score * weights['proximity'] +
            size_score * weights['size'] +
            movement_score * weights['movement'] +
            sustained_score * weights['sustained'] +
            posture_score * weights['posture']
        )
        
        return min(1.0, total_score), {
            'proximity': proximity_score,
            'size_difference': size_score,
            'movement': movement_score,
            'sustained': sustained_score,
            'posture': posture_score,
            'distance': distance
        }
    
    def analyze_body_language(self, person1_box, person2_box):
        """Analyze body language for aggressive behavior"""
        # Placeholder for pose estimation analysis
        # In a real implementation, you'd use pose estimation models
        
        x1, y1, x2, y2 = person1_box[:4]
        x3, y3, x4, y4 = person2_box[:4]
        
        # Simple heuristic: if one person is significantly taller and close, increase score
        height1 = y2 - y1
        height2 = y4 - y3
        height_ratio = max(height1, height2) / (min(height1, height2) + 1e-6)
        
        if height_ratio > 1.3:  # Significant height difference
            return 0.3
        
        return 0.1
    
    def detect_harassment_in_frame(self, frame, frame_number, fps):
        """Detect harassment in a single frame with advanced analysis"""
        results = self.model.track(frame, persist=True, verbose=False, conf=self.CONFIDENCE_THRESHOLD)
        
        if not results or not results[0].boxes:
            return []
        
        detections = []
        current_persons = {}
        
        # Extract person detections
        for box in results[0].boxes:
            if box.cls == 0:  # Person class
                track_id = int(box.id) if box.id is not None else None
                if track_id is not None:
                    bbox = box.xyxy[0].cpu().numpy()
                    confidence = float(box.conf)
                    center = ((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2)
                    
                    current_persons[track_id] = {
                        'bbox': bbox,
                        'confidence': confidence,
                        'center': center
                    }
                    
                    # Update tracking history
                    self.person_tracks[track_id].append(center)
        
        # Analyze interactions between all pairs of people
        person_ids = list(current_persons.keys())
        for i in range(len(person_ids)):
            for j in range(i + 1, len(person_ids)):
                id1, id2 = person_ids[i], person_ids[j]
                person1 = current_persons[id1]
                person2 = current_persons[id2]
                
                # Calculate harassment score
                harassment_score, details = self.calculate_interaction_score(
                    person1['bbox'], person2['bbox'],
                    self.person_tracks[id1], self.person_tracks[id2]
                )
                
                # If harassment is detected (score > threshold)
                if harassment_score > 0.4:  # Adjustable threshold
                    detection = {
                        'timestamp': frame_number / fps,
                        'frame_number': frame_number,
                        'harassment_score': harassment_score,
                        'persons': [
                            {
                                'track_id': id1,
                                'bbox': person1['bbox'].tolist(),
                                'confidence': person1['confidence']
                            },
                            {
                                'track_id': id2,
                                'bbox': person2['bbox'].tolist(),
                                'confidence': person2['confidence']
                            }
                        ],
                        'details': details,
                        'video_width': frame.shape[1],
                        'video_height': frame.shape[0]
                    }
                    detections.append(detection)
        
        return detections
    
    def process_video(self, video_path):
        """Process entire video for harassment detection"""
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        print(f"Processing video: {total_frames} frames at {fps} FPS")
        
        all_detections = []
        frame_number = 0
        
        # Process every 2nd frame for balance between speed and accuracy
        frame_skip = 2
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_number % frame_skip == 0:
                # Resize for faster processing but maintain quality
                height, width = frame.shape[:2]
                if width > 1280:  # Only resize if very large
                    scale = 1280 / width
                    new_width = int(width * scale)
                    new_height = int(height * scale)
                    frame_resized = cv2.resize(frame, (new_width, new_height))
                else:
                    frame_resized = frame
                
                # Detect harassment in this frame
                frame_detections = self.detect_harassment_in_frame(frame_resized, frame_number, fps)
                
                # Scale coordinates back if we resized
                if width > 1280:
                    scale_back = width / frame_resized.shape[1]
                    for detection in frame_detections:
                        for person in detection['persons']:
                            bbox = person['bbox']
                            person['bbox'] = [coord * scale_back for coord in bbox]
                        detection['video_width'] = width
                        detection['video_height'] = height
                
                all_detections.extend(frame_detections)
                
                # Progress update
                if frame_number % (frame_skip * 30) == 0:  # Every 30 processed frames
                    progress = (frame_number / total_frames) * 100
                    print(f"Progress: {progress:.1f}%")
            
            frame_number += 1
        
        cap.release()
        
        # Post-process detections to remove duplicates and merge nearby incidents
        processed_detections = self.post_process_detections(all_detections)
        
        print(f"Detection complete: {len(processed_detections)} harassment incidents found")
        return processed_detections
    
    def post_process_detections(self, detections):
        """Clean up and consolidate detections"""
        if not detections:
            return []
        
        # Sort by timestamp
        detections.sort(key=lambda x: x['timestamp'])
        
        # Merge nearby detections (within 1 second)
        merged = []
        current_group = [detections[0]]
        
        for i in range(1, len(detections)):
            if detections[i]['timestamp'] - current_group[-1]['timestamp'] <= 1.0:
                current_group.append(detections[i])
            else:
                # Process current group
                if len(current_group) >= 3:  # Only keep sustained incidents
                    # Take the detection with highest harassment score
                    best_detection = max(current_group, key=lambda x: x['harassment_score'])
                    merged.append(best_detection)
                
                current_group = [detections[i]]
        
        # Don't forget the last group
        if len(current_group) >= 3:
            best_detection = max(current_group, key=lambda x: x['harassment_score'])
            merged.append(best_detection)
        
        return merged

# Global detector instance
detector = AdvancedHarassmentDetector()

@app.route('/predict', methods=['POST'])
def predict():
    if 'video' not in request.files:
        return jsonify({'error': 'No video uploaded'}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Save uploaded file
    timestamp = str(int(time.time()))
    filename = f"{timestamp}_{file.filename}"
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    try:
        print(f"Starting advanced harassment analysis: {filename}")
        start_time = time.time()
        
        # Process video with advanced detection
        detections = detector.process_video(path)
        
        processing_time = time.time() - start_time
        
        # Clean up uploaded file
        os.remove(path)
        
        # Format detections for frontend
        formatted_detections = []
        for detection in detections:
            formatted_detection = {
                'timestamp': detection['timestamp'],
                'frame_number': detection['frame_number'],
                'harassment_score': detection['harassment_score'],
                'boxes': [
                    {
                        'x1': int(person['bbox'][0]),
                        'y1': int(person['bbox'][1]),
                        'x2': int(person['bbox'][2]),
                        'y2': int(person['bbox'][3]),
                        'confidence': person['confidence'],
                        'track_id': person['track_id']
                    }
                    for person in detection['persons']
                ],
                'video_width': detection['video_width'],
                'video_height': detection['video_height'],
                'details': detection['details']
            }
            formatted_detections.append(formatted_detection)
        
        response_data = {
            'detections': formatted_detections,
            'total_incidents': len(formatted_detections),
            'processing_time': round(processing_time, 2),
            'message': f'Advanced analysis complete. Found {len(formatted_detections)} harassment incidents.',
            'analysis_details': {
                'model_used': 'YOLOv8x',
                'detection_method': 'Advanced multi-factor analysis',
                'factors_analyzed': ['proximity', 'size_difference', 'movement_patterns', 'sustained_interaction', 'body_language']
            }
        }
        
        return jsonify(response_data)
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(path):
            os.remove(path)
        
        print(f"Error processing video: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error processing video: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'model_loaded': True,
        'model_type': 'YOLOv8x',
        'gpu_available': torch.cuda.is_available()
    })

if __name__ == '__main__':
    print("Starting Advanced Harassment Detection Server...")
    print("Using YOLOv8x model for maximum accuracy")
    print(f"GPU Available: {torch.cuda.is_available()}")
    print("Server will be available at: http://localhost:5000")
    app.run(debug=True, threaded=True, port=5000)