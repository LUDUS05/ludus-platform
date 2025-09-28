"""
Rate Limiter for LUDUS Selena AI Service
Implements sliding window rate limiting for API protection

Target: Support 1000+ concurrent requests with proper rate limiting

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

import redis
import time
import logging
from typing import Optional
from fastapi import HTTPException


class RateLimiter:
    """Redis-based sliding window rate limiter"""
    
    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.logger = logging.getLogger(__name__)
        self.redis_client = redis_client
        
        # Rate limiting configuration
        self.default_limit = 100  # requests per window
        self.default_window = 60   # window size in seconds
        self.burst_limit = 20      # burst allowance
        
        # Rate limit presets for different scenarios
        self.rate_limits = {
            "chat": {"limit": 60, "window": 60},      # 1 request per second
            "discovery": {"limit": 120, "window": 60}, # 2 requests per second
            "onboard": {"limit": 30, "window": 60},    # 0.5 requests per second
            "support": {"limit": 100, "window": 60},   # 1.67 requests per second
            "community": {"limit": 80, "window": 60},  # 1.33 requests per second
            "batch": {"limit": 10, "window": 60},      # Batch operations
            "health": {"limit": 300, "window": 60}     # Health checks
        }
        
        self.logger.info("🛡️ Rate Limiter initialized")
    
    def _get_key(self, identifier: str, endpoint: str = "default") -> str:
        """Generate Redis key for rate limiting"""
        return f"selena:rate_limit:{endpoint}:{identifier}"
    
    async def check_limit(
        self,
        identifier: str,
        limit: Optional[int] = None,
        window: Optional[int] = None,
        endpoint: str = "default"
    ) -> bool:
        """
        Check if request is within rate limits using sliding window
        
        Args:
            identifier: Unique identifier (session_id, IP, user_id)
            limit: Number of requests allowed in window
            window: Time window in seconds
            endpoint: Endpoint type for specific limits
            
        Returns:
            True if within limits
            
        Raises:
            HTTPException: If rate limit exceeded
        """
        
        # Use Redis if available, otherwise allow all requests
        if not self.redis_client:
            return True
        
        # Get rate limit configuration
        if endpoint in self.rate_limits:
            config = self.rate_limits[endpoint]
            limit = limit or config["limit"]
            window = window or config["window"]
        else:
            limit = limit or self.default_limit
            window = window or self.default_window
        
        key = self._get_key(identifier, endpoint)
        now = time.time()
        
        try:
            # Use sliding window log algorithm
            # Remove expired entries
            self.redis_client.zremrangebyscore(key, 0, now - window)
            
            # Count current requests
            current_requests = self.redis_client.zcard(key)
            
            # Check if limit exceeded
            if current_requests >= limit:
                # Check if user has burst allowance
                burst_key = f"{key}:burst"
                burst_used = self.redis_client.get(burst_key)
                
                if burst_used is None:
                    burst_used = 0
                else:
                    burst_used = int(burst_used)
                
                if burst_used < self.burst_limit:
                    # Allow burst request
                    self.redis_client.incr(burst_key)
                    self.redis_client.expire(burst_key, window)
                    
                    self.logger.warning(
                        f"🔥 Burst request allowed for {identifier} on {endpoint} "
                        f"({burst_used + 1}/{self.burst_limit})"
                    )
                else:
                    # Rate limit exceeded
                    self.logger.warning(f"🚫 Rate limit exceeded: {identifier} on {endpoint}")
                    
                    raise HTTPException(
                        status_code=429,
                        detail={
                            "error": "Rate limit exceeded",
                            "limit": limit,
                            "window_seconds": window,
                            "retry_after": self._get_retry_after(key, window),
                            "message_ar": "تم تجاوز حد الطلبات المسموح. يرجى المحاولة مرة أخرى لاحقاً",
                            "message_en": "Rate limit exceeded. Please try again later"
                        }
                    )
            
            # Add current request to sliding window
            request_id = f"{now}:{identifier}"
            self.redis_client.zadd(key, {request_id: now})
            
            # Set expiration for cleanup
            self.redis_client.expire(key, window + 10)
            
            return True
            
        except redis.RedisError as e:
            self.logger.error(f"❌ Redis error in rate limiting: {e}")
            # Fail open - allow request if Redis is down
            return True
        except HTTPException:
            # Re-raise HTTP exceptions (rate limit exceeded)
            raise
        except Exception as e:
            self.logger.error(f"❌ Rate limiter error: {e}")
            # Fail open - allow request on unexpected errors
            return True
    
    def _get_retry_after(self, key: str, window: int) -> int:
        """Calculate retry-after header value"""
        try:
            # Get oldest request in current window
            oldest_requests = self.redis_client.zrange(key, 0, 0, withscores=True)
            if oldest_requests:
                oldest_time = oldest_requests[0][1]
                retry_after = int(oldest_time + window - time.time())
                return max(1, retry_after)
            
            return window
            
        except Exception:
            return window
    
    async def get_rate_limit_status(self, identifier: str, endpoint: str = "default") -> Dict[str, Any]:
        """Get current rate limit status for an identifier"""
        
        if not self.redis_client:
            return {
                "status": "no_limit",
                "message": "Rate limiting not configured"
            }
        
        # Get configuration
        if endpoint in self.rate_limits:
            config = self.rate_limits[endpoint]
            limit = config["limit"]
            window = config["window"]
        else:
            limit = self.default_limit
            window = self.default_window
        
        key = self._get_key(identifier, endpoint)
        now = time.time()
        
        try:
            # Clean expired entries
            self.redis_client.zremrangebyscore(key, 0, now - window)
            
            # Count current requests
            current_requests = self.redis_client.zcard(key)
            
            # Check burst usage
            burst_key = f"{key}:burst"
            burst_used = self.redis_client.get(burst_key)
            burst_used = int(burst_used) if burst_used else 0
            
            # Calculate time to reset
            oldest_requests = self.redis_client.zrange(key, 0, 0, withscores=True)
            reset_time = None
            if oldest_requests:
                oldest_time = oldest_requests[0][1]
                reset_time = oldest_time + window
            
            return {
                "identifier": identifier,
                "endpoint": endpoint,
                "current_requests": current_requests,
                "limit": limit,
                "remaining": max(0, limit - current_requests),
                "window_seconds": window,
                "reset_time": reset_time,
                "burst_used": burst_used,
                "burst_remaining": max(0, self.burst_limit - burst_used),
                "status": "ok" if current_requests < limit else "limited"
            }
            
        except Exception as e:
            self.logger.error(f"❌ Error getting rate limit status: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def reset_rate_limit(self, identifier: str, endpoint: str = "default") -> bool:
        """Reset rate limit for an identifier (admin function)"""
        
        if not self.redis_client:
            return False
        
        try:
            key = self._get_key(identifier, endpoint)
            burst_key = f"{key}:burst"
            
            # Delete rate limit keys
            deleted = self.redis_client.delete(key, burst_key)
            
            self.logger.info(f"🔄 Rate limit reset for {identifier} on {endpoint}")
            return deleted > 0
            
        except Exception as e:
            self.logger.error(f"❌ Error resetting rate limit: {e}")
            return False
    
    async def get_global_stats(self) -> Dict[str, Any]:
        """Get global rate limiting statistics"""
        
        if not self.redis_client:
            return {"status": "disabled"}
        
        try:
            # Get all rate limit keys
            pattern = "selena:rate_limit:*"
            keys = self.redis_client.keys(pattern)
            
            stats = {
                "total_tracked_identifiers": len(keys),
                "endpoints": {},
                "top_users": [],
                "global_requests_last_hour": 0
            }
            
            # Analyze by endpoint
            endpoint_stats = {}
            for key in keys:
                parts = key.split(":")
                if len(parts) >= 4:
                    endpoint = parts[3]
                    
                    if endpoint not in endpoint_stats:
                        endpoint_stats[endpoint] = {
                            "active_users": 0,
                            "total_requests": 0
                        }
                    
                    endpoint_stats[endpoint]["active_users"] += 1
                    
                    # Count requests for this key
                    request_count = self.redis_client.zcard(key)
                    endpoint_stats[endpoint]["total_requests"] += request_count
                    stats["global_requests_last_hour"] += request_count
            
            stats["endpoints"] = endpoint_stats
            
            return stats
            
        except Exception as e:
            self.logger.error(f"❌ Error getting global rate limit stats: {e}")
            return {"status": "error", "error": str(e)}