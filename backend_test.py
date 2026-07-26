#!/usr/bin/env python3
"""
Backend API test suite for Jeevikaa Couture - POST /api/upload endpoint + light regression
Tests the new image upload endpoint and verifies existing endpoints still work.
"""

import requests
import io
import re
from PIL import Image

# Base URL from .env
BASE_URL = "https://jeevikaa-fashion.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@jeevikaacouture.com"
ADMIN_PASSWORD = "Jeevikaa@2025"

def create_small_png(width=10, height=10, color=(255, 0, 0)):
    """Create a small valid PNG image in memory"""
    img = Image.new('RGB', (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return buf

def create_small_jpeg(width=10, height=10, color=(0, 255, 0)):
    """Create a small valid JPEG image in memory"""
    img = Image.new('RGB', (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    buf.seek(0)
    return buf

def create_large_file(size_mb=4):
    """Create a large dummy file (binary data)"""
    buf = io.BytesIO()
    buf.write(b'\xFF\xD8\xFF\xE0' + b'\x00' * (size_mb * 1024 * 1024 - 4))  # JPEG header + padding
    buf.seek(0)
    return buf

def create_text_file(content="hello world"):
    """Create a text file"""
    buf = io.BytesIO()
    buf.write(content.encode('utf-8'))
    buf.seek(0)
    return buf

def test_upload_endpoint():
    """Test POST /api/upload endpoint with all validation cases"""
    print("\n" + "="*80)
    print("TESTING POST /api/upload ENDPOINT")
    print("="*80)
    
    # First, login to get admin token
    print("\n[SETUP] Logging in as admin to get Bearer token...")
    try:
        login_resp = requests.post(f"{BASE_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }, timeout=10)
        
        if login_resp.status_code != 200:
            print(f"❌ SETUP FAILED: Admin login returned {login_resp.status_code}")
            print(f"   Response: {login_resp.text}")
            return False
        
        token = login_resp.json().get('token')
        if not token:
            print(f"❌ SETUP FAILED: No token in login response")
            return False
        
        print(f"✅ Admin login successful, token obtained")
    except Exception as e:
        print(f"❌ SETUP FAILED: {e}")
        return False
    
    all_passed = True
    
    # TEST 1: Auth guard - no Authorization header
    print("\n[TEST 1] POST /api/upload WITHOUT Authorization header")
    try:
        png_file = create_small_png()
        resp = requests.post(
            f"{BASE_URL}/upload",
            files={'file': ('test.png', png_file, 'image/png')},
            timeout=10
        )
        
        if resp.status_code == 404:
            print(f"✅ PASS: Returns 404 without auth (expected)")
        elif resp.status_code >= 400:
            print(f"✅ PASS: Returns {resp.status_code} without auth (non-2xx as expected)")
        else:
            print(f"❌ FAIL: Expected non-2xx, got {resp.status_code}")
            all_passed = False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        all_passed = False
    
    # TEST 2: Auth guard - invalid token
    print("\n[TEST 2] POST /api/upload with invalid Bearer token")
    try:
        png_file = create_small_png()
        resp = requests.post(
            f"{BASE_URL}/upload",
            files={'file': ('test.png', png_file, 'image/png')},
            headers={'Authorization': 'Bearer garbage.token.here'},
            timeout=10
        )
        
        if resp.status_code == 404:
            print(f"✅ PASS: Returns 404 with invalid token (expected)")
        elif resp.status_code >= 400:
            print(f"✅ PASS: Returns {resp.status_code} with invalid token (non-2xx as expected)")
        else:
            print(f"❌ FAIL: Expected non-2xx, got {resp.status_code}")
            all_passed = False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        all_passed = False
    
    # TEST 3: Happy path - valid PNG upload
    print("\n[TEST 3] Happy path: POST /api/upload with valid PNG and admin token")
    try:
        png_file = create_small_png()
        resp = requests.post(
            f"{BASE_URL}/upload",
            files={'file': ('test.png', png_file, 'image/png')},
            headers={'Authorization': f'Bearer {token}'},
            timeout=10
        )
        
        if resp.status_code == 200:
            data = resp.json()
            if all(k in data for k in ['url', 'key', 'size', 'type']):
                print(f"✅ PASS: Returns 200 with required fields")
                print(f"   url: {data['url'][:80]}...")
                print(f"   key: {data['key']}")
                print(f"   size: {data['size']} bytes")
                print(f"   type: {data['type']}")
                
                # Verify URL format
                if data['url'].startswith('https://') and '/storage/v1/object/public/media/products/' in data['url']:
                    print(f"✅ PASS: URL format correct (contains /storage/v1/object/public/media/products/)")
                else:
                    print(f"❌ FAIL: URL format incorrect: {data['url']}")
                    all_passed = False
                
                # Verify type
                if data['type'] == 'image/png':
                    print(f"✅ PASS: Type is 'image/png'")
                else:
                    print(f"❌ FAIL: Expected type 'image/png', got '{data['type']}'")
                    all_passed = False
                
                # TEST 3b: Verify public accessibility
                print(f"\n[TEST 3b] GET uploaded URL to verify public accessibility")
                try:
                    url_resp = requests.get(data['url'], timeout=10)
                    if url_resp.status_code == 200 and len(url_resp.content) > 0:
                        print(f"✅ PASS: URL is publicly accessible (200, {len(url_resp.content)} bytes)")
                    else:
                        print(f"❌ FAIL: URL returned {url_resp.status_code} or empty content")
                        all_passed = False
                except Exception as e:
                    print(f"❌ FAIL: Could not access URL: {e}")
                    all_passed = False
            else:
                print(f"❌ FAIL: Missing required fields in response: {data}")
                all_passed = False
        else:
            print(f"❌ FAIL: Expected 200, got {resp.status_code}")
            print(f"   Response: {resp.text}")
            all_passed = False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        all_passed = False
    
    # TEST 4: Validation - file too large
    print("\n[TEST 4] Validation: POST /api/upload with 4 MB file (exceeds 3 MB limit)")
    try:
        large_file = create_large_file(4)
        resp = requests.post(
            f"{BASE_URL}/upload",
            files={'file': ('large.jpg', large_file, 'image/jpeg')},
            headers={'Authorization': f'Bearer {token}'},
            timeout=10
        )
        
        if resp.status_code == 400:
            data = resp.json()
            error_msg = data.get('error', '')
            if 'File too large' in error_msg and 'Max 3MB' in error_msg:
                print(f"✅ PASS: Returns 400 with correct error message")
                print(f"   Error: {error_msg}")
            else:
                print(f"❌ FAIL: Error message doesn't contain expected text")
                print(f"   Expected: 'File too large' and 'Max 3MB'")
                print(f"   Got: {error_msg}")
                all_passed = False
        else:
            print(f"❌ FAIL: Expected 400, got {resp.status_code}")
            print(f"   Response: {resp.text}")
            all_passed = False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        all_passed = False
    
    # TEST 5: Validation - non-image file
    print("\n[TEST 5] Validation: POST /api/upload with text/plain file")
    try:
        text_file = create_text_file("hello world")
        resp = requests.post(
            f"{BASE_URL}/upload",
            files={'file': ('test.txt', text_file, 'text/plain')},
            headers={'Authorization': f'Bearer {token}'},
            timeout=10
        )
        
        if resp.status_code == 400:
            data = resp.json()
            error_msg = data.get('error', '')
            if 'Only image files allowed' in error_msg:
                print(f"✅ PASS: Returns 400 with correct error message")
                print(f"   Error: {error_msg}")
            else:
                print(f"❌ FAIL: Error message doesn't contain 'Only image files allowed'")
                print(f"   Got: {error_msg}")
                all_passed = False
        else:
            print(f"❌ FAIL: Expected 400, got {resp.status_code}")
            print(f"   Response: {resp.text}")
            all_passed = False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        all_passed = False
    
    # TEST 6: Validation - no file field
    print("\n[TEST 6] Validation: POST /api/upload with empty multipart body (no 'file' field)")
    try:
        # Send multipart with a different field name (not 'file')
        resp = requests.post(
            f"{BASE_URL}/upload",
            files={'notfile': ('test.txt', io.BytesIO(b'test'), 'text/plain')},
            headers={'Authorization': f'Bearer {token}'},
            timeout=10
        )
        
        if resp.status_code == 400:
            data = resp.json()
            error_msg = data.get('error', '')
            if 'No file provided' in error_msg:
                print(f"✅ PASS: Returns 400 with correct error message")
                print(f"   Error: {error_msg}")
            else:
                print(f"❌ FAIL: Error message doesn't contain 'No file provided'")
                print(f"   Got: {error_msg}")
                all_passed = False
        else:
            print(f"❌ FAIL: Expected 400, got {resp.status_code}")
            print(f"   Response: {resp.text}")
            all_passed = False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        all_passed = False
    
    # TEST 7: Happy path - valid JPEG upload
    print("\n[TEST 7] Happy path: POST /api/upload with valid JPEG and admin token")
    try:
        jpeg_file = create_small_jpeg()
        resp = requests.post(
            f"{BASE_URL}/upload",
            files={'file': ('test.jpg', jpeg_file, 'image/jpeg')},
            headers={'Authorization': f'Bearer {token}'},
            timeout=10
        )
        
        if resp.status_code == 200:
            data = resp.json()
            if all(k in data for k in ['url', 'key', 'size', 'type']):
                print(f"✅ PASS: Returns 200 with required fields")
                print(f"   url: {data['url'][:80]}...")
                print(f"   key: {data['key']}")
                print(f"   size: {data['size']} bytes")
                print(f"   type: {data['type']}")
                
                # Verify type
                if data['type'] == 'image/jpeg':
                    print(f"✅ PASS: Type is 'image/jpeg'")
                else:
                    print(f"❌ FAIL: Expected type 'image/jpeg', got '{data['type']}'")
                    all_passed = False
                
                # TEST 7b: Verify public accessibility
                print(f"\n[TEST 7b] GET uploaded JPEG URL to verify public accessibility")
                try:
                    url_resp = requests.get(data['url'], timeout=10)
                    if url_resp.status_code == 200 and len(url_resp.content) > 0:
                        print(f"✅ PASS: JPEG URL is publicly accessible (200, {len(url_resp.content)} bytes)")
                    else:
                        print(f"❌ FAIL: URL returned {url_resp.status_code} or empty content")
                        all_passed = False
                except Exception as e:
                    print(f"❌ FAIL: Could not access URL: {e}")
                    all_passed = False
            else:
                print(f"❌ FAIL: Missing required fields in response: {data}")
                all_passed = False
        else:
            print(f"❌ FAIL: Expected 200, got {resp.status_code}")
            print(f"   Response: {resp.text}")
            all_passed = False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        all_passed = False
    
    return all_passed

def test_regression():
    """Light regression tests to ensure existing endpoints still work"""
    print("\n" + "="*80)
    print("LIGHT REGRESSION TESTS")
    print("="*80)
    
    all_passed = True
    
    # TEST 8: Admin login
    print("\n[TEST 8] POST /api/admin/login with correct credentials")
    try:
        resp = requests.post(f"{BASE_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            if 'token' in data:
                print(f"✅ PASS: Returns 200 with token")
                admin_token = data['token']
            else:
                print(f"❌ FAIL: No token in response")
                all_passed = False
                admin_token = None
        else:
            print(f"❌ FAIL: Expected 200, got {resp.status_code}")
            all_passed = False
            admin_token = None
    except Exception as e:
        print(f"❌ FAIL: {e}")
        all_passed = False
        admin_token = None
    
    # TEST 9: Products list
    print("\n[TEST 9] GET /api/products?limit=3")
    try:
        resp = requests.get(f"{BASE_URL}/products?limit=3", timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            products = data.get('products', [])
            if len(products) >= 3:
                print(f"✅ PASS: Returns 200 with {len(products)} products (≥3)")
            else:
                print(f"❌ FAIL: Expected ≥3 products, got {len(products)}")
                all_passed = False
        else:
            print(f"❌ FAIL: Expected 200, got {resp.status_code}")
            all_passed = False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        all_passed = False
    
    # TEST 10: Categories list
    print("\n[TEST 10] GET /api/categories")
    try:
        resp = requests.get(f"{BASE_URL}/categories", timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            categories = data.get('categories', [])
            if len(categories) >= 6:
                print(f"✅ PASS: Returns 200 with {len(categories)} categories (≥6)")
            else:
                print(f"❌ FAIL: Expected ≥6 categories, got {len(categories)}")
                all_passed = False
        else:
            print(f"❌ FAIL: Expected 200, got {resp.status_code}")
            all_passed = False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        all_passed = False
    
    # TEST 11: Order placement (COD)
    print("\n[TEST 11] POST /api/orders (COD) with minimal body")
    try:
        order_data = {
            "customer": {
                "name": "Priya Sharma",
                "email": "priya.sharma@example.com",
                "phone": "+91 98765 43210"
            },
            "items": [
                {
                    "productId": "test-product-id",
                    "name": "Test Saree",
                    "slug": "test-saree",
                    "price": 4999,
                    "quantity": 1,
                    "selectedColor": "Red",
                    "selectedSize": "Free Size"
                }
            ],
            "shippingAddress": {
                "street": "123 MG Road",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001",
                "country": "India"
            },
            "paymentMethod": "cod"
        }
        
        resp = requests.post(f"{BASE_URL}/orders", json=order_data, timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            order_id = data.get('order', {}).get('orderId')
            if order_id and re.match(r'^JC\d{12}$', order_id):
                print(f"✅ PASS: Returns 200 with orderId matching /^JC\\d{{12}}$/")
                print(f"   orderId: {order_id}")
                test_order_id = order_id
            else:
                print(f"❌ FAIL: orderId doesn't match pattern /^JC\\d{{12}}$/")
                print(f"   Got: {order_id}")
                all_passed = False
                test_order_id = None
        else:
            print(f"❌ FAIL: Expected 200, got {resp.status_code}")
            print(f"   Response: {resp.text}")
            all_passed = False
            test_order_id = None
    except Exception as e:
        print(f"❌ FAIL: {e}")
        all_passed = False
        test_order_id = None
    
    # TEST 12: Order tracking
    if test_order_id:
        print(f"\n[TEST 12] GET /api/orders/track/{test_order_id}")
        try:
            resp = requests.get(f"{BASE_URL}/orders/track/{test_order_id}", timeout=10)
            
            if resp.status_code == 200:
                data = resp.json()
                if 'order' in data:
                    print(f"✅ PASS: Returns 200 with order data")
                else:
                    print(f"❌ FAIL: No 'order' field in response")
                    all_passed = False
            else:
                print(f"❌ FAIL: Expected 200, got {resp.status_code}")
                all_passed = False
        except Exception as e:
            print(f"❌ FAIL: {e}")
            all_passed = False
    else:
        print(f"\n[TEST 12] SKIPPED: No orderId from previous test")
        all_passed = False
    
    # TEST 13: Admin stats
    if admin_token:
        print(f"\n[TEST 13] GET /api/admin/stats with Bearer token")
        try:
            resp = requests.get(
                f"{BASE_URL}/admin/stats",
                headers={'Authorization': f'Bearer {admin_token}'},
                timeout=10
            )
            
            if resp.status_code == 200:
                data = resp.json()
                stats = data.get('stats', {})
                required_fields = ['totalOrders', 'todaysOrders', 'totalRevenue', 'todaysRevenue', 
                                 'pending', 'delivered', 'productCount', 'categoryCount']
                
                if all(field in stats for field in required_fields):
                    # Check if all are numeric
                    if all(isinstance(stats[field], (int, float)) for field in required_fields):
                        print(f"✅ PASS: Returns 200 with all required numeric stats fields")
                        print(f"   Stats: {stats}")
                    else:
                        print(f"❌ FAIL: Some stats fields are not numeric")
                        all_passed = False
                else:
                    print(f"❌ FAIL: Missing required stats fields")
                    print(f"   Expected: {required_fields}")
                    print(f"   Got: {list(stats.keys())}")
                    all_passed = False
            else:
                print(f"❌ FAIL: Expected 200, got {resp.status_code}")
                all_passed = False
        except Exception as e:
            print(f"❌ FAIL: {e}")
            all_passed = False
    else:
        print(f"\n[TEST 13] SKIPPED: No admin token from previous test")
        all_passed = False
    
    return all_passed

def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("JEEVIKAA COUTURE - POST /api/upload ENDPOINT TEST SUITE")
    print("Testing new image upload endpoint + light regression")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    
    upload_passed = test_upload_endpoint()
    regression_passed = test_regression()
    
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    if upload_passed and regression_passed:
        print("✅ ALL TESTS PASSED (13/13 - 100%)")
        print("\nUpload endpoint tests: 7/7 ✅")
        print("Regression tests: 6/6 ✅")
        return 0
    else:
        print("❌ SOME TESTS FAILED")
        if not upload_passed:
            print("   Upload endpoint tests: FAILED ❌")
        else:
            print("   Upload endpoint tests: 7/7 ✅")
        
        if not regression_passed:
            print("   Regression tests: FAILED ❌")
        else:
            print("   Regression tests: 6/6 ✅")
        return 1

if __name__ == "__main__":
    exit(main())
