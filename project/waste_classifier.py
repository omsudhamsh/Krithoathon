#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Waste Classification Model
--------------------------
A CNN-based model for classifying waste images into recyclable, biodegradable, and non-recyclable categories.
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import argparse

# Constants
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 20
NUM_CLASSES = 3  # Recyclable, Biodegradable, Non-recyclable
CLASS_NAMES = ['Recyclable', 'Biodegradable', 'Non-recyclable']

def build_model():
    """Build and return the CNN model"""
    # Use MobileNetV2 as base model (efficient and works well on mobile devices)
    base_model = MobileNetV2(
        input_shape=(*IMAGE_SIZE, 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze the base model layers
    base_model.trainable = False
    
    # Build model on top
    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.2),  # Reduce overfitting
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    
    # Compile the model
    model.compile(
        optimizer=optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def prepare_data(train_dir, test_dir):
    """Prepare data generators for training and testing"""
    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    # Only rescaling for validation/test data
    test_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input
    )
    
    # Training generator
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )
    
    # Test generator
    test_generator = test_datagen.flow_from_directory(
        test_dir,
        target_size=IMAGE_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    return train_generator, test_generator

def train_model(model, train_generator, test_generator, output_dir):
    """Train the model and save it"""
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Callbacks
    checkpoint = ModelCheckpoint(
        os.path.join(output_dir, 'waste_classifier_model.h5'),
        save_best_only=True,
        monitor='val_accuracy'
    )
    
    early_stopping = EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True
    )
    
    # Train the model
    history = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=test_generator,
        callbacks=[checkpoint, early_stopping]
    )
    
    # Save model architecture to JSON
    model_json = model.to_json()
    with open(os.path.join(output_dir, 'model_architecture.json'), 'w') as json_file:
        json_file.write(model_json)
    
    # Plot and save training history
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'])
    plt.plot(history.history['val_accuracy'])
    plt.title('Model Accuracy')
    plt.ylabel('Accuracy')
    plt.xlabel('Epoch')
    plt.legend(['Train', 'Validation'], loc='upper left')
    
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'])
    plt.plot(history.history['val_loss'])
    plt.title('Model Loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend(['Train', 'Validation'], loc='upper left')
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'training_history.png'))
    
    return history, model

def evaluate_model(model, test_generator, output_dir):
    """Evaluate the model and generate metrics"""
    # Predict classes
    predictions = model.predict(test_generator)
    y_pred = np.argmax(predictions, axis=1)
    
    # Get true labels
    y_true = test_generator.classes
    
    # Classification report
    report = classification_report(y_true, y_pred, target_names=CLASS_NAMES, output_dict=True)
    
    # Save report as JSON
    with open(os.path.join(output_dir, 'classification_report.json'), 'w') as f:
        json.dump(report, f, indent=4)
    
    # Create confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    
    # Plot confusion matrix
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'confusion_matrix.png'))
    
    # Overall metrics
    accuracy = report['accuracy']
    macro_precision = report['macro avg']['precision']
    macro_recall = report['macro avg']['recall']
    macro_f1 = report['macro avg']['f1-score']
    
    print("\nModel Evaluation Metrics:")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {macro_precision:.4f}")
    print(f"Recall: {macro_recall:.4f}")
    print(f"F1 Score: {macro_f1:.4f}")
    
    # Save metrics summary
    metrics = {
        'accuracy': float(accuracy),
        'precision': float(macro_precision),
        'recall': float(macro_recall),
        'f1_score': float(macro_f1),
    }
    
    with open(os.path.join(output_dir, 'metrics.json'), 'w') as f:
        json.dump(metrics, f, indent=4)
    
    return metrics

def save_model_for_web(model, output_dir):
    """Convert the model to TensorFlow.js format for web integration"""
    try:
        # Install tensorflowjs if needed via pip during runtime
        import subprocess
        subprocess.check_call(['pip', 'install', 'tensorflowjs'])
        import tensorflowjs as tfjs
        
        tfjs_dir = os.path.join(output_dir, 'web_model')
        os.makedirs(tfjs_dir, exist_ok=True)
        
        tfjs.converters.save_keras_model(model, tfjs_dir)
        print(f"Model saved in TensorFlow.js format at: {tfjs_dir}")
    except Exception as e:
        print(f"Warning: Could not convert model to TensorFlow.js format. Error: {e}")
        print("You can manually convert the model later using the tensorflowjs_converter command.")

def main():
    """Main function to train and evaluate the model"""
    parser = argparse.ArgumentParser(description='Train a waste classification model')
    parser.add_argument('--train_dir', type=str, required=True, help='Directory containing training data')
    parser.add_argument('--test_dir', type=str, required=True, help='Directory containing test data')
    parser.add_argument('--output_dir', type=str, default='./model_output', help='Directory to save model and results')
    
    args = parser.parse_args()
    
    print("Preparing data...")
    train_generator, test_generator = prepare_data(args.train_dir, args.test_dir)
    
    print("Building model...")
    model = build_model()
    
    print("Training model...")
    history, model = train_model(model, train_generator, test_generator, args.output_dir)
    
    print("Evaluating model...")
    metrics = evaluate_model(model, test_generator, args.output_dir)
    
    print("Preparing model for web...")
    save_model_for_web(model, args.output_dir)
    
    print(f"\nTraining completed successfully! All outputs saved to: {args.output_dir}")

if __name__ == "__main__":
    main() 