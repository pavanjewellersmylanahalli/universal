import sys
import os
from datetime import date, datetime
from decimal import Decimal

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.organization import Organization, Branch, OrganizationSettings, User
from app.models.customer import Customer
from app.models.pledge import Pledge, PledgeItem, PledgePayment
from app.models.inventory import InventoryItem, ProductCategory, StockMovement
from app.models.accounting import CashAccount, CashTransaction, LedgerEntry
from app.models.rates import MetalRate

def seed_db():
    print("Initializing Database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if seed already performed
        if db.query(Organization).first():
            print("Database already seeded. Skipping.")
            return

        print("Seeding multi-tenant demonstration data...")

        # -------------------------------------------------------------
        # TENANT A: Royal Jewellers & Gold Loans
        # -------------------------------------------------------------
        org_a = Organization(
            name="Royal Jewellers & Gold Loans",
            slug="royal-jewellers",
            email="owner@royaljewellers.com",
            phone="+91 9876543210",
            address="102 MG Road, Zaveri Bazaar",
            city="Mumbai",
            state="Maharashtra",
            pincode="400002",
            gstin="27ABCDE1234F1Z5",
            pan="ABCDE1234F",
            currency="INR",
            invoice_prefix="ROYAL-INV",
            receipt_prefix="ROYAL-RCPT",
            girvi_prefix="ROYAL-GIRVI"
        )
        db.add(org_a)
        db.flush()

        branch_a = Branch(
            organization_id=org_a.id,
            name="Main Zaveri Branch",
            code="ZAVERI",
            city="Mumbai",
            phone="+91 9876543210",
            is_main=True
        )
        db.add(branch_a)
        db.flush()

        settings_a = OrganizationSettings(
            organization_id=org_a.id,
            default_monthly_interest_rate=Decimal("1.50"),
            default_ltv_percentage=Decimal("75.00"),
            grace_period_days=7
        )
        db.add(settings_a)

        user_a = User(
            organization_id=org_a.id,
            branch_id=branch_a.id,
            name="Rajesh Sharma (Owner)",
            email="owner@royaljewellers.com",
            password_hash=get_password_hash("password123"),
            role="OWNER"
        )
        db.add(user_a)

        cash_a = CashAccount(
            organization_id=org_a.id,
            branch_id=branch_a.id,
            name="Main Cash Box",
            opening_balance=Decimal("500000.00"),
            current_balance=Decimal("500000.00")
        )
        db.add(cash_a)

        rate_a = MetalRate(
            organization_id=org_a.id,
            branch_id=branch_a.id,
            gold_24k_per_gram=Decimal("7500.00"),
            gold_22k_per_gram=Decimal("6875.00"),
            gold_18k_per_gram=Decimal("5625.00"),
            silver_per_gram=Decimal("90.00"),
            source="MANUAL",
            is_stale=False
        )
        db.add(rate_a)

        # Customers for Tenant A
        cust_a1 = Customer(
            organization_id=org_a.id,
            branch_id=branch_a.id,
            customer_code="ROYAL-CUST-00001",
            name="Ramesh Patel",
            relative_name="Suresh Patel",
            mobile="+91 9123456789",
            address="45 Station Road",
            city="Mumbai",
            state="Maharashtra",
            pan_number="ABCDE9999F",
            kyc_status="VERIFIED"
        )
        db.add(cust_a1)
        db.flush()

        # Pledge for Tenant A
        pledge_a1 = Pledge(
            organization_id=org_a.id,
            branch_id=branch_a.id,
            customer_id=cust_a1.id,
            pledge_number="ROYAL-GIRVI-000001",
            pledge_date=date.today(),
            due_date=date(2026, 12, 31),
            loan_amount=Decimal("50000.00"),
            monthly_interest_rate=Decimal("1.50"),
            principal_outstanding=Decimal("50000.00"),
            interest_outstanding=Decimal("750.00"),
            total_gross_weight=Decimal("12.500"),
            total_net_weight=Decimal("12.000"),
            total_market_value=Decimal("82500.00"),
            status="ACTIVE",
            created_by_user_id=user_a.id
        )
        db.add(pledge_a1)
        db.flush()

        item_a1 = PledgeItem(
            pledge_id=pledge_a1.id,
            ornament_category="Gold Chain 22K",
            description="22K Gold Chain with Pendant",
            quantity=1,
            gross_weight=Decimal("12.500"),
            less_weight=Decimal("0.500"),
            net_weight=Decimal("12.000"),
            purity="22K",
            estimated_market_value=Decimal("82500.00"),
            loan_value=Decimal("50000.00")
        )
        db.add(item_a1)

        # -------------------------------------------------------------
        # TENANT B: Crown Pawn & Jewellery
        # -------------------------------------------------------------
        org_b = Organization(
            name="Crown Pawn & Jewellery",
            slug="crown-pawn",
            email="owner@crownpawn.com",
            phone="+91 9898989898",
            address="204 Commercial Street",
            city="Bengaluru",
            state="Karnataka",
            pincode="560001",
            currency="INR",
            invoice_prefix="CROWN-INV",
            receipt_prefix="CROWN-RCPT",
            girvi_prefix="CROWN-GIRVI"
        )
        db.add(org_b)
        db.flush()

        branch_b = Branch(
            organization_id=org_b.id,
            name="Commercial Street Branch",
            code="BLR-01",
            city="Bengaluru",
            phone="+91 9898989898",
            is_main=True
        )
        db.add(branch_b)
        db.flush()

        user_b = User(
            organization_id=org_b.id,
            branch_id=branch_b.id,
            name="Venkatesh Rao (Owner)",
            email="owner@crownpawn.com",
            password_hash=get_password_hash("password123"),
            role="OWNER"
        )
        db.add(user_b)

        cash_b = CashAccount(
            organization_id=org_b.id,
            branch_id=branch_b.id,
            name="Main Cash Box",
            opening_balance=Decimal("300000.00"),
            current_balance=Decimal("300000.00")
        )
        db.add(cash_b)

        db.commit()
        print("Database seeded successfully with 2 distinct tenants!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
