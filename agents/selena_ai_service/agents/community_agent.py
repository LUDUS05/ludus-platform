"""
Selena Community Agent for LUDUS Platform
Specializes in community building, social connections, and group activities

Capabilities:
- Social connection facilitation
- Group activity coordination
- Community building and engagement
- Cultural community features
- Event organization assistance

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

import time
import hashlib
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime, date
from .base_agent import BaseAgent, AgentRequest, AgentResponse


class SocialPreferences(BaseModel):
    """User social preferences and interests"""
    interests: List[str] = Field(default_factory=list)
    age_range: Optional[str] = None
    gender_preference: Optional[str] = None  # "mixed", "same_gender", "no_preference"
    group_size_preference: Optional[str] = None  # "small", "medium", "large"
    interaction_style: Optional[str] = None  # "active", "casual", "structured"


class CommunityRequest(AgentRequest):
    """Specialized request model for community agent"""
    community_action: str = Field(default="connect", description="Type of community action")
    social_preferences: Optional[SocialPreferences] = None
    event_type: Optional[str] = None
    looking_for: Optional[str] = None  # "friends", "activity_partners", "groups", "events"
    location_preference: Optional[str] = None


class CommunityConnection(BaseModel):
    """Community connection recommendation"""
    connection_id: str
    type: str  # "user", "group", "event"
    name: str
    name_ar: str
    description: str
    description_ar: str
    match_score: float = Field(ge=0.0, le=1.0)
    common_interests: List[str]
    activity_history: Optional[List[str]] = None
    location: Optional[str] = None
    image_url: Optional[str] = None


class CommunityEvent(BaseModel):
    """Community event recommendation"""
    event_id: str
    title: str
    title_ar: str
    description: str
    description_ar: str
    organizer: str
    date: str
    location: str
    participants_count: int
    max_participants: int
    category: str
    is_free: bool
    price_sar: Optional[float] = None


class CommunityResponse(AgentResponse):
    """Specialized response model for community agent"""
    connections: List[CommunityConnection] = Field(default_factory=list)
    events: List[CommunityEvent] = Field(default_factory=list)
    community_insights: Optional[Dict[str, Any]] = None
    group_suggestions: Optional[List[str]] = None


class CommunityAgent(BaseAgent):
    """
    Selena Community Agent - Specialized in community building and social connections
    """
    
    def __init__(self, redis_client=None, ollama_host="http://localhost:11434", ollama_model="llama3.2"):
        super().__init__(
            agent_type="community",
            redis_client=redis_client,
            ollama_host=ollama_host,
            ollama_model=ollama_model
        )
        
        # Community categories and types
        self.community_types = {
            "ar": {
                "sports": "رياضي",
                "cultural": "ثقافي", 
                "professional": "مهني",
                "hobby": "هواية",
                "family": "عائلي",
                "educational": "تعليمي",
                "volunteer": "تطوعي",
                "social": "اجتماعي"
            },
            "en": {
                "sports": "Sports",
                "cultural": "Cultural",
                "professional": "Professional", 
                "hobby": "Hobby",
                "family": "Family",
                "educational": "Educational",
                "volunteer": "Volunteer",
                "social": "Social"
            }
        }
        
        # Saudi cultural community features
        self.cultural_features = {
            "family_oriented": "Family-centered activities",
            "gender_appropriate": "Gender-appropriate groupings",
            "islamic_values": "Islamic values respected",
            "saudi_traditions": "Saudi traditions honored",
            "local_customs": "Local customs observed"
        }
        
        # Mock community data
        self.mock_communities = self._load_mock_communities()
        self.mock_events = self._load_mock_events()
    
    async def process_request(self, request: CommunityRequest) -> CommunityResponse:
        """Process community request with social matching and recommendations"""
        
        start_time = time.time()
        
        try:
            # Validate request
            if not await self.validate_request(request):
                raise ValueError("Invalid community request")
            
            # Generate cache key
            context_hash = hashlib.md5(str({
                "action": request.community_action,
                "looking_for": request.looking_for,
                "preferences": request.social_preferences.dict() if request.social_preferences else None
            }).encode()).hexdigest()[:8]
            cache_key = self._generate_cache_key(request.message, request.language, context_hash)
            
            # Check cache
            cached_response = await self._get_cached_response(cache_key)
            if cached_response:
                return await self._create_cached_community_response(cached_response, request, start_time)
            
            # Build community-specific prompt
            prompt = self._build_community_prompt(request)
            
            # Get AI response
            ai_response = await self._call_ollama(prompt, temperature=0.7, max_tokens=500)
            
            if not ai_response:
                ai_response = await self._get_template_community_response(request)
            
            # Generate community connections
            connections = await self._generate_connections(request)
            
            # Generate community events
            events = await self._generate_events(request)
            
            # Get community insights
            insights = await self._get_community_insights(request)
            
            # Format response
            formatted_response = self._format_response_for_language(ai_response, request.language)
            
            # Cache response
            await self._cache_response(cache_key, formatted_response, ttl=240)  # 4 minutes
            
            processing_time = (time.time() - start_time) * 1000
            confidence = self._calculate_confidence(formatted_response, processing_time)
            
            # Update performance stats
            await self._update_performance_stats(processing_time, True)
            
            response = CommunityResponse(
                reply=formatted_response,
                confidence_score=confidence,
                processing_time_ms=processing_time,
                agent_type=self.agent_type,
                language=request.language,
                suggested_actions=insights.get("suggested_actions", []),
                requires_followup=len(connections) > 0 or len(events) > 0,
                connections=connections,
                events=events,
                community_insights=insights,
                group_suggestions=insights.get("group_suggestions", [])
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
        """Get community agent-specific context"""
        
        if language == "ar":
            return """أنت سيلينا، وكيلة المجتمع المتخصصة في منصة LUDUS للأنشطة الاجتماعية في المملكة العربية السعودية.

مهمتك الأساسية:
👥 ربط المستخدمين بمجتمعات وأصدقاء جدد
🤝 تسهيل التواصل الاجتماعي والانضمام للمجموعات
🎉 تنظيم الفعاليات المجتمعية والأنشطة الجماعية
🇸🇦 احترام القيم الثقافية والاجتماعية السعودية
🌟 بناء مجتمع نشط ومتفاعل من محبي الأنشطة

خبرتك تشمل:
- ربط الأشخاص ذوي الاهتمامات المشتركة
- تنظيم المجموعات والأنشطة الجماعية
- إنشاء فعاليات مجتمعية مناسبة ثقافياً
- تشجيع التفاعل الإيجابي والصحي
- دعم بناء صداقات وعلاقات اجتماعية

أسلوب التفاعل:
- كوني ودودة ومشجعة للتفاعل الاجتماعي
- راعي الخصوصية والقيم الثقافية
- اقترحي أنشطة جماعية مناسبة
- ادعمي بناء الثقة بين أعضاء المجتمع
- احترمي التفضيلات الشخصية والاجتماعية"""

        else:  # English
            return """You are Selena, the specialized Community Agent for LUDUS social activities platform in Saudi Arabia.

Your primary mission:
👥 Connect users with new communities and friends
🤝 Facilitate social interactions and group joining
🎉 Organize community events and group activities
🇸🇦 Respect Saudi cultural and social values
🌟 Build an active and engaged community of activity enthusiasts

Your expertise includes:
- Connecting people with shared interests
- Organizing groups and group activities
- Creating culturally appropriate community events
- Encouraging positive and healthy interactions
- Supporting friendship and social relationship building

Interaction style:
- Be friendly and encouraging of social interaction
- Respect privacy and cultural values
- Suggest appropriate group activities
- Support trust building among community members
- Respect personal and social preferences"""
    
    def _build_community_prompt(self, request: CommunityRequest) -> str:
        """Build specialized prompt for community scenarios"""
        
        # Base prompt
        base_prompt = self._build_prompt(
            request.message,
            request.language,
            request.conversation_history,
            request.user_context
        )
        
        # Add community-specific context
        community_context = []
        
        if request.community_action:
            if request.language == "ar":
                community_context.append(f"نوع النشاط المجتمعي: {request.community_action}")
            else:
                community_context.append(f"Community action: {request.community_action}")
        
        if request.looking_for:
            if request.language == "ar":
                looking_for_map = {
                    "friends": "أصدقاء",
                    "activity_partners": "شركاء أنشطة",
                    "groups": "مجموعات",
                    "events": "فعاليات"
                }
                community_context.append(f"يبحث عن: {looking_for_map.get(request.looking_for, request.looking_for)}")
            else:
                community_context.append(f"Looking for: {request.looking_for}")
        
        if request.social_preferences:
            prefs_summary = self._summarize_social_preferences(request.social_preferences, request.language)
            if prefs_summary:
                community_context.append(prefs_summary)
        
        if community_context:
            context_text = "\n".join(community_context)
            if request.language == "ar":
                return f"{base_prompt}\n\nمعلومات المجتمع:\n{context_text}"
            else:
                return f"{base_prompt}\n\nCommunity context:\n{context_text}"
        
        return base_prompt
    
    def _summarize_social_preferences(self, preferences: SocialPreferences, language: str) -> Optional[str]:
        """Summarize social preferences for prompt context"""
        
        if not preferences:
            return None
        
        pref_parts = []
        
        if preferences.interests:
            interests_text = ", ".join(preferences.interests)
            if language == "ar":
                pref_parts.append(f"الاهتمامات: {interests_text}")
            else:
                pref_parts.append(f"Interests: {interests_text}")
        
        if preferences.age_range:
            if language == "ar":
                pref_parts.append(f"الفئة العمرية المفضلة: {preferences.age_range}")
            else:
                pref_parts.append(f"Preferred age range: {preferences.age_range}")
        
        if preferences.group_size_preference:
            if language == "ar":
                size_map = {"small": "صغيرة", "medium": "متوسطة", "large": "كبيرة"}
                pref_parts.append(f"حجم المجموعة المفضل: {size_map.get(preferences.group_size_preference, preferences.group_size_preference)}")
            else:
                pref_parts.append(f"Preferred group size: {preferences.group_size_preference}")
        
        if preferences.interaction_style:
            if language == "ar":
                style_map = {"active": "نشط", "casual": "غير رسمي", "structured": "منظم"}
                pref_parts.append(f"أسلوب التفاعل: {style_map.get(preferences.interaction_style, preferences.interaction_style)}")
            else:
                pref_parts.append(f"Interaction style: {preferences.interaction_style}")
        
        return " | ".join(pref_parts) if pref_parts else None
    
    async def _generate_connections(self, request: CommunityRequest) -> List[CommunityConnection]:
        """Generate community connection recommendations"""
        
        connections = []
        
        # Filter communities based on request
        relevant_communities = self._filter_communities(request)
        
        # Score and rank connections
        for community in relevant_communities:
            match_score = self._calculate_community_match_score(community, request)
            
            if match_score > 0.3:  # Minimum threshold
                connection = CommunityConnection(
                    connection_id=community["id"],
                    type=community["type"],
                    name=community["name"],
                    name_ar=community["name_ar"],
                    description=community["description"],
                    description_ar=community["description_ar"],
                    match_score=match_score,
                    common_interests=self._find_common_interests(community, request),
                    activity_history=community.get("recent_activities", []),
                    location=community.get("location"),
                    image_url=community.get("image_url")
                )
                connections.append(connection)
        
        # Sort by match score
        connections.sort(key=lambda x: x.match_score, reverse=True)
        
        return connections[:5]  # Return top 5 connections
    
    def _filter_communities(self, request: CommunityRequest) -> List[Dict[str, Any]]:
        """Filter communities based on request criteria"""
        
        filtered = []
        
        for community in self.mock_communities:
            # Filter by looking_for type
            if request.looking_for:
                if request.looking_for == "groups" and community["type"] != "group":
                    continue
                if request.looking_for == "friends" and community["type"] != "user":
                    continue
                if request.looking_for == "events" and community["type"] != "event":
                    continue
            
            # Filter by location preference
            if request.location_preference:
                community_location = community.get("location", "").lower()
                if request.location_preference.lower() not in community_location:
                    continue
            
            # Filter by social preferences
            if request.social_preferences:
                if not self._matches_social_preferences(community, request.social_preferences):
                    continue
            
            filtered.append(community)
        
        return filtered
    
    def _matches_social_preferences(self, community: Dict[str, Any], preferences: SocialPreferences) -> bool:
        """Check if community matches social preferences"""
        
        # Check interests overlap
        if preferences.interests:
            community_interests = community.get("interests", [])
            if not any(interest in community_interests for interest in preferences.interests):
                return False
        
        # Check group size preference
        if preferences.group_size_preference:
            community_size = community.get("size_category", "medium")
            if preferences.group_size_preference != community_size:
                return False
        
        # Check interaction style
        if preferences.interaction_style:
            community_style = community.get("interaction_style", "casual")
            if preferences.interaction_style != community_style:
                return False
        
        return True
    
    def _calculate_community_match_score(self, community: Dict[str, Any], request: CommunityRequest) -> float:
        """Calculate match score for community recommendation"""
        
        score = 0.3  # Base score
        
        # Interest matching
        if request.social_preferences and request.social_preferences.interests:
            user_interests = set(request.social_preferences.interests)
            community_interests = set(community.get("interests", []))
            
            overlap = len(user_interests & community_interests)
            total_interests = len(user_interests | community_interests)
            
            if total_interests > 0:
                interest_score = overlap / total_interests
                score += interest_score * 0.4
        
        # Activity level matching
        community_activity_level = community.get("activity_level", "medium")
        user_activity_level = request.user_context.get("activity_level", "medium") if request.user_context else "medium"
        
        if community_activity_level == user_activity_level:
            score += 0.2
        
        # Location proximity
        if request.location_preference:
            community_location = community.get("location", "").lower()
            if request.location_preference.lower() in community_location:
                score += 0.15
        
        # Community rating
        rating = community.get("rating", 3.0)
        if rating >= 4.5:
            score += 0.15
        elif rating >= 4.0:
            score += 0.1
        
        # Active community bonus
        if community.get("active", True) and community.get("member_count", 0) > 10:
            score += 0.1
        
        return min(1.0, score)
    
    def _find_common_interests(self, community: Dict[str, Any], request: CommunityRequest) -> List[str]:
        """Find common interests between user and community"""
        
        if not request.social_preferences or not request.social_preferences.interests:
            return []
        
        user_interests = set(request.social_preferences.interests)
        community_interests = set(community.get("interests", []))
        
        return list(user_interests & community_interests)
    
    async def _generate_events(self, request: CommunityRequest) -> List[CommunityEvent]:
        """Generate community event recommendations"""
        
        events = []
        
        # Filter events based on request
        relevant_events = self._filter_events(request)
        
        for event in relevant_events:
            community_event = CommunityEvent(
                event_id=event["id"],
                title=event["title"],
                title_ar=event["title_ar"],
                description=event["description"],
                description_ar=event["description_ar"],
                organizer=event["organizer"],
                date=event["date"],
                location=event["location"],
                participants_count=event["participants_count"],
                max_participants=event["max_participants"],
                category=event["category"],
                is_free=event["is_free"],
                price_sar=event.get("price_sar")
            )
            events.append(community_event)
        
        # Sort by date (upcoming first)
        events.sort(key=lambda x: x.date)
        
        return events[:4]  # Return top 4 events
    
    def _filter_events(self, request: CommunityRequest) -> List[Dict[str, Any]]:
        """Filter events based on request criteria"""
        
        filtered = []
        current_date = datetime.now().date()
        
        for event in self.mock_events:
            # Only show future events
            event_date = datetime.fromisoformat(event["date"]).date()
            if event_date < current_date:
                continue
            
            # Filter by event type
            if request.event_type and event.get("category") != request.event_type:
                continue
            
            # Filter by location
            if request.location_preference:
                event_location = event.get("location", "").lower()
                if request.location_preference.lower() not in event_location:
                    continue
            
            # Check if event has space
            if event["participants_count"] >= event["max_participants"]:
                continue
            
            filtered.append(event)
        
        return filtered
    
    async def _get_community_insights(self, request: CommunityRequest) -> Dict[str, Any]:
        """Generate community insights and suggestions"""
        
        insights = {
            "community_action": request.community_action,
            "active_communities": len(self.mock_communities),
            "upcoming_events": len([e for e in self.mock_events if datetime.fromisoformat(e["date"]).date() >= datetime.now().date()]),
            "suggested_actions": [],
            "group_suggestions": [],
            "trending_topics": []
        }
        
        # Suggested actions based on community action
        if request.community_action == "connect":
            insights["suggested_actions"] = [
                "Join interest-based groups" if request.language == "en" else "انضم لمجموعات الاهتمام",
                "Attend community events" if request.language == "en" else "احضر الفعاليات المجتمعية",
                "Start conversations" if request.language == "en" else "ابدأ محادثات"
            ]
        elif request.community_action == "organize":
            insights["suggested_actions"] = [
                "Create event proposal" if request.language == "en" else "أنشئ مقترح فعالية",
                "Invite community members" if request.language == "en" else "ادع أعضاء المجتمع",
                "Set event details" if request.language == "en" else "حدد تفاصيل الفعالية"
            ]
        else:
            insights["suggested_actions"] = [
                "Explore communities" if request.language == "en" else "استكشف المجتمعات",
                "Join discussions" if request.language == "en" else "شارك في النقاشات",
                "Attend events" if request.language == "en" else "احضر الفعاليات"
            ]
        
        # Group suggestions based on user context
        if request.user_context and "interests" in request.user_context:
            user_interests = request.user_context["interests"]
            relevant_groups = [
                group for group in self.mock_communities
                if group["type"] == "group" and any(interest in group.get("interests", []) for interest in user_interests)
            ]
            
            insights["group_suggestions"] = [
                group["name_ar"] if request.language == "ar" else group["name"]
                for group in relevant_groups[:3]
            ]
        
        # Trending topics (mock data)
        trending_topics = {
            "ar": ["التخييم الصحراوي", "الأنشطة التراثية", "الرياضات الجماعية"],
            "en": ["Desert camping", "Heritage activities", "Group sports"]
        }
        insights["trending_topics"] = trending_topics.get(request.language, trending_topics["en"])
        
        return insights
    
    async def _get_template_community_response(self, request: CommunityRequest) -> str:
        """Get template response for community requests"""
        
        templates = {
            "ar": {
                "connect": "أهلاً بك في مجتمع LUDUS! سأساعدك في الاتصال بأشخاص رائعين يشاركونك اهتماماتك. دعني أجد لك أفضل المجموعات والأصدقاء.",
                "organize": "رائع أنك تريد تنظيم فعالية مجتمعية! سأساعدك في التخطيط وإيجاد المشاركين المناسبين.",
                "join": "سأساعدك في العثور على المجموعات والفعاليات المناسبة لك. دعني أبحث عن أفضل الخيارات المتاحة.",
                "general": "مرحباً! أنا هنا لمساعدتك في التواصل مع مجتمع LUDUS النشط. ما نوع التفاعل المجتمعي الذي تبحث عنه؟"
            },
            "en": {
                "connect": "Welcome to the LUDUS community! I'll help you connect with amazing people who share your interests. Let me find the best groups and friends for you.",
                "organize": "Great that you want to organize a community event! I'll help you plan and find suitable participants.",
                "join": "I'll help you find the right groups and events for you. Let me search for the best available options.",
                "general": "Hello! I'm here to help you connect with the active LUDUS community. What type of community interaction are you looking for?"
            }
        }
        
        action = request.community_action or "general"
        language_templates = templates.get(request.language, templates["en"])
        
        return language_templates.get(action, language_templates["general"])
    
    async def _create_cached_community_response(self, cached_response: str, request: CommunityRequest, start_time: float) -> CommunityResponse:
        """Create community response from cached data"""
        
        processing_time = (time.time() - start_time) * 1000
        
        # Generate fresh connections and events (don't cache these as they should be dynamic)
        connections = await self._generate_connections(request)
        events = await self._generate_events(request)
        insights = await self._get_community_insights(request)
        
        return CommunityResponse(
            reply=cached_response,
            confidence_score=0.8,
            processing_time_ms=processing_time,
            agent_type=self.agent_type,
            language=request.language,
            suggested_actions=insights.get("suggested_actions", []),
            requires_followup=len(connections) > 0 or len(events) > 0,
            connections=connections,
            events=events,
            community_insights=insights,
            group_suggestions=insights.get("group_suggestions", [])
        )
    
    def _load_mock_communities(self) -> List[Dict[str, Any]]:
        """Load mock community data"""
        
        return [
            {
                "id": "riyadh_hikers",
                "type": "group",
                "name": "Riyadh Hiking Group",
                "name_ar": "مجموعة المشي في الرياض",
                "description": "Active hiking community in Riyadh area",
                "description_ar": "مجتمع نشط لمحبي المشي في منطقة الرياض",
                "interests": ["hiking", "outdoor", "fitness", "nature"],
                "location": "Riyadh",
                "member_count": 156,
                "activity_level": "high",
                "size_category": "large",
                "interaction_style": "active",
                "rating": 4.6,
                "active": True,
                "recent_activities": ["Edge of World hike", "Wadi Hanifa walk"]
            },
            {
                "id": "jeddah_foodies",
                "type": "group", 
                "name": "Jeddah Food Explorers",
                "name_ar": "مستكشفو الطعام في جدة",
                "description": "Food lovers exploring Saudi cuisine",
                "description_ar": "محبو الطعام الذين يستكشفون المأكولات السعودية",
                "interests": ["food", "cultural", "social", "restaurants"],
                "location": "Jeddah",
                "member_count": 89,
                "activity_level": "medium",
                "size_category": "medium",
                "interaction_style": "casual",
                "rating": 4.4,
                "active": True,
                "recent_activities": ["Traditional Saudi cooking class", "Al-Balad food tour"]
            },
            {
                "id": "tech_professionals_ksa",
                "type": "group",
                "name": "Tech Professionals KSA",
                "name_ar": "المهنيين التقنيين في السعودية",
                "description": "Technology professionals networking group",
                "description_ar": "مجموعة شبكات المهنيين التقنيين",
                "interests": ["technology", "professional", "networking", "innovation"],
                "location": "Multiple cities",
                "member_count": 234,
                "activity_level": "medium",
                "size_category": "large",
                "interaction_style": "structured",
                "rating": 4.7,
                "active": True,
                "recent_activities": ["AI meetup", "Startup pitch night"]
            },
            {
                "id": "family_activities_riyadh",
                "type": "group",
                "name": "Family Activities Riyadh",
                "name_ar": "الأنشطة العائلية في الرياض",
                "description": "Family-friendly activities and events",
                "description_ar": "أنشطة وفعاليات مناسبة للعائلات",
                "interests": ["family", "kids", "entertainment", "cultural"],
                "location": "Riyadh",
                "member_count": 312,
                "activity_level": "medium",
                "size_category": "large", 
                "interaction_style": "casual",
                "rating": 4.5,
                "active": True,
                "recent_activities": ["Family desert camp", "Kids cultural festival"]
            }
        ]
    
    def _load_mock_events(self) -> List[Dict[str, Any]]:
        """Load mock community events"""
        
        return [
            {
                "id": "hiking_weekend",
                "title": "Weekend Hiking Adventure",
                "title_ar": "مغامرة المشي نهاية الأسبوع",
                "description": "Group hiking trip to scenic locations",
                "description_ar": "رحلة مشي جماعية إلى مواقع خلابة",
                "organizer": "Riyadh Hiking Group",
                "date": "2025-10-05T07:00:00",
                "location": "Edge of the World",
                "participants_count": 12,
                "max_participants": 25,
                "category": "outdoor",
                "is_free": False,
                "price_sar": 120.0
            },
            {
                "id": "tech_meetup",
                "title": "AI & Technology Meetup",
                "title_ar": "لقاء الذكاء الاصطناعي والتكنولوجيا",
                "description": "Discussion about latest AI trends",
                "description_ar": "نقاش حول أحدث اتجاهات الذكاء الاصطناعي",
                "organizer": "Tech Professionals KSA",
                "date": "2025-09-30T19:00:00",
                "location": "Riyadh Business District",
                "participants_count": 45,
                "max_participants": 100,
                "category": "professional",
                "is_free": True,
                "price_sar": None
            },
            {
                "id": "cultural_festival",
                "title": "Saudi Heritage Festival",
                "title_ar": "مهرجان التراث السعودي",
                "description": "Celebrating Saudi culture and traditions",
                "description_ar": "احتفال بالثقافة والتقاليد السعودية",
                "organizer": "Cultural Community Jeddah",
                "date": "2025-10-12T16:00:00",
                "location": "Jeddah Historic District",
                "participants_count": 78,
                "max_participants": 200,
                "category": "cultural",
                "is_free": False,
                "price_sar": 50.0
            }
        ]