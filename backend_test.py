#!/usr/bin/env python3
"""
Backend test for admin-managed payment settings endpoints
Tests requested:
1. GET /api/settings/{key} (public, no auth)
2. PUT /api/settings/{key} (admin only, requires Bearer JWT)
3. Auth guards on PUT endpoint
4. Light regression on core endpoints
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

def test_settings_endpoints():
    """Test new GET and PUT /api/settings/{key} endpoints"""
    print("\n" + "="*80)
    print("SETTINGS ENDPOINTS - GET & PUT /api/settings/{key}")
    print("="*80)
    
    passed = 0
    total = 0
    
    # TEST 1: GET /api/settings/some-random-nonexistent-key → 200 with { key, value: null }
    total += 1
    try:
        resp = requests.get(f"{API_URL}/settings/some-random-nonexistent-key", timeout=10)
        data = resp.json()
        has_key = data.get("key") == "some-random-nonexistent-key"
        has_null_value = data.get("value") is None
        if print_test("GET /api/settings/some-random-nonexistent-key returns { key, value: null }",
                     resp.status_code == 200 and has_key and has_null_value,
                     f"Response: {data}"):
            passed += 1
    except Exception as e:
        print_test("GET /api/settings/some-random-nonexistent-key returns { key, value: null }", False, str(e))
    
    # TEST 2: GET /api/settings/payment → 200 with { key: "payment", value: null | <object> }
    total += 1
    try:
        resp = requests.get(f"{API_URL}/settings/payment", timeout=10)
        data = resp.json()
        has_key = data.get("key") == "payment"
        # Value can be null or an object
        if print_test("GET /api/settings/payment returns { key: 'payment', value: null | <object> }",
                     resp.status_code == 200 and has_key,
                     f"Response: {json.dumps(data, indent=2)}"):
            passed += 1
    except Exception as e:
        print_test("GET /api/settings/payment returns { key: 'payment', value: null | <object> }", False, str(e))
    
    # Get admin token for PUT tests
    token = get_admin_token()
    if not token:
        print("❌ Cannot proceed with PUT tests without admin token")
        return passed, total
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # TEST 3: PUT /api/settings/payment WITHOUT Authorization header → non-2xx (404 expected)
    total += 1
    try:
        test_value = {
            "upiId": "test-store@paytm",
            "merchantName": "Test Store",
            "phone": "+91 99999 88888",
            "qrImageUrl": "",
            "instructions": "Send screenshot to WhatsApp"
        }
        resp = requests.put(f"{API_URL}/settings/payment", 
                           json={"value": test_value}, 
                           timeout=10)
        # Should NOT succeed (not 2xx)
        is_blocked = resp.status_code >= 400 or resp.status_code == 404
        if print_test("PUT /api/settings/payment WITHOUT Authorization → non-2xx",
                     is_blocked,
                     f"Status: {resp.status_code} (expected 404 or 401)"):
            passed += 1
    except Exception as e:
        print_test("PUT /api/settings/payment WITHOUT Authorization → non-2xx", False, str(e))
    
    # TEST 4: PUT /api/settings/payment WITH Authorization and body { value: {...} } → 200 { ok: true }
    total += 1
    try:
        test_value = {
            "upiId": "test-store@paytm",
            "merchantName": "Test Store",
            "phone": "+91 99999 88888",
            "qrImageUrl": "",
            "instructions": "Send screenshot to WhatsApp"
        }
        resp = requests.put(f"{API_URL}/settings/payment", 
                           json={"value": test_value}, 
                           headers=headers,
                           timeout=10)
        data = resp.json()
        if print_test("PUT /api/settings/payment WITH auth and { value: {...} } → 200 { ok: true }",
                     resp.status_code == 200 and data.get("ok") == True,
                     f"Response: {data}"):
            passed += 1
    except Exception as e:
        print_test("PUT /api/settings/payment WITH auth and { value: {...} } → 200 { ok: true }", False, str(e))
    
    # TEST 5: GET /api/settings/payment → verify saved value
    total += 1
    try:
        resp = requests.get(f"{API_URL}/settings/payment", timeout=10)
        data = resp.json()
        value = data.get("value", {})
        has_correct_value = (
            value.get("upiId") == "test-store@paytm" and
            value.get("merchantName") == "Test Store" and
            value.get("phone") == "+91 99999 88888" and
            value.get("qrImageUrl") == "" and
            value.get("instructions") == "Send screenshot to WhatsApp"
        )
        if print_test("GET /api/settings/payment returns saved value",
                     resp.status_code == 200 and has_correct_value,
                     f"Value: {json.dumps(value, indent=2)}"):
            passed += 1
    except Exception as e:
        print_test("GET /api/settings/payment returns saved value", False, str(e))
    
    # TEST 6: PUT with FLAT body (no "value" wrapper) → 200 { ok: true }
    total += 1
    try:
        flat_body = {
            "upiId": "flat@upi",
            "merchantName": "Flat Store"
        }
        resp = requests.put(f"{API_URL}/settings/payment", 
                           json=flat_body, 
                           headers=headers,
                           timeout=10)
        data = resp.json()
        if print_test("PUT /api/settings/payment with FLAT body (no 'value' wrapper) → 200 { ok: true }",
                     resp.status_code == 200 and data.get("ok") == True,
                     f"Response: {data}"):
            passed += 1
    except Exception as e:
        print_test("PUT /api/settings/payment with FLAT body (no 'value' wrapper) → 200 { ok: true }", False, str(e))
    
    # TEST 7: GET /api/settings/payment → verify flat body was saved
    total += 1
    try:
        resp = requests.get(f"{API_URL}/settings/payment", timeout=10)
        data = resp.json()
        value = data.get("value", {})
        has_flat_value = (
            value.get("upiId") == "flat@upi" and
            value.get("merchantName") == "Flat Store"
        )
        if print_test("GET /api/settings/payment returns flat body value",
                     resp.status_code == 200 and has_flat_value,
                     f"Value: {json.dumps(value, indent=2)}"):
            passed += 1
    except Exception as e:
        print_test("GET /api/settings/payment returns flat body value", False, str(e))
    
    # TEST 8: Restore original test value
    total += 1
    try:
        restore_value = {
            "upiId": "test-store@paytm",
            "merchantName": "Test Store",
            "phone": "+91 99999 88888",
            "qrImageUrl": "",
            "instructions": "Send screenshot to WhatsApp"
        }
        resp = requests.put(f"{API_URL}/settings/payment", 
                           json={"value": restore_value}, 
                           headers=headers,
                           timeout=10)
        data = resp.json()
        if print_test("Restore original test value → 200 { ok: true }",
                     resp.status_code == 200 and data.get("ok") == True,
                     f"Response: {data}"):
            passed += 1
    except Exception as e:
        print_test("Restore original test value → 200 { ok: true }", False, str(e))
    
    # TEST 9: PUT with INVALID token → non-2xx
    total += 1
    try:
        invalid_headers = {"Authorization": "Bearer garbage.token.here"}
        resp = requests.put(f"{API_URL}/settings/payment", 
                           json={"value": {"test": "data"}}, 
                           headers=invalid_headers,
                           timeout=10)
        is_blocked = resp.status_code >= 400 or resp.status_code == 404
        if print_test("PUT /api/settings/payment with INVALID token → non-2xx",
                     is_blocked,
                     f"Status: {resp.status_code} (expected 404 or 401)"):
            passed += 1
    except Exception as e:
        print_test("PUT /api/settings/payment with INVALID token → non-2xx", False, str(e))
    
    print(f"\nSettings Endpoints Tests: {passed}/{total} passed")
    return passed, total

def test_regression():
    """Light regression test on core endpoints"""
    print("\n" + "="*80)
    print("REGRESSION TESTS - Verify core endpoints still work")
    print("="*80)
    
    passed = 0
    total = 0
    
    # 1. GET /api/products?limit=3 → returns products
    total += 1
    try:
        resp = requests.get(f"{API_URL}/products?limit=3", timeout=10)
        products = resp.json().get("products", [])
        if print_test("GET /api/products?limit=3 returns products",
                     resp.status_code == 200 and len(products) > 0,
                     f"Got {len(products)} products"):
            passed += 1
    except Exception as e:
        print_test("GET /api/products?limit=3 returns products", False, str(e))
    
    # 2. POST /api/orders (COD) — create a fresh order, confirm JC-prefixed orderId
    total += 1
    try:
        order_data = {
            "customer": {
                "name": "Ananya Reddy",
                "email": "ananya.reddy@example.com",
                "phone": "9123456789",
                "address": "456 Brigade Road, Bangalore, Karnataka 560025"
            },
            "items": [
                {
                    "productId": "test-product-id",
                    "name": "Elegant Silk Saree",
                    "slug": "elegant-silk-saree",
                    "price": 5999,
                    "qty": 1,
                    "color": "Maroon",
                    "size": "Free Size"
                }
            ],
            "subtotal": 5999,
            "shipping": 0,
            "total": 5999,
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
    
    # 3. GET /api/orders/track/{orderId} → returns the order
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
    
    # 4. POST /api/admin/login (correct creds) → returns token
    total += 1
    try:
        resp = requests.post(f"{API_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }, timeout=10)
        data = resp.json()
        has_token = "token" in data
        if print_test("POST /api/admin/login returns token",
                     resp.status_code == 200 and has_token,
                     f"Token received: {has_token}"):
            passed += 1
    except Exception as e:
        print_test("POST /api/admin/login returns token", False, str(e))
    
    # 5. GET /api/admin/stats (with token) → returns stats
    total += 1
    token = get_admin_token()
    if token:
        try:
            headers = {"Authorization": f"Bearer {token}"}
            resp = requests.get(f"{API_URL}/admin/stats", headers=headers, timeout=10)
            data = resp.json()
            stats = data.get("stats", {})
            has_required_fields = all(k in stats for k in ["totalOrders", "todaysOrders", "totalRevenue", "todaysRevenue", "pending", "delivered", "productCount", "categoryCount"])
            if print_test("GET /api/admin/stats returns stats",
                         resp.status_code == 200 and has_required_fields,
                         f"Stats: totalOrders={stats.get('totalOrders')}, productCount={stats.get('productCount')}, categoryCount={stats.get('categoryCount')}"):
                passed += 1
        except Exception as e:
            print_test("GET /api/admin/stats returns stats", False, str(e))
    else:
        print_test("GET /api/admin/stats returns stats", False, "No admin token")
    
    print(f"\nRegression Tests: {passed}/{total} passed")
    return passed, total

def main():
    print("="*80)
    print("JEEVIKAA COUTURE - PAYMENT SETTINGS ENDPOINTS TEST")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    
    total_passed = 0
    total_tests = 0
    
    # Run all test groups
    p, t = test_settings_endpoints()
    total_passed += p
    total_tests += t
    
    p, t = test_regression()
    total_passed += p
    total_tests += t
    
    # Final summary
    print("\n" + "="*80)
    print("FINAL SUMMARY")
    print("="*80)
    print(f"Total: {total_passed}/{total_tests} tests passed ({int(total_passed/total_tests*100) if total_tests > 0 else 0}%)")
    
    if total_passed == total_tests:
        print("✅ ALL TESTS PASSED")
        sys.exit(0)
    else:
        print(f"❌ {total_tests - total_passed} TESTS FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
