import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

client = TestClient(app)

def test_tenant_isolation_pledge_access():
    # Token for Tenant A (Royal Jewellers)
    token_a = create_access_token(
        subject="user-a-123",
        organization_id="royal-jewellers-org-id",
        branch_id="branch-a-123",
        role="OWNER"
    )

    # Token for Tenant B (Crown Pawn)
    token_b = create_access_token(
        subject="user-b-456",
        organization_id="crown-pawn-org-id",
        branch_id="branch-b-456",
        role="OWNER"
    )

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Fetch pledges with Tenant A token
    res_a = client.get("/api/v1/pledges", headers=headers_a)
    assert res_a.status_code == 200

    # Fetch pledges with Tenant B token
    res_b = client.get("/api/v1/pledges", headers=headers_b)
    assert res_b.status_code == 200

    # Verify no data leakage between Tenant A and Tenant B
    pledges_a = res_a.json()
    pledges_b = res_b.json()

    org_ids_a = {p["organization_id"] for p in pledges_a}
    org_ids_b = {p["organization_id"] for p in pledges_b}

    if org_ids_a:
        assert "crown-pawn-org-id" not in org_ids_a
    if org_ids_b:
        assert "royal-jewellers-org-id" not in org_ids_b
