"""
Base Agent Interface for LUDUS Selena AI Service
Provides common functionality and interface for all Selena agents

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

import asyncio
import logging
import time
import aiohttp
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, validator
from datetime import datetime
import redis


class AgentRequest(BaseModel):
    """Base request model for all agents"""
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: str = Field(...)
    language: str = Field(default="ar", regex="^(ar|en)$")
    user_context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, Any]]] = None
    priority: str = Field(default="normal", regex="^(low|normal|high|urgent)$")
    
    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()


class AgentResponse(BaseModel):
    """Base response model for all agents"""
    reply: str
    confidence_score: float = Field(ge=0.0, le=1.0)
    processing_time_ms: float
    agent_type: str
    language: str
    suggested_actions: Optional[List[str]] = None
    requires_followup: bool = False
    context_updated: bool = False
    metadata: Optional[Dict[str, Any]] = None


class BaseAgent(ABC):
    """
    Abstract base class for all Selena AI agents
    Provides common functionality and enforces interface consistency
    """
    
    def __init__(
        self,
        agent_type: str,
        redis_client: Optional[redis.Redis] = None,
        ollama_host: str = "http://localhost:11434",
        ollama_model: str = "llama3.2"
    ):
        self.agent_type = agent_type
        self.redis_client = redis_client
        self.ollama_host = ollama_host
        self.ollama_model = ollama_model
        self.logger = logging.getLogger(f"selena.{agent_type}")
        
        # Performance tracking
        self.request_count = 0
        self.total_processing_time = 0.0
        self.success_count = 0
        self.error_count = 0
        
        # Agent configuration
        self.max_retries = 3
        self.timeout_seconds = 25
        self.confidence_threshold = 0.7
        
        self.logger.info(f"🤖 {agent_type.title()} Agent initialized")
    
    @abstractmethod
    async def process_request(self, request: AgentRequest) -> AgentResponse:
        """
        Process agent-specific request
        Must be implemented by each specialized agent
        """
        pass
    
    @abstractmethod
    def get_agent_context(self, language: str) -> str:
        """
        Get agent-specific context and instructions
        Must be implemented by each specialized agent
        """
        pass
    
    async def _call_ollama(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> Optional[str]:
        """Make API call to Ollama service"""
        
        try:
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.timeout_seconds)
            ) as session:
                
                payload = {
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "top_p": 0.9,
                        "max_tokens": max_tokens,
                        "stop": ["Human:", "User:"]
                    }
                }
                
                start_time = time.time()
                
                async with session.post(
                    f"{self.ollama_host}/api/generate",
                    json=payload
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        reply = data.get("response", "").strip()
                        
                        # Calculate confidence based on response quality
                        confidence = self._calculate_confidence(reply, time.time() - start_time)
                        
                        self.logger.debug(f"🎯 Ollama response: {len(reply)} chars, confidence: {confidence:.2f}")
                        
                        return reply
                    else:
                        self.logger.error(f"❌ Ollama API error: {response.status}")
                        return None
                        
        except asyncio.TimeoutError:
            self.logger.error(f"⏰ Ollama timeout for {self.agent_type}")
            return None
        except Exception as e:
            self.logger.error(f"❌ Ollama call failed for {self.agent_type}: {e}")
            return None
    
    def _calculate_confidence(self, response: str, processing_time: float) -> float:
        """Calculate confidence score based on response quality and speed"""
        
        if not response or len(response) < 10:
            return 0.3
        
        base_confidence = 0.8
        
        # Adjust for response length (too short or too long reduces confidence)
        length_score = 1.0
        if len(response) < 20:
            length_score = 0.6
        elif len(response) > 800:
            length_score = 0.8
        
        # Adjust for processing time
        time_score = 1.0
        if processing_time > 20:  # > 20 seconds
            time_score = 0.6
        elif processing_time > 10:  # > 10 seconds
            time_score = 0.8
        elif processing_time < 1:  # < 1 second (suspiciously fast)
            time_score = 0.7
        
        # Check for quality indicators
        quality_score = 1.0
        
        # Arabic text quality check
        if any(char in response for char in ['ا', 'ب', 'ت', 'ث']):  # Arabic characters
            # Bonus for proper Arabic
            quality_score = 1.1
        
        # Check for structured responses
        if any(indicator in response for indicator in [':', '-', '•', '1.', '2.']):
            quality_score *= 1.05
        
        # Final confidence calculation
        confidence = base_confidence * length_score * time_score * quality_score
        return min(1.0, max(0.1, confidence))
    
    def _build_prompt(
        self,
        message: str,
        language: str,
        conversation_history: Optional[List[Dict]] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Build comprehensive prompt for Ollama"""
        
        # Get agent-specific context
        system_context = self.get_agent_context(language)
        
        # Build prompt components
        prompt_parts = [system_context]
        
        # Add user context if available
        if user_context:
            context_summary = self._summarize_user_context(user_context, language)
            if context_summary:
                prompt_parts.append(context_summary)
        
        # Add conversation history (last 3 exchanges)
        if conversation_history:
            recent_history = conversation_history[-6:] if len(conversation_history) > 6 else conversation_history
            for entry in recent_history:
                role = entry.get("role", "")
                content = entry.get("content", "")
                if role == "user":
                    prompt_parts.append(f"المستخدم: {content}" if language == "ar" else f"User: {content}")
                elif role == "assistant":
                    prompt_parts.append(f"المساعد: {content}" if language == "ar" else f"Assistant: {content}")
        
        # Add current message
        prompt_parts.append(f"المستخدم: {message}" if language == "ar" else f"User: {message}")
        prompt_parts.append("المساعد:" if language == "ar" else "Assistant:")
        
        return "\n\n".join(prompt_parts)
    
    def _summarize_user_context(self, user_context: Dict[str, Any], language: str) -> Optional[str]:
        """Summarize user context for prompt"""
        
        if not user_context:
            return None
        
        context_items = []
        
        # User preferences
        if "preferences" in user_context:
            prefs = user_context["preferences"]
            if language == "ar":
                context_items.append(f"تفضيلات المستخدم: {', '.join(prefs) if isinstance(prefs, list) else str(prefs)}")
            else:
                context_items.append(f"User preferences: {', '.join(prefs) if isinstance(prefs, list) else str(prefs)}")
        
        # Location
        if "location" in user_context:
            location = user_context["location"]
            if language == "ar":
                context_items.append(f"الموقع: {location}")
            else:
                context_items.append(f"Location: {location}")
        
        # User type/status
        if "user_type" in user_context:
            user_type = user_context["user_type"]
            if language == "ar":
                context_items.append(f"نوع المستخدم: {user_type}")
            else:
                context_items.append(f"User type: {user_type}")
        
        return "\n".join(context_items) if context_items else None
    
    async def get_fallback_response(self, language: str, error_context: str = "") -> str:
        """Generate fallback response when AI service fails"""
        
        fallback_responses = {
            "ar": [
                "أعتذر، أواجه صعوبة في معالجة طلبك الآن. يمكنك المحاولة مرة أخرى أو التواصل مع فريق الدعم.",
                "نعتذر عن هذا التأخير. نحن نعمل على حل المشكلة. يرجى المحاولة مرة أخرى خلال دقائق قليلة.",
                "يبدو أن هناك مشكلة مؤقتة. دعني أحاول مساعدتك بطريقة أخرى أو يمكنك التواصل مع الدعم."
            ],
            "en": [
                "I apologize, I'm having difficulty processing your request right now. Please try again or contact our support team.",
                "Sorry for this delay. We're working to resolve the issue. Please try again in a few minutes.",
                "There seems to be a temporary issue. Let me try to help you in another way or you can contact support."
            ]
        }
        
        responses = fallback_responses.get(language, fallback_responses["en"])
        
        # Simple selection based on error context
        if "timeout" in error_context.lower():
            return responses[1]  # Delay message
        elif "connection" in error_context.lower():
            return responses[2]  # Alternative help message
        else:
            return responses[0]  # General error message
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics for this specific agent"""
        
        avg_processing_time = (
            self.total_processing_time / self.request_count 
            if self.request_count > 0 else 0
        )
        
        success_rate = (
            self.success_count / self.request_count 
            if self.request_count > 0 else 0
        )
        
        return {
            "agent_type": self.agent_type,
            "total_requests": self.request_count,
            "successful_requests": self.success_count,
            "failed_requests": self.error_count,
            "avg_processing_time_ms": avg_processing_time,
            "success_rate": success_rate,
            "error_rate": 1 - success_rate,
            "target_compliance": avg_processing_time < 200,  # < 200ms target
            "status": "healthy" if success_rate > 0.95 and avg_processing_time < 200 else "degraded"
        }
    
    async def _update_performance_stats(self, processing_time: float, success: bool):
        """Update internal performance statistics"""
        
        self.request_count += 1
        self.total_processing_time += processing_time
        
        if success:
            self.success_count += 1
        else:
            self.error_count += 1
    
    def _log_request(self, request: AgentRequest, response: Optional[AgentResponse], error: Optional[str] = None):
        """Log request details for debugging and monitoring"""
        
        log_data = {
            "agent_type": self.agent_type,
            "session_id": request.session_id,
            "language": request.language,
            "message_length": len(request.message),
            "has_context": bool(request.user_context),
            "has_history": bool(request.conversation_history),
            "success": response is not None,
            "error": error
        }
        
        if response:
            log_data.update({
                "response_length": len(response.reply),
                "confidence_score": response.confidence_score,
                "processing_time_ms": response.processing_time_ms
            })
        
        if error:
            self.logger.error(f"❌ Request failed: {log_data}")
        else:
            self.logger.info(f"✅ Request processed: {log_data}")
    
    async def validate_request(self, request: AgentRequest) -> bool:
        """Validate incoming request"""
        
        # Basic validation
        if not request.message or len(request.message.strip()) == 0:
            return False
        
        if request.language not in ["ar", "en"]:
            return False
        
        # Agent-specific validation can be overridden
        return await self._agent_specific_validation(request)
    
    async def _agent_specific_validation(self, request: AgentRequest) -> bool:
        """Override this for agent-specific validation"""
        return True
    
    def _format_response_for_language(self, response: str, language: str) -> str:
        """Format response according to language requirements"""
        
        if not response:
            return ""
        
        # Clean up response
        response = response.strip()
        
        # Language-specific formatting
        if language == "ar":
            # Ensure proper Arabic formatting
            response = response.replace(".", ".")
            response = response.replace(",", "،")  # Arabic comma
            response = response.replace("?", "؟")   # Arabic question mark
            
            # Add Arabic politeness if not present
            if not any(polite in response for polite in ["مرحباً", "أهلاً", "تفضل", "من فضلك"]):
                if not response.startswith(("مرحباً", "أهلاً", "السلام")):
                    response = f"مرحباً! {response}"
        
        else:  # English
            # Ensure proper English formatting
            if not response.endswith(('.', '!', '?')):
                response += "."
            
            # Add English politeness if not present
            if not any(polite in response.lower() for polite in ["hello", "hi", "please", "thank"]):
                if not response.lower().startswith(("hello", "hi", "welcome")):
                    response = f"Hello! {response}"
        
        return response
    
    async def _get_cached_response(self, cache_key: str) -> Optional[str]:
        """Get cached response if available"""
        
        if not self.redis_client:
            return None
        
        try:
            cached = self.redis_client.get(f"selena:cache:{self.agent_type}:{cache_key}")
            if cached:
                self.logger.debug(f"📦 Cache hit for {self.agent_type}: {cache_key}")
                return cached
            
        except Exception as e:
            self.logger.error(f"❌ Cache read error: {e}")
        
        return None
    
    async def _cache_response(self, cache_key: str, response: str, ttl: int = 300):
        """Cache response for future use"""
        
        if not self.redis_client or not response:
            return
        
        try:
            self.redis_client.setex(
                f"selena:cache:{self.agent_type}:{cache_key}",
                ttl,
                response
            )
            self.logger.debug(f"💾 Response cached for {self.agent_type}: {cache_key}")
            
        except Exception as e:
            self.logger.error(f"❌ Cache write error: {e}")
    
    def _generate_cache_key(self, message: str, language: str, context_hash: str = "") -> str:
        """Generate cache key for request"""
        
        import hashlib
        
        # Create hash of message and context
        content = f"{message}:{language}:{context_hash}"
        cache_key = hashlib.md5(content.encode()).hexdigest()[:16]
        
        return cache_key
    
    async def _handle_agent_error(self, error: Exception, request: AgentRequest) -> AgentResponse:
        """Handle errors and provide fallback response"""
        
        error_message = str(error)
        self.error_count += 1
        
        # Generate fallback response
        fallback_reply = await self.get_fallback_response(request.language, error_message)
        
        return AgentResponse(
            reply=fallback_reply,
            confidence_score=0.3,  # Low confidence for fallback
            processing_time_ms=50,  # Quick fallback
            agent_type=self.agent_type,
            language=request.language,
            suggested_actions=[
                "Try rephrasing your question",
                "Contact support if the issue persists"
            ],
            requires_followup=True,
            context_updated=False,
            metadata={
                "fallback": True,
                "error_type": type(error).__name__,
                "error_message": error_message
            }
        )
    
    async def get_agent_status(self) -> Dict[str, Any]:
        """Get current agent status and health"""
        
        return {
            "agent_type": self.agent_type,
            "status": "active",
            "requests_processed": self.request_count,
            "success_rate": self.success_count / self.request_count if self.request_count > 0 else 0,
            "avg_processing_time_ms": self.total_processing_time / self.request_count if self.request_count > 0 else 0,
            "last_health_check": datetime.utcnow().isoformat(),
            "configuration": {
                "ollama_host": self.ollama_host,
                "ollama_model": self.ollama_model,
                "timeout_seconds": self.timeout_seconds,
                "confidence_threshold": self.confidence_threshold
            }
        }