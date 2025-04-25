export const mockWasteData = {
  recentClassifications: [
    {
      id: '1',
      timestamp: '2025-03-12T10:30:00',
      imageUrl: 'https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg',
      category: 'Recyclable',
      accuracy: 95,
      wasteType: 'Plastic Bottle'
    },
    {
      id: '2',
      timestamp: '2025-03-12T10:15:00',
      imageUrl: 'https://images.pexels.com/photos/3826114/pexels-photo-3826114.jpeg',
      category: 'Biodegradable',
      accuracy: 88,
      wasteType: 'Food Waste'
    },
    {
      id: '3',
      timestamp: '2025-03-12T09:45:00',
      imageUrl: 'https://images.pexels.com/photos/239369/pexels-photo-239369.jpeg',
      category: 'Non-recyclable',
      accuracy: 92,
      wasteType: 'Styrofoam'
    },
    {
      id: '4',
      timestamp: '2025-03-11T16:20:00',
      imageUrl: 'https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg',
      category: 'Recyclable',
      accuracy: 97,
      wasteType: 'Aluminum Can'
    },
    {
      id: '5',
      timestamp: '2025-03-11T15:10:00',
      imageUrl: 'https://images.pexels.com/photos/3826114/pexels-photo-3826114.jpeg',
      category: 'Biodegradable',
      accuracy: 85,
      wasteType: 'Paper Napkin'
    },
    {
      id: '6',
      timestamp: '2025-03-11T11:45:00',
      imageUrl: 'https://images.pexels.com/photos/239369/pexels-photo-239369.jpeg',
      category: 'Non-recyclable',
      accuracy: 90,
      wasteType: 'Plastic Bag'
    },
    {
      id: '7',
      timestamp: '2025-03-10T14:30:00',
      imageUrl: 'https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg',
      category: 'Recyclable',
      accuracy: 93,
      wasteType: 'Glass Bottle'
    }
  ],
  stats: {
    totalClassified: 358,
    recyclable: 187,
    biodegradable: 112,
    nonRecyclable: 59
  },
  distribution: {
    recyclable: 52,
    biodegradable: 31,
    nonRecyclable: 17
  },
  accuracyTrend: [
    {
      date: '2025-03-06',
      recyclable: 88,
      biodegradable: 82,
      nonRecyclable: 79
    },
    {
      date: '2025-03-07',
      recyclable: 89,
      biodegradable: 84,
      nonRecyclable: 80
    },
    {
      date: '2025-03-08',
      recyclable: 91,
      biodegradable: 85,
      nonRecyclable: 82
    },
    {
      date: '2025-03-09',
      recyclable: 92,
      biodegradable: 86,
      nonRecyclable: 83
    },
    {
      date: '2025-03-10',
      recyclable: 93,
      biodegradable: 87,
      nonRecyclable: 85
    },
    {
      date: '2025-03-11',
      recyclable: 94,
      biodegradable: 88,
      nonRecyclable: 86
    },
    {
      date: '2025-03-12',
      recyclable: 95,
      biodegradable: 89,
      nonRecyclable: 87
    }
  ]
};