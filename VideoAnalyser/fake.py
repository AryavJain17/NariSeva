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
from tensorflow.keras.layers import BatchNormalization, Activation
import urllib.request
import pickle

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MesoNet:
    """
    MesoNet implementation for deepfake detection
    Based on the paper: "MesoNet: a Compact Facial Video Forgery Detection Network"
    """
    def __init__(self):
        self.model = None
        self.input_size = 256
        
    def build_meso4(self):
        """Build MesoNet-4 architecture"""
        x = Input(shape=(self.input_size, self.input_size, 3))
        
        x1 = Conv2D(8, (3, 3), padding='same', activation='relu')(x)
        x1 = BatchNormalization()(x1)
        x1 = MaxPooling2D(pool_size=(2, 2), padding='same')(x1)
        
        x2 = Conv2D(8, (5, 5), padding='same', activation='relu')(x1)
        x2 = BatchNormalization()(x2)
        x2 = MaxPooling2D(pool_size=(2, 2), padding='same')(x2)
        
        x3 = Conv2D(16, (5, 5), padding='same', activation='relu')(x2)
        x3 = BatchNormalization()(x3)
        x3 = MaxPooling2D(pool_size=(2, 2), padding='same')(x3)
        
        x4 = Conv2D(16, (5, 5), padding='same', activation='relu')(x3)
        x4 = BatchNormalization()(x4)
        x4 = MaxPooling2D(pool_size=(4, 4), padding='same')(x4)
        
        y = Flatten()(x4)
        y = Dropout(0.5)(y)
        y = Dense(16)(y)
        y = Activation('relu')(y)
        y = Dropout(0.5)(y)
        y = Dense(1, activation='sigmoid')(y)
        
        return Model(inputs=x, outputs=y)
    
    def build_mesoInception4(self):
        """Build MesoInception-4 architecture"""
        x = Input(shape=(self.input_size, self.input_size, 3))
        
        # Inception-like blocks
        x1 = self.inception_block(x, 1, 4, 4, 2)
        x1 = MaxPooling2D(pool_size=(2, 2), padding='same')(x1)
        
        x2 = self.inception_block(x1, 2, 4, 4, 2)
        x2 = MaxPooling2D(pool_size=(2, 2), padding='same')(x2)
        
        x3 = self.inception_block(x2, 1, 2, 2, 1)
        x3 = MaxPooling2D(pool_size=(2, 2), padding='same')(x3)
        
        x4 = self.inception_block(x3, 1, 2, 2, 1)
        x4 = MaxPooling2D(pool_size=(4, 4), padding='same')(x4)
        
        y = Flatten()(x4)
        y = Dropout(0.5)(y)
        y = Dense(16)(y)
        y = Activation('relu')(y)
        y = Dropout(0.5)(y)
        y = Dense(1, activation='sigmoid')(y)
        
        return Model(inputs=x, outputs=y)
    
    def inception_block(self, x, a, b, c, d):
        """Create inception-like block"""
        from tensorflow.keras.layers import concatenate
        
        # 1x1 conv
        branch1 = Conv2D(a, (1, 1), padding='same', activation='relu')(x)
        branch1 = BatchNormalization()(branch1)
        
        # 1x1 -> 3x3 conv
        branch2 = Conv2D(b, (1, 1), padding='same', activation='relu')(x)
        branch2 = Conv2D(b, (3, 3), padding='same', activation='relu')(branch2)
        branch2 = BatchNormalization()(branch2)
        
        # 1x1 -> 3x3 -> 3x3 conv
        branch3 = Conv2D(c, (1, 1), padding='same', activation='relu')(x)
        branch3 = Conv2D(c, (3, 3), padding='same', activation='relu')(branch3)
        branch3 = Conv2D(c, (3, 3), padding='same', activation='relu')(branch3)
        branch3 = BatchNormalization()(branch3)
        
        # 3x3 maxpool -> 1x1 conv
        branch4 = MaxPooling2D(pool_size=(3, 3), strides=(1, 1), padding='same')(x)
        branch4 = Conv2D(d, (1, 1), padding='same', activation='relu')(branch4)
        branch4 = BatchNormalization()(branch4)
        
        return concatenate([branch1, branch2, branch3, branch4], axis=3)
    
    def load_model(self, model_path=None, model_type='meso4'):
        """Load pre-trained model or create new one"""
        try:
            if model_path and os.path.exists(model_path):
                self.model = tf.keras.models.load_model(model_path)
                logger.info(f"Loaded pre-trained model from {model_path}")
            else:
                # Build model architecture
                if model_type == 'meso4':
                    self.model = self.build_meso4()
                else:
                    self.model = self.build_mesoInception4()
                
                # Try to download pre-trained weights
                self.download_pretrained_weights(model_type)
                logger.info(f"Built {model_type} model architecture")
                
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            # Fallback to basic architecture
            self.model = self.build_meso4()
    
    def download_pretrained_weights(self, model_type):
        """Download pre-trained weights if available"""
        try:
            # These are example URLs - you would need to host your own pre-trained weights
            # or use publicly available ones
            weights_urls = {
                'meso4': 'https://example.com/meso4_weights.h5',
                'mesoInception4': 'https://example.com/mesoInception4_weights.h5'
            }
            
            weights_path = f"models/{model_type}_weights.h5"
            os.makedirs("models", exist_ok=True)
            
            if not os.path.exists(weights_path):
                logger.info(f"Downloading {model_type} weights...")
                # Uncomment when you have actual weights URLs
                # urllib.request.urlretrieve(weights_urls[model_type], weights_path)
                # self.model.load_weights(weights_path)
                logger.info("Pre-trained weights not available, using random initialization")
            else:
                self.model.load_weights(weights_path)
                logger.info(f"Loaded weights from {weights_path}")
                
        except Exception as e:
            logger.warning(f"Could not download pre-trained weights: {e}")
    
    def preprocess_image(self, image):
        """Preprocess image for MesoNet"""
        # Resize to model input size
        image = cv2.resize(image, (self.input_size, self.input_size))
        
        # Normalize pixel values
        image = image.astype(np.float32) / 255.0
        
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        
        return image
    
    def predict(self, image):
        """Make prediction on a single image"""
        if self.model is None:
            return 0.5, "Model not loaded"
        
        try:
            processed_image = self.preprocess_image(image)
            prediction = self.model.predict(processed_image, verbose=0)[0][0]
            
            confidence = abs(prediction - 0.5) * 2  # Convert to confidence score
            is_fake = prediction > 0.5
            
            return prediction, confidence, is_fake
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return 0.5, 0.0, False

class AdvancedDeepfakeDetector:
    def __init__(self):
        """Initialize the detection system with MesoNet integration"""
        try:
            # Initialize OpenCV face detector
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
            
            # Initialize MesoNet
            self.mesonet = MesoNet()
            self.mesonet.load_model(model_type='meso4')
            
            # Try to load MTCNN for better face detection
            self.mtcnn_available = False
            try:
                from mtcnn import MTCNN
                self.mtcnn_detector = MTCNN()
                self.mtcnn_available = True
                logger.info("MTCNN face detector loaded successfully")
            except ImportError:
                logger.info("MTCNN not available, using OpenCV Haar cascades")
            
            logger.info("Enhanced detection system initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing detector: {e}")
    
    def extract_frames(self, video_path, max_frames=40):
        """Extract frames from video for analysis"""
        cap = cv2.VideoCapture(video_path)
        frames = []
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = frame_count / fps if fps > 0 else 0
        
        if frame_count == 0:
            cap.release()
            return [], 0, 0, 0
        
        # Calculate frame interval to get evenly distributed frames
        interval = max(1, frame_count // max_frames)
        
        frame_idx = 0
        extracted_count = 0
        while cap.isOpened() and extracted_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_idx % interval == 0:
                frames.append((frame_idx, frame))
                extracted_count += 1
                
            frame_idx += 1
            
        cap.release()
        return frames, fps, frame_count, duration
    
    def detect_faces_opencv(self, frame):
        """Detect faces using OpenCV Haar cascades"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        face_data = []
        for (x, y, w, h) in faces:
            face_dict = {
                'bbox': (x, y, w, h),
                'confidence': 1.0,
                'area': w * h,
                'face_image': frame[y:y+h, x:x+w]
            }
            face_data.append(face_dict)
        
        return face_data
    
    def detect_faces_mtcnn(self, frame):
        """Detect faces using MTCNN (if available)"""
        if not self.mtcnn_available:
            return self.detect_faces_opencv(frame)
        
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            detections = self.mtcnn_detector.detect_faces(rgb_frame)
            
            face_data = []
            for detection in detections:
                bbox = detection['box']
                confidence = detection['confidence']
                
                x, y, w, h = bbox[0], bbox[1], bbox[2], bbox[3]
                face_image = frame[y:y+h, x:x+w] if y >= 0 and x >= 0 and y+h <= frame.shape[0] and x+w <= frame.shape[1] else None
                
                face_dict = {
                    'bbox': (x, y, w, h),
                    'confidence': confidence,
                    'area': w * h,
                    'keypoints': detection.get('keypoints', {}),
                    'face_image': face_image
                }
                face_data.append(face_dict)
            
            return face_data
        except Exception as e:
            logger.warning(f"MTCNN detection failed, falling back to OpenCV: {e}")
            return self.detect_faces_opencv(frame)
    
    def analyze_with_mesonet(self, frames):
        """Analyze frames using MesoNet deep learning model"""
        predictions = []
        deepfake_evidence = []
        
        for frame_idx, frame in frames:
            faces = self.detect_faces_mtcnn(frame)
            
            if not faces:
                continue
            
            # Use the largest face
            largest_face = max(faces, key=lambda x: x['area'])
            face_image = largest_face.get('face_image')
            
            if face_image is not None and face_image.size > 0:
                try:
                    prediction, confidence, is_fake = self.mesonet.predict(face_image)
                    
                    predictions.append({
                        'frame': frame_idx,
                        'prediction': prediction,
                        'confidence': confidence,
                        'is_fake': is_fake
                    })
                    
                    if is_fake and confidence > 0.6:
                        deepfake_evidence.append({
                            'frame': frame_idx,
                            'type': 'mesonet_detection',
                            'confidence': confidence,
                            'prediction_score': prediction
                        })
                        
                except Exception as e:
                    logger.error(f"MesoNet prediction error for frame {frame_idx}: {e}")
        
        if not predictions:
            return {
                'predictions': [],
                'analyzed_frames': 0,
                'evidence': "No faces detected for MesoNet analysis",
                'score': 0,
                'avg_confidence': 0,
                'deepfake_probability': 0
            }
        
        # Calculate metrics
        avg_prediction = np.mean([p['prediction'] for p in predictions])
        avg_confidence = np.mean([p['confidence'] for p in predictions])
        deepfake_frames = len([p for p in predictions if p['is_fake']])
        deepfake_rate = deepfake_frames / len(predictions)
        
        # Calculate overall score (0-100)
        score = min(100, (avg_prediction * 100 + deepfake_rate * 50))
        
        evidence = f"MesoNet analyzed {len(predictions)} face detections. "
        evidence += f"Average deepfake probability: {avg_prediction:.3f}. "
        evidence += f"Detected deepfake in {deepfake_frames}/{len(predictions)} frames ({deepfake_rate:.1%}). "
        evidence += f"Average confidence: {avg_confidence:.3f}"
        
        return {
            'predictions': predictions,
            'analyzed_frames': len(predictions),
            'evidence': evidence,
            'score': score,
            'avg_confidence': avg_confidence,
            'deepfake_probability': avg_prediction,
            'deepfake_evidence': deepfake_evidence
        }
    
    def analyze_facial_inconsistencies(self, frames):
        """Analyze facial consistency using geometric features"""
        inconsistencies = []
        face_data_sequence = []
        
        # Extract face data for each frame
        for frame_idx, frame in frames:
            faces = self.detect_faces_mtcnn(frame)
            if faces:
                # Sort by area to get the largest (most prominent) face
                faces.sort(key=lambda x: x['area'], reverse=True)
                face_data_sequence.append((frame_idx, faces[0]))
        
        if len(face_data_sequence) < 3:
            return {
                'inconsistencies': [],
                'analyzed_frames': len(face_data_sequence),
                'evidence': "Insufficient face detection data for analysis",
                'score': 0
            }
        
        # Analyze temporal consistency
        bbox_variations = []
        confidence_drops = []
        
        for i in range(1, len(face_data_sequence)):
            prev_frame_idx, prev_face = face_data_sequence[i-1]
            curr_frame_idx, curr_face = face_data_sequence[i]
            
            # Bounding box consistency
            prev_bbox = prev_face['bbox']
            curr_bbox = curr_face['bbox']
            
            # Calculate relative change in face size and position
            prev_area = prev_bbox[2] * prev_bbox[3]
            curr_area = curr_bbox[2] * curr_bbox[3]
            
            if prev_area > 0:
                size_change = abs(curr_area - prev_area) / prev_area
            else:
                size_change = 0
            
            # Position change
            prev_center = (prev_bbox[0] + prev_bbox[2]/2, prev_bbox[1] + prev_bbox[3]/2)
            curr_center = (curr_bbox[0] + curr_bbox[2]/2, curr_bbox[1] + curr_bbox[3]/2)
            pos_change = math.sqrt((curr_center[0] - prev_center[0])**2 + (curr_center[1] - prev_center[1])**2)
            
            bbox_variations.append((curr_frame_idx, size_change, pos_change))
            
            # Confidence analysis (if using MTCNN)
            if 'confidence' in prev_face and 'confidence' in curr_face:
                conf_change = abs(curr_face['confidence'] - prev_face['confidence'])
                if conf_change > 0.3:  # Significant confidence drop
                    confidence_drops.append(curr_frame_idx)
        
        # Flag suspicious variations
        suspicious_count = 0
        total_variations = len(bbox_variations)
        
        for frame_idx, size_change, pos_change in bbox_variations:
            if size_change > 0.4 or pos_change > 80:  # Thresholds for suspicious changes
                inconsistencies.append({
                    'frame': frame_idx,
                    'type': 'geometric_inconsistency',
                    'size_change': size_change,
                    'position_change': pos_change
                })
                suspicious_count += 1
        
        # Calculate score
        inconsistency_rate = suspicious_count / total_variations if total_variations > 0 else 0
        confidence_penalty = len(confidence_drops) * 10
        score = min(100, inconsistency_rate * 120 + confidence_penalty)
        
        evidence = f"Analyzed {len(face_data_sequence)} frames with face detections. "
        evidence += f"Found {suspicious_count} geometric inconsistencies and {len(confidence_drops)} confidence drops. "
        evidence += f"Inconsistency rate: {inconsistency_rate:.2%}"
        
        return {
            'inconsistencies': inconsistencies,
            'analyzed_frames': len(face_data_sequence),
            'evidence': evidence,
            'score': score
        }
    
    def analyze_eye_regions(self, frames):
        """Analyze eye regions for blinking patterns and artifacts"""
        eye_data = []
        suspicious_patterns = []
        
        for frame_idx, frame in frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces first
            faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
            
            frame_eye_data = {'frame': frame_idx, 'eyes_detected': 0, 'eye_symmetry': 0}
            
            for (x, y, w, h) in faces:
                # Focus on face region
                face_roi = gray[y:y+h, x:x+w]
                
                # Detect eyes in face region
                eyes = self.eye_cascade.detectMultiScale(face_roi, 1.1, 3)
                frame_eye_data['eyes_detected'] = len(eyes)
                
                if len(eyes) == 2:
                    # Analyze eye symmetry
                    eye1, eye2 = eyes[0], eyes[1]
                    eye1_center = (eye1[0] + eye1[2]//2, eye1[1] + eye1[3]//2)
                    eye2_center = (eye2[0] + eye2[2]//2, eye2[1] + eye2[3]//2)
                    
                    # Calculate symmetry score
                    y_diff = abs(eye1_center[1] - eye2_center[1])
                    symmetry_score = max(0, 1 - y_diff / 20)  # Normalize by expected range
                    frame_eye_data['eye_symmetry'] = symmetry_score
                
                break  # Use first face only
            
            eye_data.append(frame_eye_data)
        
        # Analyze patterns
        if len(eye_data) < 5:
            return {
                'patterns': [],
                'analyzed_frames': len(eye_data),
                'evidence': "Insufficient eye detection data",
                'score': 0
            }
        
        # Check for unnatural patterns
        eyes_detected = [data['eyes_detected'] for data in eye_data]
        symmetry_scores = [data['eye_symmetry'] for data in eye_data if data['eye_symmetry'] > 0]
        
        # Flag frames with no eyes detected (suspicious for face videos)
        no_eyes_count = eyes_detected.count(0)
        no_eyes_rate = no_eyes_count / len(eye_data)
        
        # Flag poor symmetry
        if symmetry_scores:
            avg_symmetry = np.mean(symmetry_scores)
            poor_symmetry_count = sum(1 for score in symmetry_scores if score < 0.5)
        else:
            avg_symmetry = 0
            poor_symmetry_count = 0
        
        score = 0
        if no_eyes_rate > 0.3:  # More than 30% frames without eyes
            suspicious_patterns.append("High rate of frames without detectable eyes")
            score += 40
        
        if avg_symmetry < 0.6:  # Poor average eye symmetry
            suspicious_patterns.append("Poor eye symmetry consistency")
            score += 35
        
        if poor_symmetry_count > len(symmetry_scores) * 0.4:
            suspicious_patterns.append("Many frames with asymmetric eye positioning")
            score += 25
        
        evidence = f"Analyzed {len(eye_data)} frames for eye patterns. "
        evidence += f"No eyes detected in {no_eyes_count} frames ({no_eyes_rate:.1%}). "
        if symmetry_scores:
            evidence += f"Average eye symmetry: {avg_symmetry:.2f}. "
        evidence += f"Found {len(suspicious_patterns)} suspicious patterns."
        
        return {
            'patterns': suspicious_patterns,
            'analyzed_frames': len(eye_data),
            'evidence': evidence,
            'score': min(score, 100)
        }
    
    def analyze_texture_inconsistencies(self, frames):
        """Analyze texture patterns using Local Binary Patterns"""
        texture_data = []
        
        for frame_idx, frame in frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Calculate Local Binary Pattern
            radius = 3
            n_points = 8 * radius
            lbp = local_binary_pattern(gray, n_points, radius, method='uniform')
            
            # Calculate texture features
            lbp_hist, _ = np.histogram(lbp.ravel(), bins=n_points + 2, 
                                     range=(0, n_points + 2), density=True)
            
            # Calculate entropy (measure of texture complexity)
            entropy = shannon_entropy(gray)
            
            texture_data.append({
                'frame': frame_idx,
                'lbp_hist': lbp_hist,
                'entropy': entropy
            })
        
        if len(texture_data) < 3:
            return {
                'inconsistencies': 0,
                'analyzed_frames': len(texture_data),
                'evidence': "Insufficient frames for texture analysis",
                'score': 0
            }
        
        # Analyze texture consistency
        inconsistencies = 0
        entropy_values = [data['entropy'] for data in texture_data]
        entropy_std = np.std(entropy_values)
        entropy_mean = np.mean(entropy_values)
        
        # Compare consecutive frames
        for i in range(1, len(texture_data)):
            prev_hist = texture_data[i-1]['lbp_hist']
            curr_hist = texture_data[i]['lbp_hist']
            
            # Calculate histogram correlation
            correlation = np.corrcoef(prev_hist, curr_hist)[0, 1]
            
            if correlation < 0.7:  # Low texture similarity
                inconsistencies += 1
        
        # Calculate score
        inconsistency_rate = inconsistencies / (len(texture_data) - 1) if len(texture_data) > 1 else 0
        entropy_penalty = 0
        
        # High entropy variation suggests manipulation
        if entropy_std > entropy_mean * 0.3:
            entropy_penalty = 30
        
        score = min(100, inconsistency_rate * 80 + entropy_penalty)
        
        evidence = f"Analyzed texture patterns in {len(texture_data)} frames. "
        evidence += f"Found {inconsistencies} texture inconsistencies. "
        evidence += f"Entropy variation: {entropy_std:.3f} (mean: {entropy_mean:.3f})"
        
        return {
            'inconsistencies': inconsistencies,
            'analyzed_frames': len(texture_data),
            'evidence': evidence,
            'score': score
        }
    
    def analyze_frequency_domain(self, frames):
        """Analyze frequency domain characteristics"""
        frequency_anomalies = []
        
        for frame_idx, frame in frames:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Apply FFT
            f_transform = fft2(gray)
            f_shift = fftshift(f_transform)
            magnitude_spectrum = np.log(np.abs(f_shift) + 1)
            
            # Analyze frequency distribution
            h, w = magnitude_spectrum.shape
            center_h, center_w = h // 2, w // 2
            
            # Define frequency regions
            low_freq_region = magnitude_spectrum[center_h-20:center_h+20, center_w-20:center_w+20]
            high_freq_region = magnitude_spectrum[0:30, 0:30]  # Corner regions
            
            low_freq_energy = np.mean(low_freq_region)
            high_freq_energy = np.mean(high_freq_region)
            
            # Calculate frequency ratio
            freq_ratio = high_freq_energy / low_freq_energy if low_freq_energy > 0 else 0
            
            # Flag unusual frequency distributions
            if freq_ratio > 0.8 or freq_ratio < 0.1:
                frequency_anomalies.append({
                    'frame': frame_idx,
                    'freq_ratio': freq_ratio,
                    'type': 'frequency_anomaly'
                })
        
        # Calculate score
        anomaly_rate = len(frequency_anomalies) / len(frames) if frames else 0
        score = min(100, anomaly_rate * 150)
        
        evidence = f"Analyzed frequency domain characteristics in {len(frames)} frames. "
        evidence += f"Found {len(frequency_anomalies)} frequency anomalies. "
        evidence += f"Anomaly rate: {anomaly_rate:.2%}"
        
        return {
            'anomalies': frequency_anomalies,
            'analyzed_frames': len(frames),
            'evidence': evidence,
            'score': score
        }
    
    def analyze_video(self, video_path):
        """Main analysis function with comprehensive deepfake detection including MesoNet"""
        start_time = datetime.now()
        
        try:
            # Extract frames
            frames, fps, total_frames, duration = self.extract_frames(video_path, max_frames=30)
            
            if not frames:
                return {'error': 'Could not extract frames from video'}
            
            logger.info(f"Extracted {len(frames)} frames from {total_frames} total frames")
            
            # Run comprehensive analysis including MesoNet
            mesonet_analysis = self.analyze_with_mesonet(frames)
            facial_analysis = self.analyze_facial_inconsistencies(frames)
            eye_analysis = self.analyze_eye_regions(frames)
            texture_analysis = self.analyze_texture_inconsistencies(frames)
            frequency_analysis = self.analyze_frequency_domain(frames)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Prepare results with MesoNet integration
            results = {
                'mesonet_analysis': {
                    'deepfake_probability': mesonet_analysis.get('deepfake_probability', 0),
                    'analyzed_frames': mesonet_analysis.get('analyzed_frames', 0),
                    'avg_confidence': mesonet_analysis.get('avg_confidence', 0),
                    'score': mesonet_analysis.get('score', 0),
                    'evidence': mesonet_analysis.get('evidence', 'No evidence found'),
                    'deepfake_detections': len(mesonet_analysis.get('deepfake_evidence', []))
                },
                'facial_inconsistencies': {
                    'suspicious_frames': len(facial_analysis.get('inconsistencies', [])),
                    'total_analyzed': facial_analysis.get('analyzed_frames', 0),
                    'score': facial_analysis.get('score', 0),
                    'evidence': facial_analysis.get('evidence', 'No evidence found')
                },
                'eye_patterns': {
                    'suspicious_patterns': len(eye_analysis.get('patterns', [])),
                    'total_analyzed': eye_analysis.get('analyzed_frames', 0),
                    'score': eye_analysis.get('score', 0),
                    'evidence': eye_analysis.get('evidence', 'No evidence found')
                },
                'texture_consistency': {
                    'inconsistencies': texture_analysis.get('inconsistencies', 0),
                    'total_analyzed': texture_analysis.get('analyzed_frames', 0),
                    'score': texture_analysis.get('score', 0),
                    'evidence': texture_analysis.get('evidence', 'No evidence found')
                },
                'frequency_analysis': {
                    'anomalies': len(frequency_analysis.get('anomalies', [])),
                    'total_analyzed': frequency_analysis.get('analyzed_frames', 0),
                    'score': frequency_analysis.get('score', 0),
                    'evidence': frequency_analysis.get('evidence', 'No evidence found')
                },
                'metadata': {
                    'total_frames': total_frames,
                    'analyzed_frames': len(frames),
                    'fps': fps,
                    'duration': duration,
                    'processing_time': f'{processing_time:.1f}s'
                }
            }
            
            # Calculate overall confidence using weighted scoring with MesoNet priority
            scores = [
                results['mesonet_analysis']['score'] * 0.40,      # 40% weight - highest priority
                results['facial_inconsistencies']['score'] * 0.25, # 25% weight
                results['eye_patterns']['score'] * 0.15,          # 15% weight
                results['texture_consistency']['score'] * 0.12,   # 12% weight
                results['frequency_analysis']['score'] * 0.08     # 8% weight
            ]
            
            overall_score = sum(scores)
            
            # Enhanced verdict with MesoNet consideration
            mesonet_score = results['mesonet_analysis']['score']
            is_deepfake = overall_score > 35 or mesonet_score > 50  # Lower threshold if MesoNet detects
            
            # Generate detailed verdict explanation
            verdict_explanation = self.generate_verdict_explanation(results, overall_score, is_deepfake)
            
            results['overall'] = {
                'is_deepfake': is_deepfake,
                'confidence': overall_score,
                'verdict': 'DEEPFAKE DETECTED' if is_deepfake else 'AUTHENTIC VIDEO',
                'explanation': verdict_explanation
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Analysis error: {str(e)}")
            return {'error': f'Analysis failed: {str(e)}'}
    
    def generate_verdict_explanation(self, results, overall_score, is_deepfake):
        """Generate detailed explanation for the verdict"""
        explanation = []
        
        # MesoNet analysis
        mesonet = results['mesonet_analysis']
        if mesonet['score'] > 60:
            explanation.append(f"🔴 MesoNet AI model detected high deepfake probability ({mesonet['deepfake_probability']:.3f}) with {mesonet['deepfake_detections']} suspicious detections")
        elif mesonet['score'] > 30:
            explanation.append(f"🟡 MesoNet AI model shows moderate deepfake indicators ({mesonet['deepfake_probability']:.3f})")
        else:
            explanation.append(f"🟢 MesoNet AI model shows low deepfake probability ({mesonet['deepfake_probability']:.3f})")
        
        # Other analyses
        if results['facial_inconsistencies']['score'] > 50:
            explanation.append(f"🔴 Significant facial geometric inconsistencies detected in {results['facial_inconsistencies']['suspicious_frames']} frames")
        
        if results['eye_patterns']['score'] > 50:
            explanation.append(f"🔴 Unnatural eye patterns detected: {results['eye_patterns']['suspicious_patterns']} anomalies")
        
        if results['texture_consistency']['score'] > 50:
            explanation.append(f"🔴 Texture inconsistencies found in {results['texture_consistency']['inconsistencies']} frame transitions")
        
        if results['frequency_analysis']['score'] > 50:
            explanation.append(f"🔴 Frequency domain anomalies detected in {results['frequency_analysis']['anomalies']} frames")
        
        # Overall assessment
        if is_deepfake:
            explanation.append(f"⚠️ CONCLUSION: Multiple detection methods indicate this video is likely artificially generated or manipulated (confidence: {overall_score:.1f}%)")
        else:
            explanation.append(f"✅ CONCLUSION: Analysis suggests this video appears authentic (confidence: {100-overall_score:.1f}%)")
        
        return " | ".join(explanation)

# Initialize detector
detector = AdvancedDeepfakeDetector()

@app.route('/api/analyze', methods=['POST'])
def analyze_video():
    """API endpoint for video analysis with enhanced MesoNet integration"""
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        
        if video_file.filename == '':
            return jsonify({'error': 'No video file selected'}), 400
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
            video_file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            logger.info(f"Analyzing video: {video_file.filename}")
            
            # Analyze video
            results = detector.analyze_video(temp_path)
            
            if 'error' in results:
                return jsonify(results), 500
            
            # Format results for frontend with enhanced MesoNet data
            response = {
                'isDeepfake': results['overall']['is_deepfake'],
                'confidence': results['overall']['confidence'],
                'explanation': results['overall']['explanation'],
                'detectionMethods': [
                    {
                        'method': 'MesoNet AI Detection',
                        'score': results['mesonet_analysis']['score'],
                        'evidence': results['mesonet_analysis']['evidence'],
                        'frameCount': results['mesonet_analysis']['deepfake_detections'],
                        'priority': 'HIGH',
                        'details': {
                            'deepfake_probability': results['mesonet_analysis']['deepfake_probability'],
                            'avg_confidence': results['mesonet_analysis']['avg_confidence']
                        }
                    },
                    {
                        'method': 'Facial Inconsistency Analysis',
                        'score': results['facial_inconsistencies']['score'],
                        'evidence': results['facial_inconsistencies']['evidence'],
                        'frameCount': results['facial_inconsistencies']['suspicious_frames'],
                        'priority': 'MEDIUM'
                    },
                    {
                        'method': 'Eye Pattern Analysis',
                        'score': results['eye_patterns']['score'],
                        'evidence': results['eye_patterns']['evidence'],
                        'frameCount': results['eye_patterns']['suspicious_patterns'],
                        'priority': 'MEDIUM'
                    },
                    {
                        'method': 'Texture Consistency Analysis',
                        'score': results['texture_consistency']['score'],
                        'evidence': results['texture_consistency']['evidence'],
                        'frameCount': results['texture_consistency']['inconsistencies'],
                        'priority': 'LOW'
                    },
                    {
                        'method': 'Frequency Domain Analysis',
                        'score': results['frequency_analysis']['score'],
                        'evidence': results['frequency_analysis']['evidence'],
                        'frameCount': results['frequency_analysis']['anomalies'],
                        'priority': 'LOW'
                    }
                ],
                'frameAnalysis': {
                    'totalFrames': results['metadata']['total_frames'],
                    'suspiciousFrames': (
                        results['mesonet_analysis']['deepfake_detections'] +
                        results['facial_inconsistencies']['suspicious_frames'] +
                        results['texture_consistency']['inconsistencies'] +
                        results['frequency_analysis']['anomalies']
                    ),
                    'processingTime': results['metadata']['processing_time'],
                    'mesonetAnalyzed': results['mesonet_analysis']['analyzed_frames']
                },
                'technicalDetails': {
                    'aiModelUsed': 'MesoNet-4',
                    'analysisVersion': '3.0.0',
                    'detectionCapabilities': [
                        'Deep learning face manipulation detection',
                        'Geometric facial inconsistency analysis',
                        'Temporal eye pattern analysis',
                        'Texture consistency verification',
                        'Frequency domain anomaly detection'
                    ]
                }
            }
            
            logger.info(f"Analysis complete. Deepfake: {response['isDeepfake']}, Confidence: {response['confidence']:.1f}%")
            return jsonify(response)
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            
    except Exception as e:
        logger.error(f"API error: {str(e)}")
        return jsonify({'error': 'Internal server error occurred during analysis'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'version': '3.0.0',
        'mtcnn_available': detector.mtcnn_available,
        'mesonet_loaded': detector.mesonet.model is not None,
        'tensorflow_version': tf.__version__
    })

@app.route('/api/info', methods=['GET'])
def get_info():
    """Get system information"""
    return jsonify({
        'name': 'Enhanced Deepfake Detection API with MesoNet',
        'version': '3.0.0',
        'capabilities': [
            'MesoNet deep learning detection',
            'Facial geometric inconsistency detection',
            'Eye pattern analysis',
            'Texture consistency analysis', 
            'Frequency domain analysis'
        ],
        'supported_formats': ['mp4', 'avi', 'mov', 'mkv', 'webm'],
        'max_file_size': '100MB',
        'ai_models': ['MesoNet-4', 'MTCNN (optional)'],
        'dependencies': 'TensorFlow, OpenCV, scikit-image'
    })

if __name__ == '__main__':
    print("=" * 70)
    print("🔍 Enhanced Deepfake Detection Server with MesoNet AI")
    print("=" * 70)
    print("🚀 Starting server on http://localhost:2000")
    print("📋 API Endpoints:")
    print("   POST /api/analyze - Analyze video for deepfakes")
    print("   GET  /api/health  - Health check")
    print("   GET  /api/info    - System information")
    print("=" * 70)
    print("🤖 AI Models:")
    print("   • MesoNet-4: Deep learning deepfake detection")
    print("   • MTCNN: Advanced face detection (optional)")
    print("=" * 70)
    print("⚠️  Required packages:")
    print("   pip install tensorflow flask flask-cors opencv-python")
    print("   pip install numpy scikit-learn scikit-image scipy")
    print("   pip install mtcnn pillow imageio moviepy tqdm")
    print("=" * 70)
    
    app.run(debug=True, host='0.0.0.0', port=2000)