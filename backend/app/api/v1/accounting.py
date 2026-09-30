from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_tenant_context, TenantContext
from app.core.errors import APIException
from app.models.accounting import CashAccount, CashTransaction, LedgerEntry, Expense
from app.schemas.accounting import (
    CashTransactionOut, LedgerEntryOut, ExpenseCreate, ExpenseOut, CashBookSummary
)
from app.services.ledger_engine import LedgerEngine

router = APIRouter(prefix="/accounting", tags=["Accounting"])

@router.get("/cash-book", response_model=CashBookSummary)
def get_cash_book_summary(
    target_date: Optional[date] = None,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    cash_acc = db.query(CashAccount).filter(
        CashAccount.organization_id == context.organization_id,
        CashAccount.is_active == True
    ).first()

    current_bal = cash_acc.current_balance if cash_acc else Decimal("0.00")

    query = db.query(CashTransaction).filter(CashTransaction.organization_id == context.organization_id)
    if target_date:
        start = datetime.combine(target_date, datetime.min.time())
        end = datetime.combine(target_date, datetime.max.time())
        query = query.filter(CashTransaction.transaction_date >= start, CashTransaction.transaction_date <= end)

    txs = query.order_by(CashTransaction.transaction_date.desc()).all()

    cash_in = sum([t.amount for t in txs if t.transaction_type == "CASH_IN"])
    cash_out = sum([t.amount for t in txs if t.transaction_type == "CASH_OUT"])

    opening_bal = current_bal - cash_in + cash_out

    return CashBookSummary(
        opening_balance=opening_bal,
        total_cash_in=cash_in,
        total_cash_out=cash_out,
        closing_balance=current_bal,
        transactions=[CashTransactionOut.model_validate(t) for t in txs]
    )

@router.get("/ledger", response_model=List[LedgerEntryOut])
def list_ledger_entries(
    account_head: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    query = db.query(LedgerEntry).filter(LedgerEntry.organization_id == context.organization_id)
    if account_head:
        query = query.filter(LedgerEntry.account_head == account_head)

    entries = query.order_by(LedgerEntry.created_at.desc()).offset(offset).limit(limit).all()
    return [LedgerEntryOut.model_validate(e) for e in entries]

@router.get("/expenses", response_model=List[ExpenseOut])
def list_expenses(
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    expenses = db.query(Expense).filter(
        Expense.organization_id == context.organization_id
    ).order_by(Expense.expense_date.desc()).all()
    return [ExpenseOut.model_validate(e) for e in expenses]

@router.post("/expenses", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def record_expense(
    payload: ExpenseCreate,
    context: TenantContext = Depends(get_current_tenant_context),
    db: Session = Depends(get_db)
):
    expense = Expense(
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        category=payload.category,
        amount=payload.amount,
        payment_mode=payload.payment_mode,
        paid_to=payload.paid_to,
        expense_date=payload.expense_date or date.today(),
        notes=payload.notes
    )
    db.add(expense)
    db.flush()

    if payload.payment_mode == "CASH":
        LedgerEngine.record_cash_transaction(
            db=db,
            organization_id=context.organization_id,
            branch_id=context.branch_id,
            transaction_type="CASH_OUT",
            category="EXPENSE",
            amount=payload.amount,
            reference_type="EXPENSE",
            reference_id=expense.id,
            description=f"Expense: {payload.category} ({payload.notes or ''})"
        )

    LedgerEngine.record_double_entry(
        db=db,
        organization_id=context.organization_id,
        branch_id=context.branch_id,
        account_head="EXPENSES",
        debit=payload.amount,
        credit=Decimal("0.00"),
        entity_type="EXPENSE",
        entity_id=expense.id,
        description=f"Expense {payload.category}"
    )

    db.commit()
    db.refresh(expense)
    return ExpenseOut.model_validate(expense)
