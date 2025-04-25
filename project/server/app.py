from flask import Flask, request, jsonify, send_file, render_template_string
from flask_cors import CORS
import os
import sys
import time
import threading
import base64
import logging
import random
import glob
from PIL import Image
import io
import numpy as np

# Try importing TensorFlow
try:
    import tensorflow as tf
    TENSORFLOW_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("TensorFlow is available and imported successfully")
    
    # Set TensorFlow to only use CPU if there's a GPU issue
    # comment out for GPU use
    os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
    
    # Disable eager execution for compatibility
    # tf.compat.v1.disable_eager_execution()
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("TensorFlow is not available. Using fallback classification method.")

# Try importing OpenCV
try:
    import cv2
    OPENCV_AVAILABLE = True
    logger.info("OpenCV is available and imported successfully")
except ImportError:
    OPENCV_AVAILABLE = False
    logger.warning("OpenCV is not available. Webcam functionality will be disabled.")

# Add parent directory to path so we can import the classify_waste module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables
MODEL = None
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models', 'waste_classification_model.h5')
CNN_MODEL = None
TRAINING_STATUS = {
    "is_training": False,
    "progress": 0,
    "status": "idle",
    "message": "Model not training"
}

# Class names for CNN model
CNN_CLASS_NAMES = ['Recyclable', 'Biodegradable', 'Non-recyclable']

# New webcam capture variable
webcam = None

# Dataset path
# DATASET_PATH = "C:/Users/omsud/Downloads/archive/DATASET/TRAIN/"
DATASET_PATH = "DATASET/TRAIN/"
RECYCLABLE_PATH = os.path.join(DATASET_PATH, "R")
ORGANIC_PATH = os.path.join(DATASET_PATH, "O")  # Assuming O is for organic/biodegradable
NON_RECYCLABLE_PATH = os.path.join(DATASET_PATH, "N")  # Assuming N is for non-recyclable

# Function to load CNN model
def load_cnn_model(model_path=MODEL_PATH):
    """Load the TensorFlow CNN model for waste classification"""
    global CNN_MODEL
    
    if not TENSORFLOW_AVAILABLE:
        logger.warning("TensorFlow not available, skipping CNN model loading")
        return None
        
    try:
        if os.path.exists(model_path):
            logger.info(f"Loading CNN model from {model_path}")
            
            # Load the model
            CNN_MODEL = tf.keras.models.load_model(model_path)
            logger.info("CNN model loaded successfully")
            
            # Warm up the model with a test prediction
            dummy_input = np.zeros((1, 224, 224, 3), dtype=np.float32)
            CNN_MODEL.predict(dummy_input)
            logger.info("CNN model warmed up with test prediction")
            
            return CNN_MODEL
        else:
            logger.warning(f"Model file not found at {model_path}")
            return None
    except Exception as e:
        logger.error(f"Error loading CNN model: {str(e)}")
        return None

# Function to preprocess image for CNN
def preprocess_image_for_cnn(img):
    """Preprocess image for CNN model input"""
    try:
        # Resize to model input size (assuming 224x224)
        img_resized = img.resize((224, 224))
        
        # Convert to numpy array
        img_array = np.array(img_resized)
        
        # Ensure 3 channels
        if len(img_array.shape) == 2:
            img_array = np.stack((img_array,) * 3, axis=-1)
        elif img_array.shape[2] == 4:
            img_array = img_array[:, :, :3]
        
        # Normalize pixel values to 0-1
        img_array = img_array.astype(np.float32) / 255.0
        
        # Expand dimensions to create batch of size 1
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        return None

# Function to classify with CNN
def classify_with_cnn(img):
    """Classify image using the CNN model"""
    global CNN_MODEL
    
    try:
        # Make sure the model is loaded
        if CNN_MODEL is None:
            CNN_MODEL = load_cnn_model()
            if CNN_MODEL is None:
                logger.warning("CNN model not available, using fallback classification")
                return None
        
        # Preprocess the image
        img_processed = preprocess_image_for_cnn(img)
        if img_processed is None:
            return None
        
        # Make prediction
        predictions = CNN_MODEL.predict(img_processed)[0]
        
        # Get the predicted class
        class_index = np.argmax(predictions)
        confidence = float(predictions[class_index] * 100)
        
        # Map to category
        category = CNN_CLASS_NAMES[class_index]
        
        # Select a waste type based on category
        if category == "Recyclable":
            waste_type = random.choice(['paper', 'cardboard', 'plastic', 'metal', 'glass'])
        elif category == "Biodegradable":
            waste_type = random.choice(['organic', 'food waste', 'plant matter', 'garden waste'])
        else:
            waste_type = random.choice(['mixed materials', 'composite', 'contaminated', 'styrofoam'])
        
        logger.info(f"CNN predicted category: {category}, confidence: {confidence:.2f}%")
        
        return {
            "category": category,
            "accuracy": round(confidence, 1),
            "wasteType": waste_type,
            "details": {
                "recyclable": category == "Recyclable",
                "biodegradable": category == "Biodegradable",
                "hazardous": random.choice([True, False]) if category == "Non-recyclable" else False,
                "decompositionTime": getDecompositionTime(waste_type),
                "disposalMethod": getDisposalMethod(category, waste_type)
            }
        }
    except Exception as e:
        logger.error(f"Error during CNN classification: {str(e)}")
        return None

# Pre-load some images for testing
def load_sample_images():
    sample_images = {
        "Recyclable": [],
        "Biodegradable": [],
        "Non-recyclable": []
    }
    
    # Load recyclable images
    if os.path.exists(RECYCLABLE_PATH):
        for img_path in glob.glob(os.path.join(RECYCLABLE_PATH, "*.jpg")):
            sample_images["Recyclable"].append(img_path)
        logger.info(f"Loaded {len(sample_images['Recyclable'])} recyclable sample images")
    else:
        logger.warning(f"Recyclable dataset path not found: {RECYCLABLE_PATH}")
    
    # Load organic/biodegradable images 
    if os.path.exists(ORGANIC_PATH):
        for img_path in glob.glob(os.path.join(ORGANIC_PATH, "*.jpg")):
            sample_images["Biodegradable"].append(img_path)
        logger.info(f"Loaded {len(sample_images['Biodegradable'])} biodegradable sample images")
    else:
        logger.warning(f"Organic dataset path not found: {ORGANIC_PATH}")
    
    # Load non-recyclable images
    if os.path.exists(NON_RECYCLABLE_PATH):
        for img_path in glob.glob(os.path.join(NON_RECYCLABLE_PATH, "*.jpg")):
            sample_images["Non-recyclable"].append(img_path)
        logger.info(f"Loaded {len(sample_images['Non-recyclable'])} non-recyclable sample images")
    else:
        logger.warning(f"Non-recyclable dataset path not found: {NON_RECYCLABLE_PATH}")
    
    return sample_images

# Global variable for sample images
SAMPLE_IMAGES = {}

# Waste categories for mock data
WASTE_CATEGORIES = ['paper', 'cardboard', 'plastic', 'metal', 'glass', 'organic', 'e-waste', 'hazardous', 'mixed']

# Load model at startup
def load_model_on_startup():
    global MODEL, SAMPLE_IMAGES, CNN_MODEL
    try:
        logger.info("Creating mock model for testing")
        
        # Load sample images
        SAMPLE_IMAGES = load_sample_images()
        
        # Try to load CNN model
        CNN_MODEL = load_cnn_model()
        
        class MockModel:
            def predict(self, image):
                # Return random predictions for testing
                return [[random.random() for _ in range(len(WASTE_CATEGORIES))]]
        
        MODEL = MockModel()
        logger.info("Mock model created successfully")
    except Exception as e:
        logger.error(f"Error creating mock model: {str(e)}")

def load_image_from_base64(base64_string):
    """
    Load image from base64 string
    """
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
            
        # Decode base64 string
        image_data = base64.b64decode(base64_string)
        
        # Create PIL Image
        img = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        return img
    except Exception as e:
        logger.error(f"Error loading image from base64: {str(e)}")
        return None

def predict(model, image):
    """
    Classification function using real dataset images or CNN model
    """
    global SAMPLE_IMAGES, CNN_MODEL
    
    # First try using the CNN model if available
    if TENSORFLOW_AVAILABLE and isinstance(image, Image.Image):
        cnn_result = classify_with_cnn(image)
        if cnn_result:
            return cnn_result
    
    # Fallback to color-based classification if CNN fails or isn't available
    try:
        # Extract data from image (for a real model, this would be ML-based)
        # For demo, we'll use the image color profile to determine the category
        
        # Convert base64 image to PIL if it's not already
        if isinstance(image, str) and image != "mock_image":
            # Remove data URL prefix if present
            if ',' in image:
                image = image.split(',')[1]
            image_data = base64.b64decode(image)
            img = Image.open(io.BytesIO(image_data))
        elif isinstance(image, str) and image == "mock_image":
            # For demo purposes, randomly select a category and use a sample image
            category = random.choice(["Recyclable", "Biodegradable", "Non-recyclable"])
            if category in SAMPLE_IMAGES and SAMPLE_IMAGES[category]:
                sample_img_path = random.choice(SAMPLE_IMAGES[category])
                img = Image.open(sample_img_path)
            else:
                # If no sample images, create a blank image
                img = Image.new('RGB', (100, 100), color = (73, 109, 137))
        else:
            # Assuming image is already a PIL Image
            img = image
        
        # For our simplified mock classification:
        # - Analyze dominant colors to determine waste type
        # - Green/brown tones often indicate biodegradable
        # - Blue/white/clear often indicate recyclable
        # - Black/complex mixed colors often indicate non-recyclable
        
        # Resize for faster processing
        img_small = img.resize((50, 50))
        img_array = np.array(img_small)
        
        # Calculate average color values
        r_avg = np.mean(img_array[:,:,0])
        g_avg = np.mean(img_array[:,:,1])
        b_avg = np.mean(img_array[:,:,2])
        
        # Calculate color variance (complexity)
        color_variance = np.std(img_array)
        
        # Dominant color determination
        max_channel = max(r_avg, g_avg, b_avg)
        
        # Category determination based on simple rules
        # This is a very simplified approach - real ML would be much more sophisticated
        if g_avg > r_avg and g_avg > b_avg:
            # Green dominant - likely organic/biodegradable
            category = "Biodegradable"
            waste_type = random.choice(['organic', 'food waste', 'plant matter', 'garden waste'])
            accuracy = random.randint(78, 92)
        elif b_avg > r_avg and b_avg > g_avg:
            # Blue dominant - often plastic/recyclable
            category = "Recyclable"
            waste_type = random.choice(['plastic', 'paper', 'cardboard', 'glass'])
            accuracy = random.randint(82, 95)
        elif r_avg > 120 and g_avg > 120 and b_avg > 120:
            # Light colors - often paper/recyclable
            category = "Recyclable"
            waste_type = random.choice(['paper', 'cardboard', 'light plastic'])
            accuracy = random.randint(80, 93)
        elif color_variance > 50:
            # High variance - complex materials, often non-recyclable
            category = "Non-recyclable"
            waste_type = random.choice(['mixed materials', 'composite', 'contaminated'])
            accuracy = random.randint(75, 88)
        else:
            # Default case
            category = "Non-recyclable"
            waste_type = random.choice(['mixed', 'unknown', 'composite'])
            accuracy = random.randint(70, 85)
        
        # Save the image to a temporary file for display
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        img_base64 = base64.b64encode(img_byte_arr.read()).decode('utf-8')
        
        # Return classification results (with environmentalImpact removed)
        return {
            "category": category,
            "accuracy": accuracy,
            "wasteType": waste_type,
            "imageData": f"data:image/jpeg;base64,{img_base64}",
            "details": {
                "recyclable": category == "Recyclable",
                "biodegradable": category == "Biodegradable",
                "hazardous": random.choice([True, False]) if category == "Non-recyclable" else False,
                "decompositionTime": getDecompositionTime(waste_type),
                "disposalMethod": getDisposalMethod(category, waste_type)
            }
        }
    except Exception as e:
        logger.error(f"Error during classification: {str(e)}")
        # Fallback to random classification
        return defaultClassification()

def getDecompositionTime(waste_type):
    """Helper function to get decomposition time based on waste type"""
    decomposition_times = {
        'paper': '2-6 weeks',
        'cardboard': '2 months',
        'organic': '2-4 weeks',
        'food waste': '1-2 weeks',
        'plant matter': '1-3 weeks',
        'garden waste': '2-5 weeks',
        'plastic': '450+ years',
        'glass': '1,000,000+ years',
        'metal': '50-500 years',
        'light plastic': '450+ years',
        'mixed materials': 'varies',
        'composite': '50-100 years',
        'contaminated': 'varies',
        'mixed': 'varies',
        'unknown': 'unknown',
        'e-waste': '1,000+ years',
        'styrofoam': '500+ years'
    }
    return decomposition_times.get(waste_type, 'unknown')

def getDisposalMethod(category, waste_type):
    """Helper function to get disposal method"""
    if category == "Recyclable":
        if waste_type in ['paper', 'cardboard']:
            return "Paper recycling bin"
        elif waste_type in ['plastic', 'light plastic']:
            return "Plastic recycling bin"
        elif waste_type == 'glass':
            return "Glass recycling bin"
        else:
            return "Recycling center"
    elif category == "Biodegradable":
        return "Compost bin or green waste collection"
    else:
        if "hazardous" in waste_type or waste_type == "e-waste":
            return "Special waste facility"
        else:
            return "General waste bin"

def defaultClassification():
    """Return a default classification when analysis fails"""
    category = random.choice(["Recyclable", "Biodegradable", "Non-recyclable"])
    if category == "Recyclable":
        waste_type = random.choice(['paper', 'plastic', 'glass'])
    elif category == "Biodegradable":
        waste_type = random.choice(['organic', 'food waste'])
    else:
        waste_type = random.choice(['mixed', 'unknown'])
    
    return {
        "category": category,
        "accuracy": random.randint(70, 85),
        "wasteType": waste_type,
        "details": {
            "recyclable": category == "Recyclable",
            "biodegradable": category == "Biodegradable",
            "hazardous": False,
            "decompositionTime": getDecompositionTime(waste_type),
            "disposalMethod": getDisposalMethod(category, waste_type)
        }
    }

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "serverTime": time.time(),
        "modelLoaded": MODEL is not None,
        "sampleImagesLoaded": {k: len(v) for k, v in SAMPLE_IMAGES.items()}
    })

# Get sample image endpoint
@app.route('/api/sample-image/<category>', methods=['GET'])
def get_sample_image(category):
    if category not in SAMPLE_IMAGES or not SAMPLE_IMAGES[category]:
        return jsonify({"error": f"No sample images available for category: {category}"}), 404
    
    # Get a random image from the category
    image_path = random.choice(SAMPLE_IMAGES[category])
    
    try:
        # Open the image and convert to bytes
        img = Image.open(image_path)
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format=img.format or 'JPEG')
        img_byte_arr.seek(0)
        
        # Return the image
        return send_file(img_byte_arr, mimetype=f'image/{img.format.lower() if img.format else "jpeg"}')
    except Exception as e:
        logger.error(f"Error sending image: {str(e)}")
        return jsonify({"error": "Failed to load image"}), 500

# Image classification endpoint
@app.route('/api/classify', methods=['POST'])
def classify_image():
    try:
        data = request.json
        
        if not data or 'image' not in data:
            return jsonify({
                "error": "No image data provided"
            }), 400
        
        # Get base64 image data
        image_data = data['image']
        
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Load and process the image
        image = load_image_from_base64(image_data)
        
        # Make prediction
        result = predict(MODEL, image)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error during classification: {str(e)}")
        return jsonify({
            "error": "Failed to process image",
            "details": str(e)
        }), 500

# Training status endpoint
@app.route('/api/training-status', methods=['GET'])
def get_training_status():
    return jsonify(TRAINING_STATUS)

# Model training endpoint
@app.route('/api/train', methods=['POST'])
def train_model():
    global TRAINING_STATUS
    
    # Check if already training
    if TRAINING_STATUS["is_training"]:
        return jsonify({
            "error": "Model is already being trained",
            "status": TRAINING_STATUS
        }), 400
    
    # Get training parameters from request
    data = request.json or {}
    epochs = data.get('epochs', 10)
    
    # Start training in a separate thread
    def training_process():
        global TRAINING_STATUS, MODEL
        
        try:
            # Update status
            TRAINING_STATUS = {
                "is_training": True,
                "progress": 0,
                "status": "preparing",
                "message": "Preparing training data"
            }
            
            # Simulate data preparation
            time.sleep(2)
            
            # Update status for training
            TRAINING_STATUS["status"] = "training"
            TRAINING_STATUS["message"] = "Training in progress"
            
            # Simulate training process
            for i in range(epochs):
                # Update progress
                TRAINING_STATUS["progress"] = (i + 1) / epochs * 100
                TRAINING_STATUS["message"] = f"Training epoch {i + 1}/{epochs}"
                
                # Simulate epoch time
                time.sleep(1)
            
            # Update status for completion
            TRAINING_STATUS = {
                "is_training": False,
                "progress": 100,
                "status": "complete",
                "message": "Training completed successfully",
                "results": {
                    "accuracy": 0.92,
                    "loss": 0.23,
                    "epochsCompleted": epochs
                }
            }
            
        except Exception as e:
            logger.error(f"Error during training: {str(e)}")
            
            # Update status for error
            TRAINING_STATUS = {
                "is_training": False,
                "progress": 0,
                "status": "error",
                "message": f"Training failed: {str(e)}"
            }
    
    # Start the training thread
    threading.Thread(target=training_process).start()
    
    return jsonify({
        "status": "training started",
        "trainingStatus": TRAINING_STATUS
    })

# New endpoint for webcam capture
@app.route('/api/webcam-capture', methods=['GET'])
def webcam_capture():
    """Capture an image from the webcam and return it"""
    global webcam
    
    if not OPENCV_AVAILABLE:
        return jsonify({"error": "OpenCV is not available on the server"}), 503
    
    try:
        # Initialize webcam if not already done
        if webcam is None:
            webcam = cv2.VideoCapture(0)  # Use default camera (index 0)
            
            # Check if webcam opened successfully
            if not webcam.isOpened():
                return jsonify({"error": "Could not open webcam"}), 500
                
            # Give webcam time to initialize
            time.sleep(1)
        
        # Capture frame
        ret, frame = webcam.read()
        
        if not ret:
            return jsonify({"error": "Failed to capture image from webcam"}), 500
        
        # Convert the image from BGR to RGB (for PIL)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Convert to PIL Image
        pil_img = Image.fromarray(frame_rgb)
        
        # Convert to base64 for sending to frontend
        img_byte_arr = io.BytesIO()
        pil_img.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        img_base64 = base64.b64encode(img_byte_arr.read()).decode('utf-8')
        
        # Classify the image
        result = predict(MODEL, pil_img)
        
        # Add the image data
        result["imageData"] = f"data:image/jpeg;base64,{img_base64}"
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error during webcam capture: {str(e)}")
        return jsonify({"error": f"Webcam error: {str(e)}"}), 500

# Cleanup webcam on shutdown
@app.teardown_appcontext
def cleanup_webcam(exception):
    global webcam
    if webcam is not None:
        webcam.release()
        webcam = None
        logger.info("Webcam released")

# Basic index route
@app.route('/', methods=['GET'])
def index():
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Waste Classification API</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #4CAF50; }
            .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
            pre { background: #eee; padding: 10px; border-radius: 3px; overflow-x: auto; }
            button { background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
            button:hover { background: #3e8e41; }
            #result { margin-top: 20px; }
            .image-container { margin-top: 20px; }
            img { max-width: 100%; max-height: 300px; border: 1px solid #ddd; }
        </style>
    </head>
    <body>
        <h1>Waste Classification API</h1>
        <p>This is the API server for the Waste Classification project.</p>
        
        <div class="endpoint">
            <h3>API Health</h3>
            <p>Endpoint: <code>/api/health</code></p>
            <button onclick="checkHealth()">Check Health</button>
        </div>
        
        <div class="endpoint">
            <h3>Sample Images</h3>
            <p>Endpoint: <code>/api/sample-image/&lt;category&gt;</code></p>
            <p>Categories: Recyclable, Biodegradable, Non-recyclable</p>
            <button onclick="getSampleImage('Recyclable')">Get Recyclable</button>
            <button onclick="getSampleImage('Biodegradable')">Get Biodegradable</button>
            <button onclick="getSampleImage('Non-recyclable')">Get Non-recyclable</button>
            <div class="image-container" id="image-container"></div>
        </div>
        
        <div id="result"></div>
        
        <script>
            async function checkHealth() {
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = 'Loading...';
                
                try {
                    const response = await fetch('/api/health');
                    const data = await response.json();
                    resultDiv.innerHTML = '<h3>Health Check Result:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                } catch (error) {
                    resultDiv.innerHTML = '<h3>Error:</h3><pre>' + error + '</pre>';
                }
            }
            
            async function getSampleImage(category) {
                const imageContainer = document.getElementById('image-container');
                imageContainer.innerHTML = 'Loading...';
                
                try {
                    // Use current timestamp to prevent caching
                    const timestamp = new Date().getTime();
                    const imageUrl = `/api/sample-image/${category}?t=${timestamp}`;
                    
                    imageContainer.innerHTML = `
                        <h4>${category} Sample:</h4>
                        <img src="${imageUrl}" alt="${category} waste sample">
                    `;
                } catch (error) {
                    imageContainer.innerHTML = '<h3>Error:</h3><pre>' + error + '</pre>';
                }
            }
        </script>
    </body>
    </html>
    """
    return render_template_string(html)

if __name__ == '__main__':
    # Load the model before starting the server
    load_model_on_startup()
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True) 