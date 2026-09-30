from datetime import date
from decimal import Decimal
import math

class InterestEngine:
    @staticmethod
    def calculate_interest(
        principal: Decimal,
        monthly_rate: Decimal,
        pledge_date: date,
        as_of_date: date = None
    ) -> Decimal:
        """
        Calculates accrued interest for a given principal and monthly interest rate.
        Supports standard Indian Girvi monthly calculation (minimum 1 month or pro-rata days).
        """
        if as_of_date is None:
            as_of_date = date.today()
        
        days = (as_of_date - pledge_date).days
        if days <= 0:
            return Decimal("0.00")
        
        # In traditional Girvi: if less than 30 days, minimum 1 month interest applies unless configured otherwise.
        months = max(1, math.ceil(days / 30.0))
        
        # Monthly interest = Principal * (monthly_rate / 100)
        monthly_interest = principal * (monthly_rate / Decimal("100"))
        total_interest = monthly_interest * Decimal(months)
        
        return round(total_interest, 2)
