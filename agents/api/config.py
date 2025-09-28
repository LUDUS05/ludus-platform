"""
LUDUS Selena AI Service Configuration
Created: 2025-09-28 GMT+3 (Riyadh)
Purpose: Centralized configuration management for high-performance AI service
"""

import os
import logging
from typing import Optional
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Service Configuration
    app_name: str = Field(default="LUDUS Selena AI Service", env="APP_NAME")
    app_version: str = Field(default="2.0.0", env="APP_VERSION")
    debug_mode: bool = Field(default=False, env="DEBUG_MODE")
    
    # Performance Configuration
    max_workers: int = Field(default=4, env="MAX_WORKERS")
    response_timeout: int = Field(default=30, env="RESPONSE_TIMEOUT")
    response_time_target_ms: int = Field(default=200, env="RESPONSE_TIME_TARGET_MS")
    concurrent_requests_target: int = Field(default=1000, env="CONCURRENT_REQUESTS_TARGET")
    
    # Redis Configuration
    redis_url: Optional[str] = Field(default=None, env="REDIS_URL")
    redis_session_ttl: int = Field(default=21600, env="REDIS_SESSION_TTL")  # 6 hours
    redis_performance_ttl: int = Field(default=86400, env="REDIS_PERFORMANCE_TTL")  # 24 hours
    
    # Ollama Configuration
    ollama_host: str = Field(default="http://localhost:11434", env="OLLAMA_HOST")
    ollama_model: str = Field(default="llama3.1", env="OLLAMA_MODEL")
    ollama_timeout: int = Field(default=5, env="OLLAMA_TIMEOUT")
    ollama_max_tokens: int = Field(default=200, env="OLLAMA_MAX_TOKENS")
    
    # API Configuration
    cors_origins: list = Field(default=["*"], env="CORS_ORIGINS")
    api_rate_limit: int = Field(default=100, env="API_RATE_LIMIT")  # requests per minute
    
    # Monitoring Configuration
    enable_performance_tracking: bool = Field(default=True, env="ENABLE_PERFORMANCE_TRACKING")
    enable_metrics_export: bool = Field(default=True, env="ENABLE_METRICS_EXPORT")
    slow_request_threshold_ms: int = Field(default=200, env="SLOW_REQUEST_THRESHOLD_MS")
    
    # Language Configuration
    default_language: str = Field(default="ar", env="DEFAULT_LANGUAGE")
    supported_languages: list = Field(default=["ar", "en"], env="SUPPORTED_LANGUAGES")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


def setup_logging(debug_mode: bool = False) -> None:
    """Configure application logging"""
    log_level = logging.DEBUG if debug_mode else logging.INFO
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
        ]
    )
    
    # Configure specific loggers
    logging.getLogger("uvicorn").setLevel(log_level)
    logging.getLogger("fastapi").setLevel(log_level)
    logging.getLogger("selena_agents").setLevel(log_level)
    
    # Disable noisy loggers in production
    if not debug_mode:
        logging.getLogger("urllib3").setLevel(logging.WARNING)
        logging.getLogger("requests").setLevel(logging.WARNING)


# Global settings instance
settings = Settings()

# Setup logging
setup_logging(settings.debug_mode)

# Create logger for this module
logger = logging.getLogger(__name__)
logger.info(f"LUDUS Selena AI Service v{settings.app_version} configured")
logger.info(f"Performance target: <{settings.response_time_target_ms}ms response time")
logger.info(f"Concurrent requests target: {settings.concurrent_requests_target}")