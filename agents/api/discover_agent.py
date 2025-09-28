"""
Selena-Discover AI Agent - Advanced intelligent venue and activity discovery system

This agent provides sophisticated natural language search, personalized recommendations,
cultural context awareness, and geographic proximity intelligence for the LUDUS platform.

Features:
- Advanced NLP processing for Arabic and English
- Machine learning recommendation algorithms
- Cultural context and preference matching
- Geographic proximity and clustering
- User behavior learning and analytics
- Real-time search optimization
"""

import json
import uuid
import math
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union
from pydantic import BaseModel, Field
from dataclasses import dataclass
import numpy as np
from collections import defaultdict


class DiscoverSearchRequest(BaseModel):
    """Enhanced search request model for Selena-Discover"""
    query: str
    user_id: Optional[str] = None
    location: Optional[Dict[str, Any]] = None  # {city, coordinates, radius}
    filters: Optional[Dict[str, Any]] = None
    language: str = "ar"
    search_type: str = "natural"  # natural, filter, recommendation
    context: Optional[Dict[str, Any]] = None  # user context, time, etc.
    voice_input: bool = False
    cultural_preferences: Optional[Dict[str, Any]] = None


class DiscoverSearchResponse(BaseModel):
    """Enhanced search response model"""
    results: List[Dict[str, Any]]
    total_count: int
    search_query: str
    processed_query: Dict[str, Any]  # NLP processing results
    recommendations: List[Dict[str, Any]]
    cultural_insights: List[str]
    geographic_clusters: List[Dict[str, Any]]
    search_suggestions: List[str]
    performance_metrics: Dict[str, Any]
    user_learning: Dict[str, Any]


class DiscoverRecommendationRequest(BaseModel):
    """Recommendation request model"""
    user_id: str
    context: Optional[Dict[str, Any]] = None
    preference_override: Optional[Dict[str, Any]] = None
    location: Optional[Dict[str, Any]] = None
    social_context: Optional[Dict[str, Any]] = None  # group size, demographics
    cultural_context: str = "saudi_modern"


class DiscoverRecommendationResponse(BaseModel):
    """Recommendation response model"""
    recommendations: List[Dict[str, Any]]
    reasoning: List[str]
    cultural_fit_score: float
    confidence_score: float
    learning_insights: Dict[str, Any]
    alternative_suggestions: List[Dict[str, Any]]


@dataclass
class CulturalContext:
    """Cultural context data class"""
    traditional_preference: float
    modern_preference: float
    family_orientation: float
    social_preference: float
    religious_considerations: bool
    gender_separation_preference: str  # "mixed", "separated", "flexible"


@dataclass
class GeographicCluster:
    """Geographic clustering data class"""
    center_coordinates: Tuple[float, float]
    radius_km: float
    activity_count: int
    popular_categories: List[str]
    cultural_profile: CulturalContext


class SelenaDiscoverAgent:
    """
    Advanced AI agent for intelligent venue and activity discovery
    
    This agent combines natural language processing, machine learning recommendations,
    cultural context awareness, and geographic intelligence to provide personalized
    activity discovery for LUDUS users.
    """
    
    def __init__(self, redis_client=None, mongodb_client=None):
        self.redis_client = redis_client
        self.mongodb_client = mongodb_client
        self.search_history_key = "agents:discover:search_history"
        self.user_preferences_key = "agents:discover:user_preferences"
        self.cultural_insights_key = "agents:discover:cultural_insights"
        
        # Initialize NLP components
        self._initialize_nlp_components()
        
        # Initialize recommendation engine
        self._initialize_recommendation_engine()
        
        # Initialize cultural context data
        self._initialize_cultural_context()
        
        # Initialize geographic clustering
        self._initialize_geographic_clusters()
    
    def _initialize_nlp_components(self):
        """Initialize NLP processing components"""
        # Arabic keywords and patterns
        self.arabic_keywords = {
            "adventure": ["مغامرة", "تسلق", "رحلة", "استكشاف", "مخيم", "رحلات"],
            "water": ["بحر", "مياه", "سباحة", "غوص", "صيد", "شاطئ", "بحري"],
            "cultural": ["ثقافة", "تراث", "متحف", "تاريخ", "فن", "معرض", "تراثي"],
            "sports": ["رياضة", "كرة", "جري", "دراجة", "تمارين", "لياقة", "رياضي"],
            "food": ["طعام", "طبخ", "مطعم", "تذوق", "أكل", "وجبة", "طعام"],
            "entertainment": ["ترفيه", "لعب", "مسرح", "سينما", "حفلة", "فعالية"],
            "wellness": ["استرخاء", "صحة", "تأمل", "يوغا", "تدليك", "راحة"],
            "family": ["عائلة", "أطفال", "عائلي", "أسرة", "عائلية"],
            "social": ["أصدقاء", "مجموعة", "اجتماعي", "تواصل", "لقاء"],
            "indoor": ["داخلي", "مغلق", "داخل", "صالة"],
            "outdoor": ["خارجي", "طبيعة", "هواء", "خارج", "مفتوح"]
        }
        
        # English keyword mappings
        self.english_keywords = {
            "adventure": ["adventure", "climbing", "hiking", "exploration", "outdoor", "expedition"],
            "water": ["water", "sea", "swimming", "diving", "fishing", "beach", "marine"],
            "cultural": ["culture", "heritage", "museum", "history", "art", "gallery", "traditional"],
            "sports": ["sports", "football", "running", "cycling", "exercise", "fitness", "athletic"],
            "food": ["food", "cooking", "restaurant", "tasting", "culinary", "dining"],
            "entertainment": ["entertainment", "games", "theater", "cinema", "party", "event"],
            "wellness": ["wellness", "health", "meditation", "yoga", "massage", "relaxation"],
            "family": ["family", "kids", "children", "family-friendly", "family"],
            "social": ["friends", "group", "social", "networking", "meetup"],
            "indoor": ["indoor", "inside", "closed", "hall"],
            "outdoor": ["outdoor", "outside", "nature", "open-air"]
        }
        
        # Location patterns
        self.location_patterns = {
            "ar": ["في", "بـ", "من", "عند", "قريب من", "حول"],
            "en": ["in", "at", "near", "around", "close to", "by"]
        }
        
        # Time patterns
        self.time_patterns = {
            "ar": ["اليوم", "غداً", "الأسبوع", "نهاية الأسبوع", "صباح", "مساء", "ليل"],
            "en": ["today", "tomorrow", "week", "weekend", "morning", "evening", "night"]
        }
    
    def _initialize_recommendation_engine(self):
        """Initialize machine learning recommendation components"""
        # Collaborative filtering weights
        self.cf_weights = {
            "user_similarity": 0.3,
            "item_similarity": 0.25,
            "popularity": 0.15,
            "cultural_fit": 0.2,
            "geographic_proximity": 0.1
        }
        
        # Content-based filtering features
        self.content_features = [
            "category", "subcategory", "price_range", "duration",
            "difficulty", "group_size", "location_type", "cultural_alignment"
        ]
        
        # User preference learning parameters
        self.learning_rates = {
            "click_through": 0.1,
            "booking": 0.3,
            "review": 0.4,
            "share": 0.2,
            "wishlist": 0.15
        }
    
    def _initialize_cultural_context(self):
        """Initialize cultural context data and insights"""
        self.cultural_profiles = {
            "saudi_traditional": CulturalContext(
                traditional_preference=0.8,
                modern_preference=0.3,
                family_orientation=0.9,
                social_preference=0.7,
                religious_considerations=True,
                gender_separation_preference="separated"
            ),
            "saudi_modern": CulturalContext(
                traditional_preference=0.4,
                modern_preference=0.8,
                family_orientation=0.6,
                social_preference=0.8,
                religious_considerations=True,
                gender_separation_preference="flexible"
            ),
            "expat_western": CulturalContext(
                traditional_preference=0.3,
                modern_preference=0.9,
                family_orientation=0.5,
                social_preference=0.8,
                religious_considerations=False,
                gender_separation_preference="mixed"
            ),
            "expat_arab": CulturalContext(
                traditional_preference=0.6,
                modern_preference=0.7,
                family_orientation=0.8,
                social_preference=0.8,
                religious_considerations=True,
                gender_separation_preference="flexible"
            )
        }
        
        # Cultural insights and recommendations
        self.cultural_insights = {
            "prayer_times": "Activities scheduled around prayer times show higher attendance",
            "weekend_patterns": "Thursday-Friday activities have 40% higher booking rates",
            "family_activities": "Family-oriented activities peak during school holidays",
            "ramadan_adjustments": "Evening activities become more popular during Ramadan",
            "cultural_events": "Activities during cultural festivals show increased interest"
        }
    
    def _initialize_geographic_clusters(self):
        """Initialize geographic clustering for major Saudi cities"""
        self.city_clusters = {
            "riyadh": GeographicCluster(
                center_coordinates=(24.7136, 46.6753),
                radius_km=25,
                activity_count=150,
                popular_categories=["entertainment", "sports", "cultural", "food"],
                cultural_profile=self.cultural_profiles["saudi_modern"]
            ),
            "jeddah": GeographicCluster(
                center_coordinates=(21.4858, 39.1925),
                radius_km=30,
                activity_count=120,
                popular_categories=["water", "cultural", "food", "entertainment"],
                cultural_profile=self.cultural_profiles["saudi_modern"]
            ),
            "dammam": GeographicCluster(
                center_coordinates=(26.4207, 50.0888),
                radius_km=20,
                activity_count=80,
                popular_categories=["water", "sports", "entertainment", "food"],
                cultural_profile=self.cultural_profiles["saudi_traditional"]
            ),
            "mecca": GeographicCluster(
                center_coordinates=(21.4225, 39.8262),
                radius_km=15,
                activity_count=60,
                popular_categories=["cultural", "wellness", "food"],
                cultural_profile=self.cultural_profiles["saudi_traditional"]
            )
        }
    
    def process_natural_language_query(self, query: str, language: str = "ar") -> Dict[str, Any]:
        """
        Process natural language search query using NLP
        
        Args:
            query: The search query string
            language: Language code ("ar" or "en")
        
        Returns:
            Dictionary containing processed query information
        """
        processed = {
            "original_query": query,
            "language": language,
            "intent": [],
            "entities": {
                "activities": [],
                "locations": [],
                "time": [],
                "price": [],
                "participants": None
            },
            "filters": {},
            "confidence": 0.0
        }
        
        query_lower = query.lower()
        
        # Extract intent (what user wants to do)
        intent_keywords = self.arabic_keywords if language == "ar" else self.english_keywords
        
        for category, keywords in intent_keywords.items():
            for keyword in keywords:
                if keyword in query_lower:
                    processed["intent"].append(category)
                    processed["confidence"] += 0.1
        
        # Extract location entities
        location_patterns = self.location_patterns[language]
        for pattern in location_patterns:
            if pattern in query_lower:
                # Simple location extraction (can be enhanced with NER)
                words = query.split()
                pattern_index = -1
                for i, word in enumerate(words):
                    if pattern in word.lower():
                        pattern_index = i
                        break
                
                if pattern_index != -1 and pattern_index + 1 < len(words):
                    location = words[pattern_index + 1]
                    processed["entities"]["locations"].append(location)
                    processed["confidence"] += 0.15
        
        # Extract time entities
        time_patterns = self.time_patterns[language]
        for pattern in time_patterns:
            if pattern in query_lower:
                processed["entities"]["time"].append(pattern)
                processed["confidence"] += 0.1
        
        # Extract participant count
        numbers = re.findall(r'\d+', query)
        if numbers:
            # Assume first number is participant count if reasonable
            num = int(numbers[0])
            if 1 <= num <= 50:
                processed["entities"]["participants"] = num
                processed["confidence"] += 0.1
        
        # Extract price mentions
        price_keywords = {
            "ar": ["رخيص", "غالي", "مجاني", "ريال", "درهم", "سعر"],
            "en": ["cheap", "expensive", "free", "price", "cost", "budget"]
        }
        
        for keyword in price_keywords[language]:
            if keyword in query_lower:
                processed["entities"]["price"].append(keyword)
                processed["confidence"] += 0.05
        
        # Build filters from extracted entities
        if processed["entities"]["locations"]:
            processed["filters"]["location"] = processed["entities"]["locations"][0]
        
        if processed["entities"]["participants"]:
            processed["filters"]["participants"] = processed["entities"]["participants"]
        
        if processed["intent"]:
            processed["filters"]["categories"] = list(set(processed["intent"]))
        
        # Normalize confidence score
        processed["confidence"] = min(1.0, processed["confidence"])
        
        return processed
    
    def calculate_geographic_proximity(self, user_location: Dict[str, Any], 
                                     activity_location: Dict[str, Any]) -> float:
        """
        Calculate geographic proximity score between user and activity
        
        Args:
            user_location: User's location data
            activity_location: Activity's location data
        
        Returns:
            Proximity score (0.0 to 1.0, higher is closer)
        """
        if not user_location.get("coordinates") or not activity_location.get("coordinates"):
            return 0.5  # Default neutral score
        
        user_coords = user_location["coordinates"]
        activity_coords = activity_location["coordinates"]
        
        # Calculate distance using Haversine formula
        distance_km = self._haversine_distance(
            user_coords[1], user_coords[0],  # lat, lon
            activity_coords[1], activity_coords[0]
        )
        
        # Convert distance to proximity score
        # Closer activities get higher scores
        max_distance = user_location.get("radius", 25)  # Default 25km radius
        
        if distance_km <= max_distance:
            # Linear decay from 1.0 at distance 0 to 0.1 at max_distance
            proximity_score = 1.0 - (distance_km / max_distance) * 0.9
        else:
            # Activities beyond max distance get very low scores
            proximity_score = max(0.01, 0.1 - (distance_km - max_distance) / 100)
        
        return proximity_score
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate the great circle distance between two points in kilometers"""
        R = 6371  # Earth's radius in kilometers
        
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def calculate_cultural_fit_score(self, activity: Dict[str, Any], 
                                   user_cultural_profile: CulturalContext) -> float:
        """
        Calculate how well an activity fits user's cultural preferences
        
        Args:
            activity: Activity data
            user_cultural_profile: User's cultural context
        
        Returns:
            Cultural fit score (0.0 to 1.0)
        """
        score = 0.0
        
        # Traditional vs Modern preference
        if activity.get("cultural_tags"):
            traditional_score = sum(1 for tag in activity["cultural_tags"] 
                                  if tag in ["traditional", "heritage", "cultural"])
            modern_score = sum(1 for tag in activity["cultural_tags"] 
                             if tag in ["modern", "contemporary", "trendy"])
            
            total_cultural_tags = len(activity["cultural_tags"])
            if total_cultural_tags > 0:
                traditional_ratio = traditional_score / total_cultural_tags
                modern_ratio = modern_score / total_cultural_tags
                
                score += (traditional_ratio * user_cultural_profile.traditional_preference +
                         modern_ratio * user_cultural_profile.modern_preference) * 0.3
        
        # Family orientation
        if activity.get("family_friendly"):
            if user_cultural_profile.family_orientation > 0.7:
                score += 0.2
        elif user_cultural_profile.family_orientation < 0.3:
            score += 0.1
        
        # Social preference
        group_size = activity.get("capacity", {}).get("max", 1)
        if group_size > 5 and user_cultural_profile.social_preference > 0.6:
            score += 0.2
        elif group_size <= 3 and user_cultural_profile.social_preference < 0.4:
            score += 0.15
        
        # Religious considerations
        if user_cultural_profile.religious_considerations:
            # Check if activity respects prayer times and cultural norms
            if activity.get("prayer_time_friendly", True):
                score += 0.1
            if activity.get("halal_certified", False):
                score += 0.05
        
        # Gender separation preference
        gender_policy = activity.get("gender_policy", "mixed")
        if gender_policy == user_cultural_profile.gender_separation_preference:
            score += 0.15
        elif user_cultural_profile.gender_separation_preference == "flexible":
            score += 0.1
        
        return min(1.0, score)
    
    def generate_intelligent_recommendations(self, request: DiscoverRecommendationRequest) -> DiscoverRecommendationResponse:
        """
        Generate intelligent, personalized recommendations using ML algorithms
        
        Args:
            request: Recommendation request data
        
        Returns:
            Comprehensive recommendation response
        """
        try:
            # Get user preference profile
            user_profile = self._get_user_preference_profile(request.user_id)
            
            # Get user's cultural context
            cultural_profile = self._get_user_cultural_profile(request.user_id, request.cultural_context)
            
            # Get all available activities
            all_activities = self._get_all_activities()
            
            # Apply collaborative filtering
            cf_scores = self._collaborative_filtering(request.user_id, all_activities)
            
            # Apply content-based filtering
            cb_scores = self._content_based_filtering(user_profile, all_activities)
            
            # Calculate cultural fit scores
            cultural_scores = {
                activity["id"]: self.calculate_cultural_fit_score(activity, cultural_profile)
                for activity in all_activities
            }
            
            # Calculate geographic proximity scores
            proximity_scores = {}
            if request.location:
                proximity_scores = {
                    activity["id"]: self.calculate_geographic_proximity(
                        request.location, activity.get("location", {})
                    )
                    for activity in all_activities
                }
            
            # Combine scores using weighted approach
            final_scores = {}
            for activity in all_activities:
                activity_id = activity["id"]
                
                score = (
                    cf_scores.get(activity_id, 0.5) * self.cf_weights["user_similarity"] +
                    cb_scores.get(activity_id, 0.5) * self.cf_weights["item_similarity"] +
                    cultural_scores.get(activity_id, 0.5) * self.cf_weights["cultural_fit"] +
                    proximity_scores.get(activity_id, 0.5) * self.cf_weights["geographic_proximity"] +
                    activity.get("popularity_score", 0.5) * self.cf_weights["popularity"]
                )
                
                final_scores[activity_id] = score
            
            # Sort activities by final score
            sorted_activities = sorted(all_activities, 
                                     key=lambda x: final_scores[x["id"]], 
                                     reverse=True)
            
            # Select top recommendations
            top_recommendations = sorted_activities[:10]
            
            # Generate reasoning for recommendations
            reasoning = self._generate_recommendation_reasoning(
                top_recommendations, user_profile, cultural_profile, request
            )
            
            # Calculate overall confidence
            confidence_score = self._calculate_recommendation_confidence(
                top_recommendations, final_scores, user_profile
            )
            
            # Generate alternative suggestions
            alternatives = self._generate_alternative_suggestions(
                sorted_activities[10:20], request, cultural_profile
            )
            
            # Learning insights for future improvements
            learning_insights = self._generate_learning_insights(
                request, top_recommendations, final_scores
            )
            
            return DiscoverRecommendationResponse(
                recommendations=[self._format_recommendation(activity, final_scores[activity["id"]])
                               for activity in top_recommendations],
                reasoning=reasoning,
                cultural_fit_score=np.mean([cultural_scores[a["id"]] for a in top_recommendations]),
                confidence_score=confidence_score,
                learning_insights=learning_insights,
                alternative_suggestions=alternatives
            )
            
        except Exception as e:
            # Return fallback recommendations on error
            fallback_activities = self._get_fallback_recommendations(request.language)
            return DiscoverRecommendationResponse(
                recommendations=fallback_activities,
                reasoning=["Generated fallback recommendations due to system error"],
                cultural_fit_score=0.5,
                confidence_score=0.3,
                learning_insights={},
                alternative_suggestions=[]
            )
    
    def intelligent_search(self, request: DiscoverSearchRequest) -> DiscoverSearchResponse:
        """
        Perform intelligent search with NLP processing and ML ranking
        
        Args:
            request: Enhanced search request
        
        Returns:
            Comprehensive search response with recommendations and insights
        """
        start_time = datetime.now()
        
        try:
            # Process natural language query
            processed_query = self.process_natural_language_query(request.query, request.language)
            
            # Get all activities
            all_activities = self._get_all_activities()
            
            # Apply intelligent filtering
            filtered_activities = self._apply_intelligent_filters(
                all_activities, processed_query, request
            )
            
            # Apply ML-based ranking
            ranked_activities = self._apply_ml_ranking(
                filtered_activities, request, processed_query
            )
            
            # Generate cultural insights
            cultural_insights = self._generate_cultural_insights(
                ranked_activities, request, processed_query
            )
            
            # Generate geographic clusters
            geographic_clusters = self._generate_geographic_clusters(
                ranked_activities, request.location
            )
            
            # Generate search suggestions
            search_suggestions = self._generate_search_suggestions(
                processed_query, request.language
            )
            
            # Generate personalized recommendations
            recommendations = self._generate_contextual_recommendations(
                request, processed_query, ranked_activities
            )
            
            # Calculate performance metrics
            end_time = datetime.now()
            performance_metrics = {
                "processing_time_ms": (end_time - start_time).total_seconds() * 1000,
                "total_activities_processed": len(all_activities),
                "filtered_count": len(filtered_activities),
                "final_count": len(ranked_activities),
                "nlp_confidence": processed_query["confidence"],
                "ranking_quality": self._calculate_ranking_quality(ranked_activities)
            }
            
            # User learning and behavior tracking
            user_learning = self._track_user_search_behavior(request, ranked_activities)
            
            # Save search history for analytics
            self._save_enhanced_search_history(request, processed_query, ranked_activities)
            
            return DiscoverSearchResponse(
                results=ranked_activities[:15],  # Top 15 results
                total_count=len(ranked_activities),
                search_query=request.query,
                processed_query=processed_query,
                recommendations=recommendations,
                cultural_insights=cultural_insights,
                geographic_clusters=geographic_clusters,
                search_suggestions=search_suggestions,
                performance_metrics=performance_metrics,
                user_learning=user_learning
            )
            
        except Exception as e:
            # Return error response with fallback results
            return DiscoverSearchResponse(
                results=self._get_fallback_search_results(request.language),
                total_count=0,
                search_query=request.query,
                processed_query={"error": str(e)},
                recommendations=[],
                cultural_insights=[],
                geographic_clusters=[],
                search_suggestions=[],
                performance_metrics={"error": True},
                user_learning={}
            )
    
    def _apply_intelligent_filters(self, activities: List[Dict[str, Any]], 
                                  processed_query: Dict[str, Any], 
                                  request: DiscoverSearchRequest) -> List[Dict[str, Any]]:
        """Apply intelligent filtering based on processed query and request"""
        filtered = activities.copy()
        
        # Apply category filters from intent
        if processed_query["filters"].get("categories"):
            categories = processed_query["filters"]["categories"]
            filtered = [a for a in filtered if a.get("category") in categories]
        
        # Apply location filters
        if processed_query["filters"].get("location"):
            location = processed_query["filters"]["location"].lower()
            filtered = [a for a in filtered if 
                       location in a.get("location", {}).get("city", "").lower() or
                       location in a.get("location", {}).get("address", "").lower()]
        
        # Apply participant filters
        if processed_query["filters"].get("participants"):
            participants = processed_query["filters"]["participants"]
            filtered = [a for a in filtered if 
                       a.get("capacity", {}).get("max", 1) >= participants]
        
        # Apply additional request filters
        if request.filters:
            if request.filters.get("price_range"):
                min_price, max_price = request.filters["price_range"]
                filtered = [a for a in filtered if 
                           min_price <= a.get("pricing", {}).get("basePrice", 0) <= max_price]
            
            if request.filters.get("date"):
                # Filter by availability (simplified)
                filtered = [a for a in filtered if 
                           request.filters["date"] in a.get("available_dates", [])]
            
            if request.filters.get("difficulty"):
                filtered = [a for a in filtered if 
                           a.get("difficulty") == request.filters["difficulty"]]
        
        return filtered
    
    def _apply_ml_ranking(self, activities: List[Dict[str, Any]], 
                         request: DiscoverSearchRequest,
                         processed_query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply machine learning-based ranking to activities"""
        
        def calculate_activity_score(activity):
            score = 0.0
            
            # Query relevance score
            relevance = self._calculate_query_relevance(activity, processed_query)
            score += relevance * 0.3
            
            # Popularity score
            popularity = activity.get("popularity_score", 0.5)
            score += popularity * 0.2
            
            # Rating score
            rating = activity.get("rating", {}).get("average", 0) / 5.0
            score += rating * 0.15
            
            # Cultural fit score (if user context available)
            if request.user_id:
                cultural_profile = self._get_user_cultural_profile(
                    request.user_id, request.cultural_preferences
                )
                cultural_fit = self.calculate_cultural_fit_score(activity, cultural_profile)
                score += cultural_fit * 0.2
            
            # Geographic proximity score
            if request.location:
                proximity = self.calculate_geographic_proximity(
                    request.location, activity.get("location", {})
                )
                score += proximity * 0.15
            
            return score
        
        # Calculate scores and sort
        scored_activities = []
        for activity in activities:
            activity["_discovery_score"] = calculate_activity_score(activity)
            scored_activities.append(activity)
        
        return sorted(scored_activities, key=lambda x: x["_discovery_score"], reverse=True)
    
    def _calculate_query_relevance(self, activity: Dict[str, Any], 
                                  processed_query: Dict[str, Any]) -> float:
        """Calculate how relevant an activity is to the processed query"""
        score = 0.0
        query_lower = processed_query["original_query"].lower()
        
        # Title and description matching
        title = activity.get("title", "").lower()
        description = activity.get("description", "").lower()
        
        if query_lower in title:
            score += 0.4
        elif any(word in title for word in query_lower.split()):
            score += 0.2
        
        if query_lower in description:
            score += 0.2
        elif any(word in description for word in query_lower.split()):
            score += 0.1
        
        # Category matching
        if activity.get("category") in processed_query.get("intent", []):
            score += 0.3
        
        # Tag matching
        tags = activity.get("tags", [])
        query_words = query_lower.split()
        tag_matches = sum(1 for tag in tags for word in query_words if word in tag.lower())
        score += min(0.2, tag_matches * 0.05)
        
        return min(1.0, score)
    
    def _collaborative_filtering(self, user_id: str, activities: List[Dict[str, Any]]) -> Dict[str, float]:
        """Apply collaborative filtering recommendations"""
        # Simplified collaborative filtering
        # In production, this would use actual user interaction data
        scores = {}
        
        # Get user's historical preferences
        user_history = self._get_user_search_history(user_id)
        
        if not user_history:
            # New user - return neutral scores
            return {activity["id"]: 0.5 for activity in activities}
        
        # Calculate scores based on user's interaction patterns
        for activity in activities:
            score = 0.5  # Base score
            
            # Check if user has interacted with similar activities
            similar_interactions = sum(1 for history in user_history
                                     if history.get("category") == activity.get("category"))
            
            if similar_interactions > 0:
                score += min(0.3, similar_interactions * 0.1)
            
            scores[activity["id"]] = score
        
        return scores
    
    def _content_based_filtering(self, user_profile: Dict[str, Any], 
                               activities: List[Dict[str, Any]]) -> Dict[str, float]:
        """Apply content-based filtering recommendations"""
        scores = {}
        
        user_preferences = user_profile.get("preferences", {})
        
        for activity in activities:
            score = 0.5  # Base score
            
            # Category preference match
            preferred_categories = user_preferences.get("categories", [])
            if activity.get("category") in preferred_categories:
                score += 0.2
            
            # Price range preference
            price_range = user_preferences.get("priceRange", {})
            activity_price = activity.get("pricing", {}).get("basePrice", 0)
            
            if (price_range.get("min", 0) <= activity_price <= 
                price_range.get("max", 1000)):
                score += 0.15
            
            # Difficulty preference
            user_fitness_level = user_preferences.get("physicalIntensity", "moderate")
            activity_difficulty = activity.get("difficulty", "beginner")
            
            difficulty_match = {
                ("low", "beginner"): 0.2,
                ("moderate", "intermediate"): 0.2,
                ("high", "advanced"): 0.2,
                ("moderate", "beginner"): 0.15,
                ("moderate", "advanced"): 0.15
            }
            
            score += difficulty_match.get((user_fitness_level, activity_difficulty), 0.05)
            
            scores[activity["id"]] = min(1.0, score)
        
        return scores
    
    def _generate_cultural_insights(self, activities: List[Dict[str, Any]], 
                                  request: DiscoverSearchRequest,
                                  processed_query: Dict[str, Any]) -> List[str]:
        """Generate cultural insights based on search results"""
        insights = []
        
        # Analyze cultural patterns in results
        traditional_count = sum(1 for a in activities 
                              if "traditional" in a.get("cultural_tags", []))
        modern_count = sum(1 for a in activities 
                         if "modern" in a.get("cultural_tags", []))
        
        if request.language == "ar":
            if traditional_count > modern_count:
                insights.append("النتائج تُظهر تفضيلاً للأنشطة التراثية والثقافية")
            elif modern_count > traditional_count:
                insights.append("النتائج تُظهر اتجاهاً نحو الأنشطة العصرية والحديثة")
            
            # Prayer time considerations
            if any("prayer_time_friendly" in a.get("features", []) for a in activities):
                insights.append("الأنشطة المختارة تراعي أوقات الصلاة")
            
            # Family-friendly insights
            family_friendly_count = sum(1 for a in activities if a.get("family_friendly"))
            if family_friendly_count > len(activities) * 0.6:
                insights.append("معظم الأنشطة مناسبة للعائلات والأطفال")
        else:
            if traditional_count > modern_count:
                insights.append("Results show preference for traditional and cultural activities")
            elif modern_count > traditional_count:
                insights.append("Results trend towards modern and contemporary activities")
            
            if any("prayer_time_friendly" in a.get("features", []) for a in activities):
                insights.append("Selected activities consider prayer times")
            
            family_friendly_count = sum(1 for a in activities if a.get("family_friendly"))
            if family_friendly_count > len(activities) * 0.6:
                insights.append("Most activities are family-friendly and suitable for children")
        
        return insights
    
    def _generate_geographic_clusters(self, activities: List[Dict[str, Any]], 
                                    user_location: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate geographic clusters of activities"""
        if not user_location or not activities:
            return []
        
        clusters = []
        
        # Group activities by city
        city_groups = defaultdict(list)
        for activity in activities:
            city = activity.get("location", {}).get("city", "unknown")
            city_groups[city].append(activity)
        
        # Create cluster information for each city
        for city, city_activities in city_groups.items():
            if len(city_activities) >= 2:  # Only create clusters with 2+ activities
                # Calculate center coordinates
                coords = [a.get("location", {}).get("coordinates", [0, 0]) 
                         for a in city_activities if a.get("location", {}).get("coordinates")]
                
                if coords:
                    center_lat = sum(coord[1] for coord in coords) / len(coords)
                    center_lon = sum(coord[0] for coord in coords) / len(coords)
                    
                    # Calculate distance from user
                    user_coords = user_location.get("coordinates", [0, 0])
                    distance = self._haversine_distance(
                        user_coords[1], user_coords[0],
                        center_lat, center_lon
                    )
                    
                    clusters.append({
                        "city": city,
                        "activity_count": len(city_activities),
                        "center_coordinates": [center_lon, center_lat],
                        "distance_km": round(distance, 1),
                        "popular_categories": list(set(a.get("category") for a in city_activities)),
                        "average_rating": np.mean([a.get("rating", {}).get("average", 0) 
                                                 for a in city_activities]),
                        "price_range": {
                            "min": min(a.get("pricing", {}).get("basePrice", 0) for a in city_activities),
                            "max": max(a.get("pricing", {}).get("basePrice", 0) for a in city_activities)
                        }
                    })
        
        # Sort by distance from user
        return sorted(clusters, key=lambda x: x["distance_km"])
    
    def _get_user_preference_profile(self, user_id: str) -> Dict[str, Any]:
        """Get or create user preference profile"""
        if not self.redis_client or not user_id:
            return self._get_default_preference_profile()
        
        try:
            profile_key = f"{self.user_preferences_key}:{user_id}"
            profile_data = self.redis_client.get(profile_key)
            
            if profile_data:
                return json.loads(profile_data)
            else:
                # Create default profile
                default_profile = self._get_default_preference_profile()
                self.redis_client.setex(profile_key, 60 * 60 * 24 * 30, 
                                      json.dumps(default_profile))
                return default_profile
                
        except Exception:
            return self._get_default_preference_profile()
    
    def _get_default_preference_profile(self) -> Dict[str, Any]:
        """Get default user preference profile"""
        return {
            "preferences": {
                "categories": ["entertainment", "food", "cultural"],
                "priceRange": {"min": 0, "max": 500},
                "physicalIntensity": "moderate",
                "socialPreference": "moderate",
                "indoorOutdoor": "both"
            },
            "behavior_patterns": {
                "search_frequency": 0.5,
                "booking_rate": 0.3,
                "review_rate": 0.2
            },
            "cultural_alignment": "saudi_modern"
        }
    
    def _get_user_cultural_profile(self, user_id: str, 
                                  cultural_preferences: Optional[Dict[str, Any]]) -> CulturalContext:
        """Get user's cultural profile"""
        # If specific preferences provided, use them
        if cultural_preferences:
            return CulturalContext(
                traditional_preference=cultural_preferences.get("traditional", 0.5),
                modern_preference=cultural_preferences.get("modern", 0.5),
                family_orientation=cultural_preferences.get("family", 0.5),
                social_preference=cultural_preferences.get("social", 0.5),
                religious_considerations=cultural_preferences.get("religious", True),
                gender_separation_preference=cultural_preferences.get("gender_policy", "flexible")
            )
        
        # Default to Saudi modern profile
        return self.cultural_profiles["saudi_modern"]
    
    def _get_all_activities(self) -> List[Dict[str, Any]]:
        """Get all available activities with enhanced data"""
        # Enhanced mock data with cultural and geographic information
        return [
            {
                "id": "ACT001",
                "title": "تسلق جبل الفهدة",
                "title_en": "Mount Fahda Climbing",
                "description": "مغامرة تسلق جبل الفهدة مع دليل محترف ومعدات السلامة",
                "description_en": "Mount Fahda climbing adventure with professional guide and safety equipment",
                "category": "adventure",
                "subcategory": "rock_climbing",
                "location": {
                    "city": "الرياض",
                    "city_en": "Riyadh",
                    "address": "جبل الفهدة، شمال الرياض",
                    "coordinates": [46.6753, 24.8136]
                },
                "pricing": {"basePrice": 120.0, "currency": "SAR", "priceType": "per_person"},
                "duration": {"hours": 6, "minutes": 0},
                "capacity": {"min": 2, "max": 8},
                "difficulty": "intermediate",
                "rating": {"average": 4.8, "count": 156},
                "popularity_score": 0.85,
                "cultural_tags": ["adventure", "outdoor", "modern"],
                "family_friendly": False,
                "prayer_time_friendly": True,
                "gender_policy": "mixed",
                "features": ["professional_guide", "safety_equipment", "photography"],
                "available_dates": ["2024-01-15", "2024-01-20", "2024-01-25"],
                "vendor": "VENDOR001"
            },
            {
                "id": "ACT002",
                "title": "رحلة بحرية في البحر الأحمر",
                "title_en": "Red Sea Boat Trip",
                "description": "رحلة بحرية ممتعة مع أنشطة صيد وغوص ووجبة غداء",
                "description_en": "Fun boat trip with fishing, diving activities and lunch",
                "category": "water",
                "subcategory": "boat_trip",
                "location": {
                    "city": "جدة",
                    "city_en": "Jeddah",
                    "address": "ميناء الملك عبدالعزيز، جدة",
                    "coordinates": [39.1925, 21.5858]
                },
                "pricing": {"basePrice": 200.0, "currency": "SAR", "priceType": "per_person"},
                "duration": {"hours": 8, "minutes": 0},
                "capacity": {"min": 4, "max": 15},
                "difficulty": "beginner",
                "rating": {"average": 4.6, "count": 89},
                "popularity_score": 0.75,
                "cultural_tags": ["water", "adventure", "modern", "social"],
                "family_friendly": True,
                "prayer_time_friendly": True,
                "gender_policy": "mixed",
                "halal_certified": True,
                "features": ["lunch_included", "equipment_provided", "swimming"],
                "available_dates": ["2024-01-18", "2024-01-22", "2024-01-28"],
                "vendor": "VENDOR002"
            },
            {
                "id": "ACT003",
                "title": "ورشة طبخ المأكولات السعودية",
                "title_en": "Saudi Cuisine Cooking Workshop",
                "description": "تعلم طبخ الأطباق السعودية التقليدية مع الشيف محمد",
                "description_en": "Learn to cook traditional Saudi dishes with Chef Mohammed",
                "category": "food",
                "subcategory": "cooking_class",
                "location": {
                    "city": "الدمام",
                    "city_en": "Dammam",
                    "address": "مطبخ التراث، حي الشاطئ، الدمام",
                    "coordinates": [50.0888, 26.4207]
                },
                "pricing": {"basePrice": 80.0, "currency": "SAR", "priceType": "per_person"},
                "duration": {"hours": 3, "minutes": 0},
                "capacity": {"min": 3, "max": 12},
                "difficulty": "beginner",
                "rating": {"average": 4.9, "count": 234},
                "popularity_score": 0.92,
                "cultural_tags": ["traditional", "heritage", "food", "cultural", "family"],
                "family_friendly": True,
                "prayer_time_friendly": True,
                "gender_policy": "separated",
                "halal_certified": True,
                "features": ["traditional_recipes", "take_home_food", "cultural_stories"],
                "available_dates": ["2024-01-16", "2024-01-19", "2024-01-23"],
                "vendor": "VENDOR003"
            },
            {
                "id": "ACT004",
                "title": "جولة في متحف الرياض الوطني",
                "title_en": "Riyadh National Museum Tour",
                "description": "جولة ثقافية مع دليل متخصص في تاريخ المملكة العربية السعودية",
                "description_en": "Cultural tour with specialized guide in Saudi Arabian history",
                "category": "cultural",
                "subcategory": "museum_tour",
                "location": {
                    "city": "الرياض",
                    "city_en": "Riyadh",
                    "address": "متحف الرياض الوطني، حي المربع، الرياض",
                    "coordinates": [46.6753, 24.6488]
                },
                "pricing": {"basePrice": 25.0, "currency": "SAR", "priceType": "per_person"},
                "duration": {"hours": 2, "minutes": 30},
                "capacity": {"min": 1, "max": 20},
                "difficulty": "all_levels",
                "rating": {"average": 4.5, "count": 445},
                "popularity_score": 0.78,
                "cultural_tags": ["traditional", "heritage", "cultural", "educational"],
                "family_friendly": True,
                "prayer_time_friendly": True,
                "gender_policy": "mixed",
                "features": ["expert_guide", "historical_artifacts", "educational"],
                "available_dates": ["2024-01-17", "2024-01-21", "2024-01-24"],
                "vendor": "VENDOR004"
            },
            {
                "id": "ACT005",
                "title": "مباراة كرة قدم مع الأصدقاء",
                "title_en": "Football Match with Friends",
                "description": "مباراة كرة قدم ممتعة في ملعب عشبي حديث مع حكم",
                "description_en": "Fun football match on modern grass field with referee",
                "category": "sports",
                "subcategory": "football",
                "location": {
                    "city": "الرياض",
                    "city_en": "Riyadh",
                    "address": "ملعب الأحلام الرياضي، حي النرجس، الرياض",
                    "coordinates": [46.6253, 24.7536]
                },
                "pricing": {"basePrice": 50.0, "currency": "SAR", "priceType": "per_person"},
                "duration": {"hours": 2, "minutes": 0},
                "capacity": {"min": 10, "max": 22},
                "difficulty": "intermediate",
                "rating": {"average": 4.7, "count": 178},
                "popularity_score": 0.88,
                "cultural_tags": ["sports", "social", "modern"],
                "family_friendly": False,
                "prayer_time_friendly": True,
                "gender_policy": "separated",
                "features": ["professional_field", "referee", "equipment_provided"],
                "available_dates": ["2024-01-19", "2024-01-26", "2024-01-30"],
                "vendor": "VENDOR005"
            },
            {
                "id": "ACT006",
                "title": "جلسة تأمل وسط الطبيعة",
                "title_en": "Nature Meditation Session",
                "description": "جلسة تأمل واسترخاء في بيئة طبيعية هادئة مع مدرب معتمد",
                "description_en": "Meditation and relaxation session in peaceful natural environment with certified instructor",
                "category": "wellness",
                "subcategory": "meditation",
                "location": {
                    "city": "الرياض",
                    "city_en": "Riyadh",
                    "address": "حديقة الملك عبدالله، شمال الرياض",
                    "coordinates": [46.6853, 24.7836]
                },
                "pricing": {"basePrice": 40.0, "currency": "SAR", "priceType": "per_person"},
                "duration": {"hours": 1, "minutes": 30},
                "capacity": {"min": 1, "max": 15},
                "difficulty": "all_levels",
                "rating": {"average": 4.4, "count": 67},
                "popularity_score": 0.65,
                "cultural_tags": ["wellness", "peaceful", "modern", "spiritual"],
                "family_friendly": True,
                "prayer_time_friendly": True,
                "gender_policy": "separated",
                "features": ["certified_instructor", "mats_provided", "peaceful_environment"],
                "available_dates": ["2024-01-16", "2024-01-18", "2024-01-22"],
                "vendor": "VENDOR006"
            }
        ]
    
    def _get_user_search_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's search history for collaborative filtering"""
        if not self.redis_client or not user_id:
            return []
        
        try:
            history_key = f"{self.search_history_key}:{user_id}"
            history_data = self.redis_client.get(history_key)
            return json.loads(history_data) if history_data else []
        except Exception:
            return []
    
    def _save_enhanced_search_history(self, request: DiscoverSearchRequest, 
                                    processed_query: Dict[str, Any],
                                    results: List[Dict[str, Any]]) -> None:
        """Save enhanced search history with analytics"""
        if not self.redis_client or not request.user_id:
            return
        
        try:
            search_record = {
                "user_id": request.user_id,
                "original_query": request.query,
                "processed_query": processed_query,
                "language": request.language,
                "search_type": request.search_type,
                "results_count": len(results),
                "location_context": request.location,
                "cultural_context": request.cultural_preferences,
                "voice_input": request.voice_input,
                "timestamp": datetime.now().isoformat(),
                "result_categories": list(set(r.get("category") for r in results)),
                "average_result_score": np.mean([r.get("_discovery_score", 0) for r in results]) if results else 0
            }
            
            # Save to user's search history
            history_key = f"{self.search_history_key}:{request.user_id}"
            history_data = self.redis_client.get(history_key)
            history = json.loads(history_data) if history_data else []
            
            history.append(search_record)
            history = history[-100:]  # Keep last 100 searches
            
            self.redis_client.setex(history_key, 60 * 60 * 24 * 60, json.dumps(history))
            
            # Save to global analytics
            analytics_key = "agents:discover:global_analytics"
            self.redis_client.lpush(analytics_key, json.dumps(search_record))
            
        except Exception:
            pass
    
    def _format_recommendation(self, activity: Dict[str, Any], score: float) -> Dict[str, Any]:
        """Format activity for recommendation response"""
        return {
            "activity": activity,
            "recommendation_score": round(score, 2),
            "recommendation_reason": self._generate_recommendation_reason(activity, score),
            "cultural_fit": activity.get("cultural_fit_score", 0.5),
            "distance_info": activity.get("distance_info"),
            "availability_score": activity.get("availability_score", 0.8)
        }
    
    def _generate_recommendation_reason(self, activity: Dict[str, Any], score: float) -> str:
        """Generate explanation for why activity was recommended"""
        reasons = []
        
        if activity.get("rating", {}).get("average", 0) >= 4.5:
            reasons.append("highly_rated")
        
        if activity.get("popularity_score", 0) >= 0.8:
            reasons.append("popular_choice")
        
        if activity.get("cultural_fit_score", 0) >= 0.7:
            reasons.append("cultural_match")
        
        if activity.get("distance_km", 100) <= 10:
            reasons.append("nearby_location")
        
        return ", ".join(reasons) if reasons else "general_recommendation"
    
    def _generate_search_suggestions(self, processed_query: Dict[str, Any], 
                                   language: str = "ar") -> List[str]:
        """Generate intelligent search suggestions"""
        suggestions = []
        
        # Base categories
        intent = processed_query.get("intent", [])
        
        if language == "ar":
            if "adventure" in intent:
                suggestions.extend([
                    "مغامرات تسلق في الرياض",
                    "رحلات استكشاف الصحراء",
                    "تخييم تحت النجوم"
                ])
            if "food" in intent:
                suggestions.extend([
                    "ورش طبخ تراثية",
                    "جولات تذوق الطعام",
                    "تجارب الطبخ العائلية"
                ])
            if "cultural" in intent:
                suggestions.extend([
                    "جولات المتاحف التراثية",
                    "فعاليات ثقافية محلية",
                    "ورش الحرف التقليدية"
                ])
        else:
            if "adventure" in intent:
                suggestions.extend([
                    "climbing adventures in Riyadh",
                    "desert exploration trips",
                    "stargazing camping"
                ])
            if "food" in intent:
                suggestions.extend([
                    "traditional cooking workshops",
                    "food tasting tours",
                    "family cooking experiences"
                ])
            if "cultural" in intent:
                suggestions.extend([
                    "heritage museum tours",
                    "local cultural events",
                    "traditional craft workshops"
                ])
        
        return suggestions[:5]  # Return top 5 suggestions
    
    def _calculate_ranking_quality(self, ranked_activities: List[Dict[str, Any]]) -> float:
        """Calculate the quality of the ranking algorithm"""
        if not ranked_activities:
            return 0.0
        
        # Quality metrics
        avg_rating = np.mean([a.get("rating", {}).get("average", 0) for a in ranked_activities])
        avg_popularity = np.mean([a.get("popularity_score", 0) for a in ranked_activities])
        score_distribution = np.std([a.get("_discovery_score", 0) for a in ranked_activities])
        
        # Normalize to 0-1 scale
        quality_score = (
            (avg_rating / 5.0) * 0.4 +
            avg_popularity * 0.4 +
            min(1.0, score_distribution) * 0.2
        )
        
        return quality_score
    
    def _track_user_search_behavior(self, request: DiscoverSearchRequest, 
                                  results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Track user search behavior for learning algorithms"""
        if not request.user_id:
            return {}
        
        behavior_data = {
            "search_patterns": {
                "query_complexity": len(request.query.split()),
                "uses_filters": bool(request.filters),
                "location_specific": bool(request.location),
                "cultural_aware": bool(request.cultural_preferences)
            },
            "result_quality": {
                "result_count": len(results),
                "average_score": np.mean([r.get("_discovery_score", 0) for r in results]) if results else 0,
                "category_diversity": len(set(r.get("category") for r in results))
            },
            "personalization_opportunity": {
                "can_improve_cultural": not bool(request.cultural_preferences),
                "can_improve_location": not bool(request.location),
                "can_learn_preferences": len(self._get_user_search_history(request.user_id)) < 5
            }
        }
        
        return behavior_data
    
    def _generate_contextual_recommendations(self, request: DiscoverSearchRequest,
                                           processed_query: Dict[str, Any],
                                           ranked_activities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate contextual recommendations based on search results"""
        recommendations = []
        
        # If user searched for specific category, recommend related categories
        if processed_query.get("intent"):
            primary_intent = processed_query["intent"][0]
            
            related_categories = {
                "adventure": ["sports", "outdoor"],
                "water": ["adventure", "sports"],
                "food": ["cultural", "social"],
                "cultural": ["traditional", "heritage"],
                "sports": ["fitness", "social"],
                "wellness": ["meditation", "health"]
            }
            
            related = related_categories.get(primary_intent, [])
            for category in related:
                # Find activities in related categories
                related_activities = [a for a in ranked_activities 
                                    if category in a.get("cultural_tags", []) or 
                                       a.get("subcategory") == category]
                
                if related_activities:
                    recommendations.append({
                        "type": "related_category",
                        "category": category,
                        "activities": related_activities[:3],
                        "reason": f"Based on your interest in {primary_intent}"
                    })
        
        return recommendations[:3]  # Return top 3 recommendation groups
    
    def _generate_alternative_suggestions(self, activities: List[Dict[str, Any]],
                                        request: DiscoverRecommendationRequest,
                                        cultural_profile: CulturalContext) -> List[Dict[str, Any]]:
        """Generate alternative suggestions for recommendations"""
        alternatives = []
        
        # Different price range alternatives
        if activities:
            avg_price = np.mean([a.get("pricing", {}).get("basePrice", 0) for a in activities])
            
            cheaper_activities = [a for a in activities 
                                if a.get("pricing", {}).get("basePrice", 0) < avg_price * 0.7]
            if cheaper_activities:
                alternatives.append({
                    "type": "budget_friendly",
                    "activities": cheaper_activities[:3],
                    "reason": "More budget-friendly options"
                })
            
            premium_activities = [a for a in activities 
                                if a.get("pricing", {}).get("basePrice", 0) > avg_price * 1.3]
            if premium_activities:
                alternatives.append({
                    "type": "premium",
                    "activities": premium_activities[:3],
                    "reason": "Premium experience options"
                })
        
        return alternatives
    
    def _generate_learning_insights(self, request: DiscoverRecommendationRequest,
                                  recommendations: List[Dict[str, Any]],
                                  scores: Dict[str, float]) -> Dict[str, Any]:
        """Generate insights for improving future recommendations"""
        return {
            "preference_confidence": np.mean(list(scores.values())) if scores else 0.5,
            "recommendation_diversity": len(set(r.get("category") for r in recommendations)),
            "cultural_alignment": np.mean([r.get("cultural_fit_score", 0.5) for r in recommendations]),
            "improvement_areas": self._identify_improvement_areas(request, recommendations),
            "next_learning_opportunity": self._identify_learning_opportunity(request)
        }
    
    def _identify_improvement_areas(self, request: DiscoverRecommendationRequest,
                                  recommendations: List[Dict[str, Any]]) -> List[str]:
        """Identify areas where recommendations can be improved"""
        areas = []
        
        if len(recommendations) < 5:
            areas.append("expand_activity_database")
        
        if not request.location:
            areas.append("collect_location_preferences")
        
        categories = set(r.get("category") for r in recommendations)
        if len(categories) < 3:
            areas.append("diversify_recommendations")
        
        return areas
    
    def _identify_learning_opportunity(self, request: DiscoverRecommendationRequest) -> str:
        """Identify next learning opportunity for the user"""
        if not request.user_id:
            return "user_registration"
        
        user_history = self._get_user_search_history(request.user_id)
        
        if len(user_history) < 3:
            return "build_preference_profile"
        elif not request.location:
            return "location_preferences"
        elif not request.cultural_context:
            return "cultural_preferences"
        else:
            return "refine_recommendations"
    
    def _calculate_recommendation_confidence(self, recommendations: List[Dict[str, Any]],
                                          scores: Dict[str, float],
                                          user_profile: Dict[str, Any]) -> float:
        """Calculate confidence score for recommendations"""
        if not recommendations:
            return 0.0
        
        # Base confidence from scores
        score_confidence = np.mean([scores.get(r["id"], 0.5) for r in recommendations])
        
        # User profile completeness factor
        profile_completeness = len(user_profile.get("preferences", {})) / 10.0
        
        # Search history factor
        user_history = self._get_user_search_history(user_profile.get("user_id", ""))
        history_factor = min(1.0, len(user_history) / 10.0)
        
        # Combined confidence
        confidence = (score_confidence * 0.6 + 
                     profile_completeness * 0.2 + 
                     history_factor * 0.2)
        
        return confidence
    
    def _get_fallback_recommendations(self, language: str = "ar") -> List[Dict[str, Any]]:
        """Get fallback recommendations when main algorithm fails"""
        fallback_activities = self._get_all_activities()[:5]
        
        return [
            {
                "activity": activity,
                "recommendation_score": 0.5,
                "recommendation_reason": "fallback_recommendation",
                "cultural_fit": 0.5
            }
            for activity in fallback_activities
        ]
    
    def _get_fallback_search_results(self, language: str = "ar") -> List[Dict[str, Any]]:
        """Get fallback search results when search fails"""
        return self._get_all_activities()[:5]
    
    def update_user_preferences(self, user_id: str, interaction_data: Dict[str, Any]) -> bool:
        """
        Update user preferences based on interactions
        
        Args:
            user_id: User identifier
            interaction_data: User interaction data (clicks, bookings, etc.)
        
        Returns:
            Success status
        """
        if not self.redis_client or not user_id:
            return False
        
        try:
            # Get current preferences
            user_profile = self._get_user_preference_profile(user_id)
            
            # Apply learning based on interaction type
            interaction_type = interaction_data.get("type")
            activity_data = interaction_data.get("activity")
            
            if not activity_data:
                return False
            
            learning_rate = self.learning_rates.get(interaction_type, 0.1)
            
            # Update category preferences
            category = activity_data.get("category")
            if category:
                current_categories = user_profile["preferences"].get("categories", [])
                if category not in current_categories:
                    current_categories.append(category)
                    user_profile["preferences"]["categories"] = current_categories
            
            # Update price range preferences
            activity_price = activity_data.get("pricing", {}).get("basePrice", 0)
            if activity_price > 0:
                price_range = user_profile["preferences"].setdefault("priceRange", {"min": 0, "max": 500})
                
                # Gradually adjust price range based on interactions
                if interaction_type in ["booking", "review"]:
                    # Positive interaction - adjust range to include this price
                    if activity_price > price_range["max"]:
                        price_range["max"] = activity_price * 1.2
                    elif activity_price < price_range["min"]:
                        price_range["min"] = max(0, activity_price * 0.8)
            
            # Update cultural preferences
            cultural_tags = activity_data.get("cultural_tags", [])
            for tag in cultural_tags:
                cultural_key = f"cultural_{tag}"
                current_value = user_profile["preferences"].get(cultural_key, 0.5)
                if interaction_type in ["booking", "review"]:
                    # Positive interaction
                    user_profile["preferences"][cultural_key] = min(1.0, current_value + learning_rate)
                elif interaction_type == "skip":
                    # Negative interaction
                    user_profile["preferences"][cultural_key] = max(0.0, current_value - learning_rate * 0.5)
            
            # Save updated preferences
            profile_key = f"{self.user_preferences_key}:{user_id}"
            self.redis_client.setex(profile_key, 60 * 60 * 24 * 30, 
                                  json.dumps(user_profile))
            
            return True
            
        except Exception:
            return False
    
    def get_trending_activities(self, location: Optional[str] = None, 
                              timeframe: str = "week",
                              cultural_context: str = "saudi_modern") -> Dict[str, Any]:
        """
        Get trending activities based on location and cultural context
        
        Args:
            location: Optional location filter
            timeframe: Timeframe for trending analysis
            cultural_context: Cultural context for filtering
        
        Returns:
            Trending activities with insights
        """
        try:
            all_activities = self._get_all_activities()
            
            # Filter by location if specified
            if location:
                location_lower = location.lower()
                all_activities = [a for a in all_activities
                                if location_lower in a.get("location", {}).get("city", "").lower()]
            
            # Get cultural profile
            cultural_profile = self.cultural_profiles.get(cultural_context, 
                                                        self.cultural_profiles["saudi_modern"])
            
            # Calculate trending scores
            trending_activities = []
            for activity in all_activities:
                trending_score = (
                    activity.get("popularity_score", 0) * 0.4 +
                    (activity.get("rating", {}).get("average", 0) / 5.0) * 0.3 +
                    self.calculate_cultural_fit_score(activity, cultural_profile) * 0.3
                )
                
                activity["trending_score"] = trending_score
                trending_activities.append(activity)
            
            # Sort by trending score
            trending_activities.sort(key=lambda x: x["trending_score"], reverse=True)
            
            # Generate insights
            insights = {
                "total_trending": len(trending_activities),
                "top_categories": self._get_top_categories(trending_activities[:10]),
                "price_insights": self._get_price_insights(trending_activities[:10]),
                "location_insights": self._get_location_insights(trending_activities[:10]),
                "cultural_insights": self._get_cultural_trend_insights(trending_activities[:10], cultural_profile)
            }
            
            return {
                "trending_activities": trending_activities[:15],
                "insights": insights,
                "timeframe": timeframe,
                "location": location,
                "cultural_context": cultural_context
            }
            
        except Exception as e:
            return {
                "trending_activities": [],
                "insights": {},
                "error": str(e)
            }
    
    def _get_top_categories(self, activities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get top categories from activities"""
        category_counts = defaultdict(int)
        for activity in activities:
            category_counts[activity.get("category", "other")] += 1
        
        return [{"category": cat, "count": count} 
                for cat, count in sorted(category_counts.items(), 
                                       key=lambda x: x[1], reverse=True)]
    
    def _get_price_insights(self, activities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get price insights from activities"""
        prices = [a.get("pricing", {}).get("basePrice", 0) for a in activities]
        if not prices:
            return {}
        
        return {
            "average_price": round(np.mean(prices), 2),
            "price_range": {"min": min(prices), "max": max(prices)},
            "affordable_count": sum(1 for p in prices if p <= 100),
            "premium_count": sum(1 for p in prices if p > 200)
        }
    
    def _get_location_insights(self, activities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get location insights from activities"""
        cities = [a.get("location", {}).get("city", "") for a in activities]
        city_counts = defaultdict(int)
        for city in cities:
            if city:
                city_counts[city] += 1
        
        return {
            "top_cities": [{"city": city, "count": count} 
                          for city, count in sorted(city_counts.items(), 
                                                  key=lambda x: x[1], reverse=True)],
            "geographic_spread": len(city_counts),
            "concentration": max(city_counts.values()) / sum(city_counts.values()) if city_counts else 0
        }
    
    def _get_cultural_trend_insights(self, activities: List[Dict[str, Any]], 
                                   cultural_profile: CulturalContext) -> List[str]:
        """Get cultural trend insights"""
        insights = []
        
        traditional_count = sum(1 for a in activities 
                              if "traditional" in a.get("cultural_tags", []))
        modern_count = sum(1 for a in activities 
                         if "modern" in a.get("cultural_tags", []))
        
        if traditional_count > modern_count:
            insights.append("Traditional activities are trending")
        elif modern_count > traditional_count:
            insights.append("Modern activities are gaining popularity")
        
        family_count = sum(1 for a in activities if a.get("family_friendly"))
        if family_count > len(activities) * 0.6:
            insights.append("Family-oriented activities are highly popular")
        
        return insights
    
    def process_discover_inquiry(self, message: str, user_id: str = "anonymous", 
                               language: str = "ar") -> str:
        """
        Process discover-related inquiries with intelligent responses
        
        Args:
            message: User message
            user_id: User identifier
            language: Language preference
        
        Returns:
            Intelligent response string
        """
        message_lower = message.lower()
        
        # Enhanced search keywords detection
        search_keywords = {
            "ar": ["ابحث", "أريد", "أبحث", "دلني", "اقترح", "ساعدني", "أين", "وين"],
            "en": ["search", "find", "want", "looking", "suggest", "help", "where", "recommend"]
        }
        
        recommendation_keywords = {
            "ar": ["اقترح", "رشح", "أنصحني", "أفضل", "مناسب"],
            "en": ["recommend", "suggest", "best", "suitable", "advice"]
        }
        
        # Check for search intent
        if any(keyword in message_lower for keyword in search_keywords[language]):
            # Create search request from message
            search_request = DiscoverSearchRequest(
                query=message,
                user_id=user_id,
                language=language,
                search_type="natural"
            )
            
            # Perform search
            search_response = self.intelligent_search(search_request)
            
            # Format response
            if search_response.results:
                if language == "ar":
                    response = f"وجدت {len(search_response.results)} نشاط مناسب:\n\n"
                    for i, result in enumerate(search_response.results[:3], 1):
                        response += f"{i}. {result['title']} - {result['location']['city']}\n"
                        response += f"   السعر: {result['pricing']['basePrice']} ريال\n"
                        response += f"   التقييم: {result['rating']['average']:.1f} ⭐\n\n"
                    
                    if search_response.cultural_insights:
                        response += "💡 معلومات ثقافية:\n"
                        response += "\n".join(f"• {insight}" for insight in search_response.cultural_insights)
                else:
                    response = f"Found {len(search_response.results)} suitable activities:\n\n"
                    for i, result in enumerate(search_response.results[:3], 1):
                        response += f"{i}. {result['title_en']} - {result['location']['city_en']}\n"
                        response += f"   Price: {result['pricing']['basePrice']} SAR\n"
                        response += f"   Rating: {result['rating']['average']:.1f} ⭐\n\n"
                    
                    if search_response.cultural_insights:
                        response += "💡 Cultural Insights:\n"
                        response += "\n".join(f"• {insight}" for insight in search_response.cultural_insights)
                
                return response
            else:
                return "لم أجد أنشطة مناسبة. جرب البحث بكلمات مختلفة." if language == "ar" else "No suitable activities found. Try different search terms."
        
        # Check for recommendation intent
        elif any(keyword in message_lower for keyword in recommendation_keywords[language]):
            # Create recommendation request
            rec_request = DiscoverRecommendationRequest(
                user_id=user_id,
                cultural_context="saudi_modern"
            )
            
            # Generate recommendations
            rec_response = self.generate_intelligent_recommendations(rec_request)
            
            # Format response
            if rec_response.recommendations:
                if language == "ar":
                    response = "إليك أفضل التوصيات لك:\n\n"
                    for i, rec in enumerate(rec_response.recommendations[:3], 1):
                        activity = rec["activity"]
                        response += f"{i}. {activity['title']} - {activity['location']['city']}\n"
                        response += f"   السبب: {rec['recommendation_reason']}\n"
                        response += f"   التقييم: {activity['rating']['average']:.1f} ⭐\n\n"
                    
                    response += f"🎯 مستوى الثقة: {rec_response.confidence_score:.0%}"
                else:
                    response = "Here are the best recommendations for you:\n\n"
                    for i, rec in enumerate(rec_response.recommendations[:3], 1):
                        activity = rec["activity"]
                        response += f"{i}. {activity['title_en']} - {activity['location']['city_en']}\n"
                        response += f"   Reason: {rec['recommendation_reason']}\n"
                        response += f"   Rating: {activity['rating']['average']:.1f} ⭐\n\n"
                    
                    response += f"🎯 Confidence Level: {rec_response.confidence_score:.0%}"
                
                return response
            else:
                return "لا توجد توصيات متاحة حالياً." if language == "ar" else "No recommendations available at the moment."
        
        # Default response for discover agent
        else:
            if language == "ar":
                return """مرحباً! أنا سيلينا - وكيل الاستكشاف الذكي في LUDUS 🔍

يمكنني مساعدتك في:
• البحث الذكي عن الأنشطة بالذكاء الاصطناعي
• تقديم توصيات شخصية مناسبة لك
• تحليل الأنشطة حسب الموقع الجغرافي
• اقتراحات ثقافية تناسب تفضيلاتك
• البحث بالصوت والنص

جرب أن تقول: "ابحث عن أنشطة مغامرات في الرياض" أو "اقترح لي أنشطة عائلية"

ما نوع النشاط الذي تريد اكتشافه؟ 🌟"""
            else:
                return """Hello! I'm Selena - your intelligent discovery agent for LUDUS 🔍

I can help you with:
• AI-powered intelligent activity search
• Personalized recommendations tailored for you
• Geographic analysis of activities
• Cultural suggestions matching your preferences
• Voice and text search capabilities

Try saying: "Search for adventure activities in Riyadh" or "Recommend family activities"

What type of activity would you like to discover? 🌟"""
    
    def get_discover_analytics(self, timeframe: str = "week") -> Dict[str, Any]:
        """Get analytics data for the discover agent"""
        if not self.redis_client:
            return {"error": "Analytics not available"}
        
        try:
            # Get global analytics data
            analytics_key = "agents:discover:global_analytics"
            raw_data = self.redis_client.lrange(analytics_key, 0, -1)
            
            analytics_data = []
            for item in raw_data:
                try:
                    analytics_data.append(json.loads(item))
                except:
                    continue
            
            # Filter by timeframe
            now = datetime.now()
            timeframe_hours = {"day": 24, "week": 168, "month": 720}
            hours_back = timeframe_hours.get(timeframe, 168)
            
            cutoff_time = now - timedelta(hours=hours_back)
            recent_data = [
                item for item in analytics_data
                if datetime.fromisoformat(item["timestamp"]) > cutoff_time
            ]
            
            # Calculate analytics
            total_searches = len(recent_data)
            unique_users = len(set(item["user_id"] for item in recent_data))
            
            # Language distribution
            language_dist = defaultdict(int)
            for item in recent_data:
                language_dist[item["language"]] += 1
            
            # Query complexity analysis
            avg_query_length = np.mean([len(item["original_query"].split()) 
                                      for item in recent_data]) if recent_data else 0
            
            # Popular categories
            category_counts = defaultdict(int)
            for item in recent_data:
                for category in item.get("result_categories", []):
                    category_counts[category] += 1
            
            return {
                "period": timeframe,
                "total_searches": total_searches,
                "unique_users": unique_users,
                "average_query_length": round(avg_query_length, 1),
                "language_distribution": dict(language_dist),
                "popular_categories": dict(sorted(category_counts.items(), 
                                                key=lambda x: x[1], reverse=True)),
                "search_success_rate": sum(1 for item in recent_data 
                                         if item["results_count"] > 0) / total_searches if total_searches > 0 else 0,
                "average_results_per_search": np.mean([item["results_count"] 
                                                     for item in recent_data]) if recent_data else 0
            }
            
        except Exception as e:
            return {"error": f"Analytics calculation failed: {str(e)}"}