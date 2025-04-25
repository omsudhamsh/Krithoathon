import React, { useState } from 'react';
import { Upload, Image, FileVideo, Trash2, UploadCloud, Check, Info, Leaf, Clock, AlertTriangle, Recycle } from 'lucide-react';
import { useWasteData } from '../../context/WasteDataContext';
import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:5000';

const WasteUploader: React.FC = () => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [isDetailExpanded, setIsDetailExpanded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addClassification } = useWasteData();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file: File) => {
    // Reset error state
    setError(null);
    
    // Make sure it's an image file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    setSelectedFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset classification state
    setClassificationResult(null);
    setIsDetailExpanded(false);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setClassificationResult(null);
    setIsDetailExpanded(false);
    setError(null);
  };

  const classifyWaste = async () => {
    if (!selectedFile || !previewUrl) return;
    
    setIsClassifying(true);
    setError(null);
    
    try {
      // Send image to server for classification
      const imageData = previewUrl;
      const response = await axios.post(`${API_BASE_URL}/api/classify`, {
        image: imageData
      });
      
      const result = response.data;
      setClassificationResult(result);
      
      // Add to recent classifications
      addClassification({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        imageUrl: previewUrl || '',
        category: result.category,
        accuracy: result.accuracy,
        wasteType: result.wasteType
      });
      
      setIsClassifying(false);
    } catch (error) {
      console.error("Classification failed:", error);
      setError("Failed to classify image. Please try again.");
      setIsClassifying(false);
    }
  };

  const getFileIcon = () => {
    return <UploadCloud size={40} className="text-blue-500" />;
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

  const toggleDetailExpansion = () => {
    setIsDetailExpanded(!isDetailExpanded);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Waste Classification</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {!selectedFile ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 transition-all ${
            dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <Upload size={36} className="text-gray-400" />
            <p className="text-sm text-gray-500 text-center">
              <span className="font-medium text-gray-700">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: JPG, PNG, WEBP (max 5MB)
            </p>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
              id="waste-file-upload"
            />
            <label
              htmlFor="waste-file-upload"
              className="px-4 py-2 mt-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
            >
              Select File
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="min-w-0 flex-1">
              <div className="flex justify-between">
                <div className="flex items-center">
                  {getFileIcon()}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearSelection}
                  className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              {previewUrl && (
                <div className="mt-2 relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain" 
                  />
                </div>
              )}
              
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
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm font-medium text-gray-700">
                      Waste Type: {classificationResult.wasteType}
                    </p>
                      <button 
                        onClick={toggleDetailExpansion} 
                        className="text-blue-600 hover:text-blue-800 flex items-center text-xs font-medium"
                      >
                        <Info size={14} className="mr-1" />
                        {isDetailExpanded ? 'Less Details' : 'More Details'}
                      </button>
                    </div>
                    
                    {isDetailExpanded && (
                      <div className="mt-4 space-y-3 text-sm border-t border-gray-200 pt-3">
                        <div className="flex items-start">
                          <span className="flex items-center text-gray-600 w-32 flex-shrink-0">
                            <Recycle size={16} className="mr-2" />
                            <span>Recyclable:</span>
                          </span>
                          <span className={`${classificationResult.details.recyclable ? 'text-green-600' : 'text-red-600'}`}>
                            {classificationResult.details.recyclable ? 'Yes' : 'No'}
                          </span>
                        </div>
                        
                        <div className="flex items-start">
                          <span className="flex items-center text-gray-600 w-32 flex-shrink-0">
                            <Leaf size={16} className="mr-2" />
                            <span>Biodegradable:</span>
                          </span>
                          <span className={`${classificationResult.details.biodegradable ? 'text-green-600' : 'text-red-600'}`}>
                            {classificationResult.details.biodegradable ? 'Yes' : 'No'}
                          </span>
                        </div>
                        
                        <div className="flex items-start">
                          <span className="flex items-center text-gray-600 w-32 flex-shrink-0">
                            <AlertTriangle size={16} className="mr-2" />
                            <span>Hazardous:</span>
                          </span>
                          <span className={`${classificationResult.details.hazardous ? 'text-red-600' : 'text-green-600'}`}>
                            {classificationResult.details.hazardous ? 'Yes' : 'No'}
                          </span>
                        </div>
                        
                        {classificationResult.details.decompositionTime && (
                          <div className="flex items-start">
                            <span className="flex items-center text-gray-600 w-32 flex-shrink-0">
                              <Clock size={16} className="mr-2" />
                              <span>Decomposes in:</span>
                            </span>
                            <span className="text-gray-800">{classificationResult.details.decompositionTime}</span>
                          </div>
                        )}
                        
                        {classificationResult.details.environmentalImpact && (
                          <div className="flex items-start">
                            <span className="flex items-center text-gray-600 w-32 flex-shrink-0">
                              <span>Impact:</span>
                            </span>
                            <span className="text-gray-800">{classificationResult.details.environmentalImpact}</span>
                          </div>
                        )}
                        
                        {classificationResult.details.disposalMethod && (
                          <div className="flex items-start">
                            <span className="flex items-center text-gray-600 w-32 flex-shrink-0">
                              <span>Disposal:</span>
                            </span>
                            <span className="text-gray-800">{classificationResult.details.disposalMethod}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {!classificationResult && (
            <button
              onClick={classifyWaste}
              disabled={isClassifying}
              className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                isClassifying 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isClassifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Classifying...
                </>
              ) : (
                'Classify Waste'
              )}
            </button>
          )}
          
          {classificationResult && (
            <button
              onClick={clearSelection}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Check size={16} className="mr-1" />
              Classify Another
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WasteUploader;