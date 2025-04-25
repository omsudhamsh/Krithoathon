#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Waste Classification Prediction Script
--------------------------------------
This script loads a trained waste classification model and makes predictions on new images.
It can be used as a command-line tool or integrated with other applications.
"""

import os
import sys
import json
import argparse
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import matplotlib.pyplot as plt
import base64
from io import BytesIO
from PIL import Image
import tensorflow as tf
import io

# Constants
IMAGE_SIZE = (224, 224)
CLASS_NAMES = ['Recyclable', 'Biodegradable', 'Non-recyclable']

# Define waste categories
WASTE_CATEGORIES = [
    'paper', 
    'cardboard', 
    'plastic', 
    'metal', 
    'glass', 
    'organic', 
    'e-waste', 
    'hazardous', 
    'mixed'
]

# Environmental impact data (CO2 saved in kg per kg of material recycled)
ENVIRONMENTAL_IMPACT = {
    'paper': 0.9,
    'cardboard': 1.1,
    'plastic': 1.5,
    'metal': 4.0,
    'glass': 0.3,
    'organic': 0.5,
    'e-waste': 20.0,
    'hazardous': -2.0,  # Negative impact if not properly disposed
    'mixed': 0.1
}

def load_image(img_path):
    """Load and preprocess an image for prediction"""
    img = image.load_img(img_path, target_size=IMAGE_SIZE)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array, img

def load_image_from_base64(base64_string):
    """
    Load an image from a base64 string
    
    Args:
        base64_string (str): Base64 encoded image
        
    Returns:
        PIL.Image: Decoded image
    """
    # Decode base64 string
    image_data = base64.b64decode(base64_string)
    
    # Create a PIL Image
    image = Image.open(io.BytesIO(image_data))
    
    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    return image

def predict(model, image):
    """
    Make a prediction using the waste classification model
    
    Args:
        model: TensorFlow model
        image (PIL.Image): Input image
        
    Returns:
        dict: Prediction results
    """
    # Preprocess the image
    processed_image = preprocess_image(image)
    
    # Make prediction
    predictions = model.predict(processed_image)[0]
    
    # Get the top 3 predictions
    top_indices = predictions.argsort()[-3:][::-1]
    top_predictions = [
        {
            'category': WASTE_CATEGORIES[idx],
            'confidence': float(predictions[idx]),
            'ecoImpact': ENVIRONMENTAL_IMPACT[WASTE_CATEGORIES[idx]]
        }
        for idx in top_indices
    ]
    
    # Overall result
    result = {
        'wastetype': WASTE_CATEGORIES[predictions.argmax()],
        'confidence': float(predictions.max()),
        'ecoImpact': ENVIRONMENTAL_IMPACT[WASTE_CATEGORIES[predictions.argmax()]],
        'alternatives': top_predictions[1:],  # Excluding the top prediction
        'timestamp': tf.timestamp().numpy().item()
    }
    
    return result

def visualize_prediction(img, result, output_path=None):
    """Visualize the prediction results"""
    # Create figure
    plt.figure(figsize=(10, 6))
    
    # Display image
    plt.subplot(1, 2, 1)
    plt.imshow(img)
    plt.title('Input Image')
    plt.axis('off')
    
    # Display prediction results
    plt.subplot(1, 2, 2)
    
    # Create bar chart
    categories = list(result['predictions'].keys())
    values = list(result['predictions'].values())
    colors = ['green' if cat == result['category'] else 'gray' for cat in categories]
    
    bars = plt.bar(categories, values, color=colors)
    plt.title('Classification Results')
    plt.ylabel('Confidence (%)')
    plt.ylim(0, 100)
    
    # Add percentage labels on top of bars
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height + 1,
                 f'{height:.1f}%', ha='center', va='bottom')
    
    plt.tight_layout()
    
    # Save or show the visualization
    if output_path:
        plt.savefig(output_path)
        print(f"Visualization saved to {output_path}")
    else:
        plt.show()

def main():
    """Main function to load model and make predictions"""
    parser = argparse.ArgumentParser(description='Classify waste images using a trained model')
    parser.add_argument('--model', type=str, required=True, help='Path to the trained model (.h5 file)')
    parser.add_argument('--image', type=str, help='Path to the image file to classify')
    parser.add_argument('--base64', type=str, help='Base64 encoded image data to classify')
    parser.add_argument('--output', type=str, help='Path to save the output visualization')
    parser.add_argument('--json', action='store_true', help='Output results as JSON')
    
    args = parser.parse_args()
    
    # Check if either image path or base64 data is provided
    if not args.image and not args.base64:
        print("Error: Either --image or --base64 must be provided")
        sys.exit(1)
    
    # Load the model
    try:
        model = load_model(args.model)
        print(f"Model loaded successfully from {args.model}")
    except Exception as e:
        print(f"Error loading model: {e}")
        sys.exit(1)
    
    # Process the image
    if args.image:
        try:
            img_array, img = load_image(args.image)
            print(f"Image loaded successfully from {args.image}")
        except Exception as e:
            print(f"Error loading image: {e}")
            sys.exit(1)
    else:  # Use base64 data
        try:
            img = load_image_from_base64(args.base64)
            print("Image loaded successfully from base64 data")
        except Exception as e:
            print(f"Error loading image from base64: {e}")
            sys.exit(1)
    
    # Make prediction
    result = predict(model, img)
    
    # Output results
    if args.json:
        print(json.dumps(result, indent=4))
    else:
        print(f"Predicted category: {result['wastetype']}")
        print(f"Confidence: {result['confidence']:.2f}")
        print(f"Eco-impact: {result['ecoImpact']:.2f} kg CO2e")
    
    # Visualize if not in JSON mode
    if not args.json:
        visualize_prediction(img, result, args.output)

if __name__ == "__main__":
    main() 