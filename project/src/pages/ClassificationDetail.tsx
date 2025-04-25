import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWasteData } from '../context/WasteDataContext';
import { ArrowLeft, Recycle, Leaf, AlertTriangle, Clock, Download, Trash2 } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { simulateClassification } from '../utils/wasteClassificationSimulator';

const ClassificationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recentClassifications } = useWasteData();
  
  // Find the classification
  const classification = recentClassifications.find(c => c.id === id);
  
  // If classification not found, redirect to dashboard
  if (!classification) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-medium text-gray-900">Classification not found</h2>
        <p className="mt-2 text-gray-500">The classification you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }
  
  // Simulate getting additional details (in a real app this would come from an API)
  // We're reusing the simulator but with a seed that will generate consistent results for the same waste type
  const seedFilename = `${classification.wasteType.toLowerCase().replace(/\s+/g, '-')}-${classification.id}`;
  const detailedData = simulateClassification(seedFilename);
  
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'recyclable':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'biodegradable':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'non-recyclable':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const handleDownloadPDF = () => {
    generatePDF([classification], `classification-${classification.id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/')}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Waste Classification Details</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
          >
            <Download size={16} className="mr-1.5 text-gray-600" />
            Export PDF
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-medium text-gray-900">Classification Overview</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Date:</span>
                <span className="text-sm font-medium">{new Date(classification.timestamp).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Waste Type:</span>
                <span className="text-sm font-medium">{classification.wasteType}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Category:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(classification.category)}`}>
                  {classification.category}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Accuracy:</span>
                  <span className="text-sm font-medium">{classification.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${classification.accuracy}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {classification.imageUrl && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-medium text-gray-900">Image</h2>
              </div>
              <div className="p-4">
                <div className="aspect-w-1 aspect-h-1 w-full rounded-md overflow-hidden bg-gray-100">
                  <img 
                    src={classification.imageUrl} 
                    alt={classification.wasteType} 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-medium text-gray-900">Detailed Information</h2>
            </div>
            <div className="p-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border ${detailedData.details.recyclable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center">
                      <Recycle size={20} className={`${detailedData.details.recyclable ? 'text-green-600' : 'text-red-600'}`} />
                      <span className="ml-2 font-medium">Recyclable</span>
                    </div>
                    <p className={`mt-1 text-sm ${detailedData.details.recyclable ? 'text-green-800' : 'text-red-800'}`}>
                      {detailedData.details.recyclable ? 'Yes' : 'No'}
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg border ${detailedData.details.biodegradable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center">
                      <Leaf size={20} className={`${detailedData.details.biodegradable ? 'text-green-600' : 'text-red-600'}`} />
                      <span className="ml-2 font-medium">Biodegradable</span>
                    </div>
                    <p className={`mt-1 text-sm ${detailedData.details.biodegradable ? 'text-green-800' : 'text-red-800'}`}>
                      {detailedData.details.biodegradable ? 'Yes' : 'No'}
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg border ${!detailedData.details.hazardous ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center">
                      <AlertTriangle size={20} className={`${!detailedData.details.hazardous ? 'text-green-600' : 'text-red-600'}`} />
                      <span className="ml-2 font-medium">Hazardous</span>
                    </div>
                    <p className={`mt-1 text-sm ${!detailedData.details.hazardous ? 'text-green-800' : 'text-red-800'}`}>
                      {detailedData.details.hazardous ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {detailedData.details.decompositionTime && (
                    <div className="flex items-start">
                      <div className="flex items-center w-7 h-7 rounded-full bg-blue-100 justify-center flex-shrink-0">
                        <Clock size={16} className="text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">Decomposition Time</h3>
                        <p className="mt-1 text-sm text-gray-600">{detailedData.details.decompositionTime}</p>
                      </div>
                    </div>
                  )}
                  
                  {detailedData.details.environmentalImpact && (
                    <div className="flex items-start">
                      <div className="flex items-center w-7 h-7 rounded-full bg-blue-100 justify-center flex-shrink-0">
                        <Leaf size={16} className="text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">Environmental Impact</h3>
                        <p className="mt-1 text-sm text-gray-600">{detailedData.details.environmentalImpact}</p>
                      </div>
                    </div>
                  )}
                  
                  {detailedData.details.disposalMethod && (
                    <div className="flex items-start">
                      <div className="flex items-center w-7 h-7 rounded-full bg-blue-100 justify-center flex-shrink-0">
                        <Trash2 size={16} className="text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">Recommended Disposal</h3>
                        <p className="mt-1 text-sm text-gray-600">{detailedData.details.disposalMethod}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {detailedData.details.composting && detailedData.details.composting.suitable && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-800">Composting Information</h3>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {detailedData.details.composting.timeToCompost && (
                        <div>
                          <h4 className="text-xs font-medium text-green-700">Time to Compost</h4>
                          <p className="mt-1 text-sm text-green-800">{detailedData.details.composting.timeToCompost}</p>
                        </div>
                      )}
                      
                      {detailedData.details.composting.nutrientValue && (
                        <div>
                          <h4 className="text-xs font-medium text-green-700">Nutrient Value</h4>
                          <p className="mt-1 text-sm text-green-800">{detailedData.details.composting.nutrientValue}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassificationDetail; 