from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.database import engine, Base
from app.routers import complaints, ai, presets
from seed_data import seed_database

# Create DB tables
Base.metadata.create_all(bind=engine)
# Seed database
try:
    seed_database()
except Exception as e:
    print(f"Seed error: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/openapi.json",
    docs_url="/api/docs"
)

# Enable CORS for React frontend development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(presets.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "company": "aivoa.ai",
        "status": "Operational",
        "docs": "/api/docs"
    }
