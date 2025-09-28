"""
Selena Discover Agent for LUDUS Platform
Specializes in activity discovery, personalized recommendations, and exploration

Capabilities:
- Personalized activity recommendations
- Location-based activity discovery
- Event and experience exploration
- Trending activities identification
- Cultural and seasonal activity suggestions

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

import time
import hashlib
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime, date
from .base_agent import BaseAgent, AgentRequest, AgentResponse


class ActivityFilter(BaseModel):
    """Activity filtering options"""
    category: Optional[str] = None
    location: Optional[str] = None
    price_range: Optional[Dict[str, float]] = None  # {"min": 0, "max": 1000}
    date_range: Optional[Dict[str, str]] = None    # {"start": "2025-09-28", "end": "2025-10-28"}
    duration: Optional[str] = None  # "short", "medium", "long"
    group_size: Optional[str] = None  # "individual", "couple", "family", "group"
    accessibility: Optional[List[str]] = None
    cultural_preference: Optional[str] = None  # "traditional", "modern", "mixed"


class DiscoverRequest(AgentRequest):
    """Specialized request model for discovery agent"""
    discovery_type: str = Field(default="general", description="Type of discovery (general, trending, nearby, recommended)")
    filters: Optional[ActivityFilter] = None
    user_location: Optional[Dict[str, float]] = None  # {"lat": 24.7136, "lng": 46.6753}
    search_radius_km: Optional[float] = Field(default=50.0, ge=1.0, le=200.0)
    exclude_activities: Optional[List[str]] = Field(default_factory=list)


class ActivityRecommendation(BaseModel):
    """Individual activity recommendation"""
    id: str
    title: str
    title_ar: str
    description: str
    description_ar: str
    category: str
    location: str
    price_sar: float
    duration_hours: float
    rating: float
    image_url: Optional[str] = None
    match_score: float = Field(ge=0.0, le=1.0)
    match_reasons: List[str]


class DiscoverResponse(AgentResponse):
    """Specialized response model for discovery agent"""
    recommendations: List[ActivityRecommendation] = Field(default_factory=list)
    discovery_insights: Optional[Dict[str, Any]] = None
    trending_activities: Optional[List[str]] = None
    seasonal_suggestions: Optional[List[str]] = None


class DiscoverAgent(BaseAgent):
    """
    Selena Discover Agent - Specialized in activity discovery and recommendations
    """
    
    def __init__(self, redis_client=None, ollama_host="http://localhost:11434", ollama_model="llama3.2"):
        super().__init__(
            agent_type="discover",
            redis_client=redis_client,
            ollama_host=ollama_host,
            ollama_model=ollama_model
        )
        
        # Activity categories in Saudi Arabia
        self.activity_categories = {
            "ar": {
                "cultural": "ثقافي",
                "sports": "رياضي", 
                "entertainment": "ترفيهي",
                "educational": "تعليمي",
                "outdoor": "خارجي",
                "family": "عائلي",
                "business": "تجاري",
                "religious": "ديني",
                "heritage": "تراثي",
                "adventure": "مغامرة",
                "wellness": "صحة ولياقة",
                "arts": "فنون"
            },
            "en": {
                "cultural": "Cultural",
                "sports": "Sports",
                "entertainment": "Entertainment", 
                "educational": "Educational",
                "outdoor": "Outdoor",
                "family": "Family",
                "business": "Business",
                "religious": "Religious",
                "heritage": "Heritage",
                "adventure": "Adventure",
                "wellness": "Wellness",
                "arts": "Arts"
            }
        }
        
        # Saudi cities and regions
        self.saudi_locations = {
            "riyadh": {"name_ar": "الرياض", "lat": 24.7136, "lng": 46.6753},
            "jeddah": {"name_ar": "جدة", "lat": 21.2854, "lng": 39.2376},
            "mecca": {"name_ar": "مكة المكرمة", "lat": 21.3891, "lng": 39.8579},
            "medina": {"name_ar": "المدينة المنورة", "lat": 24.5247, "lng": 39.5692},
            "dammam": {"name_ar": "الدمام", "lat": 26.4282, "lng": 50.1058},
            "khobar": {"name_ar": "الخبر", "lat": 26.2172, "lng": 50.1971},
            "taif": {"name_ar": "الطائف", "lat": 21.2703, "lng": 40.4170},
            "abha": {"name_ar": "أبها", "lat": 18.2160, "lng": 42.5053},
            "tabuk": {"name_ar": "تبوك", "lat": 28.3998, "lng": 36.5700},
            "najran": {"name_ar": "نجران", "lat": 17.4924, "lng": 44.1277}
        }
        
        # Mock activities database (in production, this would connect to real database)
        self.mock_activities = self._load_mock_activities()
    
    async def process_request(self, request: DiscoverRequest) -> DiscoverResponse:
        """Process discovery request with personalized recommendations"""
        
        start_time = time.time()
        
        try:
            # Validate request
            if not await self.validate_request(request):
                raise ValueError("Invalid discovery request")
            
            # Generate cache key
            context_hash = hashlib.md5(str({
                "filters": request.filters.dict() if request.filters else None,
                "location": request.user_location,
                "type": request.discovery_type
            }).encode()).hexdigest()[:8]
            cache_key = self._generate_cache_key(request.message, request.language, context_hash)
            
            # Check cache for similar discovery requests
            cached_response = await self._get_cached_response(cache_key)
            if cached_response:
                return await self._create_cached_discovery_response(cached_response, request, start_time)
            
            # Build discovery-specific prompt
            prompt = self._build_discovery_prompt(request)
            
            # Get AI response for contextual recommendations
            ai_response = await self._call_ollama(prompt, temperature=0.8, max_tokens=600)
            
            if not ai_response:
                ai_response = await self._get_template_discovery_response(request)
            
            # Generate activity recommendations
            recommendations = await self._generate_recommendations(request)
            
            # Get discovery insights
            insights = await self._get_discovery_insights(request)
            
            # Format response
            formatted_response = self._format_response_for_language(ai_response, request.language)
            
            # Cache response
            await self._cache_response(cache_key, formatted_response, ttl=300)  # 5 minutes
            
            processing_time = (time.time() - start_time) * 1000
            confidence = self._calculate_confidence(formatted_response, processing_time)
            
            # Update performance stats
            await self._update_performance_stats(processing_time, True)
            
            response = DiscoverResponse(
                reply=formatted_response,
                confidence_score=confidence,
                processing_time_ms=processing_time,
                agent_type=self.agent_type,
                language=request.language,
                suggested_actions=insights.get("suggested_actions", []),
                requires_followup=len(recommendations) > 0,
                recommendations=recommendations,
                discovery_insights=insights,
                trending_activities=insights.get("trending", []),
                seasonal_suggestions=insights.get("seasonal", [])
            )
            
            # Log successful request
            self._log_request(request, response)
            
            return response
            
        except Exception as e:
            processing_time = (time.time() - start_time) * 1000
            await self._update_performance_stats(processing_time, False)
            
            # Log error
            self._log_request(request, None, str(e))
            
            # Return error response
            return await self._handle_agent_error(e, request)
    
    def get_agent_context(self, language: str) -> str:
        """Get discovery agent-specific context"""
        
        if language == "ar":
            return """أنت سيلينا، وكيلة الاستكشاف المتخصصة في منصة LUDUS للأنشطة الاجتماعية في المملكة العربية السعودية.

مهمتك الأساسية:
🔍 مساعدة المستخدمين في اكتشاف أنشطة جديدة ومثيرة
🎯 تقديم توصيات شخصية بناءً على اهتماماتهم وموقعهم
🌟 اقتراح تجارب فريدة ومناسبة ثقافياً
📍 البحث عن الأنشطة حسب الموقع والتفضيلات

خبرتك تشمل:
- الأنشطة التراثية والثقافية السعودية
- الفعاليات العائلية والاجتماعية
- الأنشطة الرياضية والترفيهية
- التجارب التعليمية والتطويرية
- الأنشطة الموسمية والمناسبات الخاصة

أسلوب التفاعل:
- كوني متحمسة ومشجعة للاستكشاف
- قدمي توصيات متنوعة ومثيرة
- راعي الميزانية والوقت المتاح
- اعتبري التفضيلات الثقافية والاجتماعية
- ادعمي المستخدمين في اتخاذ قرارات مدروسة"""

        else:  # English
            return """You are Selena, the specialized Discovery Agent for LUDUS social activities platform in Saudi Arabia.

Your primary mission:
🔍 Help users discover new and exciting activities
🎯 Provide personalized recommendations based on their interests and location
🌟 Suggest unique and culturally appropriate experiences
📍 Search for activities based on location and preferences

Your expertise includes:
- Saudi heritage and cultural activities
- Family and social events
- Sports and entertainment activities
- Educational and developmental experiences
- Seasonal activities and special occasions

Interaction style:
- Be enthusiastic and encouraging about exploration
- Provide diverse and exciting recommendations
- Consider budget and time constraints
- Account for cultural and social preferences
- Support users in making informed decisions"""
    
    def _build_discovery_prompt(self, request: DiscoverRequest) -> str:
        """Build specialized prompt for discovery scenarios"""
        
        # Base prompt
        base_prompt = self._build_prompt(
            request.message,
            request.language,
            request.conversation_history,
            request.user_context
        )
        
        # Add discovery-specific context
        discovery_context = []
        
        if request.discovery_type:
            if request.language == "ar":
                discovery_context.append(f"نوع الاستكشاف المطلوب: {request.discovery_type}")
            else:
                discovery_context.append(f"Discovery type: {request.discovery_type}")
        
        if request.filters:
            filter_summary = self._summarize_filters(request.filters, request.language)
            if filter_summary:
                discovery_context.append(filter_summary)
        
        if request.user_location:
            location_info = self._get_location_context(request.user_location, request.language)
            if location_info:
                discovery_context.append(location_info)
        
        if discovery_context:
            context_text = "\n".join(discovery_context)
            if request.language == "ar":
                return f"{base_prompt}\n\nمعلومات إضافية للاستكشاف:\n{context_text}"
            else:
                return f"{base_prompt}\n\nAdditional discovery context:\n{context_text}"
        
        return base_prompt
    
    def _summarize_filters(self, filters: ActivityFilter, language: str) -> Optional[str]:
        """Summarize activity filters for prompt context"""
        
        if not filters:
            return None
        
        filter_parts = []
        
        if filters.category:
            category_name = self.activity_categories.get(language, {}).get(filters.category, filters.category)
            if language == "ar":
                filter_parts.append(f"الفئة: {category_name}")
            else:
                filter_parts.append(f"Category: {category_name}")
        
        if filters.location:
            if language == "ar":
                filter_parts.append(f"الموقع المفضل: {filters.location}")
            else:
                filter_parts.append(f"Preferred location: {filters.location}")
        
        if filters.price_range:
            min_price = filters.price_range.get("min", 0)
            max_price = filters.price_range.get("max", 1000)
            if language == "ar":
                filter_parts.append(f"النطاق السعري: {min_price} - {max_price} ريال")
            else:
                filter_parts.append(f"Price range: {min_price} - {max_price} SAR")
        
        if filters.group_size:
            if language == "ar":
                group_map = {"individual": "فردي", "couple": "زوجين", "family": "عائلي", "group": "مجموعة"}
                filter_parts.append(f"حجم المجموعة: {group_map.get(filters.group_size, filters.group_size)}")
            else:
                filter_parts.append(f"Group size: {filters.group_size}")
        
        if filters.cultural_preference:
            if language == "ar":
                cultural_map = {"traditional": "تقليدي", "modern": "حديث", "mixed": "متنوع"}
                filter_parts.append(f"التفضيل الثقافي: {cultural_map.get(filters.cultural_preference, filters.cultural_preference)}")
            else:
                filter_parts.append(f"Cultural preference: {filters.cultural_preference}")
        
        if filter_parts:
            if language == "ar":
                return f"معايير البحث: {', '.join(filter_parts)}"
            else:
                return f"Search criteria: {', '.join(filter_parts)}"
        
        return None
    
    def _get_location_context(self, user_location: Dict[str, float], language: str) -> Optional[str]:
        """Get context about user's location"""
        
        if not user_location or "lat" not in user_location or "lng" not in user_location:
            return None
        
        # Find nearest Saudi city
        nearest_city = self._find_nearest_city(user_location)
        
        if nearest_city:
            if language == "ar":
                return f"الموقع الحالي: بالقرب من {nearest_city['name_ar']}"
            else:
                return f"Current location: Near {nearest_city['name']}"
        
        return None
    
    def _find_nearest_city(self, user_location: Dict[str, float]) -> Optional[Dict[str, Any]]:
        """Find nearest Saudi city to user location"""
        
        user_lat = user_location.get("lat")
        user_lng = user_location.get("lng")
        
        if not user_lat or not user_lng:
            return None
        
        min_distance = float('inf')
        nearest_city = None
        
        for city_id, city_data in self.saudi_locations.items():
            # Simple distance calculation (not precise but sufficient for this use case)
            lat_diff = abs(city_data["lat"] - user_lat)
            lng_diff = abs(city_data["lng"] - user_lng)
            distance = (lat_diff ** 2 + lng_diff ** 2) ** 0.5
            
            if distance < min_distance:
                min_distance = distance
                nearest_city = {
                    "id": city_id,
                    "name": city_id.title(),
                    "name_ar": city_data["name_ar"],
                    "distance": distance
                }
        
        return nearest_city
    
    async def _generate_recommendations(self, request: DiscoverRequest) -> List[ActivityRecommendation]:
        """Generate activity recommendations based on request"""
        
        # Filter activities based on request criteria
        filtered_activities = self._filter_activities(request)
        
        # Score and rank activities
        scored_activities = self._score_activities(filtered_activities, request)
        
        # Sort by match score and return top recommendations
        scored_activities.sort(key=lambda x: x.match_score, reverse=True)
        
        # Return top 5 recommendations
        return scored_activities[:5]
    
    def _filter_activities(self, request: DiscoverRequest) -> List[Dict[str, Any]]:
        """Filter activities based on request criteria"""
        
        filtered = []
        
        for activity in self.mock_activities:
            # Apply filters if provided
            if request.filters:
                filters = request.filters
                
                # Category filter
                if filters.category and activity.get("category") != filters.category:
                    continue
                
                # Price range filter
                if filters.price_range:
                    activity_price = activity.get("price_sar", 0)
                    min_price = filters.price_range.get("min", 0)
                    max_price = filters.price_range.get("max", 999999)
                    if not (min_price <= activity_price <= max_price):
                        continue
                
                # Location filter (simple text matching)
                if filters.location:
                    activity_location = activity.get("location", "").lower()
                    if filters.location.lower() not in activity_location:
                        continue
                
                # Group size filter
                if filters.group_size:
                    activity_group_size = activity.get("group_size", [])
                    if filters.group_size not in activity_group_size:
                        continue
            
            # Exclude specified activities
            if request.exclude_activities and activity.get("id") in request.exclude_activities:
                continue
            
            filtered.append(activity)
        
        return filtered
    
    def _score_activities(self, activities: List[Dict[str, Any]], request: DiscoverRequest) -> List[ActivityRecommendation]:
        """Score activities based on user preferences and context"""
        
        recommendations = []
        
        for activity in activities:
            # Base match score
            match_score = 0.5
            match_reasons = []
            
            # Score based on user context
            if request.user_context:
                user_prefs = request.user_context.get("preferences", [])
                activity_tags = activity.get("tags", [])
                
                # Preference matching
                common_prefs = set(user_prefs) & set(activity_tags)
                if common_prefs:
                    match_score += 0.3
                    match_reasons.append("Matches your interests" if request.language == "en" 
                                       else "يتطابق مع اهتماماتك")
            
            # Location-based scoring
            if request.user_location:
                nearest_city = self._find_nearest_city(request.user_location)
                if nearest_city and nearest_city["id"] in activity.get("location", "").lower():
                    match_score += 0.2
                    match_reasons.append("Near your location" if request.language == "en"
                                       else "بالقرب من موقعك")
            
            # Popularity and rating boost
            rating = activity.get("rating", 3.0)
            if rating >= 4.5:
                match_score += 0.15
                match_reasons.append("Highly rated" if request.language == "en"
                                   else "تقييم عالي")
            elif rating >= 4.0:
                match_score += 0.1
            
            # Trending boost
            if activity.get("trending", False):
                match_score += 0.1
                match_reasons.append("Trending now" if request.language == "en"
                                   else "رائج حالياً")
            
            # Cultural appropriateness
            if activity.get("cultural_appropriate", True):
                match_score += 0.05
            
            # Ensure match score doesn't exceed 1.0
            match_score = min(1.0, match_score)
            
            # Create recommendation
            recommendation = ActivityRecommendation(
                id=activity["id"],
                title=activity["title"],
                title_ar=activity["title_ar"],
                description=activity["description"], 
                description_ar=activity["description_ar"],
                category=activity["category"],
                location=activity["location"],
                price_sar=activity["price_sar"],
                duration_hours=activity["duration_hours"],
                rating=activity["rating"],
                image_url=activity.get("image_url"),
                match_score=match_score,
                match_reasons=match_reasons
            )
            
            recommendations.append(recommendation)
        
        return recommendations
    
    async def _get_discovery_insights(self, request: DiscoverRequest) -> Dict[str, Any]:
        """Generate discovery insights and additional suggestions"""
        
        insights = {
            "discovery_type": request.discovery_type,
            "total_activities_available": len(self.mock_activities),
            "suggested_actions": [],
            "trending": [],
            "seasonal": [],
            "location_insights": {}
        }
        
        # Suggested actions based on discovery type
        if request.discovery_type == "general":
            insights["suggested_actions"] = [
                "Explore trending activities" if request.language == "en" else "استكشف الأنشطة الرائجة",
                "Filter by location" if request.language == "en" else "فلتر حسب الموقع",
                "Set preferences" if request.language == "en" else "حدد التفضيلات"
            ]
        elif request.discovery_type == "nearby":
            insights["suggested_actions"] = [
                "Expand search radius" if request.language == "en" else "توسيع نطاق البحث",
                "Try different categories" if request.language == "en" else "جرب فئات مختلفة"
            ]
        elif request.discovery_type == "trending":
            insights["suggested_actions"] = [
                "Book trending activities early" if request.language == "en" else "احجز الأنشطة الرائجة مبكراً",
                "Join popular events" if request.language == "en" else "انضم للفعاليات الشعبية"
            ]
        
        # Get trending activities
        trending_activities = [
            activity for activity in self.mock_activities 
            if activity.get("trending", False)
        ]
        insights["trending"] = [activity["title_ar"] if request.language == "ar" else activity["title"] 
                               for activity in trending_activities[:3]]
        
        # Get seasonal suggestions (based on current date)
        current_month = datetime.now().month
        seasonal_activities = self._get_seasonal_activities(current_month, request.language)
        insights["seasonal"] = seasonal_activities
        
        return insights
    
    def _get_seasonal_activities(self, month: int, language: str) -> List[str]:
        """Get seasonal activity suggestions"""
        
        seasonal_map = {
            "ar": {
                "winter": ["التخييم الصحراوي", "مهرجانات الشتاء", "الأنشطة التراثية"],
                "spring": ["النزهات الخارجية", "مهرجانات الربيع", "زيارة المتاحف"],
                "summer": ["الأنشطة الداخلية", "المراكز التجارية", "الأنشطة المائية"],
                "autumn": ["الفعاليات الثقافية", "المعارض الفنية", "الأنشطة الرياضية"]
            },
            "en": {
                "winter": ["Desert camping", "Winter festivals", "Heritage activities"],
                "spring": ["Outdoor picnics", "Spring festivals", "Museum visits"], 
                "summer": ["Indoor activities", "Shopping centers", "Water activities"],
                "autumn": ["Cultural events", "Art exhibitions", "Sports activities"]
            }
        }
        
        # Determine season based on month
        if month in [12, 1, 2]:
            season = "winter"
        elif month in [3, 4, 5]:
            season = "spring"
        elif month in [6, 7, 8]:
            season = "summer"
        else:
            season = "autumn"
        
        return seasonal_map.get(language, seasonal_map["en"]).get(season, [])
    
    async def _get_template_discovery_response(self, request: DiscoverRequest) -> str:
        """Get template response for discovery requests"""
        
        templates = {
            "ar": {
                "general": "أهلاً بك! سأساعدك في اكتشاف أنشطة رائعة في السعودية. دعني أبحث لك عن أفضل التوصيات المناسبة لاهتماماتك وموقعك.",
                "trending": "إليك أحدث الأنشطة الرائجة في السعودية! هذه الأنشطة تحظى بشعبية كبيرة ومراجعات ممتازة من المستخدمين.",
                "nearby": "دعني أجد لك أفضل الأنشطة القريبة من موقعك. سأقترح عليك خيارات متنوعة تناسب أوقات مختلفة.",
                "recommended": "بناءً على اهتماماتك ونشاطك السابق، إليك توصياتي الشخصية لأنشطة ستستمتع بها حقاً!"
            },
            "en": {
                "general": "Welcome! I'll help you discover amazing activities in Saudi Arabia. Let me search for the best recommendations that match your interests and location.",
                "trending": "Here are the latest trending activities in Saudi Arabia! These activities are very popular and have excellent reviews from users.",
                "nearby": "Let me find the best activities near your location. I'll suggest diverse options suitable for different times.",
                "recommended": "Based on your interests and previous activity, here are my personal recommendations for activities you'll truly enjoy!"
            }
        }
        
        discovery_type = request.discovery_type or "general"
        language_templates = templates.get(request.language, templates["en"])
        
        return language_templates.get(discovery_type, language_templates["general"])
    
    async def _create_cached_discovery_response(self, cached_response: str, request: DiscoverRequest, start_time: float) -> DiscoverResponse:
        """Create discovery response from cached data"""
        
        processing_time = (time.time() - start_time) * 1000
        
        # Generate fresh recommendations (don't cache these as they should be dynamic)
        recommendations = await self._generate_recommendations(request)
        insights = await self._get_discovery_insights(request)
        
        return DiscoverResponse(
            reply=cached_response,
            confidence_score=0.85,  # High confidence for cached responses
            processing_time_ms=processing_time,
            agent_type=self.agent_type,
            language=request.language,
            suggested_actions=insights.get("suggested_actions", []),
            requires_followup=len(recommendations) > 0,
            recommendations=recommendations,
            discovery_insights=insights,
            trending_activities=insights.get("trending", []),
            seasonal_suggestions=insights.get("seasonal", [])
        )
    
    def _load_mock_activities(self) -> List[Dict[str, Any]]:
        """Load mock activities for development and testing"""
        
        return [
            {
                "id": "desert_camp_riyadh",
                "title": "Desert Camping Experience",
                "title_ar": "تجربة التخييم الصحراوي",
                "description": "Authentic desert camping with traditional Saudi hospitality",
                "description_ar": "تخييم صحراوي أصيل مع الضيافة السعودية التقليدية",
                "category": "outdoor",
                "location": "Riyadh Desert",
                "price_sar": 250.0,
                "duration_hours": 24.0,
                "rating": 4.8,
                "trending": True,
                "cultural_appropriate": True,
                "group_size": ["family", "group"],
                "tags": ["adventure", "heritage", "outdoor", "traditional"]
            },
            {
                "id": "al_balad_tour",
                "title": "Historic Al-Balad Walking Tour",
                "title_ar": "جولة مشي في البلد التاريخية",
                "description": "Explore the historic heart of Jeddah",
                "description_ar": "استكشف القلب التاريخي لجدة",
                "category": "cultural",
                "location": "Jeddah Old Town",
                "price_sar": 85.0,
                "duration_hours": 3.0,
                "rating": 4.6,
                "trending": False,
                "cultural_appropriate": True,
                "group_size": ["individual", "couple", "family"],
                "tags": ["cultural", "heritage", "walking", "history"]
            },
            {
                "id": "red_sea_diving", 
                "title": "Red Sea Diving Adventure",
                "title_ar": "مغامرة الغوص في البحر الأحمر",
                "description": "Discover the underwater wonders of the Red Sea",
                "description_ar": "اكتشف عجائب البحر الأحمر تحت الماء",
                "category": "adventure",
                "location": "Red Sea Coast",
                "price_sar": 450.0,
                "duration_hours": 6.0,
                "rating": 4.9,
                "trending": True,
                "cultural_appropriate": True,
                "group_size": ["individual", "couple", "group"],
                "tags": ["adventure", "water", "sports", "nature"]
            },
            {
                "id": "riyadh_food_tour",
                "title": "Traditional Saudi Food Tour",
                "title_ar": "جولة الطعام السعودي التقليدي",
                "description": "Taste authentic Saudi cuisine across Riyadh",
                "description_ar": "تذوق المأكولات السعودية الأصيلة في الرياض",
                "category": "cultural",
                "location": "Riyadh",
                "price_sar": 180.0,
                "duration_hours": 4.0,
                "rating": 4.7,
                "trending": False,
                "cultural_appropriate": True,
                "group_size": ["individual", "couple", "family", "group"],
                "tags": ["food", "cultural", "traditional", "social"]
            },
            {
                "id": "edge_of_world",
                "title": "Edge of the World Hiking",
                "title_ar": "رحلة حافة العالم",
                "description": "Breathtaking hike to the famous Edge of the World",
                "description_ar": "رحلة مذهلة إلى حافة العالم الشهيرة",
                "category": "outdoor",
                "location": "Riyadh Province",
                "price_sar": 120.0,
                "duration_hours": 8.0,
                "rating": 4.9,
                "trending": True,
                "cultural_appropriate": True,
                "group_size": ["individual", "couple", "group"],
                "tags": ["adventure", "hiking", "nature", "scenic"]
            },
            {
                "id": "king_fahd_fountain",
                "title": "King Fahd Fountain Evening Tour",
                "title_ar": "جولة نافورة الملك فهد المسائية",
                "description": "Evening tour of the world's tallest fountain",
                "description_ar": "جولة مسائية لأطول نافورة في العالم",
                "category": "entertainment",
                "location": "Jeddah Waterfront",
                "price_sar": 60.0,
                "duration_hours": 2.0,
                "rating": 4.4,
                "trending": False,
                "cultural_appropriate": True,
                "group_size": ["couple", "family"],
                "tags": ["sightseeing", "evening", "waterfront", "family"]
            }
        ]
    
    async def get_activity_categories(self, language: str = "ar") -> Dict[str, str]:
        """Get available activity categories"""
        return self.activity_categories.get(language, self.activity_categories["en"])
    
    async def get_location_suggestions(self, language: str = "ar") -> List[Dict[str, Any]]:
        """Get Saudi location suggestions"""
        
        suggestions = []
        for city_id, city_data in self.saudi_locations.items():
            suggestion = {
                "id": city_id,
                "name": city_id.title(),
                "name_ar": city_data["name_ar"],
                "coordinates": {
                    "lat": city_data["lat"],
                    "lng": city_data["lng"]
                }
            }
            suggestions.append(suggestion)
        
        return suggestions