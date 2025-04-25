interface ClassificationResult {
  category: string;
  accuracy: number;
  details: {
    wasteType: string;
    recyclable: boolean;
    biodegradable: boolean;
    hazardous: boolean;
    decompositionTime?: string;
    environmentalImpact?: string;
    disposalMethod?: string;
    composting?: {
      suitable: boolean;
      timeToCompost?: string;
      nutrientValue?: string;
    };
  };
}

// Mock database of waste classification results
const wasteTypes = [
  { 
    name: 'Plastic Bottle', 
    category: 'Recyclable',
    accuracy: { min: 90, max: 98 },
    details: { 
      recyclable: true, 
      biodegradable: false, 
      hazardous: false,
      decompositionTime: '450 years',
      environmentalImpact: 'High - can harm marine life if not recycled',
      disposalMethod: 'Clean and recycle in plastic recycling bin'
    }
  },
  { 
    name: 'Aluminum Can', 
    category: 'Recyclable',
    accuracy: { min: 92, max: 99 },
    details: { 
      recyclable: true, 
      biodegradable: false, 
      hazardous: false,
      decompositionTime: '200-500 years',
      environmentalImpact: 'Moderate - energy intensive to produce',
      disposalMethod: 'Rinse and recycle in metal recycling bin'
    }
  },
  { 
    name: 'Glass Bottle', 
    category: 'Recyclable',
    accuracy: { min: 91, max: 98 },
    details: { 
      recyclable: true, 
      biodegradable: false, 
      hazardous: false,
      decompositionTime: '1+ million years',
      environmentalImpact: 'Low if recycled, can be recycled infinitely',
      disposalMethod: 'Rinse and recycle in glass recycling bin'
    }
  },
  { 
    name: 'Cardboard', 
    category: 'Recyclable',
    accuracy: { min: 87, max: 96 },
    details: { 
      recyclable: true, 
      biodegradable: true, 
      hazardous: false,
      decompositionTime: '2 months',
      environmentalImpact: 'Low - biodegradable and recyclable',
      disposalMethod: 'Flatten and recycle in paper recycling bin'
    }
  },
  { 
    name: 'Food Waste', 
    category: 'Biodegradable',
    accuracy: { min: 85, max: 95 },
    details: { 
      recyclable: false, 
      biodegradable: true, 
      hazardous: false,
      decompositionTime: '2-6 weeks',
      environmentalImpact: 'Low in compost, high in landfill (methane)',
      disposalMethod: 'Compost bin or food waste collection',
      composting: {
        suitable: true,
        timeToCompost: '2-6 weeks',
        nutrientValue: 'Moderate'
      }
    }
  },
  { 
    name: 'Paper Napkin', 
    category: 'Biodegradable',
    accuracy: { min: 82, max: 93 },
    details: { 
      recyclable: false, 
      biodegradable: true, 
      hazardous: false,
      decompositionTime: '2-4 weeks',
      environmentalImpact: 'Low - biodegrades quickly',
      disposalMethod: 'Compost if not heavily soiled',
      composting: {
        suitable: true,
        timeToCompost: '2-4 weeks',
        nutrientValue: 'Low'
      }
    }
  },
  { 
    name: 'Coffee Grounds', 
    category: 'Biodegradable',
    accuracy: { min: 88, max: 97 },
    details: { 
      recyclable: false, 
      biodegradable: true, 
      hazardous: false,
      decompositionTime: '2-3 weeks',
      environmentalImpact: 'Beneficial for compost, adds nitrogen',
      disposalMethod: 'Excellent for compost bins or gardens',
      composting: {
        suitable: true,
        timeToCompost: '2-3 weeks',
        nutrientValue: 'High'
      }
    }
  },
  { 
    name: 'Banana Peel', 
    category: 'Biodegradable',
    accuracy: { min: 89, max: 98 },
    details: { 
      recyclable: false, 
      biodegradable: true, 
      hazardous: false,
      decompositionTime: '2-5 weeks',
      environmentalImpact: 'Low - adds nutrients to soil',
      disposalMethod: 'Compost bin',
      composting: {
        suitable: true,
        timeToCompost: '2-5 weeks',
        nutrientValue: 'High'
      }
    }
  },
  { 
    name: 'Vegetable Scraps', 
    category: 'Biodegradable',
    accuracy: { min: 92, max: 99 },
    details: { 
      recyclable: false, 
      biodegradable: true, 
      hazardous: false,
      decompositionTime: '1-3 weeks',
      environmentalImpact: 'Beneficial for soil when composted',
      disposalMethod: 'Compost bin or organic waste collection',
      composting: {
        suitable: true,
        timeToCompost: '1-3 weeks',
        nutrientValue: 'Very high'
      }
    }
  },
  { 
    name: 'Carrot Tops', 
    category: 'Biodegradable',
    accuracy: { min: 93, max: 99 },
    details: { 
      recyclable: false, 
      biodegradable: true, 
      hazardous: false,
      decompositionTime: '1-2 weeks',
      environmentalImpact: 'Low - good for compost',
      disposalMethod: 'Compost bin or garden',
      composting: {
        suitable: true,
        timeToCompost: '1-2 weeks',
        nutrientValue: 'High'
      }
    }
  },
  { 
    name: 'Potato Peels', 
    category: 'Biodegradable',
    accuracy: { min: 91, max: 98 },
    details: { 
      recyclable: false, 
      biodegradable: true, 
      hazardous: false,
      decompositionTime: '1-4 weeks',
      environmentalImpact: 'Low - good for compost',
      disposalMethod: 'Compost bin',
      composting: {
        suitable: true,
        timeToCompost: '1-4 weeks',
        nutrientValue: 'Moderate'
      }
    }
  },
  { 
    name: 'Styrofoam', 
    category: 'Non-recyclable',
    accuracy: { min: 90, max: 97 },
    details: { 
      recyclable: false, 
      biodegradable: false, 
      hazardous: false,
      decompositionTime: '500+ years',
      environmentalImpact: 'High - persists in environment, harmful to wildlife',
      disposalMethod: 'General waste bin, check local specialized recycling'
    }
  },
  { 
    name: 'Plastic Bag', 
    category: 'Non-recyclable',
    accuracy: { min: 88, max: 96 },
    details: { 
      recyclable: false, 
      biodegradable: false, 
      hazardous: false,
      decompositionTime: '10-20 years',
      environmentalImpact: 'High - harmful to marine life and wildlife',
      disposalMethod: 'Reuse or return to grocery store collection'
    }
  },
  { 
    name: 'Disposable Diaper', 
    category: 'Non-recyclable',
    accuracy: { min: 91, max: 98 },
    details: { 
      recyclable: false, 
      biodegradable: false, 
      hazardous: false,
      decompositionTime: '450-500 years',
      environmentalImpact: 'High - contains plastics and human waste',
      disposalMethod: 'General waste bin'
    }
  },
  { 
    name: 'Mixed Plastic', 
    category: 'Non-recyclable',
    accuracy: { min: 84, max: 94 },
    details: { 
      recyclable: false, 
      biodegradable: false, 
      hazardous: false,
      decompositionTime: '100-500 years',
      environmentalImpact: 'High - difficult to process and often ends in landfill',
      disposalMethod: 'General waste bin, check local specialized recycling'
    }
  }
];

// Check if filename contains vegetable-related keywords
const isVegetableWaste = (filename: string): boolean => {
  const vegetableKeywords = [
    'vegetable', 'veg', 'carrot', 'potato', 'tomato', 'broccoli', 
    'cabbage', 'lettuce', 'spinach', 'onion', 'cucumber', 'kale',
    'pepper', 'eggplant', 'zucchini', 'peel', 'scrap'
  ];
  
  const lowercaseFilename = filename.toLowerCase();
  return vegetableKeywords.some(keyword => lowercaseFilename.includes(keyword));
};

// Function to simulate AI classification of waste
export const simulateClassification = (fileName: string): ClassificationResult => {
  // First check if this is vegetable waste based on filename
  if (isVegetableWaste(fileName)) {
    // Find a vegetable waste type
    const vegetableWastes = wasteTypes.filter(waste => 
      waste.category === 'Biodegradable' && 
      (waste.name.includes('Vegetable') || waste.name.includes('Carrot') || waste.name.includes('Potato'))
    );
    
    if (vegetableWastes.length > 0) {
      const selectedWaste = vegetableWastes[Math.floor(Math.random() * vegetableWastes.length)];
      const accuracy = Math.floor(selectedWaste.accuracy.min + (Math.random() * (selectedWaste.accuracy.max - selectedWaste.accuracy.min)));
      
      return {
        category: selectedWaste.category,
        accuracy: accuracy,
        details: {
          wasteType: selectedWaste.name,
          ...selectedWaste.details
        }
      };
    }
  }
  
  // Randomly select a waste type with some basic logic based on filename for consistency
  const filenameSeed = fileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomIndex = filenameSeed % wasteTypes.length;
  const selectedWaste = wasteTypes[randomIndex];
  
  // Generate a realistic accuracy value
  const accuracyRange = selectedWaste.accuracy.max - selectedWaste.accuracy.min;
  const accuracy = Math.floor(selectedWaste.accuracy.min + (Math.random() * accuracyRange));
  
  return {
    category: selectedWaste.category,
    accuracy: accuracy,
    details: {
      wasteType: selectedWaste.name,
      ...selectedWaste.details
    }
  };
};

// Function to simulate batch processing
export const simulateBatchProcessing = (count: number): ClassificationResult[] => {
  const results: ClassificationResult[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate a random file name
    const randomName = `waste_${Math.floor(Math.random() * 1000)}.jpg`;
    results.push(simulateClassification(randomName));
  }
  
  return results;
};