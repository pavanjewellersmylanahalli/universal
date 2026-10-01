from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.core.errors import APIException, api_exception_handler

# Import models to ensure all metadata is registered
import app.models

# Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.organizations import router as org_router
from app.api.v1.customers import router as customer_router
from app.api.v1.pledges import router as pledge_router
from app.api.v1.inventory import router as inventory_router
from app.api.v1.sales import router as sales_router
from app.api.v1.accounting import router as accounting_router
from app.api.v1.bank_repledge import router as bank_repledge_router
from app.api.v1.rates import router as rates_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.reports import router as reports_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Exception handler
app.add_exception_handler(APIException, api_exception_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables gracefully
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Database table initialization warning: {e}")

# Mount V1 Routers
api_v1 = f"{settings.API_V1_STR}"
app.include_router(auth_router, prefix=api_v1)
app.include_router(org_router, prefix=api_v1)
app.include_router(customer_router, prefix=api_v1)
app.include_router(pledge_router, prefix=api_v1)
app.include_router(inventory_router, prefix=api_v1)
app.include_router(sales_router, prefix=api_v1)
app.include_router(accounting_router, prefix=api_v1)
app.include_router(bank_repledge_router, prefix=api_v1)
app.include_router(rates_router, prefix=api_v1)
app.include_router(dashboard_router, prefix=api_v1)
app.include_router(reports_router, prefix=api_v1)

@app.api_route("/", methods=["GET", "HEAD"])
def root():

    return {
        "message": "Universal Jewellery & Girvi Management API",
        "status": "online",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "version": settings.VERSION}

