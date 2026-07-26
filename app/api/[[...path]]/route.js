import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { sb, fromRow, toRow } from '@/lib/supabase';
import { hashPassword, verifyPassword, signToken, verifyToken } from '@/lib/auth';
import { sendEmail, orderPlacedEmail } from '@/lib/email';
import { CATEGORIES, PRODUCTS, TESTIMONIALS, ADMIN_SEED } from '@/lib/seed-data';

const json = (data, status = 200) => NextResponse.json(data, { status });
const err = (message, status = 400) => NextResponse.json({ error: message }, { status });

async function ensureSeed() {
  const client = sb();
  const { data: existing } = await client.from('settings').select('value').eq('key', 'seeded').maybeSingle();
  if (existing?.value === true) return;

  // Categories
  const catRows = CATEGORIES.map(c => ({ ...c, status: 'active', display_order: 0 }));
  await client.from('categories').insert(catRows);

  // Products (map camelCase to snake_case)
  const prodRows = PRODUCTS.map(p => ({
    name: p.name, slug: p.slug, sku: p.sku, category: p.category,
    description: p.description, short_description: p.shortDescription,
    price: p.price, discount_price: p.discountPrice,
    offer_percentage: p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0,
    stock: p.stock, material: p.material, fabric: p.fabric,
    colors: p.colors, sizes: p.sizes, images: p.images, thumbnail: p.thumbnail, tags: p.tags,
    trending: p.trending, featured: p.featured, best_seller: p.bestSeller,
    new_arrival: p.newArrival, hot_deal: p.hotDeal,
    rating: +(4.5 + Math.random() * 0.5).toFixed(2),
    review_count: Math.floor(Math.random() * 40) + 10,
    status: 'active',
  }));
  await client.from('products').insert(prodRows);

  // Testimonials
  await client.from('testimonials').insert(TESTIMONIALS);

  // Admin (only if not exists)
  const { data: adminExists } = await client.from('admins').select('id').eq('email', ADMIN_SEED.email).maybeSingle();
  if (!adminExists) {
    await client.from('admins').insert({
      email: ADMIN_SEED.email, name: ADMIN_SEED.name, role: ADMIN_SEED.role,
      password_hash: hashPassword(ADMIN_SEED.password),
    });
  }

  await client.from('settings').upsert({ key: 'seeded', value: true, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}

function genOrderId() {
  const d = new Date();
  return `JC${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}${Math.floor(1000 + Math.random() * 9000)}`;
}

function requireAdmin(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '') || request.cookies.get('jc_admin_token')?.value;
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

async function handle(request, path, method) {
  const client = sb();
  await ensureSeed();
  const url = new URL(request.url);
  const seg = path;

  if (seg[0] === 'health') return json({ ok: true, service: 'jeevikaa', db: 'supabase' });

  // ============= CATEGORIES =============
  if (seg[0] === 'categories') {
    if (method === 'GET') {
      const { data, error } = await client.from('categories').select('*').eq('status', 'active').order('display_order').order('name');
      if (error) return err(error.message, 500);
      return json({ categories: fromRow(data) });
    }
    if (method === 'POST' && requireAdmin(request)) {
      const body = await request.json();
      const { data, error } = await client.from('categories').insert(toRow({ ...body, status: body.status || 'active' })).select().single();
      if (error) return err(error.message);
      return json({ category: fromRow(data) });
    }
    if (method === 'PUT' && seg[1] && requireAdmin(request)) {
      const body = await request.json();
      const { error } = await client.from('categories').update(toRow(body)).eq('id', seg[1]);
      if (error) return err(error.message);
      return json({ ok: true });
    }
    if (method === 'DELETE' && seg[1] && requireAdmin(request)) {
      const { error } = await client.from('categories').delete().eq('id', seg[1]);
      if (error) return err(error.message);
      return json({ ok: true });
    }
  }

  // ============= PRODUCTS =============
  if (seg[0] === 'products') {
    if (method === 'GET' && !seg[1]) {
      const q = url.searchParams.get('q');
      const category = url.searchParams.get('category');
      const filter = url.searchParams.get('filter');
      const sort = url.searchParams.get('sort') || 'newest';
      const limit = parseInt(url.searchParams.get('limit') || '100');
      let qb = client.from('products').select('*').eq('status', 'active');
      if (category) qb = qb.eq('category', category);
      if (filter === 'trending') qb = qb.eq('trending', true);
      if (filter === 'new') qb = qb.eq('new_arrival', true);
      if (filter === 'bestseller') qb = qb.eq('best_seller', true);
      if (filter === 'hotdeal') qb = qb.eq('hot_deal', true);
      if (q) qb = qb.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
      const sortMap = {
        newest: ['created_at', false],
        oldest: ['created_at', true],
        priceAsc: ['discount_price', true],
        priceDesc: ['discount_price', false],
        popular: ['review_count', false],
      };
      const [col, asc] = sortMap[sort] || sortMap.newest;
      qb = qb.order(col, { ascending: asc }).limit(limit);
      const { data, error } = await qb;
      if (error) return err(error.message, 500);
      return json({ products: fromRow(data) });
    }
    if (method === 'GET' && seg[1]) {
      const { data: p } = await client.from('products').select('*').or(`slug.eq.${seg[1]},id.eq.${seg[1].match(/^[0-9a-f-]{36}$/) ? seg[1] : '00000000-0000-0000-0000-000000000000'}`).maybeSingle();
      if (!p) return err('Not found', 404);
      const { data: rel } = await client.from('products').select('*').eq('category', p.category).neq('id', p.id).limit(4);
      return json({ product: fromRow(p), related: fromRow(rel || []) });
    }
    if (method === 'POST' && requireAdmin(request)) {
      const body = await request.json();
      const row = toRow(body);
      if (row.price && row.discount_price) row.offer_percentage = Math.round(((row.price - row.discount_price) / row.price) * 100);
      row.status = row.status || 'active';
      const { data, error } = await client.from('products').insert(row).select().single();
      if (error) return err(error.message);
      return json({ product: fromRow(data) });
    }
    if (method === 'PUT' && seg[1] && requireAdmin(request)) {
      const body = await request.json();
      const row = toRow(body);
      if (row.price && row.discount_price) row.offer_percentage = Math.round(((row.price - row.discount_price) / row.price) * 100);
      row.updated_at = new Date().toISOString();
      const { error } = await client.from('products').update(row).eq('id', seg[1]);
      if (error) return err(error.message);
      return json({ ok: true });
    }
    if (method === 'DELETE' && seg[1] && requireAdmin(request)) {
      const { error } = await client.from('products').delete().eq('id', seg[1]);
      if (error) return err(error.message);
      return json({ ok: true });
    }
  }

  // ============= TESTIMONIALS =============
  if (seg[0] === 'testimonials' && method === 'GET') {
    const { data } = await client.from('testimonials').select('*').limit(20);
    return json({ testimonials: fromRow(data || []) });
  }

  // ============= ORDERS =============
  if (seg[0] === 'orders') {
    if (method === 'POST' && !seg[1]) {
      const body = await request.json();
      const orderId = genOrderId();
      const subtotal = body.items.reduce((s, i) => s + i.price * i.qty, 0);
      const shipping = subtotal >= 2999 ? 0 : 149;
      const total = subtotal + shipping - (body.discount || 0);
      const isQr = body.paymentMethod === 'qr';
      const status = isQr ? 'payment_pending' : 'placed';
      const row = {
        order_id: orderId,
        customer: body.customer,
        items: body.items,
        subtotal, shipping, discount: body.discount || 0, total,
        payment_method: body.paymentMethod,
        utr_number: body.utrNumber || null,
        status,
        payment_status: isQr ? 'pending_verification' : 'cod',
        status_history: [{ status, at: new Date().toISOString() }],
      };
      const { data, error } = await client.from('orders').insert(row).select().single();
      if (error) return err(error.message, 500);
      const order = fromRow(data);
      try { await sendEmail({ to: body.customer.email, subject: `Order ${orderId} received — Jeevikaa Couture`, html: orderPlacedEmail(order) }); } catch (e) { console.error(e); }
      return json({ order });
    }
    if (method === 'GET' && seg[1] === 'track' && seg[2]) {
      const { data } = await client.from('orders').select('*').eq('order_id', seg[2]).maybeSingle();
      if (!data) return err('Order not found', 404);
      return json({ order: fromRow(data) });
    }
    if (method === 'GET' && !seg[1] && requireAdmin(request)) {
      const { data } = await client.from('orders').select('*').order('created_at', { ascending: false }).limit(500);
      return json({ orders: fromRow(data || []) });
    }
    if (method === 'PATCH' && seg[1] && requireAdmin(request)) {
      const body = await request.json();
      const { data: existing } = await client.from('orders').select('status_history').eq('id', seg[1]).maybeSingle();
      if (!existing) return err('Not found', 404);
      const history = existing.status_history || [];
      history.push({ status: body.status, at: new Date().toISOString(), note: body.note });
      const update = { status: body.status, status_history: history, updated_at: new Date().toISOString() };
      if (body.paymentStatus) update.payment_status = body.paymentStatus;
      const { error } = await client.from('orders').update(update).eq('id', seg[1]);
      if (error) return err(error.message);
      return json({ ok: true });
    }
  }

  // ============= ADMIN =============
  if (seg[0] === 'admin') {
    if (seg[1] === 'login' && method === 'POST') {
      const { email, password } = await request.json();
      const { data: admin } = await client.from('admins').select('*').eq('email', email).maybeSingle();
      if (!admin || !verifyPassword(password, admin.password_hash)) return err('Invalid credentials', 401);
      const token = signToken({ id: admin.id, email: admin.email, role: 'admin', name: admin.name });
      return json({ token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
    }
    if (seg[1] === 'me' && method === 'GET') {
      const p = requireAdmin(request);
      if (!p) return err('Unauthorized', 401);
      return json({ admin: p });
    }
    if (seg[1] === 'stats' && method === 'GET' && requireAdmin(request)) {
      const { data: orders } = await client.from('orders').select('total, status, created_at');
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const list = orders || [];
      const todaysOrders = list.filter(o => new Date(o.created_at) >= today);
      const totalRevenue = list.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
      const todaysRevenue = todaysOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
      const pending = list.filter(o => ['placed','payment_pending','confirmed','processing','packed'].includes(o.status)).length;
      const delivered = list.filter(o => o.status === 'delivered').length;
      const { count: productCount } = await client.from('products').select('id', { count: 'exact', head: true });
      const { count: categoryCount } = await client.from('categories').select('id', { count: 'exact', head: true });
      return json({ stats: { totalOrders: list.length, todaysOrders: todaysOrders.length, totalRevenue, todaysRevenue, pending, delivered, productCount: productCount || 0, categoryCount: categoryCount || 0 } });
    }
  }

  // ============= UPLOAD (Supabase Storage) =============
  if (seg[0] === 'upload' && method === 'POST' && requireAdmin(request)) {
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file || typeof file === 'string') return err('No file provided');
      const size = file.size || 0;
      const MAX = 3 * 1024 * 1024; // 3MB
      if (size > MAX) return err(`File too large. Max 3MB (got ${(size/1024/1024).toFixed(1)}MB)`);
      const type = file.type || 'application/octet-stream';
      if (!type.startsWith('image/')) return err('Only image files allowed');
      const bytes = new Uint8Array(await file.arrayBuffer());
      const rawName = (file.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '-');
      const ext = (rawName.split('.').pop() || 'jpg').toLowerCase();
      const key = `products/${Date.now()}-${uuid().slice(0, 8)}.${ext}`;

      // Ensure the "media" bucket exists (public read).
      try {
        const { data: buckets } = await client.storage.listBuckets();
        if (!buckets?.find(b => b.name === 'media')) {
          await client.storage.createBucket('media', { public: true, fileSizeLimit: MAX });
        }
      } catch (_) {}

      const { error: upErr } = await client.storage.from('media').upload(key, bytes, { contentType: type, upsert: false });
      if (upErr) return err(`Upload failed: ${upErr.message}`, 500);
      const { data: pub } = client.storage.from('media').getPublicUrl(key);
      return json({ url: pub.publicUrl, key, size, type });
    } catch (e) {
      console.error('Upload error', e);
      return err(e.message || 'Upload failed', 500);
    }
  }

  // ============= SETTINGS (payment config etc) =============
  if (seg[0] === 'settings') {
    const key = seg[1];
    if (method === 'GET' && key) {
      const { data } = await client.from('settings').select('value').eq('key', key).maybeSingle();
      return json({ key, value: data?.value || null });
    }
    if (method === 'PUT' && key && requireAdmin(request)) {
      const body = await request.json();
      await client.from('settings').upsert({ key, value: body.value ?? body, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      return json({ ok: true });
    }
  }

  // ============= NEWSLETTER =============
  if (seg[0] === 'newsletter' && method === 'POST') {
    const { email } = await request.json();
    if (!email) return err('Email required');
    await client.from('newsletter').upsert({ email }, { onConflict: 'email' });
    return json({ ok: true });
  }

  return err('Not found', 404);
}

export async function GET(request, { params }) { const p = (await params).path || []; try { return await handle(request, p, 'GET'); } catch (e) { console.error('API error', e); return err(e.message, 500); } }
export async function POST(request, { params }) { const p = (await params).path || []; try { return await handle(request, p, 'POST'); } catch (e) { console.error('API error', e); return err(e.message, 500); } }
export async function PUT(request, { params }) { const p = (await params).path || []; try { return await handle(request, p, 'PUT'); } catch (e) { console.error('API error', e); return err(e.message, 500); } }
export async function PATCH(request, { params }) { const p = (await params).path || []; try { return await handle(request, p, 'PATCH'); } catch (e) { console.error('API error', e); return err(e.message, 500); } }
export async function DELETE(request, { params }) { const p = (await params).path || []; try { return await handle(request, p, 'DELETE'); } catch (e) { console.error('API error', e); return err(e.message, 500); } }
