const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LUDUS API is running',
    timestamp: new Date().toISOString()
  });
});

// Mock activities endpoint
app.get('/api/activities', (req, res) => {
  const activities = [
    {
      id: '1',
      title: 'Desert Safari Adventure',
      titleAr: 'مغامرة رحلة الصحراء',
      description: 'Experience the beauty of the Saudi desert with traditional Bedouin hospitality',
      descriptionAr: 'اختبر جمال الصحراء السعودية مع كرم الضيافة البدوية التقليدية',
      price: 150,
      currency: 'SAR',
      location: 'Riyadh',
      locationAr: 'الرياض',
      category: 'Adventure',
      categoryAr: 'مغامرة',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      rating: 4.8,
      reviews: 120,
      duration: '4 hours',
      maxParticipants: 8,
      difficulty: 'Medium',
      vendor: {
        id: 'vendor1',
        name: 'Saudi Adventures Co.',
        rating: 4.9
      }
    },
    {
      id: '2',
      title: 'Traditional Cooking Class',
      titleAr: 'فصل الطبخ التقليدي',
      description: 'Learn to cook authentic Saudi dishes with local chefs',
      descriptionAr: 'تعلم طبخ الأطباق السعودية الأصيلة مع الطهاة المحليين',
      price: 80,
      currency: 'SAR',
      location: 'Jeddah',
      locationAr: 'جدة',
      category: 'Culinary',
      categoryAr: 'طبخ',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      rating: 4.6,
      reviews: 85,
      duration: '2 hours',
      maxParticipants: 12,
      difficulty: 'Easy',
      vendor: {
        id: 'vendor2',
        name: 'Jeddah Culinary School',
        rating: 4.7
      }
    },
    {
      id: '3',
      title: 'Historical Diriyah Tour',
      titleAr: 'جولة الدرعية التاريخية',
      description: 'Explore the birthplace of the Saudi Kingdom',
      descriptionAr: 'استكشف مهد المملكة العربية السعودية',
      price: 60,
      currency: 'SAR',
      location: 'Diriyah',
      locationAr: 'الدرعية',
      category: 'Cultural',
      categoryAr: 'ثقافي',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      rating: 4.9,
      reviews: 200,
      duration: '3 hours',
      maxParticipants: 15,
      difficulty: 'Easy',
      vendor: {
        id: 'vendor3',
        name: 'Heritage Tours',
        rating: 4.8
      }
    },
    {
      id: '4',
      title: 'Red Sea Diving',
      titleAr: 'غوص البحر الأحمر',
      description: 'Discover the underwater wonders of the Red Sea',
      descriptionAr: 'اكتشف عجائب البحر الأحمر تحت الماء',
      price: 200,
      currency: 'SAR',
      location: 'Jeddah',
      locationAr: 'جدة',
      category: 'Adventure',
      categoryAr: 'مغامرة',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      rating: 4.7,
      reviews: 95,
      duration: '6 hours',
      maxParticipants: 6,
      difficulty: 'Hard',
      vendor: {
        id: 'vendor4',
        name: 'Red Sea Adventures',
        rating: 4.6
      }
    }
  ];

  // Apply filters if provided
  let filteredActivities = activities;
  const { search, category, city, minPrice, maxPrice, sortBy } = req.query;

  if (search) {
    filteredActivities = filteredActivities.filter(activity => 
      activity.title.toLowerCase().includes(search.toLowerCase()) ||
      activity.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (category) {
    filteredActivities = filteredActivities.filter(activity => 
      activity.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (city) {
    filteredActivities = filteredActivities.filter(activity => 
      activity.location.toLowerCase() === city.toLowerCase()
    );
  }

  if (minPrice) {
    filteredActivities = filteredActivities.filter(activity => 
      activity.price >= parseInt(minPrice)
    );
  }

  if (maxPrice) {
    filteredActivities = filteredActivities.filter(activity => 
      activity.price <= parseInt(maxPrice)
    );
  }

  // Apply sorting
  if (sortBy === 'price') {
    filteredActivities.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'rating') {
    filteredActivities.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'reviews') {
    filteredActivities.sort((a, b) => b.reviews - a.reviews);
  }

  res.json({
    activities: filteredActivities,
    pagination: {
      page: 1,
      limit: 12,
      totalPages: 1,
      totalActivities: filteredActivities.length
    }
  });
});

// Mock categories endpoint
app.get('/api/categories', (req, res) => {
  res.json([
    { id: '1', name: 'Adventure', nameAr: 'مغامرة' },
    { id: '2', name: 'Culinary', nameAr: 'طبخ' },
    { id: '3', name: 'Cultural', nameAr: 'ثقافي' },
    { id: '4', name: 'Sports', nameAr: 'رياضة' }
  ]);
});

// Mock cities endpoint
app.get('/api/cities', (req, res) => {
  res.json([
    { id: '1', name: 'Riyadh', nameAr: 'الرياض' },
    { id: '2', name: 'Jeddah', nameAr: 'جدة' },
    { id: '3', name: 'Dammam', nameAr: 'الدمام' },
    { id: '4', name: 'Mecca', nameAr: 'مكة' }
  ]);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple LUDUS API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Activities: http://localhost:${PORT}/api/activities`);
});
