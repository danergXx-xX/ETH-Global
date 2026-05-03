"""
Foundation routers (Wave 1 + Wave 2 backend).

Each router is a FastAPI APIRouter mounted in main.py. Existing /api/debate,
/ws/debate, /api/proposals/* and /api/agents/{persona}/reputation endpoints
stay in main.py to avoid touching Sesja 19/20/21 territory.
"""

from routers.agents_custom import router as agents_custom_router
from routers.notifications import router as notifications_router
from routers.protocols import router as protocols_router
from routers.treasury import router as treasury_router
from routers.users import router as users_router

__all__ = [
    "agents_custom_router",
    "notifications_router",
    "protocols_router",
    "treasury_router",
    "users_router",
]
