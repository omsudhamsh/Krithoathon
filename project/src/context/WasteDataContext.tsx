import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockWasteData } from '../utils/mockData';
import { 
  calculateEcoImpact, 
  generateWasteTrends,
  generateCSVData,
  downloadCSV
} from '../utils/statisticsUtils';

// Local storage key
const STORAGE_KEY = 'wasteClassificationData';

interface Classification {
  id: string;
  timestamp: string;
  imageUrl: string;
  category: string;
  accuracy: number;
  wasteType: string;
}

interface Stats {
  totalClassified: number;
  recyclable: number;
  biodegradable: number;
  nonRecyclable: number;
}

interface Distribution {
  recyclable: number;
  biodegradable: number;
  nonRecyclable: number;
}

interface AccuracyTrendItem {
  date: string;
  recyclable: number;
  biodegradable: number;
  nonRecyclable: number;
}

interface EcoImpactStats {
  co2Saved: number;
  landfillReduction: number;
  waterSaved: number;
  energySaved: number;
  treesEquivalent: number;
}

interface SystemHealthStats {
  uptime: number;
  responseTime: number;
  processingRate: number;
  errorRate: number;
  storageUsed: number;
  cpuUsage: number;
  memoryUsage: number;
  status: 'Healthy' | 'Warning' | 'Critical';
}

interface BinLevels {
  recyclable: number;
  biodegradable: number;
  nonRecyclable: number;
  hazardous: number;
}

interface AIMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
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

// Intentionally not extending Classification to avoid type conflicts
interface LiveFeedItem {
  id: string;
  timestamp: string;
  imageUrl: string | null;
  category: string;
  accuracy: number;
  wasteType: string;
}

interface WasteDataContextType {
  recentClassifications: Classification[];
  stats: Stats;
  distribution: Distribution;
  accuracyTrend: AccuracyTrendItem[];
  addClassification: (classification: Classification) => void;
  ecoImpact: EcoImpactStats;
  systemHealth: SystemHealthStats;
  binLevels: BinLevels;
  aiMetrics: AIMetrics;
  wasteTrends: WasteTrend[];
  liveFeed: LiveFeedItem[];
  refreshSystemStatus: () => void;
  exportToCSV: () => void;
  clearData: () => void;
}

const WasteDataContext = createContext<WasteDataContextType | undefined>(undefined);

// Helper function to calculate bin levels based on classifications
const calculateBinLevels = (classifications: Classification[]): BinLevels => {
  // For demo purposes, we'll say each item adds a certain percentage to the bin
  const itemFillPercentage = 0.5; // Each item contributes 0.5% to bin level
  
  const recyclableCount = classifications.filter(c => c.category === 'Recyclable').length;
  const biodegradableCount = classifications.filter(c => c.category === 'Biodegradable').length;
  const nonRecyclableCount = classifications.filter(c => c.category === 'Non-recyclable').length;
  const hazardousCount = classifications.filter(c => c.wasteType === 'hazardous' || c.wasteType === 'e-waste').length;
  
  return {
    recyclable: Math.min(100, recyclableCount * itemFillPercentage),
    biodegradable: Math.min(100, biodegradableCount * itemFillPercentage),
    nonRecyclable: Math.min(100, nonRecyclableCount * itemFillPercentage),
    hazardous: Math.min(100, hazardousCount * itemFillPercentage)
  };
};

// Helper function to calculate AI metrics based on classifications
const calculateAIMetrics = (classifications: Classification[]): AIMetrics => {
  // For demo purposes, we'll derive AI metrics from the existing classifications
  // This would normally come from model evaluation
  
  if (classifications.length === 0) {
    return {
      accuracy: 90.0,
      precision: 89.5,
      recall: 88.0,
      f1Score: 88.7,
      confusionMatrix: {
        truePositives: 0,
        falsePositives: 0,
        trueNegatives: 0,
        falseNegatives: 0
      }
    };
  }
  
  // Calculate average accuracy
  const avgAccuracy = classifications.reduce((sum, item) => sum + item.accuracy, 0) / classifications.length;
  
  // Simulate precision and recall slightly lower than accuracy
  const precision = avgAccuracy * 0.99;
  const recall = avgAccuracy * 0.98;
  
  // Calculate F1 score
  const f1Score = 2 * (precision * recall) / (precision + recall);
  
  // Simulate confusion matrix based on accuracy
  const totalSamples = classifications.length * 4; // Simulate that we've seen 4x as many samples in training
  const correctPredictions = Math.round(totalSamples * (avgAccuracy / 100));
  const incorrectPredictions = totalSamples - correctPredictions;
  
  return {
    accuracy: Number(avgAccuracy.toFixed(1)),
    precision: Number(precision.toFixed(1)),
    recall: Number(recall.toFixed(1)),
    f1Score: Number(f1Score.toFixed(1)),
    confusionMatrix: {
      truePositives: Math.round(correctPredictions * 0.6),
      falsePositives: Math.round(incorrectPredictions * 0.5),
      trueNegatives: Math.round(correctPredictions * 0.4),
      falseNegatives: Math.round(incorrectPredictions * 0.5)
    }
  };
};

// Helper function to calculate accuracy trend
const calculateAccuracyTrend = (classifications: Classification[]): AccuracyTrendItem[] => {
  if (classifications.length === 0) {
    return mockWasteData.accuracyTrend;
  }
  
  // Group classifications by date
  const classificationsByDate = classifications.reduce((acc, item) => {
    const date = new Date(item.timestamp).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        recyclable: [] as number[],
        biodegradable: [] as number[],
        nonRecyclable: [] as number[]
      };
    }
    
    if (item.category === 'Recyclable') {
      acc[date].recyclable.push(item.accuracy);
    } else if (item.category === 'Biodegradable') {
      acc[date].biodegradable.push(item.accuracy);
    } else if (item.category === 'Non-recyclable') {
      acc[date].nonRecyclable.push(item.accuracy);
    }
    
    return acc;
  }, {} as Record<string, { recyclable: number[], biodegradable: number[], nonRecyclable: number[] }>);
  
  // Calculate average accuracies by date
  return Object.entries(classificationsByDate).map(([date, data]) => {
    return {
      date,
      recyclable: data.recyclable.length > 0 
        ? Math.round(data.recyclable.reduce((sum, acc) => sum + acc, 0) / data.recyclable.length) 
        : 0,
      biodegradable: data.biodegradable.length > 0 
        ? Math.round(data.biodegradable.reduce((sum, acc) => sum + acc, 0) / data.biodegradable.length) 
        : 0,
      nonRecyclable: data.nonRecyclable.length > 0 
        ? Math.round(data.nonRecyclable.reduce((sum, acc) => sum + acc, 0) / data.nonRecyclable.length) 
        : 0
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
};

// Helper function to calculate system health
const calculateSystemHealth = (totalClassified: number): SystemHealthStats => {
  // Simulate better system health as more items are classified
  // (in a real app this would come from actual system metrics)
  const scaleFactor = Math.min(1, totalClassified / 100); // Scale up to 100 classifications
  
  const baseUptime = 100 + (totalClassified * 0.5); // Simulates longer uptime as app is used
  const baseResponseTime = Math.max(30, 100 - (scaleFactor * 70)); // Response time improves with use
  const baseProcessingRate = 10 + (scaleFactor * 40);
  const baseErrorRate = Math.max(0.1, 2 - (scaleFactor * 1.9));
  const baseStorageUsed = 20 + (totalClassified * 0.2); // Storage increases with more data
  const baseCpuUsage = 20 + (Math.min(totalClassified, 100) * 0.15);
  const baseMemoryUsage = 20 + (Math.min(totalClassified, 100) * 0.2);
  
  let status: 'Healthy' | 'Warning' | 'Critical' = 'Healthy';
  if (baseErrorRate > 1.5 || baseCpuUsage > 50 || baseMemoryUsage > 50) {
    status = 'Warning';
  }
  if (baseErrorRate > 1.8 || baseCpuUsage > 55 || baseMemoryUsage > 55) {
    status = 'Critical';
  }
  
  return {
    uptime: Math.round(baseUptime),
    responseTime: Math.round(baseResponseTime * 10) / 10,
    processingRate: Math.round(baseProcessingRate),
    errorRate: Math.round(baseErrorRate * 100) / 100,
    storageUsed: Math.min(100, Math.round(baseStorageUsed)),
    cpuUsage: Math.round(baseCpuUsage),
    memoryUsage: Math.round(baseMemoryUsage),
    status
  };
};

export const WasteDataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Initialize state from localStorage or use mockData
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return {
        ...parsedData,
        // Ensure all required fields exist
        recentClassifications: parsedData.recentClassifications || [],
        stats: parsedData.stats || { 
          totalClassified: 0, 
          recyclable: 0, 
          biodegradable: 0, 
          nonRecyclable: 0 
        },
        distribution: parsedData.distribution || { 
          recyclable: 0, 
          biodegradable: 0, 
          nonRecyclable: 0 
        },
        accuracyTrend: parsedData.accuracyTrend || []
      };
    }
    return mockWasteData;
  });
  
  // Derived state from classifications
  const [ecoImpact, setEcoImpact] = useState(() => 
    calculateEcoImpact(data.stats.recyclable, data.stats.biodegradable)
  );
  
  const [systemHealth, setSystemHealth] = useState(() => 
    calculateSystemHealth(data.stats.totalClassified)
  );
  
  const [binLevels, setBinLevels] = useState(() => 
    calculateBinLevels(data.recentClassifications)
  );
  
  const [aiMetrics, setAIMetrics] = useState(() => 
    calculateAIMetrics(data.recentClassifications)
  );
  
  const [wasteTrends, setWasteTrends] = useState<WasteTrend[]>(() => 
    data.recentClassifications.length > 0 
      ? generateWasteTrends() 
      : (mockWasteData as any).wasteTrends
  );
  
  const [liveFeed, setLiveFeed] = useState<LiveFeedItem[]>(() => {
    if (data.recentClassifications.length > 0) {
      return data.recentClassifications.slice(0, 5).map((item: Classification) => ({
        id: item.id,
        timestamp: item.timestamp,
        imageUrl: item.imageUrl,
        category: item.category,
        accuracy: item.accuracy,
        wasteType: item.wasteType
      }));
    }
    return mockWasteData.recentClassifications.slice(0, 5).map((item: Classification) => ({
      id: item.id,
      timestamp: new Date().toISOString(),
      imageUrl: item.imageUrl,
      category: item.category,
      accuracy: item.accuracy,
      wasteType: item.wasteType
    }));
  });
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);
  
  // Simulate changing statistics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(calculateSystemHealth(data.stats.totalClassified));
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [data.stats.totalClassified]);
  
  const addClassification = (classification: Classification) => {
    // Add to recent classifications
    const updatedClassifications = [classification, ...data.recentClassifications];
    
    // Update stats
    const updatedStats = { ...data.stats };
    updatedStats.totalClassified += 1;
    
    if (classification.category === 'Recyclable') {
      updatedStats.recyclable += 1;
    } else if (classification.category === 'Biodegradable') {
      updatedStats.biodegradable += 1;
    } else if (classification.category === 'Non-recyclable') {
      updatedStats.nonRecyclable += 1;
    }
    
    // Update distribution
    const updatedDistribution = {
      recyclable: Math.round((updatedStats.recyclable / updatedStats.totalClassified) * 100),
      biodegradable: Math.round((updatedStats.biodegradable / updatedStats.totalClassified) * 100),
      nonRecyclable: Math.round((updatedStats.nonRecyclable / updatedStats.totalClassified) * 100),
    };

    // Calculate new accuracy trend
    const newAccuracyTrend = calculateAccuracyTrend(updatedClassifications);
    
    // Update state
    setData({
      ...data,
      recentClassifications: updatedClassifications,
      stats: updatedStats,
      distribution: updatedDistribution,
      accuracyTrend: newAccuracyTrend
    });

    // Update eco impact
    const updatedEcoImpact = calculateEcoImpact(updatedStats.recyclable, updatedStats.biodegradable);
    setEcoImpact(updatedEcoImpact);
    
    // Update bin levels
    setBinLevels(calculateBinLevels(updatedClassifications));
    
    // Update AI metrics
    setAIMetrics(calculateAIMetrics(updatedClassifications));
    
    // Update waste trends
    setWasteTrends(generateWasteTrends());
    
    // Update live feed
    const updatedLiveFeed = [
      {
        id: classification.id,
        timestamp: classification.timestamp,
        imageUrl: classification.imageUrl,
        category: classification.category,
        accuracy: classification.accuracy,
        wasteType: classification.wasteType
      },
      ...liveFeed
    ].slice(0, 10); // Keep only the last 10 items
    
    setLiveFeed(updatedLiveFeed);
  };

  // Refresh system status data
  const refreshSystemStatus = () => {
    setSystemHealth(calculateSystemHealth(data.stats.totalClassified));
    setBinLevels(calculateBinLevels(data.recentClassifications));
    setAIMetrics(calculateAIMetrics(data.recentClassifications));
    setWasteTrends(generateWasteTrends());
  };
  
  // Clear all classification data
  const clearData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(mockWasteData);
    setEcoImpact(calculateEcoImpact(mockWasteData.stats.recyclable, mockWasteData.stats.biodegradable));
    setSystemHealth(calculateSystemHealth(mockWasteData.stats.totalClassified));
    setBinLevels(calculateBinLevels(mockWasteData.recentClassifications));
    setAIMetrics(calculateAIMetrics(mockWasteData.recentClassifications));
    setWasteTrends((mockWasteData as any).wasteTrends);
    setLiveFeed(mockWasteData.recentClassifications.slice(0, 5).map((item: Classification) => ({
      id: item.id,
      timestamp: new Date().toISOString(),
      imageUrl: item.imageUrl,
      category: item.category,
      accuracy: item.accuracy,
      wasteType: item.wasteType
    })));
  };

  // Export classification data to CSV
  const exportToCSV = () => {
    const csvData = generateCSVData(data.recentClassifications);
    downloadCSV(csvData);
  };
  
  return (
    <WasteDataContext.Provider value={{
      recentClassifications: data.recentClassifications,
      stats: data.stats,
      distribution: data.distribution,
      accuracyTrend: data.accuracyTrend,
      addClassification,
      ecoImpact,
      systemHealth,
      binLevels,
      aiMetrics,
      wasteTrends,
      liveFeed,
      refreshSystemStatus,
      exportToCSV,
      clearData
    }}>
      {children}
    </WasteDataContext.Provider>
  );
};

export const useWasteData = (): WasteDataContextType => {
  const context = useContext(WasteDataContext);
  if (context === undefined) {
    throw new Error('useWasteData must be used within a WasteDataProvider');
  }
  return context;
};