import pytest

@pytest.fixture
def auth_headers(client):
    # Register Admin user
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "adminapi@retail.com",
            "full_name": "Api Admin",
            "password": "adminapipassword",
            "role": "Admin"
        }
    )
    # Login
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": "adminapi@retail.com", "password": "adminapipassword"}
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_get_dashboard_kpis(client, auth_headers):
    # Retrieve KPIs with auth headers
    response = client.get("/api/v1/dashboard/kpis", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_sales" in data
    assert "total_revenue" in data
    assert "avg_order_value" in data
    assert data["total_sales"] == 0 # no orders in testing DB yet

def test_product_lifecycle(client, auth_headers, db_session):
    # 1. Create a Category first (direct DB or seeding, but we can register product which will require category)
    # Let's seed category in DB via SQLAlchemy inside test database
    from app.models import Category
    
    cat = Category(name="Electronics", description="Test category")
    db_session.add(cat)
    db_session.commit()
    db_session.refresh(cat)
    cat_id = cat.id

    # 2. Create Product
    prod_payload = {
        "name": "Test Flagship Smartphone",
        "category_id": cat_id,
        "price": 899.99,
        "cost": 500.00,
        "sku": "TEST-SKU-01",
        "current_stock": 25,
        "reorder_point": 5,
        "description": "High-end smartphone for API test cases"
    }
    
    create_res = client.post("/api/v1/products", json=prod_payload, headers=auth_headers)
    assert create_res.status_code == 201
    prod_data = create_res.json()
    assert prod_data["sku"] == "TEST-SKU-01"
    prod_id = prod_data["id"]

    # 3. Retrieve Product
    get_res = client.get(f"/api/v1/products/{prod_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Test Flagship Smartphone"

    # 4. Delete Product
    delete_res = client.delete(f"/api/v1/products/{prod_id}", headers=auth_headers)
    assert delete_res.status_code == 204
