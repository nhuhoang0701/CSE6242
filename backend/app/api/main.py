from app.api.routes import emotions, keywords, sentiments
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(keywords.router, prefix="/keywords", tags=["keywords"])
api_router.include_router(emotions.router, prefix="/emotions", tags=["emotions"])
api_router.include_router(sentiments.router, prefix="/sentiments", tags=["sentiments"])
