import os
from dotenv import load_dotenv

# Load root .env first, then backend/.env if present
root_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
backend_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.env"))

if os.path.exists(root_env):
    load_dotenv(root_env, override=True)
if os.path.exists(backend_env):
    load_dotenv(backend_env, override=True)

class Settings:
    PROJECT_NAME: str = "AIVOA Pharma QMS - Customer Complaint Management"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./qms_complaints.db")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    PRIMARY_MODEL: str = os.getenv("PRIMARY_MODEL", "llama-3.3-70b-versatile")
    COMPLEX_MODEL: str = os.getenv("COMPLEX_MODEL", "llama-3.3-70b-versatile")

settings = Settings()
