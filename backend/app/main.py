from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.database import engine, Base
from app.routers import complaints, ai, presets
from seed_data import seed_database

# Create DB tables
try:
    Base.metadata.create_all(bind=engine)
    seed_database()
except Exception as e:
    print(f"Database init info: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/openapi.json",
    docs_url="/api/docs"
)

# Robust CORS Configuration for local dev & Vercel deployments
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "https://ai-powered-pharmaceutical-customer.vercel.app",
    "https://ai-powered-pharmaceutical-customer-one.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False, # Set to False when using wildcard origins for strict browser CORS compliance
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes under /api and root fallback (handles both Vercel rewrites & direct calls)
app.include_router(complaints.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(presets.router, prefix=settings.API_V1_STR)

# Also mount without /api prefix in case serverless gateway strips /api
app.include_router(complaints.router)
app.include_router(ai.router)
app.include_router(presets.router)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "company": "aivoa.ai",
        "status": "Operational",
        "docs": "/api/docs"
    }
