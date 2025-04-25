import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, Upload } from 'lucide-react';
import axios from 'axios';
import { useWasteData } from '../../context/WasteDataContext';

// API base URL
const API_BASE_URL = 'http://localhost:5000';

const WebcamCapture: React.FC = () => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const { addClassification } = useWasteData();
  
  // Check server status on component mount
  useEffect(() => {
    checkServerStatus();
  }, []);
  
  const checkServerStatus = async () => {
    try {
      await axios.get(`${API_BASE_URL}/api/health`);
      setError(null);
    } catch (err) {
      setError("Could not connect to the server. Make sure the Flask server is running.");
    }
  };
  
  const captureFromWebcam = async () => {
    setIsCapturing(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/webcam-capture`);
      
      // The response already contains the classification result and image data
      const result = response.data;
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setImageData(result.imageData);
      setClassificationResult(result);
      
      // Add to recent classifications
      addClassification({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        imageUrl: result.imageData || '',
        category: result.category,
        accuracy: result.accuracy,
        wasteType: result.wasteType
      });
      
    } catch (error: any) {
      console.error("Webcam capture failed:", error);
      
      // Try to provide a more specific error message
      let errorMessage = "Failed to access webcam. ";
      
      if (error.response) {
        // The server responded with an error status
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage += "Server returned an error: " + error.response.status;
        }
      } else if (error.message && error.message.includes("OpenCV")) {
        errorMessage = "OpenCV is not available on the server. Please install OpenCV to use webcam functionality.";
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage += "Please make sure your camera is connected and you've granted permission.";
      }
      
      setError(errorMessage);
    } finally {
      setIsCapturing(false);
    }
  };
  
  // Fallback to use a sample image
  const useSampleImage = async (category: string) => {
    setIsCapturing(true);
    setError(null);
    
    try {
      // Use timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_BASE_URL}/api/sample-image/${category}?t=${timestamp}`, {
        responseType: 'blob'
      });
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(response.data);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        // Now classify this sample image
        const classifyResponse = await axios.post(`${API_BASE_URL}/api/classify`, {
          image: base64data
        });
        
        setImageData(base64data);
        setClassificationResult(classifyResponse.data);
        
        // Add to recent classifications
        addClassification({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          imageUrl: base64data,
          category: classifyResponse.data.category,
          accuracy: classifyResponse.data.accuracy,
          wasteType: classifyResponse.data.wasteType
        });
        
        setIsCapturing(false);
      };
    } catch (error) {
      console.error("Sample image error:", error);
      setError("Failed to load sample image. Please try again.");
      setIsCapturing(false);
    }
  };
  
  const resetCapture = () => {
    setImageData(null);
    setClassificationResult(null);
    setError(null);
  };
  
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'recyclable':
        return 'bg-green-100 text-green-800';
      case 'biodegradable':
        return 'bg-yellow-100 text-yellow-800';
      case 'non-recyclable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Live Camera Classification</h2>
        <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
          <Camera size={14} />
          <span>Camera Feed</span>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 flex items-start">
          <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">{error}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button 
                onClick={() => useSampleImage('Recyclable')}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Use Sample Recyclable
              </button>
              <button 
                onClick={() => useSampleImage('Biodegradable')}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
              >
                Use Sample Biodegradable
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {imageData ? (
          <div>
            <div className="relative h-48 bg-gray-100 rounded-md overflow-hidden">
              <img 
                src={imageData} 
                alt="Webcam capture" 
                className="w-full h-full object-contain" 
              />
            </div>
            
            {classificationResult && (
              <div className="mt-3 bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Classification Result:</p>
                  <span 
                    className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(classificationResult.category)}`}
                  >
                    {classificationResult.category}
                  </span>
                </div>
                
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Confidence:</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[150px]">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${classificationResult.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-700">{classificationResult.accuracy}%</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    Waste Type: {classificationResult.wasteType}
                  </p>
                </div>
              </div>
            )}
            
            <button
              onClick={resetCapture}
              className="w-full mt-3 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw size={16} className="mr-1" />
              Capture Again
            </button>
          </div>
        ) : (
          <div>
            <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center">
              <div className="text-center">
                <Camera size={40} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Click the button below to capture from your camera
                </p>
              </div>
            </div>
            
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                onClick={captureFromWebcam}
                disabled={isCapturing}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isCapturing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isCapturing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera size={16} className="mr-1" />
                    Capture and Classify
                  </>
                )}
              </button>
              
              <button
                onClick={() => useSampleImage('Recyclable')}
                disabled={isCapturing}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
                  isCapturing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload size={16} className="mr-1" />
                Use Sample Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture; 