from app.api.routes import emotions, keywords
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(keywords.router, prefix="/keywords", tags=["keywords"])
api_router.include_router(emotions.router, prefix="/emotions", tags=["emotions"])
