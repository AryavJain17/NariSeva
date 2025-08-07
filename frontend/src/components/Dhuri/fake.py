from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import tempfile
import os
from datetime import datetime
import json
import logging
from sklearn.metrics import pairwise_distances
from scipy import stats
import math
from scipy.fft import fft2, fftshift
from skimage.feature import local_binary_pattern
from skimage.measure import shannon_entropy
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.layers import BatchNormalization, Activation, concatenate
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, np.generic):
        return float(obj) if isinstance(obj, (np.floating, np.integer)) else str(obj)
    elif isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_numpy_types(v) for v in obj]
    return obj

class MesoNet:
    """Enhanced MesoNet implementation for deepfake detection"""
    def __init__(self):
        self.model = None
        self.input_size = 256
        
    def build_meso4(self):
        """Build MesoNet-4 architecture with improved regularization"""
        x = Input(shape=(self.input_size, self.input_size, 3))
        
        # First Conv Block
        x1 = Conv2D(8, (3, 3), padding='same', activation='relu')(x)
        x1 = BatchNormalization()(x1)
        x1 = MaxPooling2D(pool_size=(2, 2), padding='same')(x1)
        
        # Second Conv Block
        x2 = Conv2D(8, (5, 5), padding='same', activation='relu')(x1)
        x2 = BatchNormalization()(x2)
        x2 = MaxPooling2D(pool_size=(2, 2), padding='same')(x2)
        
        # Third Conv Block
        x3 = Conv2D(16, (5, 5), padding='same', activation='relu')(x2)
        x3 = BatchNormalization()(x3)
        x3 = MaxPooling2D(pool_size=(2, 2), padding='same')(x3)
        
        # Fourth Conv Block
        x4 = Conv2D(16, (5, 5), padding='same', activation='relu')(x3)
        x4 = BatchNormalization()(x4)
        x4 = MaxPooling2D(pool_size=(4, 4), padding='same')(x4)
        
        # Dense layers
        y = Flatten()(x4)
        y = Dropout(0.5)(y)
        y = Dense(16, activation='relu')(y)
        y = Dropout(0.5)(y)
        y = Dense(1, activation='sigmoid')(y)
        
        model = Model(inputs=x, outputs=y)
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        
        return model
    
    def load_model(self, model_path=None, model_type='meso4'):
        """Load pre-trained model or create new one"""
        try:
            if model_path and os.path.exists(model_path):
                self.model = tf.keras.models.load_model(model_path)
                logger.info(f"Loaded pre-trained model from {model_path}")
            else:
                self.model = self.build_meso4()
                logger.info(f"Built {model_type} model architecture (untrained)")
                
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model = self.build_meso4()
    
    def preprocess_image(self, image):
        """Enhanced image preprocessing for MesoNet"""
        if len(image.shape) == 3 and image.shape[2] == 3:
            # Resize to input size
            image = cv2.resize(image, (self.input_size, self.input_size))
            # Normalize to [0, 1]
            image = image.astype(np.float32) / 255.0
            # Add batch dimension
            image = np.expand_dims(image, axis=0)
            return image
        else:
            raise ValueError("Invalid image format")
    
    def predict(self, image):
        """Make prediction on a single image with enhanced error handling"""
        if self.model is None:
            return 0.1, 0.0, False  # Default to low confidence authentic
        
        try:
            processed_image = self.preprocess_image(image)
            prediction = float(self.model.predict(processed_image, verbose=0)[0][0])
            
            # Calculate confidence based on how far from 0.5 the prediction is
            confidence = abs(prediction - 0.5) * 2
            is_fake = prediction > 0.5
            
            return prediction, confidence, is_fake
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return 0.1, 0.0, False

class AdvancedDeepfakeDetector:
    def __init__(self):
        """Initialize the enhanced detection system"""
        try:
            # Initialize OpenCV cascades
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
            
            # Initialize MesoNet
            self.mesonet = MesoNet()
            self.mesonet.load_model(model_type='meso4')
            
            # Try to initialize MTCNN
            self.mtcnn_available = False
            try:
                from mtcnn import MTCNN
                self.mtcnn_detector = MTCNN()
                self.mtcnn_available = True
                logger.info("MTCNN face detector loaded successfully")
            except ImportError:
                logger.info("MTCNN not available, using OpenCV Haar cascades")
            
            # Initialize MediaPipe (optional)
            self.mediapipe_available = False
            try:
                import mediapipe as mp
                self.mp_face_detection = mp.solutions.face_detection
                self.mp_drawing = mp.solutions.drawing_utils
                self.face_detection = self.mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5)
                self.mediapipe_available = True
                logger.info("MediaPipe face detector loaded successfully")
            except ImportError:
                logger.info("MediaPipe not available")
            
            # Detection thresholds
            self.thresholds = {
                'mesonet_confidence': 0.6,
                'facial_inconsistency': 0.05,
                'eye_entropy': 3.5,
                'texture_distance': 0.3,
                'frequency_energy': 2.0
            }
            
            logger.info("Enhanced detection system initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing detector: {e}")
            raise
    
    def detect_faces_multi_method(self, frame):
        """Enhanced face detection using multiple methods"""
        faces = []
        
        try:
            # Method 1: MTCNN (if available)
            if self.mtcnn_available:
                try:
                    result = self.mtcnn_detector.detect_faces(frame)
                    for detection in result:
                        x, y, w, h = detection['box']
                        x, y = max(0, x), max(0, y)
                        w = min(w, frame.shape[1] - x)
                        h = min(h, frame.shape[0] - y)
                        
                        if w > 30 and h > 30:
                            face_image = frame[y:y+h, x:x+w]
                            faces.append({
                                'box': (x, y, w, h),
                                'confidence': detection['confidence'],
                                'area': w * h,
                                'face_image': face_image,
                                'method': 'MTCNN'
                            })
                except Exception as e:
                    logger.error(f"MTCNN detection error: {e}")
            
            # Method 2: MediaPipe (if available and no faces found)
            if self.mediapipe_available and len(faces) == 0:
                try:
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    results = self.face_detection.process(rgb_frame)
                    
                    if results.detections:
                        h, w, _ = frame.shape
                        for detection in results.detections:
                            bbox = detection.location_data.relative_bounding_box
                            x = int(bbox.xmin * w)
                            y = int(bbox.ymin * h)
                            face_w = int(bbox.width * w)
                            face_h = int(bbox.height * h)
                            
                            if face_w > 30 and face_h > 30:
                                face_image = frame[y:y+face_h, x:x+face_w]
                                faces.append({
                                    'box': (x, y, face_w, face_h),
                                    'confidence': detection.score[0],
                                    'area': face_w * face_h,
                                    'face_image': face_image,
                                    'method': 'MediaPipe'
                                })
                except Exception as e:
                    logger.error(f"MediaPipe detection error: {e}")
            
            # Method 3: OpenCV Haar Cascade (fallback)
            if len(faces) == 0:
                try:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    detected_faces = self.face_cascade.detectMultiScale(
                        gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
                    )
                    
                    for (x, y, w, h) in detected_faces:
                        face_image = frame[y:y+h, x:x+w]
                        faces.append({
                            'box': (x, y, w, h),
                            'confidence': 0.8,
                            'area': w * h,
                            'face_image': face_image,
                            'method': 'OpenCV'
                        })
                except Exception as e:
                    logger.error(f"OpenCV detection error: {e}")
                    
        except Exception as e:
            logger.error(f"Face detection error: {e}")
            
        return faces
    
    def analyze_facial_inconsistencies(self, frames):
        """Enhanced facial feature inconsistency analysis"""
        inconsistencies = []
        analyzed_frames = 0
        face_landmarks_history = []
        
        for frame_idx, frame in frames:
            try:
                faces = self.detect_faces_multi_method(frame)
                
                if not faces:
                    continue
                    
                analyzed_frames += 1
                largest_face = max(faces, key=lambda x: x['area'])
                x, y, w, h = largest_face['box']
                
                # Enhanced facial geometry analysis
                face_region = frame[y:y+h, x:x+w]
                gray_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
                
                # Detect eyes within face region
                eyes = self.eye_cascade.detectMultiScale(gray_face, 1.1, 5)
                
                if len(eyes) >= 2:
                    # Sort eyes by x-coordinate to get left and right eye
                    eyes = sorted(eyes, key=lambda x: x[0])
                    left_eye, right_eye = eyes[0], eyes[1]
                    
                    # Calculate various facial ratios
                    eye_distance = np.sqrt((left_eye[0] - right_eye[0])**2 + (left_eye[1] - right_eye[1])**2)
                    face_width = w
                    face_height = h
                    
                    eye_ratio = eye_distance / face_width if face_width > 0 else 0
                    aspect_ratio = face_width / face_height if face_height > 0 else 0
                    
                    # Eye symmetry check
                    eye_y_diff = abs(left_eye[1] - right_eye[1])
                    eye_symmetry = eye_y_diff / face_height if face_height > 0 else 0
                    
                    face_landmarks_history.append({
                        'frame': frame_idx,
                        'eye_ratio': eye_ratio,
                        'aspect_ratio': aspect_ratio,
                        'eye_symmetry': eye_symmetry,
                        'face_width': face_width,
                        'face_height': face_height
                    })
                    
                    # Check for inconsistencies with sliding window
                    if len(face_landmarks_history) > 4:
                        recent_data = face_landmarks_history[-5:]
                        
                        # Check eye ratio consistency
                        eye_ratios = [f['eye_ratio'] for f in recent_data]
                        eye_ratio_std = np.std(eye_ratios)
                        
                        # Check aspect ratio consistency
                        aspect_ratios = [f['aspect_ratio'] for f in recent_data]
                        aspect_ratio_std = np.std(aspect_ratios)
                        
                        # Check eye symmetry consistency
                        symmetries = [f['eye_symmetry'] for f in recent_data]
                        symmetry_std = np.std(symmetries)
                        
                        # Flag inconsistencies
                        severity = 0
                        issues = []
                        
                        if eye_ratio_std > self.thresholds['facial_inconsistency']:
                            severity += eye_ratio_std * 100
                            issues.append('eye_distance_variation')
                            
                        if aspect_ratio_std > 0.02:
                            severity += aspect_ratio_std * 200
                            issues.append('face_aspect_variation')
                            
                        if symmetry_std > 0.01:
                            severity += symmetry_std * 300
                            issues.append('eye_symmetry_variation')
                        
                        if severity > 5:
                            inconsistencies.append({
                                'frame': frame_idx,
                                'type': 'facial_geometry_inconsistency',
                                'severity': min(severity, 100),
                                'issues': issues,
                                'details': {
                                    'eye_ratio_std': eye_ratio_std,
                                    'aspect_ratio_std': aspect_ratio_std,
                                    'symmetry_std': symmetry_std
                                }
                            })
                            
            except Exception as e:
                logger.error(f"Facial analysis error for frame {frame_idx}: {e}")
        
        # Calculate score based on inconsistencies
        if analyzed_frames > 0:
            inconsistency_rate = len(inconsistencies) / analyzed_frames
            avg_severity = np.mean([inc['severity'] for inc in inconsistencies]) if inconsistencies else 0
            score = min(100, inconsistency_rate * 100 + avg_severity * 0.5)
        else:
            score = 0
        
        evidence = f"Analyzed {analyzed_frames} frames with face detections. "
        evidence += f"Found {len(inconsistencies)} facial geometry inconsistencies. "
        
        if inconsistencies:
            max_severity = max(inconsistencies, key=lambda x: x['severity'])
            evidence += f"Most severe inconsistency: {max_severity['severity']:.1f}% in frame {max_severity['frame']}"
        
        return {
            'inconsistencies': inconsistencies,
            'analyzed_frames': analyzed_frames,
            'score': float(score),
            'evidence': evidence
        }
    
    def analyze_eye_regions(self, frames):
        """Enhanced eye region analysis with multiple texture features"""
        patterns = []
        analyzed_frames = 0
        
        for frame_idx, frame in frames:
            try:
                faces = self.detect_faces_multi_method(frame)
                
                if not faces:
                    continue
                    
                analyzed_frames += 1
                largest_face = max(faces, key=lambda x: x['area'])
                x, y, w, h = largest_face['box']
                
                face_region = frame[y:y+h, x:x+w]
                gray_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
                
                # Detect eyes
                eyes = self.eye_cascade.detectMultiScale(gray_face, 1.1, 5)
                
                for eye_x, eye_y, eye_w, eye_h in eyes:
                    eye_region = gray_face[eye_y:eye_y+eye_h, eye_x:eye_x+eye_w]
                    
                    if eye_region.size > 100:  # Minimum eye region size
                        # Calculate multiple texture features
                        entropy = shannon_entropy(eye_region)
                        
                        # Local Binary Pattern analysis
                        lbp = local_binary_pattern(eye_region, 8, 1, method='uniform')
                        lbp_variance = np.var(lbp)
                        
                        # Gradient analysis
                        grad_x = cv2.Sobel(eye_region, cv2.CV_64F, 1, 0, ksize=3)
                        grad_y = cv2.Sobel(eye_region, cv2.CV_64F, 0, 1, ksize=3)
                        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
                        avg_gradient = np.mean(gradient_magnitude)
                        
                        # Standard deviation (texture roughness)
                        texture_std = np.std(eye_region)
                        
                        # Flag suspicious patterns
                        suspicion_score = 0
                        issues = []
                        
                        if entropy < self.thresholds['eye_entropy']:
                            suspicion_score += (self.thresholds['eye_entropy'] - entropy) * 20
                            issues.append('low_entropy')
                        
                        if lbp_variance < 10:
                            suspicion_score += (10 - lbp_variance) * 5
                            issues.append('low_lbp_variance')
                        
                        if avg_gradient < 5:
                            suspicion_score += (5 - avg_gradient) * 10
                            issues.append('low_gradient')
                        
                        if texture_std < 15:
                            suspicion_score += (15 - texture_std) * 3
                            issues.append('low_texture_variation')
                        
                        if suspicion_score > 20:
                            patterns.append({
                                'frame': frame_idx,
                                'type': 'suspicious_eye_texture',
                                'suspicion_score': min(suspicion_score, 100),
                                'issues': issues,
                                'features': {
                                    'entropy': float(entropy),
                                    'lbp_variance': float(lbp_variance),
                                    'avg_gradient': float(avg_gradient),
                                    'texture_std': float(texture_std)
                                }
                            })
                            
            except Exception as e:
                logger.error(f"Eye analysis error for frame {frame_idx}: {e}")
        
        score = min(100, len(patterns) * 20) if analyzed_frames > 0 else 0
        evidence = f"Analyzed eye regions in {analyzed_frames} frames. Found {len(patterns)} suspicious eye texture patterns."
        
        if patterns:
            avg_suspicion = np.mean([p['suspicion_score'] for p in patterns])
            evidence += f" Average suspicion score: {avg_suspicion:.1f}"
        
        return {
            'patterns': patterns,
            'analyzed_frames': analyzed_frames,
            'score': float(score),
            'evidence': evidence
        }
    
    def analyze_texture_inconsistencies(self, frames):
        """Enhanced texture consistency analysis"""
        inconsistencies = 0
        analyzed_frames = 0
        texture_history = []
        detailed_inconsistencies = []
        
        for frame_idx, frame in frames:
            try:
                faces = self.detect_faces_multi_method(frame)
                
                if not faces:
                    continue
                    
                analyzed_frames += 1
                largest_face = max(faces, key=lambda x: x['area'])
                face_image = largest_face['face_image']
                
                # Resize face for consistent analysis
                face_resized = cv2.resize(face_image, (128, 128))
                gray_face = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
                
                # Calculate multiple texture features
                # 1. Local Binary Pattern
                lbp = local_binary_pattern(gray_face, 8, 1, method='uniform')
                lbp_hist, _ = np.histogram(lbp.ravel(), bins=10, range=(0, 9))
                lbp_hist = lbp_hist.astype(float)
                lbp_hist /= (lbp_hist.sum() + 1e-7)
                
                # 2. Gray Level Co-occurrence Matrix features
                glcm_contrast = np.var(gray_face)
                glcm_homogeneity = 1.0 / (1.0 + np.var(gray_face))
                
                # 3. Entropy
                entropy = shannon_entropy(gray_face)
                
                texture_features = {
                    'frame': frame_idx,
                    'lbp_hist': lbp_hist,
                    'contrast': glcm_contrast,
                    'homogeneity': glcm_homogeneity,
                    'entropy': entropy
                }
                
                texture_history.append(texture_features)
                
                # Compare with previous frames (sliding window)
                if len(texture_history) > 3:
                    recent_textures = texture_history[-4:]
                    
                    for i in range(len(recent_textures) - 1):
                        curr_frame = recent_textures[i]
                        next_frame = recent_textures[i + 1]
                        
                        # Calculate distances for different features
                        lbp_distance = np.sum(np.abs(curr_frame['lbp_hist'] - next_frame['lbp_hist']))
                        contrast_diff = abs(curr_frame['contrast'] - next_frame['contrast']) / max(curr_frame['contrast'], 1e-7)
                        entropy_diff = abs(curr_frame['entropy'] - next_frame['entropy'])
                        
                        # Flag significant changes
                        if (lbp_distance > self.thresholds['texture_distance'] or 
                            contrast_diff > 0.5 or 
                            entropy_diff > 1.0):
                            
                            inconsistencies += 1
                            detailed_inconsistencies.append({
                                'frame_pair': (curr_frame['frame'], next_frame['frame']),
                                'lbp_distance': float(lbp_distance),
                                'contrast_diff': float(contrast_diff),
                                'entropy_diff': float(entropy_diff),
                                'severity': min(100, lbp_distance * 100 + contrast_diff * 50 + entropy_diff * 30)
                            })
                            break
                            
            except Exception as e:
                logger.error(f"Texture analysis error for frame {frame_idx}: {e}")
        
        score = min(100, inconsistencies * 15) if analyzed_frames > 0 else 0
        evidence = f"Analyzed texture patterns in {analyzed_frames} frames. Found {inconsistencies} significant texture inconsistencies."
        
        if detailed_inconsistencies:
            avg_severity = np.mean([inc['severity'] for inc in detailed_inconsistencies])
            evidence += f" Average inconsistency severity: {avg_severity:.1f}"
        
        return {
            'inconsistencies': inconsistencies,
            'detailed_inconsistencies': detailed_inconsistencies,
            'analyzed_frames': analyzed_frames,
            'score': float(score),
            'evidence': evidence
        }
    
    def analyze_frequency_domain(self, frames):
        """Enhanced frequency domain analysis"""
        anomalies = []
        analyzed_frames = 0
        
        for frame_idx, frame in frames:
            try:
                faces = self.detect_faces_multi_method(frame)
                
                if not faces:
                    continue
                    
                analyzed_frames += 1
                largest_face = max(faces, key=lambda x: x['area'])
                face_image = largest_face['face_image']
                
                # Resize and convert to grayscale
                face_resized = cv2.resize(face_image, (128, 128))
                gray_face = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
                
                # Apply 2D FFT
                f_transform = fft2(gray_face)
                f_shift = fftshift(f_transform)
                magnitude_spectrum = np.log(np.abs(f_shift) + 1)
                
                # Analyze different frequency regions
                center = magnitude_spectrum.shape[0] // 2
                
                # High frequency region (edges and fine details)
                high_freq_region = magnitude_spectrum[center-10:center+10, center-10:center+10]
                high_freq_energy = np.mean(high_freq_region)
                
                # Mid frequency region
                mid_freq_region = magnitude_spectrum[center-25:center+25, center-25:center+25]
                mid_freq_energy = np.mean(mid_freq_region)
                
                # Low frequency region (overall structure)
                low_freq_region = magnitude_spectrum[center-40:center+40, center-40:center+40]
                low_freq_energy = np.mean(low_freq_region)
                
                # Calculate frequency ratios
                high_to_low_ratio = high_freq_energy / (low_freq_energy + 1e-7)
                mid_to_low_ratio = mid_freq_energy / (low_freq_energy + 1e-7)
                
                anomaly_score = 0
                issues = []
                
                # Check for suspicious patterns
                if high_freq_energy < self.thresholds['frequency_energy']:
                    anomaly_score += (self.thresholds['frequency_energy'] - high_freq_energy) * 30
                    issues.append('low_high_frequency_energy')
                
                if high_to_low_ratio < 0.1:
                    anomaly_score += (0.1 - high_to_low_ratio) * 200
                    issues.append('abnormal_frequency_distribution')
                
                if mid_to_low_ratio < 0.2:
                    anomaly_score += (0.2 - mid_to_low_ratio) * 100
                    issues.append('mid_frequency_suppression')
                
                if anomaly_score > 15:
                    anomalies.append({
                        'frame': frame_idx,
                        'type': 'frequency_domain_anomaly',
                        'anomaly_score': min(anomaly_score, 100),
                        'issues': issues,
                        'features': {
                            'high_freq_energy': float(high_freq_energy),
                            'mid_freq_energy': float(mid_freq_energy),
                            'low_freq_energy': float(low_freq_energy),
                            'high_to_low_ratio': float(high_to_low_ratio),
                            'mid_to_low_ratio': float(mid_to_low_ratio)
                        }
                    })
                    
            except Exception as e:
                logger.error(f"Frequency analysis error for frame {frame_idx}: {e}")
        
        score = min(100, len(anomalies) * 25) if analyzed_frames > 0 else 0
        evidence = f"Analyzed frequency domain in {analyzed_frames} frames. Found {len(anomalies)} frequency anomalies."
        
        if anomalies:
            avg_anomaly = np.mean([a['anomaly_score'] for a in anomalies])
            evidence += f" Average anomaly score: {avg_anomaly:.1f}"
        
        return {
            'anomalies': anomalies,
            'analyzed_frames': analyzed_frames,
            'score': float(score),
            'evidence': evidence
        }
    
    def generate_verdict_explanation(self, analysis_results, overall_score, is_deepfake):
        """Generate comprehensive human-readable explanation"""
        mesonet = analysis_results.get('mesonet_analysis', {})
        facial = analysis_results.get('facial_analysis', {})
        eye = analysis_results.get('eye_analysis', {})
        texture = analysis_results.get('texture_analysis', {})
        frequency = analysis_results.get('frequency_analysis', {})
        
        if is_deepfake:
            explanation = f"The AI analysis indicates this video is likely a deepfake with {overall_score:.1f}% confidence. "
            
            key_indicators = []
            evidence_strength = []
            
            # Analyze MesoNet results
            mesonet_score = mesonet.get('score', 0)
            if mesonet_score > 70:
                key_indicators.append(f"MesoNet neural network detected strong deepfake patterns ({mesonet.get('deepfake_probability', 0)*100:.1f}% probability)")
                evidence_strength.append('CRITICAL')
            elif mesonet_score > 40:
                key_indicators.append(f"MesoNet detected moderate deepfake indicators ({mesonet.get('deepfake_probability', 0)*100:.1f}% probability)")
                evidence_strength.append('MODERATE')
            
            # Analyze facial inconsistencies
            facial_score = facial.get('score', 0)
            if facial_score > 50:
                inconsistencies = len(facial.get('inconsistencies', []))
                key_indicators.append(f"severe facial geometry inconsistencies detected in {inconsistencies} instances")
                evidence_strength.append('HIGH')
            elif facial_score > 25:
                inconsistencies = len(facial.get('inconsistencies', []))
                key_indicators.append(f"facial geometry anomalies found in {inconsistencies} cases")
                evidence_strength.append('MODERATE')
            
            # Analyze eye patterns
            eye_score = eye.get('score', 0)
            if eye_score > 40:
                patterns = len(eye.get('patterns', []))
                key_indicators.append(f"suspicious eye region textures found in {patterns} frames")
                evidence_strength.append('MODERATE')
            
            # Analyze texture consistency
            texture_score = texture.get('score', 0)
            if texture_score > 30:
                inconsistencies = texture.get('inconsistencies', 0)
                key_indicators.append(f"texture inconsistencies across {inconsistencies} frame transitions")
                evidence_strength.append('MODERATE')
            
            # Analyze frequency anomalies
            frequency_score = frequency.get('score', 0)
            if frequency_score > 35:
                anomalies = len(frequency.get('anomalies', []))
                key_indicators.append(f"frequency domain anomalies in {anomalies} frames")
                evidence_strength.append('LOW')
            
            # Build explanation based on evidence strength
            if 'CRITICAL' in evidence_strength:
                explanation += "CRITICAL EVIDENCE: "
            elif 'HIGH' in evidence_strength:
                explanation += "STRONG EVIDENCE: "
            else:
                explanation += "MODERATE EVIDENCE: "
            
            if key_indicators:
                explanation += "; ".join(key_indicators[:3])
                if len(key_indicators) > 3:
                    explanation += f" and {len(key_indicators) - 3} additional indicators"
                explanation += ". "
            
            # Add confidence context
            if overall_score > 80:
                explanation += "This represents very high confidence detection with multiple converging indicators."
            elif overall_score > 60:
                explanation += "This represents high confidence detection with several supporting indicators."
            else:
                explanation += "This represents moderate confidence detection requiring careful consideration."
                
        else:
            explanation = f"The AI analysis suggests this video is likely authentic with {100-overall_score:.1f}% confidence. "
            
            # Provide positive evidence
            mesonet_prob = mesonet.get('deepfake_probability', 0) * 100
            explanation += f"MesoNet neural network assessed only {mesonet_prob:.1f}% deepfake probability. "
            
            authentic_indicators = []
            
            if facial.get('score', 0) < 20:
                authentic_indicators.append("consistent facial geometry across frames")
            
            if eye.get('score', 0) < 25:
                authentic_indicators.append("natural eye region textures")
            
            if texture.get('score', 0) < 20:
                authentic_indicators.append("stable texture patterns")
            
            if frequency.get('score', 0) < 25:
                authentic_indicators.append("natural frequency domain characteristics")
            
            if authentic_indicators:
                explanation += "Supporting evidence includes: " + ", ".join(authentic_indicators) + ". "
            
            explanation += "No significant manipulation artifacts were detected across multiple advanced detection methods."
        
        return explanation
    
    def extract_frames(self, video_path, max_frames=30):
        """Enhanced frame extraction with better error handling"""
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            logger.error(f"Could not open video file: {video_path}")
            return [], 0, 0, 0
        
        frames = []
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = frame_count / fps if fps > 0 else 0
        
        if frame_count == 0:
            cap.release()
            logger.error("Video has no frames")
            return [], 0, 0, 0
        
        # Calculate frame sampling interval
        interval = max(1, frame_count // max_frames)
        
        frame_idx = 0
        extracted_count = 0
        
        logger.info(f"Extracting frames: total={frame_count}, interval={interval}, target={max_frames}")
        
        while cap.isOpened() and extracted_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_idx % interval == 0:
                # Validate frame
                if frame is not None and frame.size > 0:
                    frames.append((frame_idx, frame))
                    extracted_count += 1
                    
            frame_idx += 1
            
        cap.release()
        
        logger.info(f"Successfully extracted {len(frames)} frames")
        return frames, fps, frame_count, duration
    
    def analyze_with_mesonet(self, frames):
        """Enhanced MesoNet analysis with better error handling"""
        predictions = []
        deepfake_evidence = []
        failed_predictions = 0
        
        for frame_idx, frame in frames:
            try:
                faces = self.detect_faces_multi_method(frame)
                
                if not faces:
                    continue
                
                # Use the largest, most confident face
                best_face = max(faces, key=lambda x: x['area'] * x['confidence'])
                face_image = best_face.get('face_image')
                
                if face_image is not None and face_image.size > 0:
                    try:
                        prediction, confidence, is_fake = self.mesonet.predict(face_image)
                        
                        predictions.append({
                            'frame': frame_idx,
                            'prediction': float(prediction),
                            'confidence': float(confidence),
                            'is_fake': bool(is_fake),
                            'face_method': best_face['method'],
                            'face_confidence': float(best_face['confidence'])
                        })
                        
                        # Collect high-confidence deepfake detections
                        if is_fake and confidence > self.thresholds['mesonet_confidence']:
                            deepfake_evidence.append({
                                'frame': frame_idx,
                                'type': 'mesonet_detection',
                                'confidence': float(confidence),
                                'prediction_score': float(prediction),
                                'face_detection_method': best_face['method']
                            })
                            
                    except Exception as e:
                        logger.error(f"MesoNet prediction error for frame {frame_idx}: {e}")
                        failed_predictions += 1
                        
            except Exception as e:
                logger.error(f"Face detection error for frame {frame_idx}: {e}")
                failed_predictions += 1
        
        if not predictions:
            return {
                'predictions': [],
                'analyzed_frames': 0,
                'failed_predictions': failed_predictions,
                'evidence': f"No faces detected for MesoNet analysis. Failed predictions: {failed_predictions}",
                'score': 0,
                'avg_confidence': 0,
                'deepfake_probability': 0,
                'deepfake_evidence': []
            }
        
        # Calculate statistics
        avg_prediction = float(np.mean([p['prediction'] for p in predictions]))
        avg_confidence = float(np.mean([p['confidence'] for p in predictions]))
        max_confidence = float(np.max([p['confidence'] for p in predictions]))
        deepfake_frames = len([p for p in predictions if p['is_fake']])
        deepfake_rate = deepfake_frames / len(predictions) if predictions else 0
        
        # Enhanced scoring that considers confidence distribution
        base_score = avg_prediction * 100
        confidence_boost = (avg_confidence - 0.5) * 50 if avg_confidence > 0.5 else 0
        detection_rate_bonus = deepfake_rate * 30
        
        score = min(100, base_score + confidence_boost + detection_rate_bonus)
        
        # Generate detailed evidence
        evidence = f"MesoNet analyzed {len(predictions)} face detections from {len(frames)} frames. "
        evidence += f"Average deepfake probability: {avg_prediction:.3f} (max confidence: {max_confidence:.3f}). "
        evidence += f"Flagged {deepfake_frames}/{len(predictions)} frames as deepfake ({deepfake_rate:.1%}). "
        
        if failed_predictions > 0:
            evidence += f"Failed to analyze {failed_predictions} frames. "
        
        # Add detection method breakdown
        method_counts = {}
        for pred in predictions:
            method = pred.get('face_method', 'Unknown')
            method_counts[method] = method_counts.get(method, 0) + 1
        
        if method_counts:
            method_breakdown = ", ".join([f"{method}: {count}" for method, count in method_counts.items()])
            evidence += f"Face detection methods used: {method_breakdown}."
        
        return {
            'predictions': predictions,
            'analyzed_frames': len(predictions),
            'failed_predictions': failed_predictions,
            'evidence': evidence,
            'score': float(score),
            'avg_confidence': float(avg_confidence),
            'max_confidence': float(max_confidence),
            'deepfake_probability': float(avg_prediction),
            'deepfake_detection_rate': float(deepfake_rate),
            'deepfake_evidence': deepfake_evidence,
            'method_breakdown': method_counts
        }
    
    def analyze_video(self, video_path):
        """Enhanced main analysis function with comprehensive error handling"""
        start_time = datetime.now()
        
        try:
            # Extract frames
            frames, fps, total_frames, duration = self.extract_frames(video_path, max_frames=25)
            
            if not frames:
                return {'error': 'Could not extract any valid frames from video'}
            
            logger.info(f"Starting analysis of {len(frames)} frames from {total_frames} total frames")
            
            # Run all analysis methods
            analysis_start = datetime.now()
            
            mesonet_analysis = self.analyze_with_mesonet(frames)
            logger.info(f"MesoNet analysis completed in {(datetime.now() - analysis_start).total_seconds():.1f}s")
            
            analysis_start = datetime.now()
            facial_analysis = self.analyze_facial_inconsistencies(frames)
            logger.info(f"Facial analysis completed in {(datetime.now() - analysis_start).total_seconds():.1f}s")
            
            analysis_start = datetime.now()
            eye_analysis = self.analyze_eye_regions(frames)
            logger.info(f"Eye analysis completed in {(datetime.now() - analysis_start).total_seconds():.1f}s")
            
            analysis_start = datetime.now()
            texture_analysis = self.analyze_texture_inconsistencies(frames)
            logger.info(f"Texture analysis completed in {(datetime.now() - analysis_start).total_seconds():.1f}s")
            
            analysis_start = datetime.now()
            frequency_analysis = self.analyze_frequency_domain(frames)
            logger.info(f"Frequency analysis completed in {(datetime.now() - analysis_start).total_seconds():.1f}s")
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Enhanced scoring with adaptive weights
            mesonet_weight = 0.45 if mesonet_analysis.get('analyzed_frames', 0) > 5 else 0.25
            facial_weight = 0.25 if facial_analysis.get('analyzed_frames', 0) > 3 else 0.15
            eye_weight = 0.15
            texture_weight = 0.10
            frequency_weight = 0.05
            
            # Normalize weights
            total_weight = mesonet_weight + facial_weight + eye_weight + texture_weight + frequency_weight
            mesonet_weight /= total_weight
            facial_weight /= total_weight
            eye_weight /= total_weight
            texture_weight /= total_weight
            frequency_weight /= total_weight
            
            scores = [
                mesonet_analysis.get('score', 0) * mesonet_weight,
                facial_analysis.get('score', 0) * facial_weight,
                eye_analysis.get('score', 0) * eye_weight,
                texture_analysis.get('score', 0) * texture_weight,
                frequency_analysis.get('score', 0) * frequency_weight
            ]
            
            overall_score = sum(scores)
            
            # Enhanced decision logic
            mesonet_score = mesonet_analysis.get('score', 0)
            mesonet_confidence = mesonet_analysis.get('max_confidence', 0)
            
            is_deepfake = (
                overall_score > 40 or 
                (mesonet_score > 60 and mesonet_confidence > 0.7) or
                (mesonet_score > 50 and facial_analysis.get('score', 0) > 30)
            )
            
            # Compile comprehensive results
            results = {
                'mesonet_analysis': {
                    'deepfake_probability': float(mesonet_analysis.get('deepfake_probability', 0)),
                    'analyzed_frames': int(mesonet_analysis.get('analyzed_frames', 0)),
                    'failed_predictions': int(mesonet_analysis.get('failed_predictions', 0)),
                    'avg_confidence': float(mesonet_analysis.get('avg_confidence', 0)),
                    'max_confidence': float(mesonet_analysis.get('max_confidence', 0)),
                    'detection_rate': float(mesonet_analysis.get('deepfake_detection_rate', 0)),
                    'score': float(mesonet_analysis.get('score', 0)),
                    'evidence': mesonet_analysis.get('evidence', 'No evidence found'),
                    'deepfake_detections': int(len(mesonet_analysis.get('deepfake_evidence', []))),
                    'method_breakdown': mesonet_analysis.get('method_breakdown', {}),
                    'weight_used': float(mesonet_weight)
                },
                'facial_inconsistencies': {
                    'suspicious_frames': int(len(facial_analysis.get('inconsistencies', []))),
                    'total_analyzed': int(facial_analysis.get('analyzed_frames', 0)),
                    'score': float(facial_analysis.get('score', 0)),
                    'evidence': facial_analysis.get('evidence', 'No evidence found'),
                    'weight_used': float(facial_weight)
                },
                'eye_patterns': {
                    'suspicious_patterns': int(len(eye_analysis.get('patterns', []))),
                    'total_analyzed': int(eye_analysis.get('analyzed_frames', 0)),
                    'score': float(eye_analysis.get('score', 0)),
                    'evidence': eye_analysis.get('evidence', 'No evidence found'),
                    'weight_used': float(eye_weight)
                },
                'texture_consistency': {
                    'inconsistencies': int(texture_analysis.get('inconsistencies', 0)),
                    'total_analyzed': int(texture_analysis.get('analyzed_frames', 0)),
                    'score': float(texture_analysis.get('score', 0)),
                    'evidence': texture_analysis.get('evidence', 'No evidence found'),
                    'weight_used': float(texture_weight)
                },
                'frequency_analysis': {
                    'anomalies': int(len(frequency_analysis.get('anomalies', []))),
                    'total_analyzed': int(frequency_analysis.get('analyzed_frames', 0)),
                    'score': float(frequency_analysis.get('score', 0)),
                    'evidence': frequency_analysis.get('evidence', 'No evidence found'),
                    'weight_used': float(frequency_weight)
                },
                'metadata': {
                    'total_frames': int(total_frames),
                    'analyzed_frames': int(len(frames)),
                    'fps': float(fps),
                    'duration': float(duration),
                    'processing_time': f'{processing_time:.1f}s',
                    'frames_per_second_processed': float(len(frames) / processing_time) if processing_time > 0 else 0
                },
                'overall': {
                    'is_deepfake': bool(is_deepfake),
                    'confidence': float(overall_score),
                    'verdict': 'DEEPFAKE DETECTED' if is_deepfake else 'AUTHENTIC VIDEO',
                    'explanation': self.generate_verdict_explanation({
                        'mesonet_analysis': mesonet_analysis,
                        'facial_analysis': facial_analysis,
                        'eye_analysis': eye_analysis,
                        'texture_analysis': texture_analysis,
                        'frequency_analysis': frequency_analysis
                    }, overall_score, is_deepfake),
                    'score_breakdown': {
                        'mesonet_contribution': float(scores[0]),
                        'facial_contribution': float(scores[1]),
                        'eye_contribution': float(scores[2]),
                        'texture_contribution': float(scores[3]),
                        'frequency_contribution': float(scores[4])
                    }
                }
            }
            
            logger.info(f"Analysis complete. Deepfake: {results['overall']['is_deepfake']}, "
                       f"Confidence: {results['overall']['confidence']:.1f}%, "
                       f"Processing time: {processing_time:.1f}s")
            
            return convert_numpy_types(results)
            
        except Exception as e:
            logger.error(f"Analysis error: {str(e)}", exc_info=True)
            return {
                'error': f'Analysis failed: {str(e)}',
                'processing_time': f'{(datetime.now() - start_time).total_seconds():.1f}s'
            }

# Initialize detector
try:
    detector = AdvancedDeepfakeDetector()
    logger.info("Detector initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize detector: {e}")
    detector = None

@app.route('/api/analyze', methods=['POST'])
def analyze_video():
    """Enhanced API endpoint for video analysis"""
    if detector is None:
        return jsonify({'error': 'Detection system not properly initialized'}), 500
    
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        
        if video_file.filename == '':
            return jsonify({'error': 'No video file selected'}), 400
        
        # Check file size (limit to 100MB)
        video_file.seek(0, os.SEEK_END)
        file_size = video_file.tell()
        video_file.seek(0)
        
        if file_size > 100 * 1024 * 1024:  # 100MB limit
            return jsonify({'error': 'File too large. Maximum size is 100MB'}), 400
        
        # Check file extension
        allowed_extensions = {'.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv'}
        file_ext = os.path.splitext(video_file.filename.lower())[1]
        
        if file_ext not in allowed_extensions:
            return jsonify({'error': f'Unsupported file format. Allowed: {", ".join(allowed_extensions)}'}), 400
        
        # Save temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            video_file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            logger.info(f"Analyzing video: {video_file.filename} ({file_size / (1024*1024):.1f}MB)")
            results = detector.analyze_video(temp_path)
            
            if 'error' in results:
                logger.error(f"Analysis failed for {video_file.filename}: {results['error']}")
                return jsonify(results), 500
            
            logger.info(f"Analysis completed successfully for {video_file.filename}")
            return jsonify(results)
            
        finally:
            # Clean up temporary file
            try:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
            except Exception as e:
                logger.error(f"Failed to clean up temp file: {e}")
            
    except Exception as e:
        logger.error(f"API error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error occurred during analysis'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        status = {
            'status': 'healthy',
            'detector_initialized': detector is not None,
            'mtcnn_available': detector.mtcnn_available if detector else False,
            'mediapipe_available': detector.mediapipe_available if detector else False,
            'tensorflow_version': tf.__version__,
            'opencv_version': cv2.__version__
        }
        return jsonify(status)
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Deepfake Detection Server...")
    app.run(debug=True, host='0.0.0.0', port=2000, threaded=True)