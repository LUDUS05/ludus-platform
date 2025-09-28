"""
LUDUS Selena AI Service

FastAPI service orchestrating 4 specialized Selena AI agents:
- Selena Onboard: User onboarding and registration guidance
- Selena Discover: Activity discovery and recommendations
- Selena Support: Customer support and technical assistance  
- Selena Community: Community building and social connections

Performance Targets:
- <200ms response time
- 1000+ concurrent requests capability
- 99.9% uptime
- Bilingual support (Arabic/English)

Created: 2025-09-28 GMT+3 (Riyadh)
Version: 1.0.0
"""

__version__ = "1.0.0"
__title__ = "LUDUS Selena AI Service"
__description__ = "FastAPI AI Service orchestrating 4 Selena AI agents for LUDUS platform"
__author__ = "LUDUS Development Team"

from .main import app

__all__ = ["app"]