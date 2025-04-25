/**
 * Model Integration Utilities
 * 
 * This file contains utilities for integrating the waste classification model with the React frontend.
 * It includes functions for sending images to the model API and processing the results.
 */

import axios from 'axios';
import { Classification } from '../context/WasteDataContext';

// Configuration for the classification API
const API_CONFIG = {
  baseUrl: process.env.REACT_APP_MODEL_API_URL || 'http://localhost:5000',
  endpoints: {
    classify: '/api/classify',
    train: '/api/train',
  }
};

/**
 * Send an image to the classification API for prediction
 * @param imageData Base64 encoded image data
 * @returns Classification details
 */
export const classifyImage = async (imageData: string): Promise<Classification> => {
  try {
    const response = await axios.post(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.classify}`, {
      image: imageData
    });
    
    // Parse the response data
    const result = response.data;
    
    // Create a classification object that matches our app's data structure
    const classification: Classification = {
      id: generateUniqueId(),
      timestamp: new Date().toISOString(),
      imageData: imageData,
      category: result.category,
      accuracy: result.accuracy,
      wasteType: result.wasteType,
      recyclable: result.details.recyclable,
      biodegradable: result.details.biodegradable,
      hazardous: result.details.hazardous || false,
      decompositionTime: result.details.decompositionTime,
      environmentalImpact: result.details.environmentalImpact,
      disposalMethod: result.details.disposalMethod,
      
      // Calculate environmental metrics based on waste type
      ecoImpact: calculateEcoImpact(result.category),
    };
    
    return classification;
    
  } catch (error) {
    console.error('Error classifying image:', error);
    throw new Error('Failed to classify the image. Please try again.');
  }
};

/**
 * Send labeled images to the API for model training
 * @param trainingData Array of labeled images with their classifications
 * @returns Training job status
 */
export const trainModel = async (trainingData: { imageData: string, label: string }[]): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await axios.post(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.train}`, {
      trainingData
    });
    
    return {
      success: true,
      message: response.data.message || 'Training started successfully'
    };
  } catch (error) {
    console.error('Error training model:', error);
    return {
      success: false,
      message: 'Failed to start model training. Please try again.'
    };
  }
};

/**
 * Generate a unique ID for classifications
 * @returns Unique ID string
 */
const generateUniqueId = (): string => {
  return `waste-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Calculate environmental impact metrics based on waste category
 * @param category Waste category
 * @returns Environmental impact metrics
 */
const calculateEcoImpact = (category: string): { 
  co2Saved: number; 
  wasteReduced: number;
  waterSaved: number;
  energySaved: number;
} => {
  // These are simplified calculations for demonstration purposes
  // In a real application, these would be based on actual environmental data
  
  // Base values that could be adjusted based on waste type
  const baseValues = {
    co2Saved: 0,  // kg of CO2
    wasteReduced: 1, // kg of waste
    waterSaved: 0,  // liters
    energySaved: 0,  // kWh
  };
  
  switch (category) {
    case 'Recyclable':
      // Recycling reduces CO2 emissions and saves energy
      return {
        co2Saved: baseValues.wasteReduced * 2.5,  // Each kg of recycled waste saves about 2.5kg of CO2
        wasteReduced: baseValues.wasteReduced,
        waterSaved: baseValues.wasteReduced * 13,  // Each kg of recycled waste saves about 13L of water
        energySaved: baseValues.wasteReduced * 5,  // Each kg of recycled waste saves about 5kWh of energy
      };
      
    case 'Biodegradable':
      // Composting biodegradable waste reduces methane emissions and creates nutrient-rich soil
      return {
        co2Saved: baseValues.wasteReduced * 0.5,  // Composting has a lower but still positive CO2 impact
        wasteReduced: baseValues.wasteReduced,
        waterSaved: baseValues.wasteReduced * 0.5,  // Some water saving from not having to process in landfill
        energySaved: baseValues.wasteReduced * 0.2,  // Small energy savings
      };
      
    case 'Non-recyclable':
      // Non-recyclable waste still needs proper disposal, but has less environmental benefit
      return {
        co2Saved: 0,  // No CO2 is saved for non-recyclable waste
        wasteReduced: 0,  // This waste still goes to landfill
        waterSaved: 0,
        energySaved: 0,
      };
      
    default:
      return baseValues;
  }
};

/**
 * Check if the model API is available
 * @returns Boolean indicating if the API is available
 */
export const checkModelApiAvailability = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_CONFIG.baseUrl}/api/health`);
    return true;
  } catch (error) {
    console.warn('Model API is not available:', error);
    return false;
  }
};

/**
 * Get the training status from the API
 * @returns Training status object
 */
export const getTrainingStatus = async (): Promise<{ 
  isTraining: boolean; 
  progress: number;
  message: string;
}> => {
  try {
    const response = await axios.get(`${API_CONFIG.baseUrl}/api/training-status`);
    return response.data;
  } catch (error) {
    console.error('Error getting training status:', error);
    return {
      isTraining: false,
      progress: 0,
      message: 'Failed to get training status'
    };
  }
}; 