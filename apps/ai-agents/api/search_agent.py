"""
LUDUS Activity Search Agent - Specialized agent for finding and recommending activities
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from pydantic import BaseModel


class SearchRequest(BaseModel):
    """Model for search requests"""
    query: str
    location: Optional[str] = None
    date: Optional[str] = None
    price_range: Optional[Tuple[float, float]] = None
    activity_type: Optional[str] = None
    participants: Optional[int] = None
    user_preferences: Optional[Dict[str, Any]] = None


class SearchResponse(BaseModel):
    """Model for search responses"""
    results: List[Dict[str, Any]]
    total_count: int
    search_query: str
    filters_applied: Dict[str, Any]
    recommendations: List[str]


class SearchAgent:
    """Specialized agent for handling activity search and recommendations"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.search_history_key = "agents:search_history"
        
        # Activity categories and types
        self.activity_categories = {
            "adventure": {
                "ar": "مغامرات",
                "keywords": ["تسلق", "مغامرة", "مخيم", "رحلات", "climbing", "adventure", "camping", "hiking"]
            },
            "water": {
                "ar": "أنشطة مائية",
                "keywords": ["بحر", "سباحة", "غوص", "صيد", "water", "swimming", "diving", "fishing"]
            },
            "cultural": {
                "ar": "ثقافية",
                "keywords": ["متحف", "تراث", "تاريخ", "فن", "museum", "heritage", "history", "art"]
            },
            "sports": {
                "ar": "رياضية",
                "keywords": ["رياضة", "كرة", "جري", "دراجة", "sports", "football", "running", "cycling"]
            },
            "food": {
                "ar": "طعام وشراب",
                "keywords": ["طبخ", "طعام", "مطعم", "تذوق", "cooking", "food", "restaurant", "tasting"]
            },
            "entertainment": {
                "ar": "ترفيهية",
                "keywords": ["ترفيه", "ألعاب", "سينما", "مسرح", "entertainment", "games", "cinema", "theater"]
            }
        }
    
    def _save_search_history(self, user_id: str, search_query: str, results_count: int, language: str = "ar"):
        """Save search history for analytics"""
        if not self.redis_client:
            return
            
        try:
            search_record = {
                "user_id": user_id,
                "query": search_query,
                "results_count": results_count,
                "timestamp": datetime.now().isoformat(),
                "language": language
            }
            
            # Add to search history list
            history_key = f"{self.search_history_key}:{user_id}"
            history_data = self.redis_client.get(history_key)
            if history_data:
                history = json.loads(history_data)
            else:
                history = []
            
            history.append(search_record)
            # Keep only last 50 searches
            history = history[-50:]
            
            self.redis_client.setex(history_key, 60 * 60 * 24 * 30, json.dumps(history))
        except Exception:
            pass
    
    def search_activities(self, search_request: SearchRequest, user_id: str = "anonymous", language: str = "ar") -> SearchResponse:
        """Search for activities based on criteria"""
        try:
            # Get all activities (mock data)
            all_activities = self._get_all_activities()
            
            # Apply filters
            filtered_activities = self._apply_filters(all_activities, search_request)
            
            # Sort by relevance
            sorted_activities = self._sort_by_relevance(filtered_activities, search_request.query, language)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(search_request, language)
            
            # Save search history
            self._save_search_history(user_id, search_request.query, len(sorted_activities), language)
            
            return SearchResponse(
                results=sorted_activities[:10],  # Limit to top 10 results
                total_count=len(sorted_activities),
                search_query=search_request.query,
                filters_applied=self._get_applied_filters(search_request),
                recommendations=recommendations
            )
            
        except Exception as e:
            # Return empty results on error
            return SearchResponse(
                results=[],
                total_count=0,
                search_query=search_request.query,
                filters_applied={},
                recommendations=[]
            )
    
    def _get_all_activities(self) -> List[Dict[str, Any]]:
        """Get all available activities (mock data)"""
        return [
            {
                "id": "ACT001",
                "name": "تسلق جبل الفهدة",
                "name_en": "Mount Fahda Climbing",
                "description": "مغامرة تسلق جبل الفهدة مع دليل محترف",
                "description_en": "Mount Fahda climbing adventure with professional guide",
                "category": "adventure",
                "location": "الرياض",
                "location_en": "Riyadh",
                "price": 120.0,
                "duration": "6 hours",
                "rating": 4.8,
                "max_participants": 8,
                "available_dates": ["2024-01-15", "2024-01-20", "2024-01-25"],
                "images": ["mountain1.jpg", "mountain2.jpg"],
                "vendor": "VENDOR001"
            },
            {
                "id": "ACT002",
                "name": "رحلة بحرية في البحر الأحمر",
                "name_en": "Red Sea Boat Trip",
                "description": "رحلة بحرية ممتعة مع أنشطة صيد وغوص",
                "description_en": "Fun boat trip with fishing and diving activities",
                "category": "water",
                "location": "جدة",
                "location_en": "Jeddah",
                "price": 200.0,
                "duration": "8 hours",
                "rating": 4.6,
                "max_participants": 15,
                "available_dates": ["2024-01-18", "2024-01-22", "2024-01-28"],
                "images": ["boat1.jpg", "boat2.jpg"],
                "vendor": "VENDOR002"
            },
            {
                "id": "ACT003",
                "name": "ورشة طبخ المأكولات السعودية",
                "name_en": "Saudi Cuisine Cooking Workshop",
                "description": "تعلم طبخ الأطباق السعودية التقليدية",
                "description_en": "Learn to cook traditional Saudi dishes",
                "category": "food",
                "location": "الدمام",
                "location_en": "Dammam",
                "price": 80.0,
                "duration": "3 hours",
                "rating": 4.9,
                "max_participants": 12,
                "available_dates": ["2024-01-16", "2024-01-19", "2024-01-23"],
                "images": ["cooking1.jpg", "cooking2.jpg"],
                "vendor": "VENDOR003"
            },
            {
                "id": "ACT004",
                "name": "جولة في متحف الرياض الوطني",
                "name_en": "Riyadh National Museum Tour",
                "description": "جولة ثقافية في متحف الرياض الوطني",
                "description_en": "Cultural tour of Riyadh National Museum",
                "category": "cultural",
                "location": "الرياض",
                "location_en": "Riyadh",
                "price": 25.0,
                "duration": "2 hours",
                "rating": 4.5,
                "max_participants": 20,
                "available_dates": ["2024-01-17", "2024-01-21", "2024-01-24"],
                "images": ["museum1.jpg", "museum2.jpg"],
                "vendor": "VENDOR004"
            },
            {
                "id": "ACT005",
                "name": "مباراة كرة قدم مع الأصدقاء",
                "name_en": "Football Match with Friends",
                "description": "مباراة كرة قدم ممتعة مع الأصدقاء",
                "description_en": "Fun football match with friends",
                "category": "sports",
                "location": "الرياض",
                "location_en": "Riyadh",
                "price": 50.0,
                "duration": "2 hours",
                "rating": 4.7,
                "max_participants": 22,
                "available_dates": ["2024-01-19", "2024-01-26", "2024-01-30"],
                "images": ["football1.jpg", "football2.jpg"],
                "vendor": "VENDOR005"
            }
        ]
    
    def _apply_filters(self, activities: List[Dict[str, Any]], search_request: SearchRequest) -> List[Dict[str, Any]]:
        """Apply search filters to activities"""
        filtered = activities.copy()
        
        # Location filter
        if search_request.location:
            location_lower = search_request.location.lower()
            filtered = [a for a in filtered if 
                       location_lower in a["location"].lower() or 
                       location_lower in a["location_en"].lower()]
        
        # Price range filter
        if search_request.price_range:
            min_price, max_price = search_request.price_range
            filtered = [a for a in filtered if min_price <= a["price"] <= max_price]
        
        # Activity type filter
        if search_request.activity_type:
            filtered = [a for a in filtered if a["category"] == search_request.activity_type]
        
        # Participants filter
        if search_request.participants:
            filtered = [a for a in filtered if a["max_participants"] >= search_request.participants]
        
        # Date filter
        if search_request.date:
            filtered = [a for a in filtered if search_request.date in a["available_dates"]]
        
        return filtered
    
    def _sort_by_relevance(self, activities: List[Dict[str, Any]], query: str, language: str = "ar") -> List[Dict[str, Any]]:
        """Sort activities by relevance to search query"""
        query_lower = query.lower()
        
        def relevance_score(activity):
            score = 0
            
            # Name match
            if language.startswith("ar"):
                if query_lower in activity["name"].lower():
                    score += 10
                if query_lower in activity["description"].lower():
                    score += 5
            else:
                if query_lower in activity["name_en"].lower():
                    score += 10
                if query_lower in activity["description_en"].lower():
                    score += 5
            
            # Category match
            for category, data in self.activity_categories.items():
                if category == activity["category"]:
                    for keyword in data["keywords"]:
                        if keyword.lower() in query_lower:
                            score += 3
                            break
            
            # Rating bonus
            score += activity["rating"] * 0.5
            
            return score
        
        return sorted(activities, key=relevance_score, reverse=True)
    
    def _generate_recommendations(self, search_request: SearchRequest, language: str = "ar") -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        if language.startswith("ar"):
            if search_request.activity_type == "adventure":
                recommendations.append("جرب أيضاً: رحلات التخييم الليلي")
                recommendations.append("مقترح: أنشطة التسلق الداخلي")
            elif search_request.activity_type == "water":
                recommendations.append("جرب أيضاً: أنشطة الغوص الليلي")
                recommendations.append("مقترح: رحلات صيد الأسماك")
            elif search_request.activity_type == "food":
                recommendations.append("جرب أيضاً: جولات تذوق الطعام")
                recommendations.append("مقترح: ورش صناعة الحلويات")
            else:
                recommendations.append("جرب أيضاً: أنشطة المغامرات")
                recommendations.append("مقترح: الأنشطة الثقافية")
        else:
            if search_request.activity_type == "adventure":
                recommendations.append("Also try: Night camping trips")
                recommendations.append("Suggested: Indoor climbing activities")
            elif search_request.activity_type == "water":
                recommendations.append("Also try: Night diving activities")
                recommendations.append("Suggested: Fishing trips")
            elif search_request.activity_type == "food":
                recommendations.append("Also try: Food tasting tours")
                recommendations.append("Suggested: Dessert making workshops")
            else:
                recommendations.append("Also try: Adventure activities")
                recommendations.append("Suggested: Cultural activities")
        
        return recommendations
    
    def _get_applied_filters(self, search_request: SearchRequest) -> Dict[str, Any]:
        """Get list of applied filters"""
        filters = {}
        
        if search_request.location:
            filters["location"] = search_request.location
        if search_request.price_range:
            filters["price_range"] = search_request.price_range
        if search_request.activity_type:
            filters["activity_type"] = search_request.activity_type
        if search_request.participants:
            filters["participants"] = search_request.participants
        if search_request.date:
            filters["date"] = search_request.date
        
        return filters
    
    def get_activity_categories(self, language: str = "ar") -> Dict[str, str]:
        """Get available activity categories"""
        if language.startswith("ar"):
            return {k: v["ar"] for k, v in self.activity_categories.items()}
        else:
            return {k: k.title() for k in self.activity_categories.keys()}
    
    def process_search_inquiry(self, message: str, user_id: str = "anonymous", language: str = "ar") -> str:
        """Process search-related inquiries"""
        message_lower = message.lower()
        
        # Check for search keywords
        if any(keyword in message_lower for keyword in ["ابحث", "search", "find", "أريد", "i want"]):
            if language.startswith("ar"):
                return """للبحث عن الأنشطة، يمكنك استخدام:

• "ابحث عن أنشطة في الرياض"
• "أريد أنشطة مغامرات"
• "أنشطة بسعر أقل من 100 ريال"
• "أنشطة لـ 5 أشخاص"

أو اذكر نوع النشاط الذي تبحث عنه!"""
            else:
                return """To search for activities, you can use:

• "Search for activities in Riyadh"
• "I want adventure activities"
• "Activities under 100 SAR"
• "Activities for 5 people"

Or mention the type of activity you're looking for!"""
        
        # Check for category keywords
        elif any(keyword in message_lower for keyword in ["أنواع", "categories", "types"]):
            categories = self.get_activity_categories(language)
            if language.startswith("ar"):
                category_list = "\n".join([f"• {name}" for name in categories.values()])
                return f"أنواع الأنشطة المتاحة:\n{category_list}"
            else:
                category_list = "\n".join([f"• {name}" for name in categories.values()])
                return f"Available activity categories:\n{category_list}"
        
        # Check for popular activities
        elif any(keyword in message_lower for keyword in ["شائع", "popular", "الأكثر", "most"]):
            if language.startswith("ar"):
                return """الأنشطة الأكثر شعبية:

• تسلق جبل الفهدة (4.8 ⭐)
• رحلة بحرية في البحر الأحمر (4.6 ⭐)
• ورشة طبخ المأكولات السعودية (4.9 ⭐)
• جولة في متحف الرياض الوطني (4.5 ⭐)
• مباراة كرة قدم (4.7 ⭐)"""
            else:
                return """Most popular activities:

• Mount Fahda Climbing (4.8 ⭐)
• Red Sea Boat Trip (4.6 ⭐)
• Saudi Cuisine Cooking Workshop (4.9 ⭐)
• Riyadh National Museum Tour (4.5 ⭐)
• Football Match (4.7 ⭐)"""
        
        # Default response
        else:
            if language.startswith("ar"):
                return """أنا وكيل البحث عن الأنشطة في LUDUS. يمكنني مساعدتك في:

• البحث عن الأنشطة المناسبة
• تصفية النتائج حسب الموقع والسعر
• اقتراح أنشطة جديدة
• عرض الأنشطة الأكثر شعبية

ما نوع النشاط الذي تبحث عنه؟"""
            else:
                return """I'm the activity search agent for LUDUS. I can help you with:

• Finding suitable activities
• Filtering results by location and price
• Suggesting new activities
• Showing most popular activities

What type of activity are you looking for?"""
