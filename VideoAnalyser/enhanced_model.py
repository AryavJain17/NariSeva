# enhanced_model.py - Advanced detection with tracking
import cv2
import numpy as np
from ultralytics import YOLO
from collections import defaultdict, deque
import time

class HarassmentDetector:
    def __init__(self):
        self.model = YOLO("yolov8n.pt")
        self.tracker = defaultdict(lambda: deque(maxlen=10))  # Track last 10 positions
        self.harassment_threshold = 80
        self.min_harassment_frames = 5
        
    def detect_harassment_realtime(self, video_path):
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        detections = []
        frame_count = 0
        harassment_buffer = deque(maxlen=30)  # Buffer for smoothing
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            timestamp = frame_count / fps
            
            # Process every 2nd frame for better speed/accuracy balance
            if frame_count % 2 == 0:
                # Resize for faster processing
                h, w = frame.shape[:2]
                scale = min(640/w, 480/h)
                new_w, new_h = int(w*scale), int(h*scale)
                frame_resized = cv2.resize(frame, (new_w, new_h))
                
                # YOLO detection
                results = self.model.track(frame_resized, persist=True, verbose=False)
                
                if results[0].boxes is not None:
                    boxes = results[0].boxes.data.cpu().numpy()
                    person_boxes = boxes[boxes[:, 5] == 0]  # Class 0 = person
                    
                    harassment_score = self.analyze_interactions(person_boxes, timestamp)
                    harassment_buffer.append(harassment_score)
                    
                    # Smooth detection using buffer average
                    avg_score = np.mean(harassment_buffer)
                    
                    if avg_score > 0.6 and len(person_boxes) >= 2:  # Threshold for harassment
                        detection_info = {
                            'timestamp': timestamp,
                            'frame_number': frame_count,
                            'harassment_score': float(avg_score),
                            'boxes': self.format_boxes(person_boxes, scale),
                            'video_width': w,
                            'video_height': h
                        }
                        detections.append(detection_info)
            
            frame_count += 1
            
        cap.release()
        return self.post_process_detections(detections)
    
    def analyze_interactions(self, person_boxes, timestamp):
        if len(person_boxes) < 2:
            return 0.0
            
        harassment_score = 0.0
        centers = []
        
        for box in person_boxes:
            x1, y1, x2, y2 = box[:4]
            cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
            centers.append((cx, cy))
        
        # Analyze all pairs of people
        for i in range(len(centers)):
            for j in range(i + 1, len(centers)):
                dist = np.linalg.norm(np.array(centers[i]) - np.array(centers[j]))
                
                # Score based on proximity and movement patterns
                if dist < self.harassment_threshold:
                    proximity_score = 1.0 - (dist / self.harassment_threshold)
                    harassment_score = max(harassment_score, proximity_score)
        
        return harassment_score
    
    def format_boxes(self, boxes, scale):
        formatted = []
        for box in boxes:
            x1, y1, x2, y2 = box[:4]
            formatted.append({
                'x1': int(x1 / scale),
                'y1': int(y1 / scale),
                'x2': int(x2 / scale),
                'y2': int(y2 / scale),
                'confidence': float(box[4])
            })
        return formatted
    
    def post_process_detections(self, detections):
        # Remove duplicate detections too close in time
        filtered = []
        for detection in detections:
            if not filtered or detection['timestamp'] - filtered[-1]['timestamp'] > 0.5:
                filtered.append(detection)
        return filtered