from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.deps import get_current_tenant_context, TenantContext
from app.core.errors import APIException
from app.models.pledge import Pledge, PledgeItem, PledgePayment
from app.models.customer import Customer
from app.models.organization import Organization
from app.schemas.pledge import PledgeCreate, PledgeOut, PledgePaymentCreate, PledgePaymentOut
from app.services.interest_engine import InterestEngine
from app.services.ledger_engine import LedgerEngine
from app.services.pdf_engine import PDFEngine

router = APIRouter(prefix="/pledges", tags=["Pledges"])

@router.get("", response_model=List[PledgeOut])
def list_pledges(
    status_filter: Optional[str] = Query(None, alias="status"),
    customer_id: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    query = db.query(Pledge).filter(Pledge.organization_id == context.organization_id)

    if status_filter:
        query = query.filter(Pledge.status == status_filter)
    if customer_id:
        query = query.filter(Pledge.customer_id == customer_id)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Pledge.pledge_number.ilike(search_pattern),
                Pledge.notes.ilike(search_pattern)
            )
        )

    pledges = query.order_by(Pledge.created_at.desc()).offset(offset).limit(limit).all()

    result = []
    for p in pledges:
        p_out = PledgeOut.model_validate(p)
        if p.status in ["ACTIVE", "PARTIAL_PAYMENT", "OVERDUE", "RENEWED"]:
            p_out.interest_outstanding = InterestEngine.calculate_interest(
                principal=p.principal_outstanding,
                monthly_rate=p.monthly_interest_rate,
                pledge_date=p.pledge_date
            )
        result.append(p_out)

    return result

@router.post("", response_model=PledgeOut, status_code=status.HTTP_201_CREATED)
def create_pledge(
    payload: PledgeCreate,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    customer_id = payload.customer_id

    # If no customer_id provided, create/find customer inline
    if not customer_id:
        if not payload.customer_name or not payload.mobile_number:
            raise APIException(status_code=400, code="CUSTOMER_DETAILS_REQUIRED", message="Customer Name and Mobile Number are required")
        
        # Check if customer exists by mobile
        customer = db.query(Customer).filter(
            Customer.organization_id == context.organization_id,
            Customer.mobile == payload.mobile_number
        ).first()

        if not customer:
            org = db.query(Organization).filter(Organization.id == context.organization_id).first()
            prefix = org.customer_prefix if org else "CUST"
            count = db.query(Customer).filter(Customer.organization_id == context.organization_id).count()
            code = f"{prefix}-{count + 1:05d}"

            customer = Customer(
                organization_id=context.organization_id,
                branch_id=context.branch_id,
                customer_code=code,
                name=payload.customer_name,
                relation_type=payload.relation_type,
                relative_name=payload.relation_name,
                mobile=payload.mobile_number,
                monthly_income=payload.monthly_income,
                address=payload.address,
                photo_url=payload.customer_photo_url
            )
            db.add(customer)
            db.flush()
        
        customer_id = customer.id

    org = db.query(Organization).filter(Organization.id == context.organization_id).first()
    prefix = org.girvi_prefix if org else "GIRVI"

    pledge_num = payload.pledge_number
    if not pledge_num:
        count = db.query(Pledge).filter(Pledge.organization_id == context.organization_id).count()
        pledge_num = f"{prefix}-{count + 1:06d}"

    # Calculate totals from items
    tot_gross = sum([item.gross_weight for item in payload.items])
    tot_net = sum([item.net_weight for item in payload.items])
    tot_market = sum([item.estimated_market_value for item in payload.items])
    tot_loan = payload.loan_amount or sum([item.loan_value for item in payload.items])

    pledge = Pledge(
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        customer_id=customer_id,
        pledge_number=pledge_num,
        pledge_date=payload.pledge_date or date.today(),
        due_date=payload.due_date,
        loan_amount=tot_loan,
        monthly_interest_rate=payload.monthly_interest_rate,
        principal_outstanding=tot_loan,
        interest_outstanding=Decimal("0.00"),
        total_gross_weight=tot_gross,
        total_net_weight=tot_net,
        total_market_value=tot_market,
        status="ACTIVE",
        notes=payload.notes,
        created_by_user_id=context.user_id
    )
    db.add(pledge)
    db.flush()

    for item in payload.items:
        p_item = PledgeItem(
            pledge_id=pledge.id,
            ornament_category=item.ornament_category,
            description=item.description,
            quantity=item.quantity,
            gross_weight=item.gross_weight,
            less_weight=item.less_weight,
            net_weight=item.net_weight,
            purity=item.purity,
            estimated_market_value=item.estimated_market_value,
            loan_value=item.loan_value,
            remarks=item.remarks,
            photo_url=item.photo_url
        )
        db.add(p_item)

    # Cash Out for Loan Disbursement
    LedgerEngine.record_cash_transaction(
        db=db,
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        transaction_type="CASH_OUT",
        category="GIRDVI_DISBURSEMENT",
        amount=tot_loan,
        reference_type="PLEDGE",
        reference_id=pledge.id,
        description=f"Disbursement for pledge {pledge_num}"
    )

    # Double entry ledger
    LedgerEngine.record_double_entry(
        db=db,
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        account_head="PRINCIPAL_DISBURSED",
        debit=tot_loan,
        credit=Decimal("0.00"),
        entity_type="PLEDGE",
        entity_id=pledge.id,
        description=f"Disbursed pledge {pledge_num}"
    )

    db.commit()
    db.refresh(pledge)

    p_out = PledgeOut.model_validate(pledge)
    return p_out

@router.get("/{pledge_id}", response_model=PledgeOut)
def get_pledge(
    pledge_id: str,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    pledge = db.query(Pledge).filter(
        Pledge.id == pledge_id,
        Pledge.organization_id == context.organization_id
    ).first()
    if not pledge:
        raise APIException(status_code=404, code="PLEDGE_NOT_FOUND", message="Pledge not found")

    p_out = PledgeOut.model_validate(pledge)
    if pledge.status in ["ACTIVE", "PARTIAL_PAYMENT", "OVERDUE", "RENEWED"]:
        p_out.interest_outstanding = InterestEngine.calculate_interest(
            principal=pledge.principal_outstanding,
            monthly_rate=pledge.monthly_interest_rate,
            pledge_date=pledge.pledge_date
        )
    return p_out

@router.post("/{pledge_id}/payments", response_model=PledgePaymentOut)
def record_pledge_payment(
    pledge_id: str,
    payload: PledgePaymentCreate,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    pledge = db.query(Pledge).filter(
        Pledge.id == pledge_id,
        Pledge.organization_id == context.organization_id
    ).first()
    if not pledge:
        raise APIException(status_code=404, code="PLEDGE_NOT_FOUND", message="Pledge not found")

    if pledge.status == "CLOSED":
        raise APIException(status_code=400, code="PLEDGE_ALREADY_CLOSED", message="This pledge has already been closed.")

    org = db.query(Organization).filter(Organization.id == context.organization_id).first()
    prefix = org.receipt_prefix if org else "RCPT"
    count = db.query(PledgePayment).filter(PledgePayment.organization_id == context.organization_id).count()
    pay_num = f"{prefix}-{count + 1:06d}"

    payment = PledgePayment(
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        pledge_id=pledge.id,
        payment_number=pay_num,
        payment_date=datetime.utcnow(),
        total_paid=payload.total_paid,
        principal_paid=payload.principal_paid,
        interest_paid=payload.interest_paid,
        charges_paid=payload.charges_paid,
        payment_type=payload.payment_type,
        payment_mode=payload.payment_mode,
        reference_number=payload.reference_number,
        notes=payload.notes,
        idempotency_key=payload.idempotency_key,
        created_by_user_id=context.user_id
    )
    db.add(payment)

    pledge.total_paid_interest += payload.interest_paid
    pledge.total_paid_principal += payload.principal_paid
    pledge.principal_outstanding -= payload.principal_paid

    if pledge.principal_outstanding <= 0:
        pledge.principal_outstanding = Decimal("0.00")
        pledge.status = "CLOSED"
    else:
        pledge.status = "PARTIAL_PAYMENT"

    if payload.payment_mode == "CASH":
        LedgerEngine.record_cash_transaction(
            db=db,
            organization_id=context.organization_id,
            branch_id=context.branch_id,
            transaction_type="CASH_IN",
            category="GIRDVI_PAYMENT",
            amount=payload.total_paid,
            reference_type="PLEDGE_PAYMENT",
            reference_id=payment.id,
            description=f"Received payment {pay_num} for pledge {pledge.pledge_number}"
        )

    if payload.interest_paid > 0:
        LedgerEngine.record_double_entry(
            db=db,
            organization_id=context.organization_id,
            branch_id=context.branch_id,
            account_head="INTEREST_INCOME",
            debit=Decimal("0.00"),
            credit=payload.interest_paid,
            entity_type="PLEDGE_PAYMENT",
            entity_id=payment.id,
            description=f"Interest income for pledge {pledge.pledge_number}"
        )

    db.commit()
    db.refresh(payment)
    return PledgePaymentOut.model_validate(payment)

@router.get("/{pledge_id}/pdf")
def download_pledge_receipt_pdf(
    pledge_id: str,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    pledge = db.query(Pledge).filter(
        Pledge.id == pledge_id,
        Pledge.organization_id == context.organization_id
    ).first()
    if not pledge:
        raise APIException(status_code=404, code="PLEDGE_NOT_FOUND", message="Pledge not found")

    customer = db.query(Customer).filter(Customer.id == pledge.customer_id).first()
    org = db.query(Organization).filter(Organization.id == context.organization_id).first()

    items_list = [{
        "ornament_category": i.ornament_category,
        "quantity": i.quantity,
        "gross_weight": i.gross_weight,
        "net_weight": i.net_weight,
        "purity": i.purity,
        "estimated_market_value": i.estimated_market_value
    } for i in pledge.items]

    pdf_bytes = PDFEngine.generate_pledge_receipt(
        org_name=org.name if org else "Jewellery & Girvi Management",
        org_address=org.address if org else "",
        org_phone=org.phone if org else "",
        receipt_number=f"RCPT-{pledge.pledge_number}",
        customer_name=customer.name if customer else "Customer",
        customer_mobile=customer.mobile if customer else "",
        pledge_number=pledge.pledge_number,
        loan_amount=pledge.loan_amount,
        monthly_rate=pledge.monthly_interest_rate,
        pledge_date=str(pledge.pledge_date),
        items=items_list
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=pledge_{pledge.pledge_number}.pdf"}
    )
