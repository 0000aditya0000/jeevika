#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Build a production-ready luxury e-commerce platform for Jeevikaa Couture (women's ethnic fashion:
  sarees, lehengas, kurtis, suits, gowns, co-ord sets). MVP scope: beautiful storefront +
  cart/checkout with COD and QR-UPI payment + order tracking + admin panel with product/order
  management. Auth via custom JWT. Data currently in MongoDB (will migrate to Supabase later
  when the user shares credentials). Email code prepared for Gmail SMTP via Nodemailer but
  currently logs to console (mocked) until user provides SMTP creds.

backend:
  - task: "Seed initial data (categories, products, testimonials, admin)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js, lib/seed-data.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Runs on first API hit via ensureSeed(). Seeds 6 categories, 8 products, 4 testimonials, 1 super admin (admin@jeevikaacouture.com / Jeevikaa@2025)."
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: Auto-seeding works perfectly. GET /api/categories returns 6 categories with correct slugs (sarees, lehengas, kurtis, gowns, suits, co-ord-sets). GET /api/products returns 8 products. GET /api/testimonials returns 4 testimonials. Admin login successful with seeded credentials."
  - task: "Products list & detail API with filters"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "GET /api/products (filters: q, category, filter=trending|new|bestseller|hotdeal, sort=newest|priceAsc|priceDesc|popular). GET /api/products/{slug} returns product + related."
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: All filters working correctly. Category filter (sarees=2 products), trending (5), new arrivals (5), bestseller (4), hot deals (3). Search query 'silk' returns 2 products. All sort options work (priceAsc, priceDesc, popular, newest). Product detail /api/products/rose-blush-silk-saree returns product with 1 related product (≤4 as expected)."
  - task: "Categories & testimonials list APIs"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "GET /api/categories, GET /api/testimonials"
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: GET /api/categories returns 6 categories with all expected slugs. GET /api/testimonials returns 4 testimonials. Both endpoints working perfectly."
  - task: "Order placement (COD + QR/UPI) with UTR"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js, lib/email.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/orders. Generates JC{YYYYMMDD}{NNNN} order IDs. COD => status=placed. QR => status=payment_pending. Emails mocked (logged) until SMTP creds provided."
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: Both order flows working perfectly. COD order created with orderId=JC202607265583, status='placed', paymentStatus='cod', shipping calculated correctly (0 for subtotal≥2999). QR order created with orderId=JC202607263819, status='payment_pending', paymentStatus='pending_verification', utrNumber saved correctly. OrderId format matches /^JC\\d{12}$/."
  - task: "Order tracking by orderId"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "GET /api/orders/track/{orderId} returns full order + status history."
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: Order tracking working perfectly. Both COD and QR orders can be tracked successfully. Invalid orderId returns 404 with error message as expected."
  - task: "Admin JWT auth (login, me, stats)"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js, lib/auth.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/admin/login returns JWT. Custom HS256 signing with pbkdf2 password hash. Guards protect admin CRUD & orders list."
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: Admin auth working perfectly. Wrong password returns 401. Correct credentials return token and admin data. Protected endpoints (GET /api/orders) return 404 without auth, work with Bearer token. GET /api/admin/stats returns all required fields (totalOrders, todaysOrders, totalRevenue, todaysRevenue, pending, delivered, productCount, categoryCount) with correct numeric values."
  - task: "Admin product CRUD & order status update"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST/PUT/DELETE /api/products (JWT required). PATCH /api/orders/{id} with status/paymentStatus updates. Payment verify approve/reject flow."
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: All CRUD operations working perfectly. POST /api/products creates product with correct offerPercentage calculation (30% for price=4999, discountPrice=3499). PUT updates stock correctly. DELETE removes product (verified with 404 on subsequent GET). PATCH /api/orders updates both COD and QR orders correctly, statusHistory grows as expected, paymentStatus updates work."
  - task: "Newsletter subscribe"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "POST /api/newsletter upserts email."
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: Newsletter subscription working perfectly. Valid email returns {ok: true}. Duplicate email handled correctly with upsert. Missing email returns 400 as expected."
  - task: "Admin category update (PUT /api/categories/{id})"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "PUT /api/categories/{id} (JWT required). Updates category name, description, slug, thumbnail, banner, displayOrder, status."
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: PUT /api/categories/{id} working perfectly. Updated category name and description, verified changes with GET /api/categories. Restored original values successfully. Auth guard working - returns 404 without Bearer token."
  - task: "Admin category delete (DELETE /api/categories/{id})"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "DELETE /api/categories/{id} (JWT required). Removes category from database."
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: DELETE /api/categories/{id} working perfectly. Created temporary category, deleted it, verified removal with GET /api/categories. Auth guard working - returns 404 without Bearer token."
  - task: "ChunkLoadError fix on /checkout page"
    implemented: true
    working: true
    file: ".next cache cleared"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: false
        agent: "user"
        comment: "User reported: ChunkLoadError: Loading chunk app/checkout/page failed at URL /checkout"
      - working: true
        agent: "main"
        comment: "Fixed by clearing stale .next cache after Supabase migration. Restarted nextjs service."
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: ChunkLoadError is fixed. GET /checkout returns 200 with valid HTML. No ChunkLoadError text found in response. Page loads successfully."
  - task: "Admin-managed payment settings endpoints"
    implemented: true
    working: true
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented GET /api/settings/{key} (public) and PUT /api/settings/{key} (admin JWT required). Server accepts body.value ?? body for flexibility. Frontend integrated in admin dashboard Payment Settings tab and customer checkout QR section."
      - working: true
        agent: "testing"
        comment: "✅ VERIFIED: All 14 tests passed (100%). GET /api/settings/{key} works for both existing and non-existing keys (returns { key, value: null } for non-existing). PUT /api/settings/payment requires admin auth (blocks without token or with invalid token, returns 404). PUT accepts both { value: {...} } wrapper and flat body formats. Saved values persist correctly. Regression tests passed: GET /api/products, POST /api/orders (COD with JC-prefixed orderId), GET /api/orders/track, POST /api/admin/login, GET /api/admin/stats all working."


frontend:
  - task: "Luxury home page (hero slider, categories, trending, deals, testimonials, newsletter)"
    implemented: true
    working: "NA"
    file: "app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Confirmed via screenshots. Hero embla slider auto-plays, category tiles render with hover zoom, luxury magenta/gold palette."
  - task: "Shop listing with category filter, search, sort"
    implemented: true
    working: "NA"
    file: "app/shop/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Product detail (gallery, colors, sizes, qty, add to cart, wishlist, delivery check)"
    implemented: true
    working: "NA"
    file: "app/products/[slug]/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Cart, Checkout (COD + QR), Order Success"
    implemented: true
    working: "NA"
    file: "app/cart/page.js, app/checkout/page.js, app/order-success/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Order Tracking page"
    implemented: true
    working: "NA"
    file: "app/track/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
  - task: "Admin login + Dashboard (stats, orders, products, categories, payment verification)"
    implemented: true
    working: "NA"
    file: "app/admin/page.js, app/admin/dashboard/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 3
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      MIGRATED FROM MONGODB TO SUPABASE POSTGRESQL. User provided Supabase URL + anon + service role keys.
      Steps done:
      1. Added SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET to /app/.env
      2. Installed @supabase/supabase-js@2.45.4 (2.110 needs node 22, we have 20)
      3. Created /app/supabase/schema.sql — user ran it in Supabase SQL editor manually (confirmed).
      4. Created /app/lib/supabase.js with sb() client + fromRow/toRow snake_case<->camelCase converters.
      5. Fully rewrote /app/app/api/[[...path]]/route.js to use Supabase instead of MongoDB.
         - Same endpoints, same request/response shape (all fields still camelCase to client).
         - ensureSeed() checks settings.seeded=true and inserts categories/products/testimonials/admin.
         - Nested JSONB fields (customer, items, colors, sizes, images, status_history) preserve camelCase inside.
      6. Verified manually: /api/products, /api/categories, /api/testimonials all return seeded rows.

  - agent: "main"
    message: |
      Bug fix + admin enhancement round.
      1) FIX: ChunkLoadError on /checkout — caused by stale .next cache after Supabase migration.
         Cleared .next and restarted nextjs. /checkout now returns 200.
      2) NEW backend endpoints (need testing):
         - PUT /api/categories/{id}   (admin, JWT required) — updates category fields
         - DELETE /api/categories/{id} (admin, JWT required) — deletes category
      3) Admin dashboard enhancements (frontend only, no test needed):
         - Orders tab: search bar (matches orderId prefix like JC202607260001, name, phone, email) + status filter dropdown
         - Order detail dialog: full statusHistory timeline (each entry shows status, timestamp, optional note)
         - Categories tab: "Add Category" button, hover Edit/Delete buttons on each card, full add/edit dialog with name/slug/description/thumbnail/banner/displayOrder/status + live thumbnail preview
      Please test ONLY the two new endpoints (PUT/DELETE /api/categories/{id}) plus a regression on the existing endpoints affected by the .next cache clear. Admin login creds unchanged: admin@jeevikaacouture.com / Jeevikaa@2025.

         Admin login returns JWT successfully.
      Please re-run the same 6 test groups you ran before, this time against Supabase. Only backend changes; frontend untouched.
  - agent: "testing"
    message: "All 37 backend tests passed (100%). Endpoints verified: auto-seed, categories, products list/detail with all filters + sorts, testimonials, order placement (COD + QR with UTR + JC-prefixed orderId + shipping math), order tracking (valid + invalid), admin login (correct + wrong password 401), admin stats, admin product CRUD (create with offerPercentage compute, update, delete), admin order status updates with statusHistory, newsletter (upsert + validation). Email is intentionally mocked (console logs) until Gmail SMTP creds arrive - expected."
  - agent: "testing"
    message: |
      ✅ SUPABASE MIGRATION VERIFIED - ALL 37 TESTS PASSED (100%)
      
      Re-ran complete backend test suite after Supabase PostgreSQL migration. All tests that passed with MongoDB continue to pass with Supabase.
      
      VERIFIED SUPABASE-SPECIFIC FEATURES:
      ✅ Data seeding: 6 categories, 8 products, 4 testimonials, 1 admin successfully seeded into Postgres
      ✅ Snake_case ↔ camelCase conversion: All API responses maintain camelCase contract to clients
      ✅ JSONB fields: Nested objects (customer, items, colors, sizes, images, statusHistory) preserve camelCase inside
      ✅ Product filters: All working (category, trending, new, bestseller, hotdeal, search with ilike)
      ✅ Product sort: All working (priceAsc, priceDesc, popular, newest)
      ✅ Product detail: GET /api/products/rose-blush-silk-saree returns product + 1 related
      ✅ Order placement: COD (orderId=JC202607268844, status=placed, paymentStatus=cod) and QR (orderId=JC202607263517, status=payment_pending, paymentStatus=pending_verification, utrNumber saved)
      ✅ Shipping calculation: Free (₹0) for subtotal≥₹2,999, else ₹149
      ✅ Order tracking: Valid orders found, invalid returns 404
      ✅ Admin auth: Wrong password 401, correct login returns JWT
      ✅ Admin stats: All numeric fields correct (totalOrders=2, todaysOrders=2, totalRevenue=23996, todaysRevenue=23996, pending=2, delivered=0, productCount=8, categoryCount=6)
      ✅ Admin CRUD: Product creation with offerPercentage=30% computed correctly, update stock to 3, delete verified with 404
      ✅ Slug uniqueness: Enforced by Postgres unique constraint
      ✅ Admin order status: PATCH updates status + paymentStatus, statusHistory JSONB array grows correctly
      ✅ Newsletter: Upsert on unique email constraint working, validation returns 400 for missing email
      
      NO ISSUES FOUND. Supabase migration is production-ready.
  - agent: "main"
    message: |
      Round 1 MVP complete. Backend uses MongoDB with catch-all Next.js API route at /api/[[...path]].
      Auto-seeds on first hit: 6 categories, 8 products, 4 testimonials, 1 admin.
      Admin creds: admin@jeevikaacouture.com / Jeevikaa@2025.
      Please test all backend endpoints listed under current_focus:
      1) Seed via first GET /api/products
      2) GET /api/categories, /api/products (all filters + sort), /api/products/{slug}
      3) POST /api/orders for both COD and QR (with utrNumber). Verify JC-prefixed orderId.
      4) GET /api/orders/track/{orderId}
      5) POST /api/admin/login → get JWT. Then GET /api/admin/stats, /api/orders (needs Bearer).

  - agent: "main"
    message: |
      New feature: admin-managed QR/UPI payment settings.
      Endpoints (need testing):
      - GET  /api/settings/{key}   (public read) — returns { key, value }. If no row, value is null.
      - PUT  /api/settings/{key}   (admin JWT required) — upserts by key. Body can be { value: {...} } (preferred) or a flat object; server stores whatever comes in.
      Client uses key="payment" with value shape:
        { upiId, merchantName, phone, qrImageUrl, instructions }
      Frontend already integrated:
      - Admin dashboard now has "Payment Settings" tab: edit merchant name / UPI ID / phone / QR (upload file → base64 data URL OR paste URL) / instructions with live customer preview. Save button PUTs to /api/settings/payment.
      - Customer checkout QR section reads /api/settings/payment on mount and dynamically renders merchant name, UPI ID, support phone, custom QR image (if uploaded) or auto-generated QR (if only UPI ID set), plus optional custom instructions banner.
      Please verify:
      1) GET /api/settings/payment → returns { key: 'payment', value: null } OR the saved value.
      2) PUT /api/settings/payment WITH admin bearer token AND body { value: { upiId: 'test@paytm', merchantName: 'Test Store', phone: '+91 99999 88888', qrImageUrl: '', instructions: 'Send screenshot' } } → { ok: true }.
      3) GET again → returns exactly that value object.
      4) PUT /api/settings/payment WITHOUT auth header → returns non-2xx (404).
      5) GET /api/settings/some-random-key → returns { key: 'some-random-key', value: null }.
      6) PUT with a flat body { upiId: 'flat@upi' } (no "value" wrapper) → still ok:true; subsequent GET returns { upiId: 'flat@upi' } (server accepts body.value ?? body).
      7) Regression: order flow (POST /api/orders both COD and QR), tracking, admin login, admin stats, product & category CRUD still all work.

      6) POST /api/products (auth), PUT, DELETE. PATCH /api/orders/{id} status update.
      Note: Nodemailer email is intentionally mocked (console log) until user provides Gmail SMTP creds.
  - agent: "testing"
    message: |
      🎉 BACKEND TESTING COMPLETE - ALL TESTS PASSED (37/37 - 100% SUCCESS RATE)
      
      Comprehensive testing completed for all Jeevikaa Couture backend APIs:
      
      ✅ PUBLIC APIs (15 tests):
      - Health check working
      - Categories API returns 6 categories with correct slugs
      - Products list returns 8 products
      - All filters working (category, trending, new, bestseller, hotdeal, search)
      - All sort options working (priceAsc, priceDesc, popular, newest)
      - Product detail with related products (≤4) working

  - agent: "main"
    message: |
      New feature + bug fix round.

      1) NEW ENDPOINT: POST /api/upload (admin JWT required, multipart/form-data with "file" field).
         - Uploads to Supabase Storage bucket "media" (auto-creates the bucket on first use, public read).
         - Validates image mime + max size 3 MB. Rejects non-images with 400 "Only image files allowed".
         - Returns { url, key, size, type }. The `url` is a Supabase public URL.
         - Auth guard: without Bearer token returns 404 (path not matched).

      2) FIX (frontend only): Admin product form was clobbering commas typed into the Sizes / Colors inputs.
         Root cause: input value was rebuilt each keystroke via `array.join(', ')`, and filter(Boolean) stripped
         the trailing empty item so users couldn't type multiple entries.
         Fix: introduced separate `sizesText` / `colorsText` string state that stores the raw text as typed;
         parsed to arrays only at save time inside `saveProduct`. Also added a live color-swatch preview.

      3) FIX/UX (frontend only): Admin product form now has a drag-drop image uploader (instead of a URL
         textarea). Multi-file. Shows "800×1000 px, JPG/PNG/WebP, max 3 MB" guidance. Live thumbnail grid
         with hover "Set as thumbnail" ⭐ and "Remove" actions. Uses the new /api/upload endpoint.

      Please test:
      A) POST /api/upload:
         - Without auth → 404 (not authorised).
         - With admin bearer token + a small valid PNG (multipart) → 200 with `{ url, key, size, type }`.
           The returned URL must be reachable via HTTP GET returning 200 (public bucket).
         - With admin bearer token + a >3 MB file (multipart, image/jpeg) → 400 with
           `{ error: "File too large. Max 3MB (got X.XMB)" }`.
         - With admin bearer token + a text/plain file → 400 with `{ error: "Only image files allowed" }`.
         - With admin bearer token + no file → 400 with `{ error: "No file provided" }`.
      B) Regression on the endpoints most likely affected by /api/upload sharing the same handler:
         - POST /api/admin/login still returns token.
         - GET /api/products, GET /api/categories, POST /api/orders, GET /api/orders/track/{orderId} still work.
      Do NOT run the full 37-test suite — just the new /api/upload cases + a light regression.
      Note: the comma-input & uploader UI fixes are frontend-only and don't need backend testing.

      - Testimonials API returns 4 testimonials
      
      ✅ ORDER FLOW (5 tests):
      - COD order placement with correct orderId format (JC{12 digits})
      - QR/UPI order placement with UTR number saved
      - Shipping calculation correct (0 if subtotal≥2999, else 149)
      - Order tracking working for both COD and QR orders
      - Invalid order tracking returns 404 correctly
      
      ✅ ADMIN AUTH (5 tests):
      - Wrong password returns 401
      - Correct login returns JWT token and admin data
      - Protected endpoints blocked without auth
      - Protected endpoints accessible with Bearer token

  - agent: "main"
    message: |
      New feature: admin can change their own email/name/password from the dashboard.

      NEW ENDPOINT: PUT /api/admin/profile
      - Requires Bearer JWT of admin.
      - Body: { currentPassword (required), name?, email?, newPassword? }
      - Verifies currentPassword against stored PBKDF2 hash before applying changes.
      - Rejects with "Email already in use by another admin" if the new email collides with another admin row.
      - If newPassword provided, must be ≥ 6 chars; server re-hashes with PBKDF2.
      - Returns { ok: true, token, admin } — a fresh JWT reflecting the new email/name so the client can seamlessly stay logged in.

      Frontend: added "My Profile" tab in admin sidebar with a form (name, email, current password, new password, confirm new password) + client-side confirm-match check + Reset button.

      Please test:
      1) Login as admin → PUT /api/admin/profile with WRONG currentPassword → 401 "Current password is incorrect".
      2) PUT /api/admin/profile without any Authorization → 401 Unauthorized (or 404).
      3) PUT /api/admin/profile with correct currentPassword + name change → 200, returns fresh token + updated admin object.
      4) PUT with correct currentPassword + newPassword "NewPass123!" → 200 fresh token; then login with new password succeeds; login with old password 401.
      5) Restore original password ("Jeevikaa@2025") for follow-up tests.
      6) Email collision: create a second admin manually (INSERT INTO admins…) OR skip if not feasible; attempt to change the primary admin's email to that duplicate → 400 with "Email already in use by another admin".
      7) newPassword shorter than 6 chars → 400 "New password must be at least 6 characters".
      8) Empty body (only currentPassword, nothing to update) → 200 with { ok: true, message: "No changes" }.
      Light regression: POST /api/admin/login, GET /api/products?limit=3, GET /api/orders (with auth), GET /api/admin/stats.

      - Admin stats returns all required fields with correct values
      
      ✅ ADMIN CRUD (9 tests):
      - Product creation with correct offerPercentage calculation
      - Product update working
      - Product deletion working
      - Order status updates working for both COD and QR
      - Payment status verification working
      - StatusHistory growing correctly
      
      ✅ NEWSLETTER (3 tests):
      - Valid email subscription working
      - Duplicate email handled with upsert
      - Missing email returns 400
      
      NO CRITICAL ISSUES FOUND. All backend APIs are production-ready.
  - agent: "testing"
    message: |
      ✅ REGRESSION + NEW ENDPOINTS TESTING COMPLETE - ALL 10 TESTS PASSED (100%)
      
      Tested bug fix and new admin category endpoints after .next cache clear:
      
      ✅ REGRESSION TESTS (5/5):
      - GET /api/products returns 8+ products ✅
      - GET /api/products/rose-blush-silk-saree returns product + related ✅
      - POST /api/orders (COD) creates order with JC-prefixed orderId (JC202607265249) ✅
      - GET /api/orders/track/{orderId} returns the order ✅
      - POST /api/admin/login returns JWT ✅
      
      ✅ NEW ADMIN ENDPOINTS (2/2):
      - PUT /api/categories/{id} updates category name & description ✅
        * Verified update with GET /api/categories
        * Successfully restored original values
      - DELETE /api/categories/{id} deletes category ✅
        * Created temp category "Test Category To Delete"
        * Deleted successfully
        * Verified removal with GET /api/categories
      
      ✅ AUTH GUARDS (2/2):
      - PUT /api/categories/{id} WITHOUT Authorization → 404 (blocked) ✅
      - DELETE /api/categories/{id} WITHOUT Authorization → 404 (blocked) ✅
      
      ✅ CHUNK ERROR FIX (1/1):
      - GET /checkout returns 200 with valid HTML ✅
      - No "ChunkLoadError" text found in response ✅
      - Bug is FIXED - page loads successfully
      
      NO CRITICAL ISSUES FOUND. All existing endpoints still work after cache clear. New category management endpoints working perfectly with proper auth guards.

