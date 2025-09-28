"""
LUDUS Selena AI Service Startup Configuration
Created: 2025-09-28 GMT+3 (Riyadh)
Purpose: Production-ready startup configuration for high-performance AI service
"""

import asyncio
import uvicorn
import logging
from fastapi import FastAPI
from .config import settings
from .performance_monitor import performance_monitor


def configure_app_startup(app: FastAPI) -> None:
    """Configure application startup events"""
    
    @app.on_event("startup")
    async def startup_event():
        """Initialize services on startup"""
        logger = logging.getLogger(__name__)
        logger.info(f"Starting {settings.app_name} v{settings.app_version}")
        
        # Start Prometheus metrics server if enabled
        if settings.enable_metrics_export:
            try:
                performance_monitor.start_prometheus_server()
                logger.info("Prometheus metrics server started")
            except Exception as e:
                logger.error(f"Failed to start Prometheus server: {e}")
        
        # Validate Redis connection
        try:
            from .main import redis_client
            if redis_client:
                redis_client.ping()
                logger.info("Redis connection established")
            else:
                logger.warning("Redis not configured - session persistence disabled")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
        
        # Validate Ollama connection
        try:
            import requests
            response = requests.get(f"{settings.ollama_host}/api/tags", timeout=2)
            if response.ok:
                logger.info("Ollama connection established")
            else:
                logger.warning("Ollama connection failed - AI responses may be limited")
        except Exception as e:
            logger.warning(f"Ollama connection error: {e}")
        
        logger.info("LUDUS Selena AI Service startup completed")
    
    @app.on_event("shutdown")
    async def shutdown_event():
        """Cleanup on shutdown"""
        logger = logging.getLogger(__name__)
        logger.info("Shutting down LUDUS Selena AI Service")
        
        # Cleanup any background tasks
        try:
            # Cancel any pending asyncio tasks
            tasks = [task for task in asyncio.all_tasks() if not task.done()]
            if tasks:
                logger.info(f"Cancelling {len(tasks)} pending tasks")
                for task in tasks:
                    task.cancel()
                await asyncio.gather(*tasks, return_exceptions=True)
        except Exception as e:
            logger.error(f"Error during shutdown cleanup: {e}")
        
        logger.info("LUDUS Selena AI Service shutdown completed")


def run_production_server():
    """Run the production server with optimal configuration"""
    import os
    
    # Production server configuration for Render deployment
    server_config = {
        "host": "0.0.0.0",
        "port": int(os.environ.get("PORT", 8081)),
        "workers": settings.max_workers,
        "loop": "asyncio",
        "log_level": "info" if not settings.debug_mode else "debug",
        "access_log": True,
        "reload": settings.debug_mode,
        "reload_dirs": ["agents"] if settings.debug_mode else None,
    }
    
    # Import app after configuration
    from .main import app
    configure_app_startup(app)
    
    # Start server
    uvicorn.run("agents.api.main:app", **server_config)


def run_development_server():
    """Run the development server with hot reload"""
    
    dev_config = {
        "host": "0.0.0.0",
        "port": 8081,
        "reload": True,
        "reload_dirs": ["agents"],
        "log_level": "debug",
        "access_log": True,
    }
    
    from .main import app
    configure_app_startup(app)
    
    uvicorn.run("agents.api.main:app", **dev_config)


if __name__ == "__main__":
    import os
    
    if os.environ.get("RENDER_ENVIRONMENT") == "production":
        run_production_server()
    else:
        run_development_server()