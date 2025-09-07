"""
LUDUS Booking Agent - Specialized agent for managing bookings and reservations
"""

import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pydantic import BaseModel


class BookingRequest(BaseModel):
    """Model for booking requests"""
    activity_id: str
    user_id: str
    date: str
    time: str
    participants: int
    special_requests: Optional[str] = None
    contact_info: Dict[str, str]


class BookingResponse(BaseModel):
    """Model for booking responses"""
    booking_id: str
    status: str
    message: str
    confirmation_code: str
    total_amount: float
    payment_required: bool


class BookingAgent:
    """Specialized agent for handling booking operations"""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.booking_statuses = {
            "pending": "قيد الانتظار",
            "confirmed": "مؤكد",
            "cancelled": "ملغي",
            "completed": "مكتمل"
        }
    
    def _get_booking_key(self, booking_id: str) -> str:
        """Get Redis key for booking data"""
        return f"agents:booking:{booking_id}"
    
    def _get_user_bookings_key(self, user_id: str) -> str:
        """Get Redis key for user's bookings"""
        return f"agents:user_bookings:{user_id}"
    
    def create_booking(self, booking_data: BookingRequest, language: str = "ar") -> BookingResponse:
        """Create a new booking"""
        try:
            booking_id = str(uuid.uuid4())
            confirmation_code = f"LUD{booking_id[:8].upper()}"
            
            # Calculate pricing (mock implementation)
            base_price = 50.0  # Base price per person
            total_amount = base_price * booking_data.participants
            
            booking_record = {
                "booking_id": booking_id,
                "activity_id": booking_data.activity_id,
                "user_id": booking_data.user_id,
                "date": booking_data.date,
                "time": booking_data.time,
                "participants": booking_data.participants,
                "special_requests": booking_data.special_requests,
                "contact_info": booking_data.contact_info,
                "status": "pending",
                "confirmation_code": confirmation_code,
                "total_amount": total_amount,
                "created_at": datetime.now().isoformat(),
                "language": language
            }
            
            # Save booking to Redis
            if self.redis_client:
                self.redis_client.setex(
                    self._get_booking_key(booking_id),
                    60 * 60 * 24 * 30,  # 30 days
                    json.dumps(booking_record)
                )
                
                # Add to user's booking list
                user_bookings = self.get_user_bookings(booking_data.user_id)
                user_bookings.append(booking_id)
                self.redis_client.setex(
                    self._get_user_bookings_key(booking_data.user_id),
                    60 * 60 * 24 * 30,
                    json.dumps(user_bookings)
                )
            
            # Generate response message
            if language.startswith("ar"):
                message = f"""تم إنشاء حجزك بنجاح! 🎉

رقم الحجز: {confirmation_code}
التاريخ: {booking_data.date}
الوقت: {booking_data.time}
عدد المشاركين: {booking_data.participants}
المبلغ الإجمالي: {total_amount:.2f} ريال

يرجى إتمام الدفع لتأكيد الحجز."""
            else:
                message = f"""Your booking has been created successfully! 🎉

Booking ID: {confirmation_code}
Date: {booking_data.date}
Time: {booking_data.time}
Participants: {booking_data.participants}
Total Amount: {total_amount:.2f} SAR

Please complete payment to confirm your booking."""
            
            return BookingResponse(
                booking_id=booking_id,
                status="pending",
                message=message,
                confirmation_code=confirmation_code,
                total_amount=total_amount,
                payment_required=True
            )
            
        except Exception as e:
            error_msg = f"خطأ في إنشاء الحجز: {str(e)}" if language.startswith("ar") else f"Error creating booking: {str(e)}"
            return BookingResponse(
                booking_id="",
                status="error",
                message=error_msg,
                confirmation_code="",
                total_amount=0.0,
                payment_required=False
            )
    
    def get_booking(self, booking_id: str) -> Optional[Dict[str, Any]]:
        """Get booking details by ID"""
        if not self.redis_client:
            return None
            
        try:
            data = self.redis_client.get(self._get_booking_key(booking_id))
            if data:
                return json.loads(data)
        except Exception:
            pass
        return None
    
    def get_user_bookings(self, user_id: str) -> List[str]:
        """Get list of booking IDs for a user"""
        if not self.redis_client:
            return []
            
        try:
            data = self.redis_client.get(self._get_user_bookings_key(user_id))
            if data:
                return json.loads(data)
        except Exception:
            pass
        return []
    
    def update_booking_status(self, booking_id: str, status: str, language: str = "ar") -> Dict[str, Any]:
        """Update booking status"""
        booking = self.get_booking(booking_id)
        if not booking:
            error_msg = "الحجز غير موجود" if language.startswith("ar") else "Booking not found"
            return {"success": False, "message": error_msg}
        
        booking["status"] = status
        booking["updated_at"] = datetime.now().isoformat()
        
        if self.redis_client:
            self.redis_client.setex(
                self._get_booking_key(booking_id),
                60 * 60 * 24 * 30,
                json.dumps(booking)
            )
        
        status_text = self.booking_statuses.get(status, status)
        success_msg = f"تم تحديث حالة الحجز إلى: {status_text}" if language.startswith("ar") else f"Booking status updated to: {status_text}"
        
        return {"success": True, "message": success_msg, "booking": booking}
    
    def cancel_booking(self, booking_id: str, language: str = "ar") -> Dict[str, Any]:
        """Cancel a booking"""
        return self.update_booking_status(booking_id, "cancelled", language)
    
    def confirm_booking(self, booking_id: str, language: str = "ar") -> Dict[str, Any]:
        """Confirm a booking"""
        return self.update_booking_status(booking_id, "confirmed", language)
    
    def get_booking_summary(self, user_id: str, language: str = "ar") -> str:
        """Get summary of user's bookings"""
        booking_ids = self.get_user_bookings(user_id)
        
        if not booking_ids:
            return "لا توجد حجوزات" if language.startswith("ar") else "No bookings found"
        
        summary_lines = []
        if language.startswith("ar"):
            summary_lines.append(f"إجمالي الحجوزات: {len(booking_ids)}")
        else:
            summary_lines.append(f"Total bookings: {len(booking_ids)}")
        
        # Get details for recent bookings (last 5)
        recent_bookings = booking_ids[-5:]
        for booking_id in recent_bookings:
            booking = self.get_booking(booking_id)
            if booking:
                status_text = self.booking_statuses.get(booking["status"], booking["status"])
                if language.startswith("ar"):
                    summary_lines.append(f"• {booking['confirmation_code']} - {booking['date']} - {status_text}")
                else:
                    summary_lines.append(f"• {booking['confirmation_code']} - {booking['date']} - {status_text}")
        
        return "\n".join(summary_lines)
    
    def process_booking_inquiry(self, message: str, user_id: str, language: str = "ar") -> str:
        """Process booking-related inquiries"""
        message_lower = message.lower()
        
        # Check for booking creation keywords
        if any(keyword in message_lower for keyword in ["حجز", "book", "reserve", "احجز"]):
            if language.startswith("ar"):
                return """لإنشاء حجز جديد، يرجى توفير المعلومات التالية:

1. معرف النشاط
2. التاريخ المطلوب
3. الوقت المطلوب
4. عدد المشاركين
5. معلومات الاتصال

مثال: "أريد حجز نشاط ID123 في 2024-01-15 الساعة 14:00 لـ 3 أشخاص" """
            else:
                return """To create a new booking, please provide the following information:

1. Activity ID
2. Desired date
3. Desired time
4. Number of participants
5. Contact information

Example: "I want to book activity ID123 on 2024-01-15 at 14:00 for 3 people" """
        
        # Check for booking status keywords
        elif any(keyword in message_lower for keyword in ["حالة", "status", "متى", "when"]):
            return self.get_booking_summary(user_id, language)
        
        # Check for cancellation keywords
        elif any(keyword in message_lower for keyword in ["إلغاء", "cancel", "الغاء"]):
            if language.startswith("ar"):
                return """لإلغاء حجز، يرجى توفير رقم الحجز أو كود التأكيد.

مثال: "أريد إلغاء الحجز LUD12345678" """
            else:
                return """To cancel a booking, please provide the booking ID or confirmation code.

Example: "I want to cancel booking LUD12345678" """
        
        # Default response
        else:
            if language.startswith("ar"):
                return """أنا وكيل الحجوزات في LUDUS. يمكنني مساعدتك في:

• إنشاء حجوزات جديدة
• التحقق من حالة الحجوزات
• إلغاء الحجوزات
• تعديل تفاصيل الحجز

كيف يمكنني مساعدتك اليوم؟"""
            else:
                return """I'm the booking agent for LUDUS. I can help you with:

• Creating new bookings
• Checking booking status
• Cancelling bookings
• Modifying booking details

How can I help you today?"""


# Mock activity data for testing
MOCK_ACTIVITIES = {
    "ACT001": {
        "name": "تسلق الجبال",
        "name_en": "Mountain Climbing",
        "price": 50.0,
        "duration": "4 hours",
        "location": "الرياض",
        "location_en": "Riyadh"
    },
    "ACT002": {
        "name": "رحلة بحرية",
        "name_en": "Boat Trip",
        "price": 75.0,
        "duration": "6 hours",
        "location": "جدة",
        "location_en": "Jeddah"
    },
    "ACT003": {
        "name": "ورشة طبخ",
        "name_en": "Cooking Workshop",
        "price": 30.0,
        "duration": "2 hours",
        "location": "الدمام",
        "location_en": "Dammam"
    }
}
