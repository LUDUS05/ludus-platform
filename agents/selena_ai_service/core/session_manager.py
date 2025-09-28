"""
Session Management for LUDUS Selena AI Service
Handles conversation history, user context, and session persistence

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

import redis
import json
import logging
from typing import Optional, Dict, List, Any
from datetime import datetime, timedelta
from pydantic import BaseModel


class ConversationEntry(BaseModel):
    """Single conversation entry model"""
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime
    agent_type: str
    language: str
    confidence_score: Optional[float] = None


class SessionData(BaseModel):
    """Complete session data model"""
    session_id: str
    created_at: datetime
    last_activity: datetime
    language: str
    user_context: Dict[str, Any]
    conversation_history: List[ConversationEntry]
    agent_interactions: Dict[str, int]  # Count of interactions per agent
    total_messages: int
    
    
class SessionAnalytics(BaseModel):
    """Session analytics model"""
    session_id: str
    duration_minutes: float
    total_messages: int
    agents_used: List[str]
    primary_language: str
    avg_response_time_ms: float
    user_satisfaction: Optional[float] = None


class SessionManager:
    """Manages user sessions and conversation history with Redis"""
    
    def __init__(self, redis_url: Optional[str] = None, redis_client: Optional[redis.Redis] = None):
        self.logger = logging.getLogger(__name__)
        self.redis_client = None
        
        if redis_client:
            self.redis_client = redis_client
        elif redis_url:
            try:
                self.redis_client = redis.from_url(
                    redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True,
                    health_check_interval=30
                )
                # Test connection
                self.redis_client.ping()
                self.logger.info("✅ Redis connection established")
            except Exception as e:
                self.logger.error(f"❌ Redis connection failed: {e}")
                self.redis_client = None
        
        # Session configuration
        self.session_expire_hours = 6
        self.max_history_length = 20
        self.max_session_size_kb = 100
    
    def _session_key(self, session_id: str) -> str:
        """Generate Redis key for session"""
        return f"selena:session:{session_id}"
    
    def _analytics_key(self, session_id: str) -> str:
        """Generate Redis key for session analytics"""
        return f"selena:analytics:{session_id}"
    
    async def create_session(self, session_id: str, language: str = "ar", user_context: Optional[Dict] = None) -> SessionData:
        """Create a new session"""
        now = datetime.utcnow()
        
        session_data = SessionData(
            session_id=session_id,
            created_at=now,
            last_activity=now,
            language=language,
            user_context=user_context or {},
            conversation_history=[],
            agent_interactions={},
            total_messages=0
        )
        
        if self.redis_client:
            try:
                session_json = session_data.json()
                expire_seconds = int(self.session_expire_hours * 3600)
                
                self.redis_client.setex(
                    self._session_key(session_id),
                    expire_seconds,
                    session_json
                )
                
                self.logger.info(f"📝 Session created: {session_id}")
                
            except Exception as e:
                self.logger.error(f"❌ Failed to save session {session_id}: {e}")
        
        return session_data
    
    async def get_session(self, session_id: str) -> Optional[SessionData]:
        """Get session data"""
        if not self.redis_client:
            return None
        
        try:
            session_json = self.redis_client.get(self._session_key(session_id))
            if not session_json:
                return None
            
            session_data = SessionData.parse_raw(session_json)
            return session_data
            
        except Exception as e:
            self.logger.error(f"❌ Failed to load session {session_id}: {e}")
            return None
    
    async def load_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Load conversation history for a session"""
        session_data = await self.get_session(session_id)
        if not session_data:
            return []
        
        # Convert to simple dict format for backward compatibility
        history = []
        for entry in session_data.conversation_history:
            history.append({
                "role": entry.role,
                "content": entry.content,
                "timestamp": entry.timestamp.isoformat(),
                "agent_type": entry.agent_type,
                "language": entry.language
            })
        
        return history
    
    async def save_conversation(
        self,
        session_id: str,
        user_message: str,
        agent_response: str,
        agent_type: str,
        language: str,
        confidence_score: Optional[float] = None
    ):
        """Save conversation exchange to session"""
        session_data = await self.get_session(session_id)
        
        if not session_data:
            # Create new session if it doesn't exist
            session_data = await self.create_session(session_id, language)
        
        now = datetime.utcnow()
        
        # Add user message
        user_entry = ConversationEntry(
            role="user",
            content=user_message,
            timestamp=now,
            agent_type=agent_type,
            language=language
        )
        
        # Add agent response
        agent_entry = ConversationEntry(
            role="assistant",
            content=agent_response,
            timestamp=now,
            agent_type=agent_type,
            language=language,
            confidence_score=confidence_score
        )
        
        # Update session data
        session_data.conversation_history.extend([user_entry, agent_entry])
        session_data.last_activity = now
        session_data.total_messages += 2
        
        # Update agent interaction count
        if agent_type not in session_data.agent_interactions:
            session_data.agent_interactions[agent_type] = 0
        session_data.agent_interactions[agent_type] += 1
        
        # Trim history if too long
        if len(session_data.conversation_history) > self.max_history_length:
            session_data.conversation_history = session_data.conversation_history[-self.max_history_length:]
        
        # Save updated session
        if self.redis_client:
            try:
                session_json = session_data.json()
                
                # Check session size
                session_size_kb = len(session_json.encode('utf-8')) / 1024
                if session_size_kb > self.max_session_size_kb:
                    # Trim conversation history further
                    session_data.conversation_history = session_data.conversation_history[-10:]
                    session_json = session_data.json()
                
                expire_seconds = int(self.session_expire_hours * 3600)
                self.redis_client.setex(
                    self._session_key(session_id),
                    expire_seconds,
                    session_json
                )
                
            except Exception as e:
                self.logger.error(f"❌ Failed to save conversation for session {session_id}: {e}")
    
    async def clear_session(self, session_id: str) -> bool:
        """Clear session data"""
        if not self.redis_client:
            return False
        
        try:
            deleted = self.redis_client.delete(self._session_key(session_id))
            self.redis_client.delete(self._analytics_key(session_id))
            
            if deleted:
                self.logger.info(f"🗑️ Session cleared: {session_id}")
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"❌ Failed to clear session {session_id}: {e}")
            return False
    
    async def get_session_analytics(self, session_id: str) -> Optional[SessionAnalytics]:
        """Get analytics for a session"""
        session_data = await self.get_session(session_id)
        if not session_data:
            return None
        
        try:
            # Calculate session duration
            duration = (session_data.last_activity - session_data.created_at).total_seconds() / 60
            
            # Get unique agents used
            agents_used = list(session_data.agent_interactions.keys())
            
            # Calculate average response time (if available)
            avg_response_time = 150.0  # Default estimate
            
            analytics = SessionAnalytics(
                session_id=session_id,
                duration_minutes=duration,
                total_messages=session_data.total_messages,
                agents_used=agents_used,
                primary_language=session_data.language,
                avg_response_time_ms=avg_response_time
            )
            
            return analytics
            
        except Exception as e:
            self.logger.error(f"❌ Failed to generate analytics for session {session_id}: {e}")
            return None
    
    async def cleanup_expired_sessions(self):
        """Clean up expired sessions (background task)"""
        if not self.redis_client:
            return
        
        try:
            # Get all session keys
            pattern = "selena:session:*"
            keys = self.redis_client.keys(pattern)
            
            expired_count = 0
            for key in keys:
                ttl = self.redis_client.ttl(key)
                if ttl == -1:  # No expiration set
                    # Set expiration for old sessions
                    self.redis_client.expire(key, int(self.session_expire_hours * 3600))
                elif ttl == -2:  # Key doesn't exist
                    expired_count += 1
            
            if expired_count > 0:
                self.logger.info(f"🧹 Cleaned up {expired_count} expired sessions")
                
        except Exception as e:
            self.logger.error(f"❌ Failed to cleanup expired sessions: {e}")
    
    async def get_active_sessions_count(self) -> int:
        """Get count of active sessions"""
        if not self.redis_client:
            return 0
        
        try:
            pattern = "selena:session:*"
            keys = self.redis_client.keys(pattern)
            return len(keys)
            
        except Exception as e:
            self.logger.error(f"❌ Failed to count active sessions: {e}")
            return 0
    
    async def close(self):
        """Close Redis connection"""
        if self.redis_client:
            try:
                self.redis_client.close()
                self.logger.info("🔒 Redis connection closed")
            except Exception as e:
                self.logger.error(f"❌ Error closing Redis connection: {e}")