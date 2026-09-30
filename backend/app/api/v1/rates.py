from datetime import datetime
from decimal import Decimal
import httpx
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_tenant_context, TenantContext
from app.models.rates import MetalRate
from app.schemas.rates import MetalRateCreate, MetalRateOut

router = APIRouter(prefix="/rates", tags=["Rates"])

@router.get("/latest", response_model=MetalRateOut)
def get_latest_rate(
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    rate = db.query(MetalRate).filter(
        MetalRate.organization_id == context.organization_id
    ).order_by(MetalRate.effective_at.desc()).first()

    if not rate:
        # Default fallback rate if none set yet
        rate = MetalRate(
            organization_id=context.organization_id,
            branch_id=context.branch_id,
            gold_24k_per_gram=Decimal("7450.00"),
            gold_22k_per_gram=Decimal("6830.00"),
            gold_18k_per_gram=Decimal("5590.00"),
            silver_per_gram=Decimal("88.50"),
            source="DEFAULT_FALLBACK",
            is_stale=True
        )
        db.add(rate)
        db.commit()
        db.refresh(rate)

    return MetalRateOut.model_validate(rate)

@router.post("", response_model=MetalRateOut, status_code=status.HTTP_201_CREATED)
def set_metal_rate(
    payload: MetalRateCreate,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    rate = MetalRate(
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        gold_24k_per_gram=payload.gold_24k_per_gram,
        gold_22k_per_gram=payload.gold_22k_per_gram,
        gold_18k_per_gram=payload.gold_18k_per_gram,
        silver_per_gram=payload.silver_per_gram,
        source=payload.source,
        is_stale=False,
        effective_at=datetime.utcnow()
    )
    db.add(rate)
    db.commit()
    db.refresh(rate)
    return MetalRateOut.model_validate(rate)

@router.post("/fetch-live", response_model=MetalRateOut)
def fetch_live_market_rate(
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    last_known = db.query(MetalRate).filter(
        MetalRate.organization_id == context.organization_id
    ).order_by(MetalRate.effective_at.desc()).first()

    try:
        # Call external metal rate API if configured
        if settings.GOLD_RATE_API_URL and settings.GOLD_RATE_API_KEY:
            resp = httpx.get(
                settings.GOLD_RATE_API_URL,
                headers={"Accept": "application/json", "Authorization": f"Bearer {settings.GOLD_RATE_API_KEY}"},
                timeout=5.0
            )
            if resp.status_code == 200:
                data = resp.json()
                g24 = Decimal(str(data.get("rates", {}).get("XAU", 7450.0)))
                new_rate = MetalRate(
                    organization_id=context.organization_id,
                    branch_id=context.branch_id,
                    gold_24k_per_gram=g24,
                    gold_22k_per_gram=round(g24 * Decimal("0.916"), 2),
                    gold_18k_per_gram=round(g24 * Decimal("0.750"), 2),
                    silver_per_gram=Decimal(str(data.get("rates", {}).get("XAG", 88.5))),
                    source="LIVE_API",
                    is_stale=False,
                    effective_at=datetime.utcnow()
                )
                db.add(new_rate)
                db.commit()
                db.refresh(new_rate)
                return MetalRateOut.model_validate(new_rate)
    except Exception:
        pass

    # External API failed or not configured: retain last known rate, mark it stale
    if last_known:
        last_known.is_stale = True
        db.commit()
        db.refresh(last_known)
        return MetalRateOut.model_validate(last_known)

    # Return default fallback marked stale
    stale_rate = MetalRate(
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        gold_24k_per_gram=Decimal("7450.00"),
        gold_22k_per_gram=Decimal("6830.00"),
        gold_18k_per_gram=Decimal("5590.00"),
        silver_per_gram=Decimal("88.50"),
        source="FALLBACK_STALE",
        is_stale=True
    )
    db.add(stale_rate)
    db.commit()
    db.refresh(stale_rate)
    return MetalRateOut.model_validate(stale_rate)
