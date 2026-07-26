import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { getDb, COLLECTIONS } from '@/lib/mongo';
import { hashPassword, verifyPassword, signToken, verifyToken } from '@/lib/auth';
import { sendEmail, orderPlacedEmail } from '@/lib/email';
import { CATEGORIES, PRODUCTS, TESTIMONIALS, ADMIN_SEED } from '@/lib/seed-data';

const json = (data, status = 200) => NextResponse.json(data, { status });
const err = (message, status = 400) => NextResponse.json({ error: message }, { status });

async function ensureSeed() {
  const db = await getDb();
  const settings = await db.collection(COLLECTIONS.settings).findOne({ key: 'seeded' });
  if (settings?.value === true) return;
  const now = new Date();
  // Categories
  const cats = CATEGORIES.map(c => ({ id: uuid(), ...c, status: 'active', displayOrder: 0, createdAt: now }));
  await db.collection(COLLECTIONS.categories).insertMany(cats);
  // Products
  const prods = PRODUCTS.map(p => ({ id: uuid(), ...p, offerPercentage: p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0, status: 'active', rating: 4.5 + Math.random() * 0.5, reviewCount: Math.floor(Math.random() * 40) + 10, createdAt: now }));
  await db.collection(COLLECTIONS.products).insertMany(prods);
  // Testimonials
  await db.collection(COLLECTIONS.testimonials).insertMany(TESTIMONIALS.map(t => ({ id: uuid(), ...t, createdAt: now })));
  // Admin
  await db.collection(COLLECTIONS.admins).insertOne({ id: uuid(), email: ADMIN_SEED.email, name: ADMIN_SEED.name, role: ADMIN_SEED.role, passwordHash: hashPassword(ADMIN_SEED.password), createdAt: now });
  await db.collection(COLLECTIONS.settings).updateOne({ key: 'seeded' }, { $set: { key: 'seeded', value: true, seededAt: now } }, { upsert: true });
}

function genOrderId() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `JC${y}${m}${day}${rand}`;
}

function requireAdmin(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '') || request.cookies.get('jc_admin_token')?.value;
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

async function handle(request, path, method) {
  await ensureSeed();
  const db = await getDb();
  const url = new URL(request.url);
  const seg = path;

  // ==== PUBLIC ROUTES ====
  if (seg[0] === 'health') return json({ ok: true, service: 'jeevikaa' });

  if (seg[0] === 'categories') {
    if (method === 'GET') {
      const cats = await db.collection(COLLECTIONS.categories).find({ status: 'active' }).sort({ displayOrder: 1, name: 1 }).toArray();
      return json({ categories: cats.map(c => ({ ...c, _id: undefined })) });
    }
    if (method === 'POST' && requireAdmin(request)) {
      const body = await request.json();
      const doc = { id: uuid(), ...body, status: body.status || 'active', createdAt: new Date() };
      await db.collection(COLLECTIONS.categories).insertOne(doc);
      return json({ category: { ...doc, _id: undefined } });
    }
  }

  if (seg[0] === 'products') {
    if (method === 'GET' && !seg[1]) {
      const q = url.searchParams.get('q');
      const category = url.searchParams.get('category');
      const filter = url.searchParams.get('filter');
      const sort = url.searchParams.get('sort') || 'newest';
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const query = { status: 'active' };
      if (category) query.category = category;
      if (q) query.$or = [{ name: { $regex: q, $options: 'i' } }, { tags: { $in: [new RegExp(q, 'i')] } }, { description: { $regex: q, $options: 'i' } }];
      if (filter === 'trending') query.trending = true;
      if (filter === 'new') query.newArrival = true;
      if (filter === 'bestseller') query.bestSeller = true;
      if (filter === 'hotdeal') query.hotDeal = true;
      const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, priceAsc: { discountPrice: 1 }, priceDesc: { discountPrice: -1 }, popular: { reviewCount: -1 } };
      const products = await db.collection(COLLECTIONS.products).find(query).sort(sortMap[sort] || sortMap.newest).limit(limit).toArray();
      return json({ products: products.map(p => ({ ...p, _id: undefined })) });
    }
    if (method === 'GET' && seg[1]) {
      const p = await db.collection(COLLECTIONS.products).findOne({ $or: [{ slug: seg[1] }, { id: seg[1] }] });
      if (!p) return err('Not found', 404);
      const related = await db.collection(COLLECTIONS.products).find({ category: p.category, id: { $ne: p.id } }).limit(4).toArray();
      return json({ product: { ...p, _id: undefined }, related: related.map(r => ({ ...r, _id: undefined })) });
    }
    if (method === 'POST' && requireAdmin(request)) {
      const body = await request.json();
      const doc = { id: uuid(), ...body, status: body.status || 'active', createdAt: new Date() };
      if (doc.price && doc.discountPrice) doc.offerPercentage = Math.round(((doc.price - doc.discountPrice) / doc.price) * 100);
      await db.collection(COLLECTIONS.products).insertOne(doc);
      return json({ product: { ...doc, _id: undefined } });
    }
    if (method === 'PUT' && seg[1] && requireAdmin(request)) {
      const body = await request.json();
      delete body._id; delete body.id;
      if (body.price && body.discountPrice) body.offerPercentage = Math.round(((body.price - body.discountPrice) / body.price) * 100);
      await db.collection(COLLECTIONS.products).updateOne({ id: seg[1] }, { $set: { ...body, updatedAt: new Date() } });
      return json({ ok: true });
    }
    if (method === 'DELETE' && seg[1] && requireAdmin(request)) {
      await db.collection(COLLECTIONS.products).deleteOne({ id: seg[1] });
      return json({ ok: true });
    }
  }

  if (seg[0] === 'testimonials' && method === 'GET') {
    const list = await db.collection(COLLECTIONS.testimonials).find().limit(20).toArray();
    return json({ testimonials: list.map(t => ({ ...t, _id: undefined })) });
  }

  if (seg[0] === 'orders') {
    if (method === 'POST' && !seg[1]) {
      const body = await request.json();
      const orderId = genOrderId();
      const now = new Date();
      const subtotal = body.items.reduce((s, i) => s + i.price * i.qty, 0);
      const shipping = subtotal >= 2999 ? 0 : 149;
      const total = subtotal + shipping - (body.discount || 0);
      const order = {
        id: uuid(), orderId,
        customer: body.customer,
        items: body.items,
        subtotal, shipping, discount: body.discount || 0, total,
        paymentMethod: body.paymentMethod,
        utrNumber: body.utrNumber || null,
        status: body.paymentMethod === 'qr' ? 'payment_pending' : 'placed',
        paymentStatus: body.paymentMethod === 'qr' ? 'pending_verification' : 'cod',
        statusHistory: [{ status: body.paymentMethod === 'qr' ? 'payment_pending' : 'placed', at: now }],
        createdAt: now,
      };
      await db.collection(COLLECTIONS.orders).insertOne(order);
      // Send email (mocked until Gmail SMTP is set up)
      try { await sendEmail({ to: body.customer.email, subject: `Order ${orderId} received — Jeevikaa Couture`, html: orderPlacedEmail(order) }); } catch (e) { console.error(e); }
      return json({ order: { ...order, _id: undefined } });
    }
    if (method === 'GET' && seg[1] === 'track' && seg[2]) {
      const order = await db.collection(COLLECTIONS.orders).findOne({ orderId: seg[2] });
      if (!order) return err('Order not found', 404);
      return json({ order: { ...order, _id: undefined } });
    }
    if (method === 'GET' && !seg[1] && requireAdmin(request)) {
      const list = await db.collection(COLLECTIONS.orders).find().sort({ createdAt: -1 }).limit(500).toArray();
      return json({ orders: list.map(o => ({ ...o, _id: undefined })) });
    }
    if (method === 'PATCH' && seg[1] && requireAdmin(request)) {
      const body = await request.json();
      const order = await db.collection(COLLECTIONS.orders).findOne({ id: seg[1] });
      if (!order) return err('Not found', 404);
      const history = order.statusHistory || [];
      history.push({ status: body.status, at: new Date(), note: body.note });
      const update = { status: body.status, statusHistory: history, updatedAt: new Date() };
      if (body.paymentStatus) update.paymentStatus = body.paymentStatus;
      await db.collection(COLLECTIONS.orders).updateOne({ id: seg[1] }, { $set: update });
      return json({ ok: true });
    }
  }

  if (seg[0] === 'admin') {
    if (seg[1] === 'login' && method === 'POST') {
      const { email, password } = await request.json();
      const admin = await db.collection(COLLECTIONS.admins).findOne({ email });
      if (!admin || !verifyPassword(password, admin.passwordHash)) return err('Invalid credentials', 401);
      const token = signToken({ id: admin.id, email: admin.email, role: 'admin', name: admin.name });
      return json({ token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
    }
    if (seg[1] === 'me' && method === 'GET') {
      const p = requireAdmin(request);
      if (!p) return err('Unauthorized', 401);
      return json({ admin: p });
    }
    if (seg[1] === 'stats' && method === 'GET' && requireAdmin(request)) {
      const orders = await db.collection(COLLECTIONS.orders).find().toArray();
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todaysOrders = orders.filter(o => new Date(o.createdAt) >= today);
      const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
      const todaysRevenue = todaysOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
      const pending = orders.filter(o => ['placed','payment_pending','confirmed','processing','packed'].includes(o.status)).length;
      const delivered = orders.filter(o => o.status === 'delivered').length;
      const productCount = await db.collection(COLLECTIONS.products).countDocuments();
      const categoryCount = await db.collection(COLLECTIONS.categories).countDocuments();
      return json({ stats: { totalOrders: orders.length, todaysOrders: todaysOrders.length, totalRevenue, todaysRevenue, pending, delivered, productCount, categoryCount } });
    }
  }

  if (seg[0] === 'newsletter' && method === 'POST') {
    const { email } = await request.json();
    if (!email) return err('Email required');
    await db.collection(COLLECTIONS.newsletter).updateOne({ email }, { $set: { email, createdAt: new Date() } }, { upsert: true });
    return json({ ok: true });
  }

  return err('Not found', 404);
}

export async function GET(request, { params }) { const p = (await params).path || []; try { return await handle(request, p, 'GET'); } catch (e) { console.error(e); return err(e.message, 500); } }
export async function POST(request, { params }) { const p = (await params).path || []; try { return await handle(request, p, 'POST'); } catch (e) { console.error(e); return err(e.message, 500); } }
export async function PUT(request, { params }) { const p = (await params).path || []; try { return await handle(request, p, 'PUT'); } catch (e) { console.error(e); return err(e.message, 500); } }
export async function PATCH(request, { params }) { const p = (await params).path || []; try { return await handle(request, p, 'PATCH'); } catch (e) { console.error(e); return err(e.message, 500); } }
export async function DELETE(request, { params }) { const p = (await params).path || []; try { return await handle(request, p, 'DELETE'); } catch (e) { console.error(e); return err(e.message, 500); } }
