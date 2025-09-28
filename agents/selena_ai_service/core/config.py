"""
Configuration settings for LUDUS Selena AI Service
Handles environment variables and application settings

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

from pydantic import BaseSettings, Field
from typing import Optional, List
import os


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # FastAPI Configuration
    app_name: str = Field(default="LUDUS Selena AI Service", description="Application name")
    app_version: str = Field(default="1.0.0", description="Application version")
    debug: bool = Field(default=False, description="Debug mode")
    
    # Server Configuration
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8081, description="Server port")
    workers: int = Field(default=1, description="Number of worker processes")
    
    # Redis Configuration
    redis_url: Optional[str] = Field(default=None, env="REDIS_URL", description="Redis connection URL")
    redis_host: str = Field(default="localhost", env="REDIS_HOST", description="Redis host")
    redis_port: int = Field(default=6379, env="REDIS_PORT", description="Redis port")
    redis_password: Optional[str] = Field(default=None, env="REDIS_PASSWORD", description="Redis password")
    redis_db: int = Field(default=0, env="REDIS_DB", description="Redis database number")
    
    # Ollama Configuration
    ollama_host: str = Field(default="http://localhost:11434", env="OLLAMA_HOST", description="Ollama server host")
    ollama_model: str = Field(default="llama3.2", env="OLLAMA_MODEL", description="Ollama model name")
    ollama_timeout: int = Field(default=30, description="Ollama request timeout in seconds")
    
    # Performance Configuration
    max_concurrent_requests: int = Field(default=1000, description="Maximum concurrent requests")
    response_timeout: int = Field(default=30, description="Response timeout in seconds")
    target_response_time_ms: int = Field(default=200, description="Target response time in milliseconds")
    
    # Rate Limiting Configuration
    rate_limit_requests: int = Field(default=100, description="Rate limit requests per window")
    rate_limit_window: int = Field(default=60, description="Rate limit window in seconds")
    rate_limit_burst: int = Field(default=10, description="Rate limit burst capacity")
    
    # Logging Configuration
    log_level: str = Field(default="INFO", description="Logging level")
    log_format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="Log format string"
    )
    
    # Security Configuration
    secret_key: str = Field(default="your-secret-key-here", env="SECRET_KEY", description="Secret key for JWT")
    algorithm: str = Field(default="HS256", description="JWT algorithm")
    access_token_expire_minutes: int = Field(default=30, description="Access token expiration")
    
    # CORS Configuration
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "https://*.render.com"],
        description="Allowed CORS origins"
    )
    
    # Selena AI Agent Configuration
    agent_timeout: int = Field(default=25, description="Individual agent timeout in seconds")
    max_conversation_history: int = Field(default=10, description="Maximum conversation history items")
    confidence_threshold: float = Field(default=0.7, description="Minimum confidence score for responses")
    
    # Session Configuration
    session_expire_hours: int = Field(default=6, description="Session expiration in hours")
    max_session_size: int = Field(default=100, description="Maximum session data size in KB")
    
    # Monitoring Configuration
    metrics_retention_hours: int = Field(default=168, description="Metrics retention period (7 days)")
    health_check_interval: int = Field(default=30, description="Health check interval in seconds")
    
    # Feature Flags
    enable_detailed_logging: bool = Field(default=True, description="Enable detailed request logging")
    enable_performance_monitoring: bool = Field(default=True, description="Enable performance monitoring")
    enable_error_tracking: bool = Field(default=True, description="Enable error tracking")
    enable_analytics: bool = Field(default=True, description="Enable usage analytics")
    
    # Database Configuration (if needed)
    mongodb_url: Optional[str] = Field(default=None, env="MONGODB_URL", description="MongoDB connection URL")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        
    def get_redis_url(self) -> str:
        """Get complete Redis URL"""
        if self.redis_url:
            return self.redis_url
        
        auth = f":{self.redis_password}@" if self.redis_password else ""
        return f"redis://{auth}{self.redis_host}:{self.redis_port}/{self.redis_db}"
    
    def get_cors_origins(self) -> List[str]:
        """Get CORS origins as list"""
        if isinstance(self.cors_origins, str):
            return [origin.strip() for origin in self.cors_origins.split(",")]
        return self.cors_origins
    
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return os.getenv("ENVIRONMENT", "development").lower() == "production"
    
    def get_log_config(self) -> dict:
        """Get logging configuration"""
        return {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": self.log_format,
                },
                "detailed": {
                    "format": "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s",
                },
            },
            "handlers": {
                "default": {
                    "formatter": "default",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
                "detailed": {
                    "formatter": "detailed",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                },
            },
            "root": {
                "level": self.log_level,
                "handlers": ["default"],
            },
            "loggers": {
                "uvicorn": {
                    "level": "INFO",
                    "handlers": ["default"],
                    "propagate": False,
                },
                "fastapi": {
                    "level": "INFO", 
                    "handlers": ["detailed"] if self.enable_detailed_logging else ["default"],
                    "propagate": False,
                },
                "selena": {
                    "level": "DEBUG" if self.debug else "INFO",
                    "handlers": ["detailed"] if self.enable_detailed_logging else ["default"],
                    "propagate": False,
                },
            },
        }


# Global settings instance
settings = Settings()