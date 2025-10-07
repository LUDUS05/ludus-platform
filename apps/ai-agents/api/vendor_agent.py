"""
LUDUS Vendor Coordination Agent - Specialized agent for managing vendor relationships
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pydantic import BaseModel


class VendorRequest(BaseModel):
    """Model for vendor requests"""
    vendor_id: str
    activity_id: str
    date: str
    time: str
    participants: int
    special_requirements: Optional[str] = None
    contact_person: str
    contact_phone: str


class VendorResponse(BaseModel):
    """Model for vendor responses"""
    request_id: str
    status: str
    message: str
    vendor_confirmation: Optional[str] = None
    estimated_cost: float
    availability_confirmed: bool


class VendorAgent:
    """Specialized agent for handling vendor coordination"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.request_statuses = {
            "pending": "قيد الانتظار",
            "confirmed": "مؤكد",
            "declined": "مرفوض",
            "rescheduled": "مؤجل",
            "completed": "مكتمل"
        }
    
    def _get_vendor_request_key(self, request_id: str) -> str:
        """Get Redis key for vendor request data"""
        return f"agents:vendor_request:{request_id}"
    
    def _get_vendor_requests_key(self, vendor_id: str) -> str:
        """Get Redis key for vendor's requests"""
        return f"agents:vendor_requests:{vendor_id}"
    
    def create_vendor_request(self, request_data: VendorRequest, language: str = "ar") -> VendorResponse:
        """Create a new vendor coordination request"""
        try:
            request_id = str(uuid.uuid4())
            
            # Calculate estimated cost (mock implementation)
            base_cost = 40.0  # Base cost per person
            estimated_cost = base_cost * request_data.participants
            
            request_record = {
                "request_id": request_id,
                "vendor_id": request_data.vendor_id,
                "activity_id": request_data.activity_id,
                "date": request_data.date,
                "time": request_data.time,
                "participants": request_data.participants,
                "special_requirements": request_data.special_requirements,
                "contact_person": request_data.contact_person,
                "contact_phone": request_data.contact_phone,
                "status": "pending",
                "estimated_cost": estimated_cost,
                "created_at": datetime.now().isoformat(),
                "language": language
            }
            
            # Save request to Redis
            if self.redis_client:
                self.redis_client.setex(
                    self._get_vendor_request_key(request_id),
                    60 * 60 * 24 * 30,  # 30 days
                    json.dumps(request_record)
                )
                
                # Add to vendor's request list
                vendor_requests = self.get_vendor_requests(request_data.vendor_id)
                vendor_requests.append(request_id)
                self.redis_client.setex(
                    self._get_vendor_requests_key(request_data.vendor_id),
                    60 * 60 * 24 * 30,
                    json.dumps(vendor_requests)
                )
            
            # Generate response message
            if language.startswith("ar"):
                message = f"""تم إرسال طلب التنسيق إلى المورد بنجاح! 📞

رقم الطلب: {request_id[:8]}
التاريخ: {request_data.date}
الوقت: {request_data.time}
عدد المشاركين: {request_data.participants}
التكلفة المقدرة: {estimated_cost:.2f} ريال

سيتم التواصل مع المورد لتأكيد التوفر."""
            else:
                message = f"""Vendor coordination request sent successfully! 📞

Request ID: {request_id[:8]}
Date: {request_data.date}
Time: {request_data.time}
Participants: {request_data.participants}
Estimated Cost: {estimated_cost:.2f} SAR

We will contact the vendor to confirm availability."""
            
            return VendorResponse(
                request_id=request_id,
                status="pending",
                message=message,
                vendor_confirmation=None,
                estimated_cost=estimated_cost,
                availability_confirmed=False
            )
            
        except Exception as e:
            error_msg = f"خطأ في إرسال طلب التنسيق: {str(e)}" if language.startswith("ar") else f"Error sending coordination request: {str(e)}"
            return VendorResponse(
                request_id="",
                status="error",
                message=error_msg,
                vendor_confirmation=None,
                estimated_cost=0.0,
                availability_confirmed=False
            )
    
    def get_vendor_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        """Get vendor request details by ID"""
        if not self.redis_client:
            return None
            
        try:
            data = self.redis_client.get(self._get_vendor_request_key(request_id))
            if data:
                return json.loads(data)
        except Exception:
            pass
        return None
    
    def get_vendor_requests(self, vendor_id: str) -> List[str]:
        """Get list of request IDs for a vendor"""
        if not self.redis_client:
            return []
            
        try:
            data = self.redis_client.get(self._get_vendor_requests_key(vendor_id))
            if data:
                return json.loads(data)
        except Exception:
            pass
        return []
    
    def update_request_status(self, request_id: str, status: str, vendor_confirmation: str = None, language: str = "ar") -> Dict[str, Any]:
        """Update vendor request status"""
        request = self.get_vendor_request(request_id)
        if not request:
            error_msg = "الطلب غير موجود" if language.startswith("ar") else "Request not found"
            return {"success": False, "message": error_msg}
        
        request["status"] = status
        request["updated_at"] = datetime.now().isoformat()
        if vendor_confirmation:
            request["vendor_confirmation"] = vendor_confirmation
        
        if self.redis_client:
            self.redis_client.setex(
                self._get_vendor_request_key(request_id),
                60 * 60 * 24 * 30,
                json.dumps(request)
            )
        
        status_text = self.request_statuses.get(status, status)
        success_msg = f"تم تحديث حالة الطلب إلى: {status_text}" if language.startswith("ar") else f"Request status updated to: {status_text}"
        
        return {"success": True, "message": success_msg, "request": request}
    
    def confirm_vendor_availability(self, request_id: str, language: str = "ar") -> Dict[str, Any]:
        """Confirm vendor availability"""
        return self.update_request_status(request_id, "confirmed", "Vendor confirmed availability", language)
    
    def decline_vendor_request(self, request_id: str, reason: str, language: str = "ar") -> Dict[str, Any]:
        """Decline vendor request"""
        return self.update_request_status(request_id, "declined", f"Declined: {reason}", language)
    
    def get_vendor_summary(self, vendor_id: str, language: str = "ar") -> str:
        """Get summary of vendor's requests"""
        request_ids = self.get_vendor_requests(vendor_id)
        
        if not request_ids:
            return "لا توجد طلبات" if language.startswith("ar") else "No requests found"
        
        summary_lines = []
        if language.startswith("ar"):
            summary_lines.append(f"إجمالي الطلبات: {len(request_ids)}")
        else:
            summary_lines.append(f"Total requests: {len(request_ids)}")
        
        # Get details for recent requests (last 5)
        recent_requests = request_ids[-5:]
        for request_id in recent_requests:
            request = self.get_vendor_request(request_id)
            if request:
                status_text = self.request_statuses.get(request["status"], request["status"])
                if language.startswith("ar"):
                    summary_lines.append(f"• {request_id[:8]} - {request['date']} - {status_text}")
                else:
                    summary_lines.append(f"• {request_id[:8]} - {request['date']} - {status_text}")
        
        return "\n".join(summary_lines)
    
    def process_vendor_inquiry(self, message: str, vendor_id: str, language: str = "ar") -> str:
        """Process vendor-related inquiries"""
        message_lower = message.lower()
        
        # Check for coordination request keywords
        if any(keyword in message_lower for keyword in ["تنسيق", "coordinate", "coordination", "طلب"]):
            if language.startswith("ar"):
                return """لإنشاء طلب تنسيق مع مورد، يرجى توفير المعلومات التالية:

1. معرف المورد
2. معرف النشاط
3. التاريخ المطلوب
4. الوقت المطلوب
5. عدد المشاركين
6. معلومات الاتصال

مثال: "أريد تنسيق مع المورد VENDOR001 للنشاط ACT001 في 2024-01-15 الساعة 14:00 لـ 3 أشخاص" """
            else:
                return """To create a vendor coordination request, please provide the following information:

1. Vendor ID
2. Activity ID
3. Desired date
4. Desired time
5. Number of participants
6. Contact information

Example: "I want to coordinate with vendor VENDOR001 for activity ACT001 on 2024-01-15 at 14:00 for 3 people" """
        
        # Check for status keywords
        elif any(keyword in message_lower for keyword in ["حالة", "status", "متى", "when"]):
            return self.get_vendor_summary(vendor_id, language)
        
        # Check for confirmation keywords
        elif any(keyword in message_lower for keyword in ["تأكيد", "confirm", "confirmation"]):
            if language.startswith("ar"):
                return """لتأكيد طلب مع مورد، يرجى توفير رقم الطلب.

مثال: "أريد تأكيد الطلب REQ12345678" """
            else:
                return """To confirm a vendor request, please provide the request ID.

Example: "I want to confirm request REQ12345678" """
        
        # Default response
        else:
            if language.startswith("ar"):
                return """أنا وكيل تنسيق الموردين في LUDUS. يمكنني مساعدتك في:

• إنشاء طلبات تنسيق مع الموردين
• التحقق من حالة الطلبات
• تأكيد توفر الموردين
• إدارة العلاقات مع الموردين

كيف يمكنني مساعدتك اليوم؟"""
            else:
                return """I'm the vendor coordination agent for LUDUS. I can help you with:

• Creating vendor coordination requests
• Checking request status
• Confirming vendor availability
• Managing vendor relationships

How can I help you today?"""


# Mock vendor data for testing
MOCK_VENDORS = {
    "VENDOR001": {
        "name": "شركة المغامرات الرياضية",
        "name_en": "Sports Adventure Company",
        "specialties": ["تسلق الجبال", "مغامرات", "رياضات مائية"],
        "specialties_en": ["Mountain Climbing", "Adventures", "Water Sports"],
        "location": "الرياض",
        "location_en": "Riyadh",
        "rating": 4.8,
        "contact": "+966501234567"
    },
    "VENDOR002": {
        "name": "مركز الأنشطة البحرية",
        "name_en": "Marine Activities Center",
        "specialties": ["رحلات بحرية", "صيد", "غوص"],
        "specialties_en": ["Boat Trips", "Fishing", "Diving"],
        "location": "جدة",
        "location_en": "Jeddah",
        "rating": 4.6,
        "contact": "+966507654321"
    },
    "VENDOR003": {
        "name": "أكاديمية الطبخ الإبداعي",
        "name_en": "Creative Cooking Academy",
        "specialties": ["ورش طبخ", "دورات طهي", "تذوق طعام"],
        "specialties_en": ["Cooking Workshops", "Culinary Courses", "Food Tasting"],
        "location": "الدمام",
        "location_en": "Dammam",
        "rating": 4.9,
        "contact": "+966509876543"
    }
}
