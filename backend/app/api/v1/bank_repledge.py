from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.deps import get_current_tenant_context, TenantContext
from app.core.errors import APIException
from app.models.bank_repledge import BankRePledge, BankRePledgeInterestPayment
from app.models.pledge import Pledge
from app.models.accounting import JournalEntry, JournalLine
from app.schemas.bank_repledge import BankRePledgeCreate, BankRePledgeOut, BankInterestPaymentCreate, BankInterestPaymentOut

router = APIRouter(prefix="/bank-repledge", tags=["Bank Re-Pledge"])

@router.get("/eligible-pledges")
def list_eligible_pledges(
    q: Optional[str] = Query(None, description="Search by pledge no, customer name or phone"),
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    """
    Returns active customer pledges eligible for Bank Re-pledging.
    Filters out pledges that are already redeemed or re-pledged.
    """
    query = db.query(Pledge).filter(
        Pledge.organization_id == context.organization_id,
        Pledge.status == "ACTIVE",
        Pledge.is_bank_repledged == False
    )

    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Pledge.pledge_no.ilike(search),
                Pledge.customer_name.ilike(search),
                Pledge.customer_phone.ilike(search),
                Pledge.articles_summary.ilike(search)
            )
        )

    pledges = query.order_by(Pledge.created_at.desc()).limit(100).all()
    
    return [
        {
            "id": p.id,
            "pledge_no": p.pledge_no,
            "pledge_date": p.pledge_date,
            "customer_name": p.customer_name,
            "customer_phone": p.customer_phone,
            "principal_amount": float(p.principal_amount),
            "articles_summary": p.articles_summary,
            "total_gross_weight": float(p.total_gross_weight),
            "total_net_weight": float(p.total_net_weight),
        }
        for p in pledges
    ]

@router.get("", response_model=List[BankRePledgeOut])
def list_bank_repledges(
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    items = db.query(BankRePledge).filter(
        BankRePledge.organization_id == context.organization_id
    ).order_by(BankRePledge.created_at.desc()).all()
    return [BankRePledgeOut.model_validate(i) for i in items]

@router.post("", response_model=BankRePledgeOut, status_code=status.HTTP_201_CREATED)
def create_bank_repledge(
    payload: BankRePledgeCreate,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    if not payload.pledge_ids or len(payload.pledge_ids) == 0:
        raise APIException(status_code=400, code="NO_PLEDGES_SELECTED", message="Please select at least one customer pledge item for re-pledging.")

    # Retrieve all selected pledges
    pledges = db.query(Pledge).filter(
        Pledge.id.in_(payload.pledge_ids),
        Pledge.organization_id == context.organization_id,
        Pledge.status == "ACTIVE"
    ).all()

    if len(pledges) != len(payload.pledge_ids):
        raise APIException(status_code=400, code="INVALID_PLEDGE_SELECTION", message="One or more selected pledges are invalid or already re-pledged.")

    # Calculate cumulative weights
    total_gross = sum([p.total_gross_weight for p in pledges])
    total_net = sum([p.total_net_weight for p in pledges])
    primary_pledge_id = pledges[0].id if len(pledges) > 0 else None
    
    bank_name = payload.bank_name or payload.repledge_bank or "BANK"
    ref_no = payload.reference_number or payload.repledge_bill_no

    repledge = BankRePledge(
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        pledge_id=primary_pledge_id,
        pledge_ids=payload.pledge_ids,
        repledge_bill_no=payload.repledge_bill_no,
        repledge_name=payload.repledge_name,
        repledge_bank=payload.repledge_bank,
        repledge_date=payload.repledge_date,
        repledge_amount=payload.repledge_amount,
        loan_amount=payload.repledge_amount,
        monthly_interest_rate=payload.monthly_interest_rate or 0,
        annual_interest_rate=(payload.monthly_interest_rate or 0) * 12,
        bank_name=bank_name,
        bank_branch=payload.bank_branch or "MAIN",
        reference_number=ref_no,
        total_gross_weight=total_gross,
        total_net_weight=total_net,
        notes=payload.notes,
        status="ACTIVE"
    )
    db.add(repledge)

    # Update selected pledges status
    for pledge in pledges:
        pledge.is_bank_repledged = True
        pledge.status = "RE-PLEDGED"

    # Post Double-Entry Accounting Entry
    # DEBIT Cash / Bank (Received from Bank Repledge)
    # CREDIT Bank Loan Payable / Repledge Liability
    entry = JournalEntry(
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        entry_date=payload.repledge_date,
        description=f"Bank Re-Pledge Loan Received - Bill #{payload.repledge_bill_no} ({payload.repledge_name} / {payload.repledge_bank})"
    )
    db.add(entry)
    db.flush()

    line_debit = JournalLine(
        journal_entry_id=entry.id,
        account_name="CASH IN HAND",
        account_type="ASSET",
        debit=payload.repledge_amount,
        credit=0
    )
    line_credit = JournalLine(
        journal_entry_id=entry.id,
        account_name="BANK RE-PLEDGE LOAN LIABILITY",
        account_type="LIABILITY",
        debit=0,
        credit=payload.repledge_amount
    )
    db.add_all([line_debit, line_credit])

    db.commit()
    db.refresh(repledge)
    return BankRePledgeOut.model_validate(repledge)


@router.post("/{repledge_id}/interest-payment", response_model=BankInterestPaymentOut)
def record_bank_interest_payment(
    repledge_id: str,
    payload: BankInterestPaymentCreate,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    """
    Record a monthly interest payment made to the bank for a re-pledge.
    """
    repledge = db.query(BankRePledge).filter(
        BankRePledge.id == repledge_id,
        BankRePledge.organization_id == context.organization_id
    ).first()

    if not repledge:
        raise APIException(status_code=404, code="REPLEDE_NOT_FOUND", message="Bank Re-pledge record not found.")

    payment = BankRePledgeInterestPayment(
        organization_id=context.organization_id,
        bank_repledge_id=repledge.id,
        payment_date=payload.payment_date,
        amount=payload.amount,
        interest_period=payload.interest_period,
        payment_mode=payload.payment_mode or "CASH",
        reference_no=payload.reference_no,
        notes=payload.notes
    )
    db.add(payment)

    # Double-Entry Ledger Expense
    # DEBIT Bank Interest Paid Expense
    # CREDIT Cash / Bank
    entry = JournalEntry(
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        entry_date=payload.payment_date,
        description=f"Bank Re-Pledge Monthly Interest Paid - Bill #{repledge.repledge_bill_no} ({repledge.repledge_bank})"
    )
    db.add(entry)
    db.flush()

    line_exp = JournalLine(
        journal_entry_id=entry.id,
        account_name="BANK RE-PLEDGE INTEREST EXPENSE",
        account_type="EXPENSE",
        debit=payload.amount,
        credit=0
    )
    line_cash = JournalLine(
        journal_entry_id=entry.id,
        account_name="CASH IN HAND" if payload.payment_mode == "CASH" else "BANK ACCOUNT",
        account_type="ASSET",
        debit=0,
        credit=payload.amount
    )
    db.add_all([line_exp, line_cash])

    db.commit()
    db.refresh(payment)
    return BankInterestPaymentOut.model_validate(payment)

