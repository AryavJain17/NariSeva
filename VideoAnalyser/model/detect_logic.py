import cv2
import numpy as np
from ultralytics import YOLO

model = YOLO("yolov8n.pt")  # Downloads if not present

# Distance tracking helper
def compute_distance(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))

def detect_harassment(video_path):
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    tracked_positions = {}

    HARASSMENT_THRESHOLD = 50  # pixels
    SUSPICIOUS_FRAMES = 0
    MAX_ALLOWED = 15

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_count += 1

        results = model(frame)[0]
        person_boxes = [b for b in results.boxes.data.cpu().numpy() if int(b[5]) == 0]

        centers = []
        for box in person_boxes:
            x1, y1, x2, y2, conf, cls = box
            cx = int((x1 + x2) / 2)
            cy = int((y1 + y2) / 2)
            centers.append((cx, cy))

        if len(centers) >= 2:
            # Check pairwise distances
            for i in range(len(centers)):
                for j in range(i + 1, len(centers)):
                    dist = compute_distance(centers[i], centers[j])
                    if dist < HARASSMENT_THRESHOLD:
                        SUSPICIOUS_FRAMES += 1
                        break

    cap.release()

    print("Suspicious frames:", SUSPICIOUS_FRAMES)
    return "harassment" if SUSPICIOUS_FRAMES > MAX_ALLOWED else "normal"
