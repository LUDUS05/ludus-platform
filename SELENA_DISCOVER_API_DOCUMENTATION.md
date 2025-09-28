# Selena-Discover AI Agent API Documentation

## Overview

The Selena-Discover AI Agent is an advanced, culturally-aware search and recommendation system designed specifically for the LUDUS platform and Saudi Arabian market. It provides intelligent venue and game discovery with natural language processing, personalized recommendations, and cultural context awareness.

## Features

### 🤖 AI-Powered Search
- **Natural Language Processing**: Understands Arabic, English, and mixed-language queries
- **Intent Recognition**: Extracts search intent, entities, and context from user queries
- **Cultural Context**: Saudi-specific cultural awareness and recommendations
- **Geographic Intelligence**: Proximity calculations and location-based filtering

### 🎯 Personalized Recommendations
- **Machine Learning**: Collaborative and content-based filtering algorithms
- **User Learning**: Learns from user interactions and preferences
- **Cultural Fit Scoring**: Rates activities based on Saudi cultural preferences
- **Trend Analysis**: Real-time trending activities and insights

### 🌍 Saudi Cultural Context
- **Prayer Time Awareness**: Considers Islamic prayer times in scheduling
- **Family-Friendly Focus**: Prioritizes family-suitable activities
- **Local Preferences**: Understands regional and cultural variations
- **Arabic Language**: Native Arabic language support with dialect understanding

## API Endpoints

### Backend Integration (Node.js/Express)

Base URL: `https://your-domain.com/api/discover`

#### POST /search
Intelligent AI-powered activity search with cultural insights.

**Request:**
```json
{
  "query": "ابحث عن أنشطة مغامرات في الرياض",
  "location": "الرياض",
  "price_range": [50, 200],
  "date_preference": "weekend",
  "group_size": 4,
  "activity_types": ["adventure", "gaming"],
  "cultural_preferences": {
    "family_friendly": true,
    "prayer_aware": true
  },
  "language": "ar"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "search_id": "uuid-string",
    "activities": [
      {
        "_id": "activity_id",
        "title": "تسلق جبل الفهدة",
        "title_en": "Mount Fahda Climbing",
        "description": "مغامرة تسلق...",
        "category": "adventure",
        "pricing": {
          "basePrice": 120,
          "currency": "SAR"
        },
        "location": {
          "city": "الرياض",
          "coordinates": [46.6753, 24.7136]
        },
        "ai_scores": {
          "relevance_score": 0.95,
          "cultural_fit_score": 0.88,
          "popularity_score": 0.76,
          "distance_km": 5.2
        },
        "recommendations_reason": [
          "يطابق بحثك بشكل ممتاز",
          "مناسب ثقافياً للمجتمع السعودي"
        ]
      }
    ],
    "total_count": 15,
    "search_time_ms": 245,
    "personalized_insights": [
      "وجدت 15 نشاط مناسب لاهتماماتك",
      "معظم الأنشطة المقترحة في الرياض"
    ],
    "cultural_recommendations": [
      "ننصح بالأنشطة التي توفر أماكن منفصلة للعائلات",
      "أنشطة المساء متاحة بعد صلاة العصر"
    ],
    "search_suggestions": [
      "جرب إضافة الموقع: 'في الرياض' أو 'في جدة'"
    ],
    "geographic_clusters": [
      {
        "city": "الرياض",
        "count": 12,
        "avg_price": 125.5,
        "avg_rating": 4.6
      }
    ]
  },
  "meta": {
    "query_analysis": {
      "primary_intent": "find_activity",
      "activity_types": ["adventure"],
      "location": "الرياض",
      "confidence": 0.92
    },
    "filters_applied": {
      "location": "الرياض",
      "price_range": [50, 200],
      "group_size": 4
    },
    "agent": "selena-discover",
    "version": "1.0.0"
  }
}
```

#### POST /recommend
Get personalized recommendations based on user preferences.

**Request:**
```json
{
  "preferred_categories": ["gaming", "adventure"],
  "location": "الرياض",
  "language": "ar",
  "context_hint": "اقترح أنشطة للمساء"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": {
      "results": [...], // Same structure as search results
      "personalized_insights": [...],
      "cultural_recommendations": [...]
    },
    "trending_insights": {
      "trending_categories": [
        {
          "name": "ألعاب إلكترونية",
          "growth": "+25%",
          "reason": "موسم البطولات"
        }
      ],
      "popular_locations": [...],
      "seasonal_recommendations": [...]
    },
    "personalization_applied": true
  },
  "meta": {
    "agent": "selena-discover",
    "recommendation_type": "personalized",
    "user_id": "user_id_string"
  }
}
```

#### GET /trending
Get trending activities and cultural insights.

**Query Parameters:**
- `language` (optional): "ar" or "en" (default: "ar")
- `location` (optional): City name for location-specific trends

**Response:**
```json
{
  "success": true,
  "data": {
    "trending_data": {
      "trending_categories": [...],
      "popular_locations": [...],
      "seasonal_recommendations": [...]
    },
    "cultural_events": [
      {
        "name": "موسم اليوم الوطني",
        "description": "فعاليات وأنشطة خاصة بمناسبة اليوم الوطني السعودي",
        "boost_categories": ["cultural", "entertainment", "social"]
      }
    ],
    "database_trending": [...], // Real-time database trends
    "real_time_insights": {...}
  }
}
```

#### GET /nearby/:location
Discover activities near a specific location.

**Path Parameters:**
- `location`: City name or area name

**Query Parameters:**
- `radius` (optional): Search radius in kilometers (default: 10)
- `language` (optional): "ar" or "en" (default: "ar")

#### POST /chat
Natural language chat interface for discovery.

**Request:**
```json
{
  "message": "أريد أنشطة ممتعة للعائلة في نهاية الأسبوع",
  "language": "ar",
  "session_id": "optional_session_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "وجدت عدة أنشطة عائلية ممتعة! 🎯\n\n🏆 أفضل التوصيات:\n1. ورشة طبخ المأكولات السعودية - 95 ريال\n   💡 مناسب للعائلات | يحترم القيم التقليدية...",
    "agent": "selena-discover",
    "language": "ar",
    "session_id": "session_123"
  }
}
```

#### POST /preferences
Save user search preferences (requires authentication).

#### GET /history
Get user's search history (requires authentication).

#### POST /track
Track user interactions with search results (requires authentication).

#### GET /analytics
Get user's discovery analytics (requires authentication).

### Direct AI Agent Endpoints (Python/FastAPI)

Base URL: `https://your-agents-domain.com`

#### POST /discover/search
Direct access to the AI discovery engine.

#### POST /discover/recommend
Direct personalized recommendations.

#### GET /discover/trending
Direct trending data from AI analysis.

#### POST /discover/chat
Direct natural language chat interface.

## Search Query Processing

### Natural Language Understanding

The Selena-Discover agent processes queries through multiple stages:

1. **Language Detection**: Automatically detects Arabic, English, or mixed languages
2. **Intent Recognition**: Identifies search intent (find, recommend, nearby, popular)
3. **Entity Extraction**: Extracts locations, activity types, prices, group sizes
4. **Cultural Context**: Analyzes cultural indicators and preferences

### Supported Query Patterns

#### Arabic Queries
```
"ابحث عن أنشطة مغامرات في الرياض"
"أريد نشاط عائلي أقل من 100 ريال"
"وش أفضل أنشطة ألعاب قريبة مني؟"
"اقترح لي أنشطة للمساء مع الأصدقاء"
```

#### English Queries
```
"Find adventure activities in Riyadh"
"I want family activities under 100 SAR"
"What are the best gaming activities near me?"
"Recommend evening activities with friends"
```

#### Mixed Language Queries
```
"Find ألعاب activities في الرياض"
"I want أنشطة عائلية in Jeddah"
```

## Cultural Context Features

### Prayer Time Considerations
- Automatically suggests activity times that respect prayer schedules
- Provides alternatives during prayer times
- Considers cultural peak hours

### Family-Friendly Features
- Identifies family-suitable activities
- Considers gender-separated options when relevant
- Prioritizes educational and cultural value

### Saudi Cultural Insights
- Local venue popularity trends
- Traditional vs. modern activity preferences
- Seasonal and cultural event awareness
- Regional preference variations

## Recommendation Algorithm

### Scoring Components

1. **Relevance Score** (30% weight)
   - Query matching against title, description, tags
   - Category alignment with detected intent
   - Language-specific matching

2. **Cultural Fit Score** (25% weight)
   - Family-friendly indicators
   - Traditional value alignment
   - Religious considerations
   - Social gathering suitability

3. **Popularity Score** (20% weight)
   - Total bookings and revenue
   - User ratings and reviews
   - Recent activity trends
   - Vendor reputation

4. **Geographic Score** (15% weight)
   - Distance from user location
   - Transportation accessibility
   - Local area popularity
   - Landmark proximity

5. **Price Preference Score** (10% weight)
   - User price sensitivity
   - Historical spending patterns
   - Budget optimization
   - Value for money assessment

### Machine Learning Components

#### Collaborative Filtering
- User-based similarity matching
- Activity-based recommendation
- Cultural preference clustering
- Geographic behavior patterns

#### Content-Based Filtering
- Activity feature matching
- Category preference learning
- Cultural context scoring
- Vendor quality assessment

## Performance Specifications

### Response Time Requirements
- **Target**: <300ms for search queries
- **Personalized recommendations**: <500ms
- **Chat responses**: <200ms
- **Trending data**: <100ms

### Accuracy Targets
- **Search relevance**: >85%
- **Recommendation accuracy**: >80%
- **Cultural appropriateness**: >90%
- **Language detection**: >95%

### Scalability
- **Concurrent users**: 500+
- **Search queries per minute**: 1000+
- **Database query optimization**: Sub-50ms
- **Memory usage**: <512MB per agent instance

## Error Handling

### Graceful Degradation
1. **AI Agent Unavailable**: Falls back to traditional MongoDB search
2. **Slow Response**: Returns cached results with fresh computation in background
3. **Invalid Query**: Provides helpful suggestions and error guidance
4. **No Results**: Offers alternative searches and trending recommendations

### Error Responses
```json
{
  "success": false,
  "message": "فشل في البحث عن الأنشطة",
  "fallback_data": {
    "traditional_search": [...],
    "suggestions": [...]
  },
  "meta": {
    "error_type": "agent_timeout",
    "fallback_used": true
  }
}
```

## Database Schema

### SearchHistory Model
Tracks user search patterns for learning and analytics.

**Key Fields:**
- `user`: Reference to User model
- `searchQuery`: Original and processed query data
- `nlpAnalysis`: Intent, entities, and confidence scores
- `appliedFilters`: Filters applied to search
- `searchResults`: Results and interaction data
- `performanceMetrics`: Response time and processing metrics
- `culturalContext`: Cultural considerations and context

### VenuePopularityMetrics Model
Stores popularity and cultural metrics for venues and activities.

**Key Fields:**
- `venue/activity`: Reference to venue or activity
- `popularityScore`: Current and historical popularity
- `culturalMetrics`: Cultural fit and appropriateness scores
- `geographicMetrics`: Location-based analytics
- `timePatterns`: Time-based popularity patterns
- `demographicInsights`: User demographic analysis

### UserSearchPreferences Model
Learns and stores user preferences for personalization.

**Key Fields:**
- `user`: Reference to User model
- `activityPreferences`: Category and tag preferences
- `pricePreferences`: Price sensitivity and spending patterns
- `locationPreferences`: Geographic preferences and travel willingness
- `culturalPreferences`: Cultural and social preferences
- `learningData`: ML model data and prediction accuracy

## Integration Guide

### Frontend Integration

#### React/JavaScript Example
```javascript
import axios from 'axios';

// Intelligent search
const searchActivities = async (query, options = {}) => {
  try {
    const response = await axios.post('/api/discover/search', {
      query,
      language: options.language || 'ar',
      location: options.location,
      price_range: options.priceRange,
      group_size: options.groupSize,
      cultural_preferences: options.culturalPrefs
    });
    
    return response.data;
  } catch (error) {
    console.error('Search failed:', error);
    // Handle fallback or error state
  }
};

// Natural language chat
const chatWithSelena = async (message, sessionId) => {
  try {
    const response = await axios.post('/api/discover/chat', {
      message,
      language: 'ar', // or detect from message
      session_id: sessionId
    });
    
    return response.data.data.response;
  } catch (error) {
    console.error('Chat failed:', error);
    return 'عذراً، حدث خطأ في معالجة طلبك';
  }
};

// Get personalized recommendations
const getRecommendations = async (userPreferences) => {
  try {
    const response = await axios.post('/api/discover/recommend', {
      preferred_categories: userPreferences.categories,
      location: userPreferences.location,
      language: 'ar',
      context_hint: 'اقترح أنشطة مناسبة لي'
    });
    
    return response.data;
  } catch (error) {
    console.error('Recommendations failed:', error);
  }
};
```

### Backend Service Integration

#### Express.js Middleware
```javascript
const discoverMiddleware = async (req, res, next) => {
  // Add user context for personalization
  if (req.user) {
    req.user_context = {
      user_id: req.user._id.toString(),
      preferences: await getUserPreferences(req.user._id),
      location: req.user.location,
      search_history: await getRecentSearches(req.user._id)
    };
  }
  next();
};

// Use middleware
app.use('/api/discover', discoverMiddleware, discoverRoutes);
```

### Database Integration

#### MongoDB Connection
The agent integrates with existing MongoDB models and creates new collections for enhanced functionality:

```javascript
// Import new models
const SearchHistory = require('./models/SearchHistory');
const VenuePopularityMetrics = require('./models/VenuePopularityMetrics');
const UserSearchPreferences = require('./models/UserSearchPreferences');

// Create indexes for performance
async function createDiscoverIndexes() {
  await SearchHistory.createIndexes();
  await VenuePopularityMetrics.createIndexes();
  await UserSearchPreferences.createIndexes();
  
  // Geospatial indexes for proximity search
  await Activity.collection.createIndex({ "location.coordinates": "2dsphere" });
  await Vendor.collection.createIndex({ "location.coordinates": "2dsphere" });
}
```

## Testing and Validation

### Running Tests
```bash
# Run comprehensive test suite
node test-selena-discover-agent.js

# Run specific test categories
node test-selena-discover-agent.js --category=nlp
node test-selena-discover-agent.js --category=performance
node test-selena-discover-agent.js --category=cultural
```

### Test Categories

1. **Natural Language Processing**
   - Arabic query understanding
   - English query processing
   - Mixed language handling
   - Intent recognition accuracy

2. **Cultural Context**
   - Saudi cultural awareness
   - Family-friendly recommendations
   - Prayer time considerations
   - Local preference matching

3. **Performance Benchmarks**
   - Response time validation (<300ms)
   - Concurrent load testing
   - Memory usage optimization
   - Database query performance

4. **Integration Testing**
   - Backend API integration
   - Database enrichment
   - Error handling and fallbacks
   - Authentication flow

## Deployment

### Production Deployment
```bash
# Deploy Selena-Discover agent
./deploy-selena-discover.sh

# Or manual deployment
cd agents
pip install -r requirements.txt
python -m uvicorn api.main:app --host 0.0.0.0 --port 8001

cd ../server
npm install
npm run dev
```

### Environment Variables
```bash
# Required
REDIS_URL=redis://your-redis-url
MONGODB_URI=mongodb://your-mongodb-url

# Optional (with defaults)
OLLAMA_HOST=http://localhost:11434
AGENTS_API_URL=http://localhost:8001
NODE_ENV=production
```

### Render.com Configuration
```yaml
# render.yaml
services:
  - type: web
    name: ludus-agents
    env: python
    buildCommand: "pip install -r agents/requirements.txt"
    startCommand: "cd agents && python -m uvicorn api.main:app --host 0.0.0.0 --port $PORT"
    
  - type: web
    name: ludus-backend
    env: node
    buildCommand: "cd server && npm install"
    startCommand: "cd server && npm start"
```

## Monitoring and Analytics

### Performance Monitoring
- Response time tracking
- Error rate monitoring
- Search accuracy metrics
- User satisfaction scores

### Usage Analytics
- Search volume and patterns
- Popular query types
- Cultural preference trends
- Geographic usage distribution

### Health Checks
```bash
# Agent service health
curl http://localhost:8001/health

# Backend service health
curl http://localhost:5000/api/health

# Full integration test
curl -X POST http://localhost:5000/api/discover/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test","language":"ar"}'
```

## Best Practices

### Query Optimization
1. **Specific Queries**: Use specific terms for better results
2. **Cultural Context**: Include cultural preferences when relevant
3. **Location Data**: Provide location for proximity-based results
4. **Price Ranges**: Specify budget constraints for targeted results

### Personalization
1. **User Tracking**: Track user interactions for learning
2. **Preference Updates**: Regularly update user preferences
3. **Cultural Alignment**: Respect cultural and religious preferences
4. **Privacy**: Follow privacy settings and data retention policies

### Performance
1. **Caching**: Implement appropriate caching strategies
2. **Batch Requests**: Use batch operations for multiple queries
3. **Fallback Handling**: Always provide fallback options
4. **Error Recovery**: Implement graceful error recovery

## Troubleshooting

### Common Issues

1. **Slow Response Times**
   - Check Redis connection
   - Verify database indexes
   - Monitor agent service health
   - Consider result caching

2. **Poor Search Results**
   - Verify query language detection
   - Check cultural context settings
   - Update trending data
   - Review user preference learning

3. **Integration Errors**
   - Verify API URLs and connectivity
   - Check authentication tokens
   - Validate request/response formats
   - Monitor network timeouts

### Debug Endpoints
```bash
# Get agent information
GET /agents

# Check specific agent performance
GET /monitoring/agents/discover/performance

# View search analytics
GET /discover/analytics/{user_id}
```

## Future Enhancements

### Planned Features
- Voice search integration
- Real-time availability checking
- Advanced ML recommendation models
- Cross-platform synchronization
- Enhanced Arabic dialect support

### Integration Roadmap
- Booking system integration
- Payment flow optimization
- Social sharing features
- Calendar integration
- Notification system enhancement

---

**Version:** 1.0.0  
**Last Updated:** September 28, 2025  
**Maintainer:** LUDUS Development Team  
**License:** Proprietary - LUDUS Platform