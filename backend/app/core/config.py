import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Universal Jewellery & Girvi Management API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "SUPER_SECRET_PRODUCTION_KEY_CHANGE_IN_ENV_3892749284729"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    ALGORITHM: str = "HS256"
    
    # Database
    # Default to SQLite for local development/testing if PostgreSQL URL is not set
    DATABASE_URL: str = "sqlite:///./girvi_platform.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "https://*.render.com"
    ]
    
    # Live Rate External Service URL
    GOLD_RATE_API_URL: Optional[str] = "https://api.metals.dev/v1/latest"
    GOLD_RATE_API_KEY: Optional[str] = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
