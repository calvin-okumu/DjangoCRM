#!/usr/bin/env python
"""
DjangoCRM API Testing Script
Tests all authentication methods and API endpoints
"""
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_auth_methods():
    """Test the auth-methods endpoint"""
    print("🔍 Testing auth-methods endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/auth-methods/")
        if response.status_code == 200:
            data = response.json()
            print("✅ Auth methods endpoint working")
            print(f"   Traditional auth: {data['traditional']['endpoint']}")
            print(f"   OAuth providers: {list(data['oauth']['providers'].keys())}")
            return True
        else:
            print(f"❌ Auth methods failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Auth methods error: {e}")
        return False

def test_traditional_login(email="admin@example.com", password="admin123"):
    """Test traditional email/password login"""
    print(f"\n🔐 Testing traditional login for user: {email}")
    try:
        response = requests.post(
            f"{BASE_URL}/api/login/",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
            print("✅ Traditional login successful")
            print(f"   Token: {token[:20]}...")
            return token
        else:
            print(f"❌ Traditional login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Traditional login error: {e}")
        return None

def test_api_with_token(token, endpoint="/api/tenants/"):
    """Test API endpoint with token authentication"""
    print(f"\n📡 Testing API endpoint: {endpoint}")
    try:
        response = requests.get(
            f"{BASE_URL}{endpoint}",
            headers={
                "Authorization": f"Token {token}",
                "Content-Type": "application/json"
            }
        )

        if response.status_code == 200:
            data = response.json()
            print("✅ API access successful")
            if isinstance(data, list):
                print(f"   Returned {len(data)} items")
                return data
            else:
                print(f"   Response keys: {list(data.keys()) if isinstance(data, dict) else 'N/A'}")
                return data
        else:
            print(f"❌ API access failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ API test error: {e}")
        return None

def test_unauthorized_access(endpoint="/api/tenants/"):
    """Test that unauthorized access is properly blocked"""
    print(f"\n🚫 Testing unauthorized access to: {endpoint}")
    try:
        response = requests.get(f"{BASE_URL}{endpoint}")

        if response.status_code == 401:
            print("✅ Unauthorized access properly blocked")
            return True
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Unauthorized access test error: {e}")
        return False

def test_post_project(token):
    """Test posting a new project"""
    print("\n📝 Testing POST project...")

    # First get a client
    clients = test_api_with_token(token, "/api/clients/")
    if not clients or len(clients) == 0:
        print("❌ No clients found to associate project with")
        return False

    client_id = clients[0]['id']
    print(f"   Using client ID: {client_id}")

    project_data = {
        "name": "Test Project from API",
        "client": client_id,
        "status": "planning",
        "priority": "medium",
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "budget": 5000,  # Test without decimal places
        "description": "A test project created via API",
        "tags": "api,test,automation"
    }

    try:
        response = requests.post(
            f"{BASE_URL}/api/projects/",
            json=project_data,
            headers={
                "Authorization": f"Token {token}",
                "Content-Type": "application/json"
            }
        )

        if response.status_code == 201:
            data = response.json()
            print("✅ Project created successfully")
            print(f"   Project ID: {data.get('id')}")
            print(f"   Project name: {data.get('name')}")
            return True
        else:
            print(f"❌ Project creation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Project creation error: {e}")
        return False

def test_oauth_redirects():
    """Test OAuth login redirects"""
    print("\n🌐 Testing OAuth redirects...")

    providers = ['google', 'github']
    for provider in providers:
        try:
            response = requests.get(f"{BASE_URL}/accounts/{provider}/login/", allow_redirects=False)
            if response.status_code in [302, 301]:
                print(f"✅ {provider.capitalize()} OAuth redirect working")
            else:
                print(f"⚠️  {provider.capitalize()} OAuth: Unexpected status {response.status_code}")
        except Exception as e:
            print(f"❌ {provider.capitalize()} OAuth test error: {e}")

def create_test_user():
    """Create a test user for testing"""
    print("\n👤 Creating test user...")
    try:
        import os
        import django

        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saasCRM.settings')
        django.setup()

        from accounts.models import CustomUser, Tenant, UserTenant
        from django.contrib.auth.models import Group

        user, created = CustomUser.objects.get_or_create(
            email='test@example.com',
            defaults={
                'username': 'testuser',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            print("✅ Test user created: test@example.com / password123")
        else:
            print("ℹ️  Test user already exists")

        # Ensure in required groups
        groups = ['Client Management Administrators', 'Business Strategy Administrators', 'API Control Administrators']
        for group_name in groups:
            group, _ = Group.objects.get_or_create(name=group_name)
            if not user.groups.filter(name=group_name).exists():
                user.groups.add(group)
                print(f"   Added to group: {group_name}")

        # Create or get a default tenant and link user to it
        tenant, tenant_created = Tenant.objects.get_or_create(
            name='Test Tenant',
            defaults={
                'domain': 'test.example.com',
                'address': '123 Test St',
                'phone': '555-1234',
                'website': 'https://test.example.com',
                'industry': 'Technology',
                'company_size': '11-50'
            }
        )
        if tenant_created:
            print("✅ Default tenant created: Test Tenant")
        else:
            print("ℹ️  Default tenant already exists")

        # Link user to tenant
        user_tenant, ut_created = UserTenant.objects.get_or_create(
            user=user,
            tenant=tenant,
            defaults={
                'is_owner': True,
                'is_approved': True,
                'role': 'Tenant Owner'
            }
        )
        if ut_created:
            print("✅ User linked to tenant: Test Tenant")
        else:
            print("ℹ️  User already linked to tenant")

        # Create a test client for the tenant
        from project.models import Client
        client, client_created = Client.objects.get_or_create(
            email='testclient@example.com',
            defaults={
                'name': 'Test Client',
                'phone': '555-5678',
                'status': 'active',
                'tenant': tenant
            }
        )
        if client_created:
            print("✅ Test client created: Test Client")
        else:
            print("ℹ️  Test client already exists")

        return True
    except Exception as e:
        print(f"❌ Failed to create test user: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 DjangoCRM API Testing Suite")
    print("=" * 40)

    # Test 1: Environment and server
    print("🌐 Server should be running on http://127.0.0.1:8001")

    # Test 1: Create test user
    create_test_user()

    # Test 2: Auth methods endpoint
    auth_methods_ok = test_auth_methods()

    # Test 3: Unauthorized access
    unauthorized_ok = test_unauthorized_access()

    # Test 4: Traditional login
    token = test_traditional_login(email="test@example.com", password="password123")

    # Test 5: API access with token
    api_ok = False
    if token:
        api_ok = test_api_with_token(token) is not None

    # Test 6: POST project
    project_ok = False
    if token:
        project_ok = test_post_project(token)

    # Test 7: OAuth redirects
    test_oauth_redirects()

    # Summary
    print("\n" + "=" * 40)
    print("📊 Test Results Summary:")
    print(f"   Auth methods: {'✅' if auth_methods_ok else '❌'}")
    print(f"   Unauthorized blocking: {'✅' if unauthorized_ok else '❌'}")
    print(f"   Traditional login: {'✅' if token else '❌'}")
    print(f"   API access: {'✅' if api_ok else '❌'}")
    print(f"   Project creation: {'✅' if project_ok else '❌'}")

    if auth_methods_ok and unauthorized_ok and token and api_ok and project_ok:
        print("\n🎉 All tests passed! Your API is working correctly.")
        print("\nNext steps:")
        print("1. Configure real OAuth credentials in .env")
        print("2. Test OAuth login in browser")
        print("3. Test more API endpoints")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
        sys.exit(1)

if __name__ == '__main__':
    main()