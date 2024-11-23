from app.api.routes import keywords, utils
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(
    keywords.router, prefix="/keywords/state", tags=["keywords", "state"]
)
api_router.include_router(
    keywords.router, prefix="/keywords/college", tags=["keywords", "college"]
)
api_router.include_router(
    keywords.router, prefix="/emotions/state", tags=["emotions", "state"]
)
api_router.include_router(
    keywords.router, prefix="/emotions/college", tags=["emotions", "college"]
)
