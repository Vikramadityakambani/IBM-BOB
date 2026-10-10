from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db.session import init_db
from .api import auth, workspaces, content, brand, campaigns, calendar, ai

# Initialize database schema and seeds on module load to guarantee readiness
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise SaaS platform for AI content creation, repurposing, and Agiloft-inspired governance.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Healthcheck
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "database": "sqlite_fallback" if settings.USE_SQLITE_FALLBACK else "postgresql",
        "llm_provider": settings.LLM_PROVIDER,
        "llm_model": settings.LLM_MODEL
    }

# Include API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(workspaces.router, prefix="/api")
app.include_router(content.router, prefix="/api")
app.include_router(brand.router, prefix="/api")
app.include_router(campaigns.router, prefix="/api")
app.include_router(calendar.router, prefix="/api")
app.include_router(ai.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
