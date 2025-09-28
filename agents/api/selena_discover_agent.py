"""
Selena-Discover AI Agent - Advanced AI-powered venue and game search with personalized recommendations

This agent implements intelligent search capabilities with:
- Natural language processing for Arabic/English queries
- Cultural context awareness for Saudi Arabian market
- Personalized recommendations using ML algorithms
- Geographic proximity calculations
- Advanced filtering and ranking systems
- Search history analytics and learning
"""

import json
import uuid
import re
import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union
from pydantic import BaseModel, Field
from dataclasses import dataclass
import requests
import os


class SearchQuery(BaseModel):
    """Enhanced search query model with NLP capabilities"""
    query: str = Field(..., description="Natural language search query")
    location: Optional[str] = Field(None, description="Location filter (city, area, coordinates)")
    price_range: Optional[Tuple[float, float]] = Field(None, description="Price range filter (min, max)")
    date_preference: Optional[str] = Field(None, description="Date or time preference")
    group_size: Optional[int] = Field(None, description="Number of participants")
    activity_types: Optional[List[str]] = Field(None, description="Preferred activity categories")
    cultural_preferences: Optional[Dict[str, Any]] = Field(None, description="Cultural context preferences")
    user_context: Optional[Dict[str, Any]] = Field(None, description="User profile and history context")
    language: str = Field(default="ar", description="Query language (ar/en)")
    search_intent: Optional[str] = Field(None, description="Detected search intent")


class SearchResult(BaseModel):
    """Enhanced search result with AI-powered insights"""
    activity_id: str
    title: str
    title_en: Optional[str]
    description: str
    description_en: Optional[str]
    category: str
    subcategory: Optional[str]
    venue_info: Dict[str, Any]
    pricing: Dict[str, Any]
    location: Dict[str, Any]
    availability: Dict[str, Any]
    rating: float
    popularity_score: float
    cultural_fit_score: float
    relevance_score: float
    distance_km: Optional[float]
    recommendations_reason: List[str]
    images: List[str]
    tags: List[str]


class DiscoverResponse(BaseModel):
    """Comprehensive discovery response"""
    search_id: str
    query_analysis: Dict[str, Any]
    results: List[SearchResult]
    total_count: int
    search_time_ms: int
    personalized_insights: List[str]
    cultural_recommendations: List[str]
    trending_activities: List[Dict[str, Any]]
    filters_applied: Dict[str, Any]
    search_suggestions: List[str]
    geographic_clusters: List[Dict[str, Any]]


@dataclass
class GeographicPoint:
    """Geographic coordinate point"""
    latitude: float
    longitude: float
    
    def distance_to(self, other: 'GeographicPoint') -> float:
        """Calculate distance in kilometers using Haversine formula"""
        R = 6371  # Earth's radius in kilometers
        
        lat1_rad = math.radians(self.latitude)
        lon1_rad = math.radians(self.longitude)
        lat2_rad = math.radians(other.latitude)
        lon2_rad = math.radians(other.longitude)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c


class SelenaDiscoverEngine:
    """
    Advanced AI-powered discovery engine for LUDUS platform
    
    Provides intelligent search, recommendations, and cultural insights
    for venue and game discovery in Saudi Arabian context.
    """
    
    def __init__(self, redis_client=None, ollama_host: str = None):
        self.redis_client = redis_client
        self.ollama_host = ollama_host or os.environ.get("OLLAMA_HOST", "http://localhost:11434")
        self.search_history_key = "discover:search_history"
        self.user_preferences_key = "discover:user_preferences"
        self.popularity_metrics_key = "discover:popularity_metrics"
        
        # Cultural context definitions for Saudi Arabia
        self.cultural_contexts = {
            "prayer_times": {
                "peak_activity_hours": ["10:00-11:30", "14:00-15:30", "19:30-21:30"],
                "avoid_hours": ["12:00-13:00", "15:30-16:00", "18:00-19:00", "20:30-21:00"],
                "description_ar": "أوقات الصلاة والذروة الثقافية",
                "description_en": "Prayer times and cultural peak hours"
            },
            "family_friendly": {
                "indicators": ["عائلية", "أطفال", "family", "kids", "children"],
                "requirements": ["separate_sections", "child_activities", "family_pricing"],
                "boost_score": 1.3
            },
            "gender_preferences": {
                "mixed_indicators": ["مختلط", "mixed", "co-ed", "together"],
                "separate_indicators": ["منفصل", "separate", "ladies", "men", "women"],
                "cultural_weight": 1.2
            },
            "saudi_gaming_culture": {
                "popular_categories": ["esports", "adventure", "sports", "cultural", "food"],
                "trending_activities": ["mobile_gaming", "board_games", "outdoor_adventures"],
                "cultural_events": ["national_day", "ramadan", "eid", "founding_day"]
            }
        }
        
        # Arabic NLP patterns and keywords
        self.arabic_nlp_patterns = {
            "search_intents": {
                "find_activity": ["ابحث عن", "أريد", "أبحث", "بدي", "find", "search", "looking for"],
                "recommendation": ["اقترح", "وش تنصح", "recommend", "suggest", "what do you recommend"],
                "nearby": ["قريب", "بالقرب", "nearby", "close", "around me"],
                "popular": ["مشهور", "شائع", "popular", "trending", "hot"],
                "group": ["مع أصدقاء", "جماعي", "group", "friends", "together"],
                "solo": ["لوحدي", "فردي", "solo", "alone", "individual"]
            },
            "activity_types": {
                "adventure": ["مغامرة", "مغامرات", "تسلق", "تخييم", "adventure", "climbing", "camping", "hiking"],
                "gaming": ["ألعاب", "جيمنج", "إي سبورت", "gaming", "esports", "video games", "pc"],
                "sports": ["رياضة", "كرة", "سباحة", "جري", "sports", "football", "swimming", "running"],
                "cultural": ["ثقافي", "تراث", "متحف", "cultural", "heritage", "museum", "traditional"],
                "food": ["طبخ", "طعام", "مطعم", "cooking", "food", "restaurant", "culinary"],
                "entertainment": ["ترفيه", "سينما", "مسرح", "entertainment", "cinema", "theater", "fun"],
                "wellness": ["صحة", "يوجا", "استرخاء", "wellness", "yoga", "relaxation", "spa"],
                "social": ["اجتماعي", "تعارف", "شبكة", "social", "networking", "meetup", "gathering"]
            },
            "location_keywords": {
                "cities": {
                    "الرياض": ["riyadh", "الرياض", "العاصمة"],
                    "جدة": ["jeddah", "جدة", "جده"],
                    "الدمام": ["dammam", "الدمام", "الشرقية"],
                    "مكة": ["mecca", "مكة", "مكة المكرمة"],
                    "المدينة": ["medina", "المدينة", "المدينة المنورة"],
                    "الطائف": ["taif", "الطائف"],
                    "تبوك": ["tabuk", "تبوك"],
                    "أبها": ["abha", "أبها"],
                    "الخبر": ["khobar", "الخبر"],
                    "القطيف": ["qatif", "القطيف"]
                },
                "areas": {
                    "شمال الرياض": ["north riyadh", "شمال الرياض"],
                    "جنوب الرياض": ["south riyadh", "جنوب الرياض"],
                    "شرق الرياض": ["east riyadh", "شرق الرياض"],
                    "غرب الرياض": ["west riyadh", "غرب الرياض"],
                    "وسط الرياض": ["central riyadh", "وسط الرياض", "center riyadh"]
                }
            },
            "time_expressions": {
                "today": ["اليوم", "today"],
                "tomorrow": ["غداً", "غدا", "tomorrow"],
                "weekend": ["نهاية الأسبوع", "weekend", "الويك اند"],
                "evening": ["مساء", "evening", "night"],
                "morning": ["صباح", "morning"],
                "afternoon": ["ظهر", "afternoon", "بعد الظهر"]
            }
        }
        
        # Recommendation algorithms configuration
        self.recommendation_config = {
            "weights": {
                "user_history": 0.3,
                "cultural_fit": 0.25,
                "popularity": 0.2,
                "proximity": 0.15,
                "price_preference": 0.1
            },
            "cultural_factors": {
                "family_oriented": 1.4,
                "traditional_values": 1.2,
                "modern_tech": 1.3,
                "social_gathering": 1.1,
                "educational": 1.2
            }
        }

    def _extract_search_intent(self, query: str, language: str = "ar") -> Dict[str, Any]:
        """Extract search intent using NLP analysis"""
        query_lower = query.lower()
        intent_analysis = {
            "primary_intent": "search",
            "entities": [],
            "activity_types": [],
            "location": None,
            "time_preference": None,
            "group_context": None,
            "cultural_context": {},
            "confidence": 0.0
        }
        
        # Detect primary intent
        for intent, keywords in self.arabic_nlp_patterns["search_intents"].items():
            if any(keyword in query_lower for keyword in keywords):
                intent_analysis["primary_intent"] = intent
                intent_analysis["confidence"] += 0.2
                break
        
        # Extract activity types
        for activity_type, keywords in self.arabic_nlp_patterns["activity_types"].items():
            if any(keyword in query_lower for keyword in keywords):
                intent_analysis["activity_types"].append(activity_type)
                intent_analysis["confidence"] += 0.15
        
        # Extract location
        for city_ar, variations in self.arabic_nlp_patterns["location_keywords"]["cities"].items():
            if any(variation in query_lower for variation in variations):
                intent_analysis["location"] = city_ar
                intent_analysis["confidence"] += 0.2
                break
        
        # Extract time preferences
        for time_type, keywords in self.arabic_nlp_patterns["time_expressions"].items():
            if any(keyword in query_lower for keyword in keywords):
                intent_analysis["time_preference"] = time_type
                intent_analysis["confidence"] += 0.1
                break
        
        # Detect group context
        group_keywords = ["مع أصدقاء", "جماعي", "group", "friends", "together"]
        solo_keywords = ["لوحدي", "فردي", "solo", "alone", "individual"]
        
        if any(keyword in query_lower for keyword in group_keywords):
            intent_analysis["group_context"] = "group"
            intent_analysis["confidence"] += 0.1
        elif any(keyword in query_lower for keyword in solo_keywords):
            intent_analysis["group_context"] = "solo"
            intent_analysis["confidence"] += 0.1
        
        # Cultural context detection
        family_keywords = ["عائلة", "عائلي", "أطفال", "family", "kids", "children"]
        if any(keyword in query_lower for keyword in family_keywords):
            intent_analysis["cultural_context"]["family_friendly"] = True
            intent_analysis["confidence"] += 0.15
        
        return intent_analysis

    def _calculate_cultural_fit_score(self, activity: Dict[str, Any], user_context: Dict[str, Any], 
                                     search_intent: Dict[str, Any]) -> float:
        """Calculate cultural fit score based on Saudi cultural preferences"""
        base_score = 0.5
        cultural_modifiers = []
        
        # Family-friendly boost
        if search_intent.get("cultural_context", {}).get("family_friendly"):
            if "family" in activity.get("tags", []) or "عائلي" in activity.get("tags", []):
                cultural_modifiers.append(("family_friendly", 0.3))
        
        # Time-based cultural considerations
        if "prayer_aware" in activity.get("tags", []):
            cultural_modifiers.append(("prayer_awareness", 0.2))
        
        # Saudi culture alignment
        saudi_cultural_tags = ["سعودي", "تراث", "محلي", "traditional", "heritage", "local"]
        if any(tag in activity.get("tags", []) for tag in saudi_cultural_tags):
            cultural_modifiers.append(("cultural_alignment", 0.25))
        
        # Social gathering preferences
        if search_intent.get("group_context") == "group":
            if activity.get("capacity", {}).get("max", 1) >= 4:
                cultural_modifiers.append(("group_suitable", 0.2))
        
        # Calculate final score
        for modifier_name, modifier_value in cultural_modifiers:
            base_score += modifier_value
        
        return min(base_score, 1.0)

    def _calculate_geographic_score(self, activity: Dict[str, Any], user_location: Optional[Dict[str, Any]]) -> float:
        """Calculate geographic proximity score"""
        if not user_location or not activity.get("location", {}).get("coordinates"):
            return 0.5  # Neutral score if no location data
        
        try:
            user_coords = GeographicPoint(
                latitude=user_location.get("latitude", 24.7136),  # Default to Riyadh
                longitude=user_location.get("longitude", 46.6753)
            )
            
            activity_coords = activity["location"]["coordinates"]
            activity_point = GeographicPoint(
                latitude=activity_coords[1],  # GeoJSON format [lng, lat]
                longitude=activity_coords[0]
            )
            
            distance = user_coords.distance_to(activity_point)
            
            # Convert distance to score (closer = higher score)
            if distance <= 5:
                return 1.0
            elif distance <= 15:
                return 0.8
            elif distance <= 30:
                return 0.6
            elif distance <= 50:
                return 0.4
            else:
                return 0.2
                
        except Exception:
            return 0.5

    def _calculate_popularity_score(self, activity: Dict[str, Any]) -> float:
        """Calculate popularity score based on bookings, ratings, and trends"""
        base_score = 0.3
        
        # Rating contribution
        rating = activity.get("rating", {}).get("average", 0)
        rating_score = rating / 5.0 * 0.4
        
        # Booking count contribution
        total_bookings = activity.get("statistics", {}).get("totalBookings", 0)
        booking_score = min(total_bookings / 100.0, 1.0) * 0.3  # Cap at 100 bookings
        
        # Recency boost for newer activities
        created_at = activity.get("createdAt")
        recency_score = 0.0
        if created_at:
            try:
                created_date = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                days_since_creation = (datetime.now() - created_date).days
                if days_since_creation <= 30:
                    recency_score = 0.1 * (30 - days_since_creation) / 30
            except Exception:
                pass
        
        return min(base_score + rating_score + booking_score + recency_score, 1.0)

    def _calculate_relevance_score(self, activity: Dict[str, Any], search_query: SearchQuery, 
                                  search_intent: Dict[str, Any]) -> float:
        """Calculate relevance score based on query matching"""
        relevance_score = 0.0
        query_lower = search_query.query.lower()
        
        # Title matching
        title_fields = [activity.get("title", ""), activity.get("title_en", "")]
        for title in title_fields:
            if title and query_lower in title.lower():
                relevance_score += 0.4
                break
        
        # Description matching
        desc_fields = [activity.get("description", ""), activity.get("description_en", "")]
        for desc in desc_fields:
            if desc and query_lower in desc.lower():
                relevance_score += 0.2
                break
        
        # Category matching
        detected_types = search_intent.get("activity_types", [])
        if activity.get("category") in detected_types:
            relevance_score += 0.3
        
        # Tags matching
        activity_tags = activity.get("tags", [])
        for tag in activity_tags:
            if query_lower in tag.lower():
                relevance_score += 0.1
                break
        
        return min(relevance_score, 1.0)

    def _generate_personalized_insights(self, results: List[SearchResult], 
                                       search_query: SearchQuery, user_context: Dict[str, Any]) -> List[str]:
        """Generate personalized insights based on search results and user context"""
        insights = []
        language = search_query.language
        
        if language.startswith("ar"):
            if len(results) > 5:
                insights.append(f"وجدت {len(results)} نشاط مناسب لاهتماماتك")
            
            # Location-based insights
            location_stats = {}
            for result in results:
                city = result.location.get("city", "Unknown")
                location_stats[city] = location_stats.get(city, 0) + 1
            
            if location_stats:
                top_city = max(location_stats, key=location_stats.get)
                insights.append(f"معظم الأنشطة المقترحة في {top_city}")
            
            # Price insights
            prices = [r.pricing.get("basePrice", 0) for r in results if r.pricing.get("basePrice")]
            if prices:
                avg_price = sum(prices) / len(prices)
                insights.append(f"متوسط السعر: {avg_price:.0f} ريال سعودي")
            
            # Cultural insights
            if any("عائلي" in r.tags or "family" in r.tags for r in results):
                insights.append("تم العثور على أنشطة مناسبة للعائلات")
                
        else:
            if len(results) > 5:
                insights.append(f"Found {len(results)} activities matching your interests")
            
            # Location-based insights
            location_stats = {}
            for result in results:
                city = result.location.get("city", "Unknown")
                location_stats[city] = location_stats.get(city, 0) + 1
            
            if location_stats:
                top_city = max(location_stats, key=location_stats.get)
                insights.append(f"Most suggested activities are in {top_city}")
            
            # Price insights
            prices = [r.pricing.get("basePrice", 0) for r in results if r.pricing.get("basePrice")]
            if prices:
                avg_price = sum(prices) / len(prices)
                insights.append(f"Average price: {avg_price:.0f} SAR")
            
            # Cultural insights
            if any("family" in r.tags or "عائلي" in r.tags for r in results):
                insights.append("Found family-friendly activities")
        
        return insights

    def _generate_cultural_recommendations(self, search_query: SearchQuery, 
                                         search_intent: Dict[str, Any]) -> List[str]:
        """Generate cultural recommendations based on Saudi context"""
        recommendations = []
        language = search_query.language
        
        current_hour = datetime.now().hour
        
        if language.startswith("ar"):
            # Prayer time recommendations
            if 11 <= current_hour <= 13:
                recommendations.append("يُنصح بحجز الأنشطة بعد صلاة الظهر للحصول على أفضل تجربة")
            elif 15 <= current_hour <= 16:
                recommendations.append("أنشطة المساء متاحة بعد صلاة العصر")
            
            # Cultural context recommendations
            if search_intent.get("cultural_context", {}).get("family_friendly"):
                recommendations.append("ننصح بالأنشطة التي توفر أماكن منفصلة للعائلات")
            
            # Seasonal recommendations
            current_month = datetime.now().month
            if current_month in [12, 1, 2]:  # Winter months
                recommendations.append("أنشطة الشتاء والطقس البارد مناسبة أكثر في هذا الوقت")
            elif current_month in [6, 7, 8]:  # Summer months
                recommendations.append("ننصح بالأنشطة الداخلية أو المسائية لتجنب الحر")
        else:
            # Prayer time recommendations
            if 11 <= current_hour <= 13:
                recommendations.append("Activities after Dhuhr prayer are recommended for the best experience")
            elif 15 <= current_hour <= 16:
                recommendations.append("Evening activities are available after Asr prayer")
            
            # Cultural context recommendations
            if search_intent.get("cultural_context", {}).get("family_friendly"):
                recommendations.append("We recommend activities with separate family sections")
            
            # Seasonal recommendations
            current_month = datetime.now().month
            if current_month in [12, 1, 2]:  # Winter months
                recommendations.append("Winter and cool weather activities are more suitable now")
            elif current_month in [6, 7, 8]:  # Summer months
                recommendations.append("Indoor or evening activities are recommended to avoid heat")
        
        return recommendations

    def _get_trending_activities(self, language: str = "ar") -> List[Dict[str, Any]]:
        """Get trending activities based on recent bookings and popularity"""
        # Mock trending data - in production, this would come from analytics
        trending = [
            {
                "id": "TREND001",
                "name": "إي سبورت تورنامنت" if language.startswith("ar") else "Esports Tournament",
                "category": "gaming",
                "popularity_increase": "15%",
                "location": "الرياض" if language.startswith("ar") else "Riyadh"
            },
            {
                "id": "TREND002", 
                "name": "رحلة تخييم الشتاء" if language.startswith("ar") else "Winter Camping Trip",
                "category": "adventure",
                "popularity_increase": "22%",
                "location": "أبها" if language.startswith("ar") else "Abha"
            }
        ]
        return trending

    def _cluster_geographic_results(self, results: List[SearchResult]) -> List[Dict[str, Any]]:
        """Group results by geographic clusters"""
        clusters = {}
        
        for result in results:
            city = result.location.get("city", "Unknown")
            if city not in clusters:
                clusters[city] = {
                    "city": city,
                    "count": 0,
                    "avg_price": 0,
                    "avg_rating": 0,
                    "activities": []
                }
            
            clusters[city]["count"] += 1
            clusters[city]["activities"].append(result.activity_id)
            
            # Update averages
            total_activities = clusters[city]["count"]
            current_avg_price = clusters[city]["avg_price"]
            current_avg_rating = clusters[city]["avg_rating"]
            
            new_price = result.pricing.get("basePrice", 0)
            new_rating = result.rating
            
            clusters[city]["avg_price"] = ((current_avg_price * (total_activities - 1)) + new_price) / total_activities
            clusters[city]["avg_rating"] = ((current_avg_rating * (total_activities - 1)) + new_rating) / total_activities
        
        return list(clusters.values())

    def _save_search_analytics(self, search_query: SearchQuery, results_count: int, 
                              search_time_ms: int, user_id: str = "anonymous"):
        """Save search analytics for improvement and personalization"""
        if not self.redis_client:
            return
        
        try:
            search_record = {
                "search_id": str(uuid.uuid4()),
                "user_id": user_id,
                "query": search_query.query,
                "language": search_query.language,
                "results_count": results_count,
                "search_time_ms": search_time_ms,
                "filters": {
                    "location": search_query.location,
                    "price_range": search_query.price_range,
                    "group_size": search_query.group_size,
                    "activity_types": search_query.activity_types
                },
                "timestamp": datetime.now().isoformat(),
                "cultural_context": search_query.cultural_preferences
            }
            
            # Save individual search record
            search_key = f"discover:search:{search_record['search_id']}"
            self.redis_client.setex(search_key, 60 * 60 * 24 * 7, json.dumps(search_record))
            
            # Add to user's search history
            user_history_key = f"discover:user_history:{user_id}"
            history_data = self.redis_client.get(user_history_key)
            if history_data:
                history = json.loads(history_data)
            else:
                history = []
            
            history.append(search_record)
            # Keep only last 100 searches
            history = history[-100:]
            
            self.redis_client.setex(user_history_key, 60 * 60 * 24 * 30, json.dumps(history))
            
        except Exception as e:
            print(f"Error saving search analytics: {e}")

    def discover_activities(self, search_query: SearchQuery, user_id: str = "anonymous") -> DiscoverResponse:
        """
        Main discovery method that processes natural language queries and returns
        intelligent, culturally-aware activity recommendations
        """
        start_time = datetime.now()
        search_id = str(uuid.uuid4())
        
        try:
            # Step 1: Analyze search intent using NLP
            search_intent = self._extract_search_intent(search_query.query, search_query.language)
            
            # Step 2: Get base activity data (mock data for now - in production, query MongoDB)
            base_activities = self._get_mock_activity_data()
            
            # Step 3: Apply intelligent filtering
            filtered_activities = self._apply_intelligent_filters(base_activities, search_query, search_intent)
            
            # Step 4: Calculate AI-powered scores for each activity
            scored_results = []
            for activity in filtered_activities:
                # Calculate multiple scoring dimensions
                cultural_score = self._calculate_cultural_fit_score(
                    activity, search_query.user_context or {}, search_intent
                )
                geographic_score = self._calculate_geographic_score(
                    activity, search_query.user_context.get("location") if search_query.user_context else None
                )
                popularity_score = self._calculate_popularity_score(activity)
                relevance_score = self._calculate_relevance_score(activity, search_query, search_intent)
                
                # Combined weighted score
                weights = self.recommendation_config["weights"]
                final_score = (
                    relevance_score * 0.3 +
                    cultural_score * weights["cultural_fit"] +
                    popularity_score * weights["popularity"] +
                    geographic_score * weights["proximity"]
                )
                
                # Generate recommendation reasons
                reasons = self._generate_recommendation_reasons(
                    activity, search_intent, cultural_score, geographic_score, 
                    popularity_score, relevance_score, search_query.language
                )
                
                # Create search result
                result = SearchResult(
                    activity_id=activity["id"],
                    title=activity["title"],
                    title_en=activity.get("title_en"),
                    description=activity["description"],
                    description_en=activity.get("description_en"),
                    category=activity["category"],
                    subcategory=activity.get("subcategory"),
                    venue_info=activity.get("vendor", {}),
                    pricing=activity.get("pricing", {}),
                    location=activity.get("location", {}),
                    availability=activity.get("schedule", {}),
                    rating=activity.get("rating", {}).get("average", 0),
                    popularity_score=popularity_score,
                    cultural_fit_score=cultural_score,
                    relevance_score=relevance_score,
                    distance_km=self._calculate_distance_km(activity, search_query.user_context),
                    recommendations_reason=reasons,
                    images=activity.get("images", []),
                    tags=activity.get("tags", [])
                )
                
                scored_results.append((final_score, result))
            
            # Step 5: Sort by final score and select top results
            scored_results.sort(key=lambda x: x[0], reverse=True)
            final_results = [result for score, result in scored_results[:20]]  # Top 20 results
            
            # Step 6: Generate insights and recommendations
            personalized_insights = self._generate_personalized_insights(
                final_results, search_query, search_query.user_context or {}
            )
            cultural_recommendations = self._generate_cultural_recommendations(search_query, search_intent)
            trending_activities = self._get_trending_activities(search_query.language)
            geographic_clusters = self._cluster_geographic_results(final_results)
            
            # Step 7: Generate search suggestions for improved queries
            search_suggestions = self._generate_search_suggestions(search_query, search_intent)
            
            # Calculate search time
            search_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Step 8: Save analytics
            self._save_search_analytics(search_query, len(final_results), search_time_ms, user_id)
            
            # Step 9: Build comprehensive response
            response = DiscoverResponse(
                search_id=search_id,
                query_analysis=search_intent,
                results=final_results,
                total_count=len(final_results),
                search_time_ms=search_time_ms,
                personalized_insights=personalized_insights,
                cultural_recommendations=cultural_recommendations,
                trending_activities=trending_activities,
                filters_applied=self._get_applied_filters(search_query),
                search_suggestions=search_suggestions,
                geographic_clusters=geographic_clusters
            )
            
            return response
            
        except Exception as e:
            # Return empty response on error
            search_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            print(f"Error in discover_activities: {e}")
            
            return DiscoverResponse(
                search_id=search_id,
                query_analysis={"error": str(e)},
                results=[],
                total_count=0,
                search_time_ms=search_time_ms,
                personalized_insights=[],
                cultural_recommendations=[],
                trending_activities=[],
                filters_applied={},
                search_suggestions=[],
                geographic_clusters=[]
            )

    def _apply_intelligent_filters(self, activities: List[Dict[str, Any]], 
                                  search_query: SearchQuery, search_intent: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply intelligent filtering based on query analysis"""
        filtered = activities.copy()
        
        # Location filtering with fuzzy matching
        if search_query.location or search_intent.get("location"):
            location = search_query.location or search_intent.get("location")
            location_lower = location.lower()
            
            filtered = [a for a in filtered if 
                       location_lower in a.get("location", {}).get("city", "").lower() or
                       location_lower in a.get("location", {}).get("address", "").lower()]
        
        # Activity type filtering
        detected_types = search_intent.get("activity_types", [])
        if detected_types:
            filtered = [a for a in filtered if a.get("category") in detected_types]
        
        # Price range filtering
        if search_query.price_range:
            min_price, max_price = search_query.price_range
            filtered = [a for a in filtered if 
                       min_price <= a.get("pricing", {}).get("basePrice", 0) <= max_price]
        
        # Group size filtering
        if search_query.group_size:
            filtered = [a for a in filtered if 
                       a.get("capacity", {}).get("max", 1) >= search_query.group_size]
        
        # Cultural filtering
        if search_intent.get("cultural_context", {}).get("family_friendly"):
            filtered = [a for a in filtered if 
                       "family" in a.get("tags", []) or "عائلي" in a.get("tags", [])]
        
        return filtered

    def _generate_recommendation_reasons(self, activity: Dict[str, Any], search_intent: Dict[str, Any],
                                       cultural_score: float, geographic_score: float,
                                       popularity_score: float, relevance_score: float,
                                       language: str = "ar") -> List[str]:
        """Generate human-readable recommendation reasons"""
        reasons = []
        
        if language.startswith("ar"):
            if relevance_score > 0.7:
                reasons.append("يطابق بحثك بشكل ممتاز")
            if cultural_score > 0.7:
                reasons.append("مناسب ثقافياً للمجتمع السعودي")
            if geographic_score > 0.8:
                reasons.append("قريب من موقعك")
            if popularity_score > 0.8:
                reasons.append("نشاط شائع ومحبوب")
            if activity.get("rating", {}).get("average", 0) > 4.5:
                reasons.append("تقييم عالي من المستخدمين")
        else:
            if relevance_score > 0.7:
                reasons.append("Excellent match for your search")
            if cultural_score > 0.7:
                reasons.append("Culturally suitable for Saudi community")
            if geographic_score > 0.8:
                reasons.append("Close to your location")
            if popularity_score > 0.8:
                reasons.append("Popular and well-loved activity")
            if activity.get("rating", {}).get("average", 0) > 4.5:
                reasons.append("Highly rated by users")
        
        return reasons

    def _generate_search_suggestions(self, search_query: SearchQuery, 
                                   search_intent: Dict[str, Any]) -> List[str]:
        """Generate search suggestions for query improvement"""
        suggestions = []
        language = search_query.language
        
        if language.startswith("ar"):
            if not search_intent.get("location"):
                suggestions.append("جرب إضافة الموقع: 'في الرياض' أو 'في جدة'")
            if not search_intent.get("activity_types"):
                suggestions.append("حدد نوع النشاط: 'أنشطة رياضية' أو 'أنشطة ثقافية'")
            if not search_query.price_range:
                suggestions.append("حدد الميزانية: 'أقل من 100 ريال' أو 'بين 50-200 ريال'")
        else:
            if not search_intent.get("location"):
                suggestions.append("Try adding location: 'in Riyadh' or 'in Jeddah'")
            if not search_intent.get("activity_types"):
                suggestions.append("Specify activity type: 'sports activities' or 'cultural activities'")
            if not search_query.price_range:
                suggestions.append("Set budget: 'under 100 SAR' or 'between 50-200 SAR'")
        
        return suggestions

    def _calculate_distance_km(self, activity: Dict[str, Any], user_context: Optional[Dict[str, Any]]) -> Optional[float]:
        """Calculate distance in kilometers"""
        if not user_context or not user_context.get("location") or not activity.get("location", {}).get("coordinates"):
            return None
        
        try:
            user_coords = GeographicPoint(
                latitude=user_context["location"].get("latitude", 24.7136),
                longitude=user_context["location"].get("longitude", 46.6753)
            )
            
            activity_coords = activity["location"]["coordinates"]
            activity_point = GeographicPoint(
                latitude=activity_coords[1],
                longitude=activity_coords[0]
            )
            
            return round(user_coords.distance_to(activity_point), 2)
        except Exception:
            return None

    def _get_applied_filters(self, search_query: SearchQuery) -> Dict[str, Any]:
        """Get dictionary of applied filters"""
        filters = {}
        
        if search_query.location:
            filters["location"] = search_query.location
        if search_query.price_range:
            filters["price_range"] = search_query.price_range
        if search_query.group_size:
            filters["group_size"] = search_query.group_size
        if search_query.activity_types:
            filters["activity_types"] = search_query.activity_types
        if search_query.date_preference:
            filters["date_preference"] = search_query.date_preference
        
        return filters

    def _get_mock_activity_data(self) -> List[Dict[str, Any]]:
        """Get mock activity data - in production this would query MongoDB"""
        return [
            {
                "id": "ACT001",
                "title": "تسلق جبل الفهدة",
                "title_en": "Mount Fahda Climbing",
                "description": "مغامرة تسلق جبل الفهدة مع دليل محترف في أجواء آمنة ومناسبة للجميع",
                "description_en": "Mount Fahda climbing adventure with professional guide in safe, family-friendly environment",
                "category": "adventure",
                "subcategory": "climbing",
                "location": {
                    "city": "الرياض",
                    "address": "جبل الفهدة، شمال الرياض",
                    "coordinates": [46.6753, 24.8136]
                },
                "pricing": {
                    "basePrice": 120.0,
                    "currency": "SAR",
                    "priceType": "per_person"
                },
                "rating": {"average": 4.8, "count": 156},
                "tags": ["مغامرة", "تسلق", "طبيعة", "adventure", "climbing", "nature", "guided"],
                "images": ["mountain1.jpg", "mountain2.jpg"],
                "vendor": {"businessName": "مغامرات الصحراء", "businessName_en": "Desert Adventures"},
                "schedule": {"type": "flexible"},
                "capacity": {"min": 2, "max": 8},
                "statistics": {"totalBookings": 89},
                "createdAt": "2024-12-01T00:00:00Z"
            },
            {
                "id": "ACT002",
                "title": "إي سبورت تورنامنت PUBG",
                "title_en": "PUBG Esports Tournament",
                "description": "بطولة PUBG مع جوائز قيمة وأجواء تنافسية ممتعة للاعبين المحترفين والهواة",
                "description_en": "PUBG tournament with valuable prizes and competitive atmosphere for pro and amateur players",
                "category": "gaming",
                "subcategory": "esports",
                "location": {
                    "city": "الرياض",
                    "address": "مركز الألعاب الرقمية، العليا",
                    "coordinates": [46.6837, 24.7478]
                },
                "pricing": {
                    "basePrice": 75.0,
                    "currency": "SAR",
                    "priceType": "per_person"
                },
                "rating": {"average": 4.9, "count": 234},
                "tags": ["ألعاب", "إي سبورت", "تنافس", "gaming", "esports", "competitive", "tournament"],
                "images": ["gaming1.jpg", "tournament1.jpg"],
                "vendor": {"businessName": "نادي الألعاب الرقمية", "businessName_en": "Digital Gaming Club"},
                "schedule": {"type": "fixed"},
                "capacity": {"min": 1, "max": 64},
                "statistics": {"totalBookings": 156},
                "createdAt": "2024-11-15T00:00:00Z"
            },
            {
                "id": "ACT003",
                "title": "ورشة طبخ المأكولات السعودية",
                "title_en": "Saudi Cuisine Cooking Workshop",
                "description": "تعلم طبخ الأطباق السعودية التقليدية مع الشيف محمد في جو عائلي ممتع",
                "description_en": "Learn traditional Saudi cooking with Chef Mohammed in a fun family atmosphere",
                "category": "food",
                "subcategory": "cooking",
                "location": {
                    "city": "جدة",
                    "address": "مركز الطبخ التراثي، البلد",
                    "coordinates": [39.1925, 21.4858]
                },
                "pricing": {
                    "basePrice": 95.0,
                    "currency": "SAR",
                    "priceType": "per_person"
                },
                "rating": {"average": 4.7, "count": 89},
                "tags": ["طبخ", "تراث", "عائلي", "cooking", "heritage", "family", "traditional", "saudi"],
                "images": ["cooking1.jpg", "traditional1.jpg"],
                "vendor": {"businessName": "مطبخ التراث", "businessName_en": "Heritage Kitchen"},
                "schedule": {"type": "recurring"},
                "capacity": {"min": 4, "max": 12},
                "statistics": {"totalBookings": 67},
                "createdAt": "2024-10-20T00:00:00Z"
            },
            {
                "id": "ACT004",
                "title": "رحلة استكشاف الباحة",
                "title_en": "Al-Baha Exploration Trip",
                "description": "رحلة استكشاف منطقة الباحة الجميلة مع مرشد سياحي متخصص وأنشطة طبيعية",
                "description_en": "Beautiful Al-Baha region exploration with specialized tour guide and nature activities",
                "category": "adventure",
                "subcategory": "exploration",
                "location": {
                    "city": "الباحة",
                    "address": "منتزه الباحة الوطني",
                    "coordinates": [41.4684, 20.0129]
                },
                "pricing": {
                    "basePrice": 180.0,
                    "currency": "SAR",
                    "priceType": "per_person"
                },
                "rating": {"average": 4.6, "count": 45},
                "tags": ["استكشاف", "طبيعة", "رحلة", "exploration", "nature", "trip", "guided"],
                "images": ["albaha1.jpg", "nature1.jpg"],
                "vendor": {"businessName": "رحلات الجنوب", "businessName_en": "Southern Trips"},
                "schedule": {"type": "fixed"},
                "capacity": {"min": 6, "max": 15},
                "statistics": {"totalBookings": 23},
                "createdAt": "2024-09-10T00:00:00Z"
            },
            {
                "id": "ACT005",
                "title": "ليلة ألعاب الطاولة",
                "title_en": "Board Game Night",
                "description": "أمسية ألعاب الطاولة مع مجموعة متنوعة من الألعاب الاستراتيجية والممتعة",
                "description_en": "Board game evening with diverse strategic and fun games collection",
                "category": "gaming",
                "subcategory": "board_games",
                "location": {
                    "city": "الرياض",
                    "address": "كافية الألعاب، حي الملز",
                    "coordinates": [46.7278, 24.6408]
                },
                "pricing": {
                    "basePrice": 45.0,
                    "currency": "SAR",
                    "priceType": "per_person"
                },
                "rating": {"average": 4.5, "count": 123},
                "tags": ["ألعاب طاولة", "استراتيجية", "اجتماعي", "board games", "strategy", "social", "cafe"],
                "images": ["boardgame1.jpg", "cafe1.jpg"],
                "vendor": {"businessName": "كافية الألعاب", "businessName_en": "Games Cafe"},
                "schedule": {"type": "recurring"},
                "capacity": {"min": 3, "max": 10},
                "statistics": {"totalBookings": 78},
                "createdAt": "2024-11-01T00:00:00Z"
            }
        ]

    def process_natural_language_query(self, message: str, user_id: str = "anonymous", 
                                     language: str = "ar", user_context: Dict[str, Any] = None) -> str:
        """Process natural language queries and return intelligent responses"""
        try:
            # Parse the message to create a SearchQuery
            search_query = self._parse_message_to_query(message, language, user_context)
            
            # Perform intelligent discovery
            discovery_response = self.discover_activities(search_query, user_id)
            
            # Generate natural language response
            return self._generate_natural_response(discovery_response, language)
            
        except Exception as e:
            print(f"Error processing natural language query: {e}")
            if language.startswith("ar"):
                return "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى."
            else:
                return "Sorry, there was an error processing your request. Please try again."

    def _parse_message_to_query(self, message: str, language: str, user_context: Dict[str, Any]) -> SearchQuery:
        """Parse natural language message into structured SearchQuery"""
        query_data = {
            "query": message,
            "language": language,
            "user_context": user_context
        }
        
        message_lower = message.lower()
        
        # Extract price information
        price_patterns = [
            r'(\d+)\s*-\s*(\d+)\s*ريال',
            r'أقل من\s*(\d+)',
            r'under\s*(\d+)',
            r'between\s*(\d+)\s*and\s*(\d+)'
        ]
        
        for pattern in price_patterns:
            match = re.search(pattern, message_lower)
            if match:
                if len(match.groups()) == 2:
                    query_data["price_range"] = (float(match.group(1)), float(match.group(2)))
                else:
                    query_data["price_range"] = (0, float(match.group(1)))
                break
        
        # Extract group size
        group_patterns = [r'(\d+)\s*أشخاص', r'(\d+)\s*people', r'group of\s*(\d+)']
        for pattern in group_patterns:
            match = re.search(pattern, message_lower)
            if match:
                query_data["group_size"] = int(match.group(1))
                break
        
        return SearchQuery(**query_data)

    def _generate_natural_response(self, discovery_response: DiscoverResponse, language: str = "ar") -> str:
        """Generate natural language response from discovery results"""
        results = discovery_response.results
        insights = discovery_response.personalized_insights
        cultural_recs = discovery_response.cultural_recommendations
        
        if not results:
            if language.startswith("ar"):
                return "لم أجد أنشطة تطابق بحثك. جرب تعديل كلمات البحث أو الفلاتر."
            else:
                return "I couldn't find activities matching your search. Try modifying your search terms or filters."
        
        # Build response
        if language.startswith("ar"):
            response_parts = [
                f"وجدت {len(results)} نشاط مناسب لك! 🎯"
            ]
            
            # Top 3 recommendations
            response_parts.append("\n🏆 أفضل التوصيات:")
            for i, result in enumerate(results[:3], 1):
                reasons = " | ".join(result.recommendations_reason[:2])
                response_parts.append(f"{i}. {result.title} - {result.pricing.get('basePrice', 0)} ريال")
                if reasons:
                    response_parts.append(f"   💡 {reasons}")
            
            # Add insights
            if insights:
                response_parts.append(f"\n📊 تحليل شخصي:")
                response_parts.extend([f"• {insight}" for insight in insights[:2]])
            
            # Add cultural recommendations
            if cultural_recs:
                response_parts.append(f"\n🕌 اعتبارات ثقافية:")
                response_parts.extend([f"• {rec}" for rec in cultural_recs[:2]])
            
            response_parts.append(f"\n📱 للمزيد من التفاصيل والحجز، تفضل بزيارة صفحة الأنشطة")
            
        else:
            response_parts = [
                f"Found {len(results)} activities perfect for you! 🎯"
            ]
            
            # Top 3 recommendations
            response_parts.append("\n🏆 Top Recommendations:")
            for i, result in enumerate(results[:3], 1):
                reasons = " | ".join(result.recommendations_reason[:2])
                response_parts.append(f"{i}. {result.title_en or result.title} - {result.pricing.get('basePrice', 0)} SAR")
                if reasons:
                    response_parts.append(f"   💡 {reasons}")
            
            # Add insights
            if insights:
                response_parts.append(f"\n📊 Personal Insights:")
                response_parts.extend([f"• {insight}" for insight in insights[:2]])
            
            # Add cultural recommendations
            if cultural_recs:
                response_parts.append(f"\n🕌 Cultural Considerations:")
                response_parts.extend([f"• {rec}" for rec in cultural_recs[:2]])
            
            response_parts.append(f"\n📱 Visit the activities page for more details and booking")
        
        return "\n".join(response_parts)

    def get_user_search_history(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get user's search history for personalization"""
        if not self.redis_client:
            return []
        
        try:
            history_key = f"discover:user_history:{user_id}"
            history_data = self.redis_client.get(history_key)
            if history_data:
                history = json.loads(history_data)
                return history[-limit:]
            return []
        except Exception:
            return []

    def learn_user_preferences(self, user_id: str, interaction_data: Dict[str, Any]):
        """Learn from user interactions to improve future recommendations"""
        if not self.redis_client:
            return
        
        try:
            preferences_key = f"discover:user_preferences:{user_id}"
            current_prefs = self.redis_client.get(preferences_key)
            
            if current_prefs:
                preferences = json.loads(current_prefs)
            else:
                preferences = {
                    "activity_types": {},
                    "price_sensitivity": 0.5,
                    "location_preferences": {},
                    "cultural_preferences": {},
                    "time_preferences": {},
                    "group_size_preference": None,
                    "last_updated": datetime.now().isoformat()
                }
            
            # Update preferences based on interaction
            if interaction_data.get("clicked_activity"):
                activity = interaction_data["clicked_activity"]
                category = activity.get("category")
                if category:
                    preferences["activity_types"][category] = preferences["activity_types"].get(category, 0) + 1
            
            if interaction_data.get("booked_activity"):
                # Higher weight for actual bookings
                activity = interaction_data["booked_activity"]
                category = activity.get("category")
                if category:
                    preferences["activity_types"][category] = preferences["activity_types"].get(category, 0) + 3
            
            # Update preferences
            preferences["last_updated"] = datetime.now().isoformat()
            self.redis_client.setex(preferences_key, 60 * 60 * 24 * 90, json.dumps(preferences))
            
        except Exception as e:
            print(f"Error learning user preferences: {e}")

    def get_trending_insights(self, language: str = "ar", location: str = None) -> Dict[str, Any]:
        """Get trending insights and popular activities"""
        trending_data = {
            "trending_categories": [],
            "popular_locations": [],
            "seasonal_recommendations": [],
            "cultural_events": []
        }
        
        if language.startswith("ar"):
            trending_data.update({
                "trending_categories": [
                    {"name": "ألعاب إلكترونية", "growth": "+25%", "reason": "موسم البطولات"},
                    {"name": "أنشطة شتوية", "growth": "+18%", "reason": "الطقس المعتدل"},
                    {"name": "ورش طبخ", "growth": "+12%", "reason": "الاهتمام بالتراث"}
                ],
                "popular_locations": [
                    {"name": "الرياض", "activity_count": 45, "avg_rating": 4.6},
                    {"name": "جدة", "activity_count": 32, "avg_rating": 4.7},
                    {"name": "الدمام", "activity_count": 18, "avg_rating": 4.5}
                ],
                "seasonal_recommendations": [
                    "أنشطة شتوية مناسبة للطقس الحالي",
                    "ورش داخلية مريحة",
                    "أنشطة مسائية لتجنب البرد"
                ]
            })
        else:
            trending_data.update({
                "trending_categories": [
                    {"name": "Gaming", "growth": "+25%", "reason": "Tournament season"},
                    {"name": "Winter Activities", "growth": "+18%", "reason": "Pleasant weather"},
                    {"name": "Cooking Workshops", "growth": "+12%", "reason": "Heritage interest"}
                ],
                "popular_locations": [
                    {"name": "Riyadh", "activity_count": 45, "avg_rating": 4.6},
                    {"name": "Jeddah", "activity_count": 32, "avg_rating": 4.7},
                    {"name": "Dammam", "activity_count": 18, "avg_rating": 4.5}
                ],
                "seasonal_recommendations": [
                    "Winter activities suitable for current weather",
                    "Comfortable indoor workshops",
                    "Evening activities to avoid cold"
                ]
            })
        
        return trending_data


class SelenaDiscoverAgent:
    """
    Main Selena-Discover AI Agent class
    
    Handles natural language interaction and coordinates with the discovery engine
    """
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.engine = SelenaDiscoverEngine(redis_client)
        self.agent_name = "Selena-Discover"
        self.agent_version = "1.0.0"
    
    def process_discover_inquiry(self, message: str, user_id: str = "anonymous", 
                               language: str = "ar", user_context: Dict[str, Any] = None) -> str:
        """Process discovery-related inquiries with intelligent responses"""
        message_lower = message.lower()
        
        # Enhanced discovery keywords detection
        discovery_keywords = [
            "ابحث", "أريد", "search", "find", "discover", "اكتشف",
            "اقترح", "recommend", "suggest", "وش تنصح",
            "قريب", "nearby", "around", "بالقرب",
            "مشهور", "popular", "trending", "شائع"
        ]
        
        if any(keyword in message_lower for keyword in discovery_keywords):
            # Use the intelligent discovery engine
            return self.engine.process_natural_language_query(message, user_id, language, user_context)
        
        # Handle specific inquiry types
        elif any(keyword in message_lower for keyword in ["trending", "شائع", "الأكثر"]):
            return self._handle_trending_inquiry(language)
        
        elif any(keyword in message_lower for keyword in ["help", "مساعدة", "كيف"]):
            return self._generate_help_response(language)
        
        else:
            # Default intelligent response
            return self._generate_intelligent_default_response(message, language)
    
    def _handle_trending_inquiry(self, language: str = "ar") -> str:
        """Handle trending activities inquiry"""
        trending_data = self.engine.get_trending_insights(language)
        
        if language.startswith("ar"):
            response_parts = ["📈 الأنشطة الشائعة حالياً:\n"]
            
            for category in trending_data["trending_categories"][:3]:
                response_parts.append(f"🔥 {category['name']} {category['growth']}")
                response_parts.append(f"   السبب: {category['reason']}\n")
            
            response_parts.append("📍 المدن الأكثر نشاطاً:")
            for location in trending_data["popular_locations"][:3]:
                response_parts.append(f"• {location['name']}: {location['activity_count']} نشاط")
            
            return "\n".join(response_parts)
        else:
            response_parts = ["📈 Currently Trending Activities:\n"]
            
            for category in trending_data["trending_categories"][:3]:
                response_parts.append(f"🔥 {category['name']} {category['growth']}")
                response_parts.append(f"   Reason: {category['reason']}\n")
            
            response_parts.append("📍 Most Active Cities:")
            for location in trending_data["popular_locations"][:3]:
                response_parts.append(f"• {location['name']}: {location['activity_count']} activities")
            
            return "\n".join(response_parts)
    
    def _generate_help_response(self, language: str = "ar") -> str:
        """Generate help response explaining agent capabilities"""
        if language.startswith("ar"):
            return """🤖 أنا سيلينا، وكيل الاكتشاف الذكي في LUDUS!

يمكنني مساعدتك في:

🔍 **البحث الذكي:**
• "ابحث عن أنشطة مغامرات في الرياض"
• "أريد نشاط عائلي أقل من 100 ريال"
• "وش أفضل أنشطة ألعاب قريبة مني؟"

🎯 **التوصيات الشخصية:**
• توصيات مبنية على اهتماماتك
• أنشطة مناسبة ثقافياً
• اقتراحات حسب الموقع والوقت

🏛️ **السياق الثقافي:**
• مراعاة أوقات الصلاة
• أنشطة مناسبة للعائلات السعودية
• التوصيات المحلية والتراثية

💬 تحدث معي بشكل طبيعي وسأساعدك في العثور على النشاط المثالي!"""
        else:
            return """🤖 I'm Selena, your intelligent discovery agent at LUDUS!

I can help you with:

🔍 **Smart Search:**
• "Find adventure activities in Riyadh"
• "I want family activity under 100 SAR"
• "What are the best gaming activities near me?"

🎯 **Personalized Recommendations:**
• Recommendations based on your interests
• Culturally appropriate activities
• Suggestions by location and time

🏛️ **Cultural Context:**
• Prayer time considerations
• Family-friendly Saudi activities
• Local and heritage recommendations

💬 Talk to me naturally and I'll help you find the perfect activity!"""
    
    def _generate_intelligent_default_response(self, message: str, language: str = "ar") -> str:
        """Generate intelligent default response using context clues"""
        if language.startswith("ar"):
            return f"""مرحباً! أنا سيلينا 🤖، وكيل الاكتشاف الذكي في LUDUS.

فهمت أنك تسأل عن: "{message}"

يمكنني مساعدتك في العثور على:
• أنشطة مناسبة لاهتماماتك
• توصيات ذكية حسب موقعك
• أنشطة مناسبة ثقافياً ومحلياً

جرب أن تسأل: "ابحث عن أنشطة ممتعة في [مدينتك]" 🎯"""
        else:
            return f"""Hello! I'm Selena 🤖, your intelligent discovery agent at LUDUS.

I understand you're asking about: "{message}"

I can help you find:
• Activities suited to your interests
• Smart recommendations based on your location
• Culturally appropriate local activities

Try asking: "Find fun activities in [your city]" 🎯"""