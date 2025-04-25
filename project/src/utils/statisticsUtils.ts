/**
 * Statistics Utility for Waste Classification App
 * 
 * This utility provides methods to calculate environmental impact statistics
 * and generate data for charts and visualizations.
 */

interface EcoImpactStats {
  co2Saved: number; // kg of CO2 saved
  landfillReduction: number; // kg of waste diverted from landfill
  waterSaved: number; // liters of water saved
  energySaved: number; // kWh of energy saved
  treesEquivalent: number; // equivalent number of trees planted
}

interface SystemHealthStats {
  uptime: number; // hours
  responseTime: number; // ms
  processingRate: number; // images per minute
  errorRate: number; // percentage
  storageUsed: number; // percentage
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  status: 'Healthy' | 'Warning' | 'Critical';
}

interface BinLevels {
  recyclable: number; // percentage full
  biodegradable: number; // percentage full
  nonRecyclable: number; // percentage full
  hazardous: number; // percentage full
}

interface AIMetrics {
  accuracy: number; // percentage
  precision: number; // percentage
  recall: number; // percentage
  f1Score: number; // percentage
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
  };
}

interface WasteTrend {
  date: string;
  recyclable: number;
  biodegradable: number;
  nonRecyclable: number;
}

// Calculate eco impact based on waste classifications
export const calculateEcoImpact = (recyclableCount: number, biodegradableCount: number): EcoImpactStats => {
  // These are estimated values for demonstration
  const recyclableCO2PerKg = 2.5; // kg of CO2 saved per kg of recycled material
  const biodegradableCO2PerKg = 0.5; // kg of CO2 saved per kg of composted material
  const avgWeightPerItem = 0.2; // kg per waste item

  const totalRecycledWeight = recyclableCount * avgWeightPerItem;
  const totalBiodegradableWeight = biodegradableCount * avgWeightPerItem;
  
  const co2Saved = (totalRecycledWeight * recyclableCO2PerKg) + (totalBiodegradableWeight * biodegradableCO2PerKg);
  const landfillReduction = totalRecycledWeight + totalBiodegradableWeight;
  const waterSaved = totalRecycledWeight * 1000; // 1000L of water per kg of recycled material
  const energySaved = totalRecycledWeight * 5; // 5 kWh per kg of recycled material
  const treesEquivalent = co2Saved / 20; // 20kg of CO2 per tree per year (very rough estimate)

  return {
    co2Saved: Math.round(co2Saved * 100) / 100,
    landfillReduction: Math.round(landfillReduction * 100) / 100,
    waterSaved: Math.round(waterSaved),
    energySaved: Math.round(energySaved * 100) / 100,
    treesEquivalent: Math.round(treesEquivalent * 10) / 10
  };
};

// Generate mock system health statistics
export const generateSystemHealth = (): SystemHealthStats => {
  const uptime = Math.floor(Math.random() * 500) + 100; // 100-600 hours
  const responseTime = Math.floor(Math.random() * 80) + 20; // 20-100ms
  const processingRate = Math.floor(Math.random() * 50) + 10; // 10-60 images per minute
  const errorRate = Math.random() * 2; // 0-2%
  const storageUsed = Math.floor(Math.random() * 60) + 20; // 20-80%
  const cpuUsage = Math.floor(Math.random() * 40) + 20; // 20-60%
  const memoryUsage = Math.floor(Math.random() * 40) + 20; // 20-60%
  
  let status: 'Healthy' | 'Warning' | 'Critical' = 'Healthy';
  if (errorRate > 1.5 || cpuUsage > 50 || memoryUsage > 50) {
    status = 'Warning';
  }
  if (errorRate > 1.8 || cpuUsage > 55 || memoryUsage > 55) {
    status = 'Critical';
  }

  return {
    uptime,
    responseTime,
    processingRate,
    errorRate: Math.round(errorRate * 100) / 100,
    storageUsed,
    cpuUsage,
    memoryUsage,
    status
  };
};

// Generate mock bin fill levels
export const generateBinLevels = (): BinLevels => {
  return {
    recyclable: Math.floor(Math.random() * 100),
    biodegradable: Math.floor(Math.random() * 100),
    nonRecyclable: Math.floor(Math.random() * 100),
    hazardous: Math.floor(Math.random() * 100)
  };
};

// Generate mock AI performance metrics
export const generateAIMetrics = (): AIMetrics => {
  const accuracy = 85 + (Math.random() * 10); // 85-95%
  const precision = 83 + (Math.random() * 12); // 83-95%
  const recall = 80 + (Math.random() * 15); // 80-95%
  const f1Score = 2 * (precision * recall) / (precision + recall);

  return {
    accuracy: Math.round(accuracy * 10) / 10,
    precision: Math.round(precision * 10) / 10,
    recall: Math.round(recall * 10) / 10,
    f1Score: Math.round(f1Score * 10) / 10,
    confusionMatrix: {
      truePositives: Math.floor(Math.random() * 200) + 800, // 800-1000
      falsePositives: Math.floor(Math.random() * 50) + 10, // 10-60
      trueNegatives: Math.floor(Math.random() * 200) + 800, // 800-1000
      falseNegatives: Math.floor(Math.random() * 50) + 10 // 10-60
    }
  };
};

// Generate waste trends over time (past 14 days)
export const generateWasteTrends = (): WasteTrend[] => {
  const trends: WasteTrend[] = [];
  const today = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Create some realistic looking fluctuations
    const baseRecyclable = 30 + Math.sin(i * 0.5) * 10;
    const baseBiodegradable = 25 + Math.cos(i * 0.5) * 8;
    const baseNonRecyclable = 15 + Math.sin(i * 0.8) * 5;
    
    trends.push({
      date: dateString,
      recyclable: Math.round(baseRecyclable + Math.random() * 5),
      biodegradable: Math.round(baseBiodegradable + Math.random() * 5),
      nonRecyclable: Math.round(baseNonRecyclable + Math.random() * 5)
    });
  }
  
  return trends;
};

// Generate data for CSV export
export const generateCSVData = (classifications: any[]): string => {
  // CSV header
  let csv = 'ID,Date,Waste Type,Category,Accuracy,Recyclable,Biodegradable,Hazardous,CO2_Impact,Water_Saved,Energy_Saved\n';
  
  // Add rows
  classifications.forEach(item => {
    // Calculate estimated environmental impact for this item
    const isRecyclable = item.category === 'Recyclable';
    const isBiodegradable = item.category === 'Biodegradable';
    const avgWeightPerItem = 0.2; // kg per waste item
    const co2Impact = isRecyclable ? (avgWeightPerItem * 2.5) : (isBiodegradable ? (avgWeightPerItem * 0.5) : 0);
    const waterSaved = isRecyclable ? (avgWeightPerItem * 1000) : 0; // 1000L of water per kg of recycled material
    const energySaved = isRecyclable ? (avgWeightPerItem * 5) : 0; // 5 kWh per kg of recycled material
    
    const row = [
      item.id,
      new Date(item.timestamp).toISOString(),
      item.wasteType,
      item.category,
      `${item.accuracy}%`,
      isRecyclable ? 'Yes' : 'No',
      isBiodegradable ? 'Yes' : 'No',
      'No', // Assuming none are hazardous in this demo
      co2Impact.toFixed(2), // CO2 impact in kg
      waterSaved.toFixed(0), // Water saved in liters
      energySaved.toFixed(2) // Energy saved in kWh
    ];
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
};

// Download data as a CSV file
export const downloadCSV = (data: string, filename: string = 'waste-classifications.csv'): void => {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the blob URL after download
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}; 