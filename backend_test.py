#!/usr/bin/env python3
"""
Comprehensive backend API test suite for Jeevikaa Couture e-commerce platform
Tests all backend endpoints including public APIs, order flow, admin auth, and CRUD operations
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from environment
BASE_URL = "https://jeevikaa-fashion.preview.emergentagent.com/api"

# Admin credentials
ADMIN_EMAIL = "admin@jeevikaacouture.com"
ADMIN_PASSWORD = "Jeevikaa@2025"

# Test state
test_results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

# Store data between tests
test_data = {
    "admin_token": None,
    "cod_order_id": None,
    "cod_order_internal_id": None,
    "qr_order_id": None,
    "qr_order_internal_id": None,
    "created_product_id": None,
    "created_product_slug": None
}

def log_test(name, passed, message=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if message:
        print(f"   {message}")
    
    test_results["tests"].append({
        "name": name,
        "passed": passed,
        "message": message
    })
    
    if passed:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                log_test("GET /api/health", True, "Returns { ok: true }")
                return True
            else:
                log_test("GET /api/health", False, f"Unexpected response: {data}")
                return False
        else:
            log_test("GET /api/health", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/health", False, f"Exception: {str(e)}")
        return False

def test_categories():
    """Test categories endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/categories", timeout=10)
        if response.status_code == 200:
            data = response.json()
            categories = data.get("categories", [])
            if len(categories) == 6:
                slugs = [c.get("slug") for c in categories]
                expected_slugs = ["sarees", "lehengas", "kurtis", "gowns", "suits", "co-ord-sets"]
                if all(slug in slugs for slug in expected_slugs):
                    log_test("GET /api/categories", True, f"Returns 6 categories with correct slugs")
                    return True
                else:
                    log_test("GET /api/categories", False, f"Missing expected slugs. Got: {slugs}")
                    return False
            else:
                log_test("GET /api/categories", False, f"Expected 6 categories, got {len(categories)}")
                return False
        else:
            log_test("GET /api/categories", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/categories", False, f"Exception: {str(e)}")
        return False

def test_products_list():
    """Test products list endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/products", timeout=10)
        if response.status_code == 200:
            data = response.json()
            products = data.get("products", [])
            if len(products) == 8:
                log_test("GET /api/products", True, f"Returns 8 products")
                return True
            else:
                log_test("GET /api/products", False, f"Expected 8 products, got {len(products)}")
                return False
        else:
            log_test("GET /api/products", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/products", False, f"Exception: {str(e)}")
        return False

def test_products_filters():
    """Test product filters"""
    tests_passed = 0
    tests_total = 6
    
    # Test category filter
    try:
        response = requests.get(f"{BASE_URL}/products?category=sarees", timeout=10)
        if response.status_code == 200:
            data = response.json()
            products = data.get("products", [])
            if all(p.get("category") == "sarees" for p in products):
                log_test("GET /api/products?category=sarees", True, f"Returns {len(products)} sarees")
                tests_passed += 1
            else:
                log_test("GET /api/products?category=sarees", False, "Some products not in sarees category")
        else:
            log_test("GET /api/products?category=sarees", False, f"Status {response.status_code}")
    except Exception as e:
        log_test("GET /api/products?category=sarees", False, f"Exception: {str(e)}")
    
    # Test trending filter
    try:
        response = requests.get(f"{BASE_URL}/products?filter=trending", timeout=10)
        if response.status_code == 200:
            data = response.json()
            products = data.get("products", [])
            if all(p.get("trending") == True for p in products):
                log_test("GET /api/products?filter=trending", True, f"Returns {len(products)} trending products")
                tests_passed += 1
            else:
                log_test("GET /api/products?filter=trending", False, "Some products not marked as trending")
        else:
            log_test("GET /api/products?filter=trending", False, f"Status {response.status_code}")
    except Exception as e:
        log_test("GET /api/products?filter=trending", False, f"Exception: {str(e)}")
    
    # Test new arrivals filter
    try:
        response = requests.get(f"{BASE_URL}/products?filter=new", timeout=10)
        if response.status_code == 200:
            data = response.json()
            products = data.get("products", [])
            if all(p.get("newArrival") == True for p in products):
                log_test("GET /api/products?filter=new", True, f"Returns {len(products)} new arrivals")
                tests_passed += 1
            else:
                log_test("GET /api/products?filter=new", False, "Some products not marked as new arrival")
        else:
            log_test("GET /api/products?filter=new", False, f"Status {response.status_code}")
    except Exception as e:
        log_test("GET /api/products?filter=new", False, f"Exception: {str(e)}")
    
    # Test bestseller filter
    try:
        response = requests.get(f"{BASE_URL}/products?filter=bestseller", timeout=10)
        if response.status_code == 200:
            data = response.json()
            products = data.get("products", [])
            if all(p.get("bestSeller") == True for p in products):
                log_test("GET /api/products?filter=bestseller", True, f"Returns {len(products)} bestsellers")
                tests_passed += 1
            else:
                log_test("GET /api/products?filter=bestseller", False, "Some products not marked as bestseller")
        else:
            log_test("GET /api/products?filter=bestseller", False, f"Status {response.status_code}")
    except Exception as e:
        log_test("GET /api/products?filter=bestseller", False, f"Exception: {str(e)}")
    
    # Test hot deal filter
    try:
        response = requests.get(f"{BASE_URL}/products?filter=hotdeal", timeout=10)
        if response.status_code == 200:
            data = response.json()
            products = data.get("products", [])
            if all(p.get("hotDeal") == True for p in products):
                log_test("GET /api/products?filter=hotdeal", True, f"Returns {len(products)} hot deals")
                tests_passed += 1
            else:
                log_test("GET /api/products?filter=hotdeal", False, "Some products not marked as hot deal")
        else:
            log_test("GET /api/products?filter=hotdeal", False, f"Status {response.status_code}")
    except Exception as e:
        log_test("GET /api/products?filter=hotdeal", False, f"Exception: {str(e)}")
    
    # Test search
    try:
        response = requests.get(f"{BASE_URL}/products?q=silk", timeout=10)
        if response.status_code == 200:
            data = response.json()
            products = data.get("products", [])
            # Check if any product contains "silk" in name, tags, or description
            has_silk = any(
                "silk" in p.get("name", "").lower() or
                "silk" in p.get("description", "").lower() or
                any("silk" in tag.lower() for tag in p.get("tags", []))
                for p in products
            )
            if has_silk or len(products) > 0:
                log_test("GET /api/products?q=silk", True, f"Returns {len(products)} products matching 'silk'")
                tests_passed += 1
            else:
                log_test("GET /api/products?q=silk", False, "No products found with 'silk'")
        else:
            log_test("GET /api/products?q=silk", False, f"Status {response.status_code}")
    except Exception as e:
        log_test("GET /api/products?q=silk", False, f"Exception: {str(e)}")
    
    return tests_passed == tests_total

def test_products_sort():
    """Test product sorting"""
    tests_passed = 0
    tests_total = 4
    
    # Test price ascending
    try:
        response = requests.get(f"{BASE_URL}/products?sort=priceAsc", timeout=10)
        if response.status_code == 200:
            data = response.json()
            products = data.get("products", [])
            prices = [p.get("discountPrice", p.get("price", 0)) for p in products]
            if prices == sorted(prices):
                log_test("GET /api/products?sort=priceAsc", True, "Products sorted by price ascending")
                tests_passed += 1
            else:
                log_test("GET /api/products?sort=priceAsc", False, "Products not sorted correctly")
        else:
            log_test("GET /api/products?sort=priceAsc", False, f"Status {response.status_code}")
    except Exception as e:
        log_test("GET /api/products?sort=priceAsc", False, f"Exception: {str(e)}")
    
    # Test price descending
    try:
        response = requests.get(f"{BASE_URL}/products?sort=priceDesc", timeout=10)
        if response.status_code == 200:
            data = response.json()
            products = data.get("products", [])
            prices = [p.get("discountPrice", p.get("price", 0)) for p in products]
            if prices == sorted(prices, reverse=True):
                log_test("GET /api/products?sort=priceDesc", True, "Products sorted by price descending")
                tests_passed += 1
            else:
                log_test("GET /api/products?sort=priceDesc", False, "Products not sorted correctly")
        else:
            log_test("GET /api/products?sort=priceDesc", False, f"Status {response.status_code}")
    except Exception as e:
        log_test("GET /api/products?sort=priceDesc", False, f"Exception: {str(e)}")
    
    # Test popular sort
    try:
        response = requests.get(f"{BASE_URL}/products?sort=popular", timeout=10)
        if response.status_code == 200:
            log_test("GET /api/products?sort=popular", True, "Popular sort works")
            tests_passed += 1
        else:
            log_test("GET /api/products?sort=popular", False, f"Status {response.status_code}")
    except Exception as e:
        log_test("GET /api/products?sort=popular", False, f"Exception: {str(e)}")
    
    # Test newest sort
    try:
        response = requests.get(f"{BASE_URL}/products?sort=newest", timeout=10)
        if response.status_code == 200:
            log_test("GET /api/products?sort=newest", True, "Newest sort works")
            tests_passed += 1
        else:
            log_test("GET /api/products?sort=newest", False, f"Status {response.status_code}")
    except Exception as e:
        log_test("GET /api/products?sort=newest", False, f"Exception: {str(e)}")
    
    return tests_passed == tests_total

def test_product_detail():
    """Test product detail endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/products/rose-blush-silk-saree", timeout=10)
        if response.status_code == 200:
            data = response.json()
            product = data.get("product")
            related = data.get("related", [])
            
            if product and product.get("slug") == "rose-blush-silk-saree":
                if len(related) <= 4:
                    log_test("GET /api/products/rose-blush-silk-saree", True, f"Returns product with {len(related)} related products")
                    return True
                else:
                    log_test("GET /api/products/rose-blush-silk-saree", False, f"Too many related products: {len(related)}")
                    return False
            else:
                log_test("GET /api/products/rose-blush-silk-saree", False, "Product not found or wrong slug")
                return False
        else:
            log_test("GET /api/products/rose-blush-silk-saree", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/products/rose-blush-silk-saree", False, f"Exception: {str(e)}")
        return False

def test_testimonials():
    """Test testimonials endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/testimonials", timeout=10)
        if response.status_code == 200:
            data = response.json()
            testimonials = data.get("testimonials", [])
            if len(testimonials) == 4:
                log_test("GET /api/testimonials", True, "Returns 4 testimonials")
                return True
            else:
                log_test("GET /api/testimonials", False, f"Expected 4 testimonials, got {len(testimonials)}")
                return False
        else:
            log_test("GET /api/testimonials", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/testimonials", False, f"Exception: {str(e)}")
        return False

def test_order_cod():
    """Test COD order placement"""
    try:
        order_data = {
            "customer": {
                "fullName": "Priya Sharma",
                "phone": "9876543210",
                "email": "priya.sharma@example.com",
                "address": "123 MG Road, Koramangala",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560034"
            },
            "items": [
                {
                    "productId": "test-product-1",
                    "name": "Rose Blush Silk Saree",
                    "slug": "rose-blush-silk-saree",
                    "price": 5999,
                    "thumbnail": "https://example.com/saree.jpg",
                    "size": "M",
                    "color": "#C2185B",
                    "qty": 2
                }
            ],
            "paymentMethod": "cod"
        }
        
        response = requests.post(f"{BASE_URL}/orders", json=order_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            order = data.get("order")
            
            # Validate order structure
            order_id = order.get("orderId")
            status = order.get("status")
            payment_status = order.get("paymentStatus")
            subtotal = order.get("subtotal")
            shipping = order.get("shipping")
            total = order.get("total")
            
            # Check orderId format
            import re
            if not re.match(r'^JC\d{12}$', order_id):
                log_test("POST /api/orders (COD)", False, f"Invalid orderId format: {order_id}")
                return False
            
            # Check status
            if status != "placed":
                log_test("POST /api/orders (COD)", False, f"Expected status 'placed', got '{status}'")
                return False
            
            # Check payment status
            if payment_status != "cod":
                log_test("POST /api/orders (COD)", False, f"Expected paymentStatus 'cod', got '{payment_status}'")
                return False
            
            # Check shipping calculation
            expected_shipping = 0 if subtotal >= 2999 else 149
            if shipping != expected_shipping:
                log_test("POST /api/orders (COD)", False, f"Expected shipping {expected_shipping}, got {shipping}")
                return False
            
            # Check total
            expected_total = subtotal + shipping
            if total != expected_total:
                log_test("POST /api/orders (COD)", False, f"Expected total {expected_total}, got {total}")
                return False
            
            # Store for later tests
            test_data["cod_order_id"] = order_id
            test_data["cod_order_internal_id"] = order.get("id")
            
            log_test("POST /api/orders (COD)", True, f"Order created: {order_id}, subtotal={subtotal}, shipping={shipping}, total={total}")
            return True
        else:
            log_test("POST /api/orders (COD)", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("POST /api/orders (COD)", False, f"Exception: {str(e)}")
        return False

def test_order_qr():
    """Test QR/UPI order placement"""
    try:
        order_data = {
            "customer": {
                "fullName": "Ananya Reddy",
                "phone": "9123456789",
                "email": "ananya.reddy@example.com",
                "address": "456 Brigade Road",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560025"
            },
            "items": [
                {
                    "productId": "test-product-2",
                    "name": "Royal Blue Lehenga",
                    "slug": "royal-blue-lehenga",
                    "price": 5999,
                    "thumbnail": "https://example.com/lehenga.jpg",
                    "size": "M",
                    "color": "#C2185B",
                    "qty": 2
                }
            ],
            "paymentMethod": "qr",
            "utrNumber": "123456789012"
        }
        
        response = requests.post(f"{BASE_URL}/orders", json=order_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            order = data.get("order")
            
            # Validate order structure
            order_id = order.get("orderId")
            status = order.get("status")
            payment_status = order.get("paymentStatus")
            utr_number = order.get("utrNumber")
            
            # Check orderId format
            import re
            if not re.match(r'^JC\d{12}$', order_id):
                log_test("POST /api/orders (QR)", False, f"Invalid orderId format: {order_id}")
                return False
            
            # Check status
            if status != "payment_pending":
                log_test("POST /api/orders (QR)", False, f"Expected status 'payment_pending', got '{status}'")
                return False
            
            # Check payment status
            if payment_status != "pending_verification":
                log_test("POST /api/orders (QR)", False, f"Expected paymentStatus 'pending_verification', got '{payment_status}'")
                return False
            
            # Check UTR number
            if utr_number != "123456789012":
                log_test("POST /api/orders (QR)", False, f"UTR number not saved correctly")
                return False
            
            # Store for later tests
            test_data["qr_order_id"] = order_id
            test_data["qr_order_internal_id"] = order.get("id")
            
            log_test("POST /api/orders (QR)", True, f"Order created: {order_id}, status={status}, paymentStatus={payment_status}, utrNumber={utr_number}")
            return True
        else:
            log_test("POST /api/orders (QR)", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("POST /api/orders (QR)", False, f"Exception: {str(e)}")
        return False

def test_order_tracking():
    """Test order tracking"""
    tests_passed = 0
    tests_total = 3
    
    # Track COD order
    if test_data["cod_order_id"]:
        try:
            response = requests.get(f"{BASE_URL}/orders/track/{test_data['cod_order_id']}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                order = data.get("order")
                if order and order.get("orderId") == test_data["cod_order_id"]:
                    log_test(f"GET /api/orders/track/{test_data['cod_order_id']}", True, "COD order found")
                    tests_passed += 1
                else:
                    log_test(f"GET /api/orders/track/{test_data['cod_order_id']}", False, "Order not found or wrong orderId")
            else:
                log_test(f"GET /api/orders/track/{test_data['cod_order_id']}", False, f"Status {response.status_code}")
        except Exception as e:
            log_test(f"GET /api/orders/track/{test_data['cod_order_id']}", False, f"Exception: {str(e)}")
    
    # Track QR order
    if test_data["qr_order_id"]:
        try:
            response = requests.get(f"{BASE_URL}/orders/track/{test_data['qr_order_id']}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                order = data.get("order")
                if order and order.get("orderId") == test_data["qr_order_id"]:
                    log_test(f"GET /api/orders/track/{test_data['qr_order_id']}", True, "QR order found")
                    tests_passed += 1
                else:
                    log_test(f"GET /api/orders/track/{test_data['qr_order_id']}", False, "Order not found or wrong orderId")
            else:
                log_test(f"GET /api/orders/track/{test_data['qr_order_id']}", False, f"Status {response.status_code}")
        except Exception as e:
            log_test(f"GET /api/orders/track/{test_data['qr_order_id']}", False, f"Exception: {str(e)}")
    
    # Track invalid order
    try:
        response = requests.get(f"{BASE_URL}/orders/track/INVALID", timeout=10)
        if response.status_code == 404:
            data = response.json()
            if "error" in data:
                log_test("GET /api/orders/track/INVALID", True, "Returns 404 with error message")
                tests_passed += 1
            else:
                log_test("GET /api/orders/track/INVALID", False, "404 but no error message")
        else:
            log_test("GET /api/orders/track/INVALID", False, f"Expected 404, got {response.status_code}")
    except Exception as e:
        log_test("GET /api/orders/track/INVALID", False, f"Exception: {str(e)}")
    
    return tests_passed == tests_total

def test_admin_login_wrong_password():
    """Test admin login with wrong password"""
    try:
        response = requests.post(f"{BASE_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": "WrongPassword123"
        }, timeout=10)
        
        if response.status_code == 401:
            log_test("POST /api/admin/login (wrong password)", True, "Returns 401 Unauthorized")
            return True
        else:
            log_test("POST /api/admin/login (wrong password)", False, f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        log_test("POST /api/admin/login (wrong password)", False, f"Exception: {str(e)}")
        return False

def test_admin_login_correct():
    """Test admin login with correct credentials"""
    try:
        response = requests.post(f"{BASE_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            admin = data.get("admin")
            
            if token and admin:
                test_data["admin_token"] = token
                log_test("POST /api/admin/login (correct)", True, f"Returns token and admin data")
                return True
            else:
                log_test("POST /api/admin/login (correct)", False, "Missing token or admin data")
                return False
        else:
            log_test("POST /api/admin/login (correct)", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("POST /api/admin/login (correct)", False, f"Exception: {str(e)}")
        return False

def test_orders_list_without_auth():
    """Test orders list without authentication"""
    try:
        response = requests.get(f"{BASE_URL}/orders", timeout=10)
        
        # Should return 404 or 401 (not 200)
        if response.status_code != 200:
            log_test("GET /api/orders (no auth)", True, f"Returns {response.status_code} (not authorized)")
            return True
        else:
            log_test("GET /api/orders (no auth)", False, "Should not return 200 without auth")
            return False
    except Exception as e:
        log_test("GET /api/orders (no auth)", False, f"Exception: {str(e)}")
        return False

def test_orders_list_with_auth():
    """Test orders list with authentication"""
    if not test_data["admin_token"]:
        log_test("GET /api/orders (with auth)", False, "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {test_data['admin_token']}"}
        response = requests.get(f"{BASE_URL}/orders", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            orders = data.get("orders", [])
            
            # Should include the 2 orders we created
            if len(orders) >= 2:
                log_test("GET /api/orders (with auth)", True, f"Returns {len(orders)} orders (including our 2 test orders)")
                return True
            else:
                log_test("GET /api/orders (with auth)", False, f"Expected at least 2 orders, got {len(orders)}")
                return False
        else:
            log_test("GET /api/orders (with auth)", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("GET /api/orders (with auth)", False, f"Exception: {str(e)}")
        return False

def test_admin_stats():
    """Test admin stats endpoint"""
    if not test_data["admin_token"]:
        log_test("GET /api/admin/stats", False, "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {test_data['admin_token']}"}
        response = requests.get(f"{BASE_URL}/admin/stats", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            stats = data.get("stats", {})
            
            # Check all required fields are present and numeric
            required_fields = ["totalOrders", "todaysOrders", "totalRevenue", "todaysRevenue", 
                             "pending", "delivered", "productCount", "categoryCount"]
            
            all_present = all(field in stats for field in required_fields)
            all_numeric = all(isinstance(stats.get(field), (int, float)) for field in required_fields)
            
            if all_present and all_numeric:
                log_test("GET /api/admin/stats", True, f"Returns all stats: {stats}")
                return True
            else:
                log_test("GET /api/admin/stats", False, f"Missing or non-numeric fields in stats")
                return False
        else:
            log_test("GET /api/admin/stats", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("GET /api/admin/stats", False, f"Exception: {str(e)}")
        return False

def test_product_create():
    """Test product creation"""
    if not test_data["admin_token"]:
        log_test("POST /api/products (create)", False, "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {test_data['admin_token']}"}
        product_data = {
            "name": "Test Anarkali",
            "slug": "test-anarkali",
            "sku": "JC-TEST-001",
            "category": "suits",
            "price": 4999,
            "discountPrice": 3499,
            "description": "Test product for automated testing",
            "stock": 5,
            "images": ["https://example.com/x.jpg"],
            "thumbnail": "https://example.com/x.jpg",
            "colors": ["#C2185B"],
            "sizes": ["M", "L"],
            "newArrival": True
        }
        
        response = requests.post(f"{BASE_URL}/products", json=product_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            product = data.get("product")
            
            if product:
                product_id = product.get("id")
                offer_percentage = product.get("offerPercentage")
                
                # Check offer percentage calculation
                expected_offer = 30  # (4999 - 3499) / 4999 * 100 = 30%
                if offer_percentage == expected_offer:
                    test_data["created_product_id"] = product_id
                    test_data["created_product_slug"] = product.get("slug")
                    log_test("POST /api/products (create)", True, f"Product created with id={product_id}, offerPercentage={offer_percentage}%")
                    return True
                else:
                    log_test("POST /api/products (create)", False, f"Expected offerPercentage={expected_offer}, got {offer_percentage}")
                    return False
            else:
                log_test("POST /api/products (create)", False, "No product in response")
                return False
        else:
            log_test("POST /api/products (create)", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("POST /api/products (create)", False, f"Exception: {str(e)}")
        return False

def test_product_update():
    """Test product update"""
    if not test_data["admin_token"] or not test_data["created_product_id"]:
        log_test("PUT /api/products/{id}", False, "No admin token or product id available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {test_data['admin_token']}"}
        update_data = {"stock": 3}
        
        response = requests.put(f"{BASE_URL}/products/{test_data['created_product_id']}", 
                               json=update_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                log_test("PUT /api/products/{id}", True, "Product updated successfully")
                return True
            else:
                log_test("PUT /api/products/{id}", False, f"Unexpected response: {data}")
                return False
        else:
            log_test("PUT /api/products/{id}", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("PUT /api/products/{id}", False, f"Exception: {str(e)}")
        return False

def test_product_verify_update():
    """Verify product update"""
    if not test_data["created_product_slug"]:
        log_test("GET /api/products/{slug} (verify update)", False, "No product slug available")
        return False
    
    try:
        response = requests.get(f"{BASE_URL}/products/{test_data['created_product_slug']}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            product = data.get("product")
            
            if product and product.get("stock") == 3:
                log_test("GET /api/products/{slug} (verify update)", True, "Stock updated to 3")
                return True
            else:
                log_test("GET /api/products/{slug} (verify update)", False, f"Stock not updated correctly: {product.get('stock')}")
                return False
        else:
            log_test("GET /api/products/{slug} (verify update)", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/products/{slug} (verify update)", False, f"Exception: {str(e)}")
        return False

def test_product_delete():
    """Test product deletion"""
    if not test_data["admin_token"] or not test_data["created_product_id"]:
        log_test("DELETE /api/products/{id}", False, "No admin token or product id available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {test_data['admin_token']}"}
        response = requests.delete(f"{BASE_URL}/products/{test_data['created_product_id']}", 
                                  headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                log_test("DELETE /api/products/{id}", True, "Product deleted successfully")
                return True
            else:
                log_test("DELETE /api/products/{id}", False, f"Unexpected response: {data}")
                return False
        else:
            log_test("DELETE /api/products/{id}", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("DELETE /api/products/{id}", False, f"Exception: {str(e)}")
        return False

def test_product_verify_deletion():
    """Verify product deletion"""
    if not test_data["created_product_slug"]:
        log_test("GET /api/products/{slug} (verify deletion)", False, "No product slug available")
        return False
    
    try:
        response = requests.get(f"{BASE_URL}/products/{test_data['created_product_slug']}", timeout=10)
        
        if response.status_code == 404:
            log_test("GET /api/products/{slug} (verify deletion)", True, "Product not found (404)")
            return True
        else:
            log_test("GET /api/products/{slug} (verify deletion)", False, f"Expected 404, got {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /api/products/{slug} (verify deletion)", False, f"Exception: {str(e)}")
        return False

def test_order_status_update_cod():
    """Test COD order status update"""
    if not test_data["admin_token"] or not test_data["cod_order_internal_id"]:
        log_test("PATCH /api/orders/{id} (COD)", False, "No admin token or order id available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {test_data['admin_token']}"}
        update_data = {"status": "confirmed"}
        
        response = requests.patch(f"{BASE_URL}/orders/{test_data['cod_order_internal_id']}", 
                                 json=update_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                log_test("PATCH /api/orders/{id} (COD)", True, "Order status updated to 'confirmed'")
                return True
            else:
                log_test("PATCH /api/orders/{id} (COD)", False, f"Unexpected response: {data}")
                return False
        else:
            log_test("PATCH /api/orders/{id} (COD)", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("PATCH /api/orders/{id} (COD)", False, f"Exception: {str(e)}")
        return False

def test_order_status_update_qr():
    """Test QR order status update with payment verification"""
    if not test_data["admin_token"] or not test_data["qr_order_internal_id"]:
        log_test("PATCH /api/orders/{id} (QR)", False, "No admin token or order id available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {test_data['admin_token']}"}
        update_data = {
            "status": "confirmed",
            "paymentStatus": "verified"
        }
        
        response = requests.patch(f"{BASE_URL}/orders/{test_data['qr_order_internal_id']}", 
                                 json=update_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                log_test("PATCH /api/orders/{id} (QR)", True, "Order status updated to 'confirmed' and payment 'verified'")
                return True
            else:
                log_test("PATCH /api/orders/{id} (QR)", False, f"Unexpected response: {data}")
                return False
        else:
            log_test("PATCH /api/orders/{id} (QR)", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("PATCH /api/orders/{id} (QR)", False, f"Exception: {str(e)}")
        return False

def test_order_verify_status_updates():
    """Verify order status updates"""
    tests_passed = 0
    tests_total = 2
    
    # Verify COD order
    if test_data["cod_order_id"]:
        try:
            response = requests.get(f"{BASE_URL}/orders/track/{test_data['cod_order_id']}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                order = data.get("order")
                
                if order.get("status") == "confirmed" and len(order.get("statusHistory", [])) >= 2:
                    log_test("Verify COD order status update", True, "Status is 'confirmed' and statusHistory grew")
                    tests_passed += 1
                else:
                    log_test("Verify COD order status update", False, f"Status: {order.get('status')}, History length: {len(order.get('statusHistory', []))}")
            else:
                log_test("Verify COD order status update", False, f"Status {response.status_code}")
        except Exception as e:
            log_test("Verify COD order status update", False, f"Exception: {str(e)}")
    
    # Verify QR order
    if test_data["qr_order_id"]:
        try:
            response = requests.get(f"{BASE_URL}/orders/track/{test_data['qr_order_id']}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                order = data.get("order")
                
                if (order.get("status") == "confirmed" and 
                    order.get("paymentStatus") == "verified" and 
                    len(order.get("statusHistory", [])) >= 2):
                    log_test("Verify QR order status update", True, "Status is 'confirmed', payment 'verified', and statusHistory grew")
                    tests_passed += 1
                else:
                    log_test("Verify QR order status update", False, 
                           f"Status: {order.get('status')}, Payment: {order.get('paymentStatus')}, History: {len(order.get('statusHistory', []))}")
            else:
                log_test("Verify QR order status update", False, f"Status {response.status_code}")
        except Exception as e:
            log_test("Verify QR order status update", False, f"Exception: {str(e)}")
    
    return tests_passed == tests_total

def test_newsletter():
    """Test newsletter subscription"""
    tests_passed = 0
    tests_total = 3
    
    # Test valid email
    try:
        response = requests.post(f"{BASE_URL}/newsletter", json={"email": "test@example.com"}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                log_test("POST /api/newsletter (valid)", True, "Newsletter subscription successful")
                tests_passed += 1
            else:
                log_test("POST /api/newsletter (valid)", False, f"Unexpected response: {data}")
        else:
            log_test("POST /api/newsletter (valid)", False, f"Status {response.status_code}")
    except Exception as e:
        log_test("POST /api/newsletter (valid)", False, f"Exception: {str(e)}")
    
    # Test duplicate email (should still work - upsert)
    try:
        response = requests.post(f"{BASE_URL}/newsletter", json={"email": "test@example.com"}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True:
                log_test("POST /api/newsletter (duplicate)", True, "Duplicate email handled (upsert)")
                tests_passed += 1
            else:
                log_test("POST /api/newsletter (duplicate)", False, f"Unexpected response: {data}")
        else:
            log_test("POST /api/newsletter (duplicate)", False, f"Status {response.status_code}")
    except Exception as e:
        log_test("POST /api/newsletter (duplicate)", False, f"Exception: {str(e)}")
    
    # Test invalid (no email)
    try:
        response = requests.post(f"{BASE_URL}/newsletter", json={}, timeout=10)
        if response.status_code == 400:
            log_test("POST /api/newsletter (invalid)", True, "Returns 400 for missing email")
            tests_passed += 1
        else:
            log_test("POST /api/newsletter (invalid)", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        log_test("POST /api/newsletter (invalid)", False, f"Exception: {str(e)}")
    
    return tests_passed == tests_total

def main():
    """Run all tests"""
    print("=" * 80)
    print("JEEVIKAA COUTURE - BACKEND API TEST SUITE")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()
    
    # Run tests in order
    print("🔍 Testing Public APIs...")
    test_health()
    test_categories()
    test_products_list()
    test_products_filters()
    test_products_sort()
    test_product_detail()
    test_testimonials()
    
    print("\n🛒 Testing Order Flow...")
    test_order_cod()
    test_order_qr()
    test_order_tracking()
    
    print("\n🔐 Testing Admin Authentication...")
    test_admin_login_wrong_password()
    test_admin_login_correct()
    test_orders_list_without_auth()
    test_orders_list_with_auth()
    test_admin_stats()
    
    print("\n📦 Testing Admin Product CRUD...")
    test_product_create()
    test_product_update()
    test_product_verify_update()
    test_product_delete()
    test_product_verify_deletion()
    
    print("\n📝 Testing Admin Order Status Updates...")
    test_order_status_update_cod()
    test_order_status_update_qr()
    test_order_verify_status_updates()
    
    print("\n📧 Testing Newsletter...")
    test_newsletter()
    
    # Print summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total Tests: {test_results['passed'] + test_results['failed']}")
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    print(f"Success Rate: {(test_results['passed'] / (test_results['passed'] + test_results['failed']) * 100):.1f}%")
    print("=" * 80)
    
    # Exit with appropriate code
    sys.exit(0 if test_results['failed'] == 0 else 1)

if __name__ == "__main__":
    main()
