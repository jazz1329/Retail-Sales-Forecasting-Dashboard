def test_register_user(client):
    # Test signup
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "testadmin@retail.com",
            "full_name": "Test Admin",
            "password": "testpassword",
            "role": "Admin"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testadmin@retail.com"
    assert data["role"] == "Admin"
    assert "id" in data

def test_login_user(client):
    # Register first user (gets Admin role by default)
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "firstuser@retail.com",
            "full_name": "First User",
            "password": "firstpassword",
            "role": "Admin"
        }
    )
    
    # Register second user (gets requested Manager role)
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "testmanager@retail.com",
            "full_name": "Test Manager",
            "password": "managerpwd",
            "role": "Manager"
        }
    )
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "testmanager@retail.com",
            "password": "managerpwd"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "testmanager@retail.com"
    assert data["user"]["role"] == "Manager"

def test_login_invalid_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "nonexistent@retail.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"
