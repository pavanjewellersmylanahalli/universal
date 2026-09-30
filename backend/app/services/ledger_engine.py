from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Session
from app.models.accounting import CashAccount, CashTransaction, LedgerEntry

class LedgerEngine:
    @staticmethod
    def record_cash_transaction(
        db: Session,
        organization_id: str,
        branch_id: Optional[str],
        transaction_type: str, # CASH_IN, CASH_OUT
        category: str,
        amount: Decimal,
        reference_type: Optional[str] = None,
        reference_id: Optional[str] = None,
        description: Optional[str] = None
    ) -> CashTransaction:
        cash_acc = db.query(CashAccount).filter(
            CashAccount.organization_id == organization_id,
            CashAccount.is_active == True
        ).first()

        if not cash_acc:
            cash_acc = CashAccount(
                organization_id=organization_id,
                branch_id=branch_id,
                name="Main Cash Box",
                opening_balance=Decimal("0.00"),
                current_balance=Decimal("0.00")
            )
            db.add(cash_acc)
            db.flush()

        if transaction_type == "CASH_IN":
            cash_acc.current_balance += amount
        else:
            cash_acc.current_balance -= amount

        tx = CashTransaction(
            organization_id=organization_id,
            branch_id=branch_id,
            cash_account_id=cash_acc.id,
            transaction_type=transaction_type,
            category=category,
            amount=amount,
            balance_after=cash_acc.current_balance,
            reference_type=reference_type,
            reference_id=reference_id,
            description=description
        )
        db.add(tx)
        return tx

    @staticmethod
    def record_double_entry(
        db: Session,
        organization_id: str,
        branch_id: Optional[str],
        account_head: str,
        debit: Decimal,
        credit: Decimal,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        description: Optional[str] = None
    ) -> LedgerEntry:
        entry = LedgerEntry(
            organization_id=organization_id,
            branch_id=branch_id,
            account_head=account_head,
            debit_amount=debit,
            credit_amount=credit,
            entity_type=entity_type,
            entity_id=entity_id,
            description=description
        )
        db.add(entry)
        return entry
