#!/usr/bin/env python3
"""
Backend regression + new category endpoints test for Jeevikaa Couture
Tests requested:
1. Regression: existing endpoints after .next cache clear
2. New: PUT /api/categories/{id}
3. New: DELETE /api/categories/{id}
4. Auth guards on new endpoints
5. ChunkLoadError verification
"""
import requests
import json
import sys

BASE_URL = "https://jeevikaa-fashion.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@jeevikaacouture.com"
ADMIN_PASSWORD = "Jeevikaa@2025"

# Global variable to store order ID for tracking test
TEST_ORDER_ID = None

def print_test(name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if details:
        print(f"   {details}")
    return passed

def get_admin_token():
    """Login and get JWT token"""
    try:
        resp = requests.post(f"{API_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            return data.get("token")
        return None
    except Exception as e:
        print(f"❌ Failed to get admin token: {e}")
        return None

def test_regression():
    """Test existing endpoints still work after cache clear"""
    print("\n" + "="*80)
    print("REGRESSION TESTS - Verify existing endpoints after .next cache clear")
    print("="*80)
    
    passed = 0
    total = 0
    
    # 1. GET /api/products - should return 8+ products
    total += 1
    try:
        resp = requests.get(f"{API_URL}/products", timeout=10)
        products = resp.json().get("products", [])
        if print_test("GET /api/products returns 8+ products", 
                     resp.status_code == 200 and len(products) >= 8,
                     f"Got {len(products)} products"):
            passed += 1
    except Exception as e:
        print_test("GET /api/products returns 8+ products", False, str(e))
    
    # 2. GET /api/products/rose-blush-silk-saree - should return product + related
    total += 1
    try:
        resp = requests.get(f"{API_URL}/products/rose-blush-silk-saree", timeout=10)
        data = resp.json()
        has_product = "product" in data
        has_related = "related" in data
        if print_test("GET /api/products/rose-blush-silk-saree returns product + related",
                     resp.status_code == 200 and has_product and has_related,
                     f"Product: {has_product}, Related: {has_related}"):
            passed += 1
    except Exception as e:
        print_test("GET /api/products/rose-blush-silk-saree returns product + related", False, str(e))
    
    # 3. POST /api/orders (COD) - should create order with JC-prefixed orderId
    total += 1
    try:
        order_data = {
            "customer": {
                "name": "Priya Sharma",
                "email": "priya.sharma@example.com",
                "phone": "9876543210",
                "address": "123 MG Road, Bangalore, Karnataka 560001"
            },
            "items": [
                {
                    "productId": "test-product-id",
                    "name": "Test Saree",
                    "slug": "test-saree",
                    "price": 4999,
                    "qty": 1,
                    "color": "Red",
                    "size": "Free Size"
                }
            ],
            "subtotal": 4999,
            "shipping": 0,
            "total": 4999,
            "paymentMethod": "cod"
        }
        resp = requests.post(f"{API_URL}/orders", json=order_data, timeout=10)
        data = resp.json()
        order_id = data.get("order", {}).get("orderId", "")
        is_jc_format = order_id.startswith("JC") and len(order_id) == 14
        if print_test("POST /api/orders (COD) creates order with JC-prefixed orderId",
                     resp.status_code == 200 and is_jc_format,
                     f"OrderId: {order_id}"):
            passed += 1
            # Save for tracking test
            global TEST_ORDER_ID
            TEST_ORDER_ID = order_id
    except Exception as e:
        print_test("POST /api/orders (COD) creates order with JC-prefixed orderId", False, str(e))
        TEST_ORDER_ID = None
    
    # 4. GET /api/orders/track/{orderId} - should return the order
    total += 1
    if TEST_ORDER_ID:
        try:
            resp = requests.get(f"{API_URL}/orders/track/{TEST_ORDER_ID}", timeout=10)
            data = resp.json()
            has_order = "order" in data
            if print_test(f"GET /api/orders/track/{TEST_ORDER_ID} returns the order",
                         resp.status_code == 200 and has_order,
                         f"Order found: {has_order}"):
                passed += 1
        except Exception as e:
            print_test(f"GET /api/orders/track/{TEST_ORDER_ID} returns the order", False, str(e))
    else:
        print_test("GET /api/orders/track/{orderId} returns the order", False, "No orderId from previous test")
    
    # 5. POST /api/admin/login - should return JWT
    total += 1
    try:
        resp = requests.post(f"{API_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }, timeout=10)
        data = resp.json()
        has_token = "token" in data
        if print_test("POST /api/admin/login returns JWT",
                     resp.status_code == 200 and has_token,
                     f"Token received: {has_token}"):
            passed += 1
    except Exception as e:
        print_test("POST /api/admin/login returns JWT", False, str(e))
    
    print(f"\nRegression Tests: {passed}/{total} passed")
    return passed, total

def test_new_category_endpoints():
    """Test new PUT and DELETE category endpoints"""
    print("\n" + "="*80)
    print("NEW ENDPOINTS - PUT & DELETE /api/categories/{id}")
    print("="*80)
    
    passed = 0
    total = 0
    
    # Get admin token
    token = get_admin_token()
    if not token:
        print("❌ Cannot proceed without admin token")
        return 0, 0
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get existing categories to pick one for update test
    try:
        resp = requests.get(f"{API_URL}/categories", timeout=10)
        categories = resp.json().get("categories", [])
        if not categories:
            print("❌ No categories found for testing")
            return 0, 0
        
        # Pick first category (likely "Sarees")
        test_category = categories[0]
        category_id = test_category.get("id")
        original_name = test_category.get("name")
        original_description = test_category.get("description", "")
        
        print(f"\nUsing category: {original_name} (ID: {category_id})")
        
    except Exception as e:
        print(f"❌ Failed to get categories: {e}")
        return 0, 0
    
    # TEST 1: PUT /api/categories/{id} - Update category
    total += 1
    try:
        update_data = {
            "name": f"{original_name} Updated",
            "description": "Updated description for test"
        }
        resp = requests.put(f"{API_URL}/categories/{category_id}", 
                           json=update_data, 
                           headers=headers, 
                           timeout=10)
        data = resp.json()
        if print_test(f"PUT /api/categories/{category_id} updates category",
                     resp.status_code == 200 and data.get("ok") == True,
                     f"Response: {data}"):
            passed += 1
            
            # Verify the update
            resp_verify = requests.get(f"{API_URL}/categories", timeout=10)
            updated_cats = resp_verify.json().get("categories", [])
            updated_cat = next((c for c in updated_cats if c.get("id") == category_id), None)
            
            if updated_cat:
                name_updated = updated_cat.get("name") == f"{original_name} Updated"
                desc_updated = updated_cat.get("description") == "Updated description for test"
                print(f"   Verification: Name updated={name_updated}, Description updated={desc_updated}")
            
            # Restore original values
            restore_data = {
                "name": original_name,
                "description": original_description
            }
            requests.put(f"{API_URL}/categories/{category_id}", 
                        json=restore_data, 
                        headers=headers, 
                        timeout=10)
            print(f"   Restored original values")
    except Exception as e:
        print_test(f"PUT /api/categories/{category_id} updates category", False, str(e))
    
    # TEST 2: Create temporary category for deletion test
    temp_category_id = None
    try:
        create_data = {
            "name": "Test Category To Delete",
            "slug": "test-cat-delete-abc",
            "description": "temp",
            "status": "active"
        }
        resp = requests.post(f"{API_URL}/categories", 
                            json=create_data, 
                            headers=headers, 
                            timeout=10)
        if resp.status_code == 200:
            temp_category_id = resp.json().get("category", {}).get("id")
            print(f"\n✅ Created temporary category (ID: {temp_category_id})")
    except Exception as e:
        print(f"❌ Failed to create temporary category: {e}")
    
    # TEST 3: DELETE /api/categories/{id}
    total += 1
    if temp_category_id:
        try:
            resp = requests.delete(f"{API_URL}/categories/{temp_category_id}", 
                                  headers=headers, 
                                  timeout=10)
            data = resp.json()
            if print_test(f"DELETE /api/categories/{temp_category_id} deletes category",
                         resp.status_code == 200 and data.get("ok") == True,
                         f"Response: {data}"):
                passed += 1
                
                # Verify deletion
                resp_verify = requests.get(f"{API_URL}/categories", timeout=10)
                remaining_cats = resp_verify.json().get("categories", [])
                still_exists = any(c.get("id") == temp_category_id for c in remaining_cats)
                print(f"   Verification: Category still exists={still_exists} (should be False)")
        except Exception as e:
            print_test(f"DELETE /api/categories/{temp_category_id} deletes category", False, str(e))
    else:
        print_test("DELETE /api/categories/{id} deletes category", False, "No temp category created")
    
    print(f"\nNew Endpoints Tests: {passed}/{total} passed")
    return passed, total

def test_auth_guards():
    """Test that new endpoints require authentication"""
    print("\n" + "="*80)
    print("AUTH GUARD TESTS - New endpoints should reject unauthenticated requests")
    print("="*80)
    
    passed = 0
    total = 0
    
    # Get a category ID for testing
    try:
        resp = requests.get(f"{API_URL}/categories", timeout=10)
        categories = resp.json().get("categories", [])
        if categories:
            test_id = categories[0].get("id")
        else:
            print("❌ No categories found for auth guard testing")
            return 0, 0
    except Exception as e:
        print(f"❌ Failed to get categories: {e}")
        return 0, 0
    
    # TEST 1: PUT without auth should fail
    total += 1
    try:
        resp = requests.put(f"{API_URL}/categories/{test_id}", 
                           json={"name": "Should Fail"}, 
                           timeout=10)
        # Should NOT succeed (not 2xx)
        is_blocked = resp.status_code >= 400 or resp.status_code == 404
        if print_test("PUT /api/categories/{id} WITHOUT auth is blocked",
                     is_blocked,
                     f"Status: {resp.status_code} (expected 401/404/4xx)"):
            passed += 1
    except Exception as e:
        print_test("PUT /api/categories/{id} WITHOUT auth is blocked", False, str(e))
    
    # TEST 2: DELETE without auth should fail
    total += 1
    try:
        resp = requests.delete(f"{API_URL}/categories/{test_id}", timeout=10)
        # Should NOT succeed (not 2xx)
        is_blocked = resp.status_code >= 400 or resp.status_code == 404
        if print_test("DELETE /api/categories/{id} WITHOUT auth is blocked",
                     is_blocked,
                     f"Status: {resp.status_code} (expected 401/404/4xx)"):
            passed += 1
    except Exception as e:
        print_test("DELETE /api/categories/{id} WITHOUT auth is blocked", False, str(e))
    
    print(f"\nAuth Guard Tests: {passed}/{total} passed")
    return passed, total

def test_chunk_error_fix():
    """Verify ChunkLoadError is fixed"""
    print("\n" + "="*80)
    print("CHUNK ERROR FIX - Verify /checkout page loads without ChunkLoadError")
    print("="*80)
    
    passed = 0
    total = 0
    
    # TEST 1: GET /checkout should return 200 with valid HTML
    total += 1
    try:
        resp = requests.get(f"{BASE_URL}/checkout", timeout=10)
        is_html = "text/html" in resp.headers.get("content-type", "")
        has_content = len(resp.text) > 0
        no_chunk_error = "ChunkLoadError" not in resp.text
        
        if print_test("GET /checkout returns 200 with valid HTML (no ChunkLoadError)",
                     resp.status_code == 200 and is_html and has_content and no_chunk_error,
                     f"Status: {resp.status_code}, HTML: {is_html}, No ChunkLoadError: {no_chunk_error}"):
            passed += 1
    except Exception as e:
        print_test("GET /checkout returns 200 with valid HTML (no ChunkLoadError)", False, str(e))
    
    print(f"\nChunk Error Fix Tests: {passed}/{total} passed")
    return passed, total

def main():
    print("="*80)
    print("JEEVIKAA COUTURE - BACKEND REGRESSION + NEW ENDPOINTS TEST")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    
    total_passed = 0
    total_tests = 0
    
    # Run all test groups
    p, t = test_regression()
    total_passed += p
    total_tests += t
    
    p, t = test_new_category_endpoints()
    total_passed += p
    total_tests += t
    
    p, t = test_auth_guards()
    total_passed += p
    total_tests += t
    
    p, t = test_chunk_error_fix()
    total_passed += p
    total_tests += t
    
    # Final summary
    print("\n" + "="*80)
    print("FINAL SUMMARY")
    print("="*80)
    print(f"Total: {total_passed}/{total_tests} tests passed ({int(total_passed/total_tests*100)}%)")
    
    if total_passed == total_tests:
        print("✅ ALL TESTS PASSED")
        sys.exit(0)
    else:
        print(f"❌ {total_tests - total_passed} TESTS FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
