from datetime import date, timedelta
from decimal import Decimal
from app.services.interest_engine import InterestEngine

def test_interest_calculation_minimum_one_month():
    pledge_date = date.today() - timedelta(days=10) # 10 days ago
    principal = Decimal("100000.00")
    rate = Decimal("1.50") # 1.5% per month

    interest = InterestEngine.calculate_interest(
        principal=principal,
        monthly_rate=rate,
        pledge_date=pledge_date
    )
    # 1.5% of 100,000 for 1 month = 1500
    assert interest == Decimal("1500.00")

def test_interest_calculation_three_months():
    pledge_date = date.today() - timedelta(days=70) # ~2.3 months -> rounds up to 3 months
    principal = Decimal("50000.00")
    rate = Decimal("2.00") # 2% per month

    interest = InterestEngine.calculate_interest(
        principal=principal,
        monthly_rate=rate,
        pledge_date=pledge_date
    )
    # 2% of 50,000 = 1000 * 3 months = 3000
    assert interest == Decimal("3000.00")
