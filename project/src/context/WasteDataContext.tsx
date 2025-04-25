import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockWasteData } from '../utils/mockData';
import { 
  calculateEcoImpact, 
  generateSystemHealth, 
  generateBinLevels, 
  generateAIMetrics, 
  generateWasteTrends,
  generateCSVData,
  downloadCSV
} from '../utils/statisticsUtils';

interface Classification {
  id: string;
  timestamp: string;
  imageUrl: string | null;
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
}

const WasteDataContext = createContext<WasteDataContextType | undefined>(undefined);

export const WasteDataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [data, setData] = useState(mockWasteData);
  const [ecoImpact, setEcoImpact] = useState(calculateEcoImpact(mockWasteData.stats.recyclable, mockWasteData.stats.biodegradable));
  const [systemHealth, setSystemHealth] = useState(generateSystemHealth());
  const [binLevels, setBinLevels] = useState(generateBinLevels());
  const [aiMetrics, setAIMetrics] = useState(generateAIMetrics());
  const [wasteTrends, setWasteTrends] = useState(generateWasteTrends());
  const [liveFeed, setLiveFeed] = useState<LiveFeedItem[]>(
    mockWasteData.recentClassifications.slice(0, 5).map(item => ({
      id: item.id,
      timestamp: new Date().toISOString(),
      imageUrl: item.imageUrl,
      category: item.category,
      accuracy: item.accuracy,
      wasteType: item.wasteType
    }))
  );

  // Simulate changing statistics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(generateSystemHealth());
      setBinLevels(generateBinLevels());
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
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

    // Update eco impact
    const updatedEcoImpact = calculateEcoImpact(updatedStats.recyclable, updatedStats.biodegradable);
    
    // Update live feed
    const updatedLiveFeed = [
      {
        id: classification.id,
        timestamp: new Date().toISOString(),
        imageUrl: classification.imageUrl,
        category: classification.category,
        accuracy: classification.accuracy,
        wasteType: classification.wasteType
      },
      ...liveFeed
    ].slice(0, 10); // Keep only the last 10 items

    setData({
      ...data,
      recentClassifications: updatedClassifications,
      stats: updatedStats,
      distribution: updatedDistribution,
    });

    setEcoImpact(updatedEcoImpact);
    setLiveFeed(updatedLiveFeed);
  };

  // Refresh system status data
  const refreshSystemStatus = () => {
    setSystemHealth(generateSystemHealth());
    setBinLevels(generateBinLevels());
    setAIMetrics(generateAIMetrics());
    setWasteTrends(generateWasteTrends());
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
      exportToCSV
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