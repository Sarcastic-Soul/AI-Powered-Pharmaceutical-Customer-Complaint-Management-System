import sys
import os

# Include backend directory in Python path for Vercel Serverless Function
sys.path.append(os.path.join(os.path.dirname(__file__), "../backend"))

from app.main import app

# Vercel entry point
