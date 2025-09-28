"""
Error Handler for LUDUS Selena AI Service
Comprehensive error handling and response management

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

import logging
import traceback
from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import HTTPException
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standardized error response model"""
    error: str
    error_code: str
    message: str
    message_ar: str
    timestamp: str
    request_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    retry_after: Optional[int] = None


class ErrorHandler:
    """Centralized error handling for the AI service"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Error code mappings
        self.error_codes = {
            "AGENT_UNAVAILABLE": {
                "message": "AI agent is temporarily unavailable",
                "message_ar": "الوكيل الذكي غير متاح مؤقتاً",
                "retry_after": 60
            },
            "INVALID_REQUEST": {
                "message": "Invalid request format or parameters",
                "message_ar": "تنسيق الطلب أو المعاملات غير صالحة",
                "retry_after": None
            },
            "SESSION_EXPIRED": {
                "message": "Session has expired, please start a new conversation",
                "message_ar": "انتهت صلاحية الجلسة، يرجى بدء محادثة جديدة",
                "retry_after": None
            },
            "RATE_LIMIT_EXCEEDED": {
                "message": "Too many requests, please try again later",
                "message_ar": "كثرة الطلبات، يرجى المحاولة مرة أخرى لاحقاً",
                "retry_after": 60
            },
            "OLLAMA_TIMEOUT": {
                "message": "AI model response timeout, please try again",
                "message_ar": "انتهت مهلة استجابة النموذج الذكي، يرجى المحاولة مرة أخرى",
                "retry_after": 30
            },
            "REDIS_CONNECTION": {
                "message": "Session storage temporarily unavailable",
                "message_ar": "تخزين الجلسة غير متاح مؤقتاً",
                "retry_after": 30
            },
            "VALIDATION_ERROR": {
                "message": "Request validation failed",
                "message_ar": "فشل في التحقق من صحة الطلب",
                "retry_after": None
            },
            "INTERNAL_ERROR": {
                "message": "Internal server error, please try again later",
                "message_ar": "خطأ داخلي في الخادم، يرجى المحاولة مرة أخرى لاحقاً",
                "retry_after": 120
            }
        }
        
        self.logger.info("🛡️ Error Handler initialized")
    
    async def handle_chat_error(self, error: Exception, request: Any) -> ErrorResponse:
        """Handle chat-specific errors"""
        
        error_type = type(error).__name__
        error_message = str(error)
        
        # Determine error code and response
        if "timeout" in error_message.lower() or "ollama" in error_message.lower():
            error_code = "OLLAMA_TIMEOUT"
        elif "redis" in error_message.lower() or "connection" in error_message.lower():
            error_code = "REDIS_CONNECTION"
        elif "validation" in error_message.lower():
            error_code = "VALIDATION_ERROR"
        elif "agent not available" in error_message.lower():
            error_code = "AGENT_UNAVAILABLE"
        else:
            error_code = "INTERNAL_ERROR"
        
        return await self._create_error_response(
            error_code=error_code,
            original_error=error,
            context={
                "agent_type": getattr(request, "agent_type", "unknown"),
                "language": getattr(request, "language", "ar"),
                "session_id": getattr(request, "session_id", None)
            }
        )
    
    async def handle_validation_error(self, error: Exception, field: str = "") -> ErrorResponse:
        """Handle Pydantic validation errors"""
        
        return await self._create_error_response(
            error_code="VALIDATION_ERROR",
            original_error=error,
            context={"field": field}
        )
    
    async def handle_rate_limit_error(self, limit: int, window: int, retry_after: int) -> ErrorResponse:
        """Handle rate limiting errors"""
        
        return await self._create_error_response(
            error_code="RATE_LIMIT_EXCEEDED",
            original_error=None,
            context={
                "limit": limit,
                "window": window,
                "retry_after": retry_after
            }
        )
    
    async def handle_agent_error(self, agent_type: str, error: Exception) -> ErrorResponse:
        """Handle agent-specific errors"""
        
        return await self._create_error_response(
            error_code="AGENT_UNAVAILABLE",
            original_error=error,
            context={"agent_type": agent_type}
        )
    
    async def _create_error_response(
        self,
        error_code: str,
        original_error: Optional[Exception] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> ErrorResponse:
        """Create standardized error response"""
        
        # Get error configuration
        error_config = self.error_codes.get(error_code, self.error_codes["INTERNAL_ERROR"])
        
        # Log error details
        if original_error:
            self.logger.error(
                f"❌ Error [{error_code}]: {original_error} | Context: {context}",
                exc_info=True
            )
        
        # Create error response
        error_response = ErrorResponse(
            error=error_code,
            error_code=error_code,
            message=error_config["message"],
            message_ar=error_config["message_ar"],
            timestamp=datetime.utcnow().isoformat(),
            details=context,
            retry_after=error_config.get("retry_after")
        )
        
        return error_response
    
    def get_error_statistics(self) -> Dict[str, Any]:
        """Get error handling statistics"""
        
        # This would typically be stored in Redis for production
        # For now, return basic structure
        
        return {
            "total_errors_handled": 0,
            "error_types": {
                error_code: 0 for error_code in self.error_codes.keys()
            },
            "error_rate_last_hour": 0.0,
            "most_common_errors": [],
            "error_trends": {
                "increasing": [],
                "decreasing": [],
                "stable": []
            }
        }
    
    def create_user_friendly_message(self, error_code: str, language: str = "ar") -> str:
        """Create user-friendly error messages"""
        
        error_config = self.error_codes.get(error_code, self.error_codes["INTERNAL_ERROR"])
        
        if language == "ar":
            base_message = error_config["message_ar"]
            
            # Add helpful context in Arabic
            if error_code == "AGENT_UNAVAILABLE":
                return f"{base_message}. يمكنك المحاولة مرة أخرى خلال دقيقة أو التواصل مع وكيل آخر."
            elif error_code == "RATE_LIMIT_EXCEEDED":
                return f"{base_message}. لقد تجاوزت الحد المسموح من الطلبات. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى."
            elif error_code == "OLLAMA_TIMEOUT":
                return f"{base_message}. النظام يعمل على معالجة طلبات كثيرة. يرجى المحاولة مرة أخرى."
            else:
                return base_message
        else:
            base_message = error_config["message"]
            
            # Add helpful context in English
            if error_code == "AGENT_UNAVAILABLE":
                return f"{base_message}. You can try again in a minute or contact another agent."
            elif error_code == "RATE_LIMIT_EXCEEDED":
                return f"{base_message}. You have exceeded the allowed request limit. Please wait a moment and try again."
            elif error_code == "OLLAMA_TIMEOUT":
                return f"{base_message}. The system is processing many requests. Please try again."
            else:
                return base_message
    
    async def log_error_for_monitoring(
        self,
        error_code: str,
        agent_type: str,
        error_details: str,
        context: Optional[Dict[str, Any]] = None
    ):
        """Log error for monitoring and alerting"""
        
        error_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "error_code": error_code,
            "agent_type": agent_type,
            "error_details": error_details,
            "context": context or {}
        }
        
        # In production, this would be sent to monitoring service
        import json
        self.logger.error(f"📊 Error logged for monitoring: {json.dumps(error_entry)}")
    
    def should_retry(self, error_code: str) -> bool:
        """Determine if the error is retryable"""
        
        retryable_errors = [
            "OLLAMA_TIMEOUT",
            "REDIS_CONNECTION", 
            "AGENT_UNAVAILABLE"
        ]
        
        return error_code in retryable_errors