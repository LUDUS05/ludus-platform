// Simple mock entity to power Neumorphic demo UI without backend coupling

const MOCK_ACTIVITIES = [
  {
    id: 'a1',
    title: 'Sunset Desert Safari',
    description: 'Experience the golden dunes with a guided desert safari and traditional dinner.',
    category: 'outdoor',
    price: 120,
    duration: '3h',
    location: 'Riyadh',
    date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    time: '17:00',
    max_participants: 12,
    current_participants: 8,
    image_url: 'https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1600&auto=format&fit=crop',
    vendor_name: 'Desert Adventures',
    vendor_rating: 4.7,
    tags: ['adventure', 'desert']
  },
  {
    id: 'a2',
    title: 'Traditional Cooking Class',
    description: 'Learn to cook authentic local dishes with a professional chef.',
    category: 'food',
    price: 75,
    duration: '2h',
    location: 'Jeddah',
    date: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    time: '14:00',
    max_participants: 10,
    current_participants: 4,
    image_url: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=1600&auto=format&fit=crop',
    vendor_name: 'Culinary Studio',
    vendor_rating: 4.6,
    tags: ['cooking', 'workshop']
  },
  {
    id: 'a3',
    title: 'Live Music Night',
    description: 'Enjoy an evening of live music performances featuring local artists.',
    category: 'music',
    price: 40,
    duration: '2h',
    location: 'Dammam',
    date: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
    time: '20:00',
    max_participants: 100,
    current_participants: 85,
    image_url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600&auto=format&fit=crop',
    vendor_name: 'City Stage',
    vendor_rating: 4.8,
    tags: ['music', 'nightlife']
  }
];

export const Activity = {
  async list(sort = '') {
    const data = [...MOCK_ACTIVITIES];
    if (sort === '-created_date') {
      return data.reverse();
    }
    return data;
  },

  async update(id, updates) {
    const index = MOCK_ACTIVITIES.findIndex(a => a.id === id);
    if (index !== -1) {
      MOCK_ACTIVITIES[index] = { ...MOCK_ACTIVITIES[index], ...updates };
      return MOCK_ACTIVITIES[index];
    }
    return null;
  }
};

