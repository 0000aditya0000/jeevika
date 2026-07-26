'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutDashboard, ShoppingBag, Package, Users, Tag, LogOut, Plus, Edit, Trash2, TrendingUp, IndianRupee, Clock, CheckCircle2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'categories', label: 'Categories', icon: Tag },
];

const STATUS_OPTIONS = ['placed','payment_pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled'];
const STATUS_COLORS = { placed: 'bg-blue-100 text-blue-700', payment_pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-purple-100 text-purple-700', processing: 'bg-indigo-100 text-indigo-700', packed: 'bg-cyan-100 text-cyan-700', shipped: 'bg-teal-100 text-teal-700', out_for_delivery: 'bg-orange-100 text-orange-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

export default function Dashboard() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orderView, setOrderView] = useState(null);
  const [productEdit, setProductEdit] = useState(null);
  const [showProdForm, setShowProdForm] = useState(false);
  const [categoryEdit, setCategoryEdit] = useState(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const t = localStorage.getItem('jc_admin_token');
    if (!t) return router.push('/admin');
    setToken(t);
    setAdmin(JSON.parse(localStorage.getItem('jc_admin') || '{}'));
  }, [router]);

  const authFetch = (url, opts = {}) => fetch(url, { ...opts, headers: { ...(opts.headers || {}), authorization: `Bearer ${token}`, 'content-type': 'application/json' } });

  useEffect(() => {
    if (!token) return;
    authFetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d.stats));
    authFetch('/api/orders').then(r => r.json()).then(d => setOrders(d.orders || []));
    fetch('/api/products?limit=500').then(r => r.json()).then(d => setProducts(d.products || []));
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  }, [token]);

  const refresh = () => {
    authFetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d.stats));
    authFetch('/api/orders').then(r => r.json()).then(d => setOrders(d.orders || []));
    fetch('/api/products?limit=500').then(r => r.json()).then(d => setProducts(d.products || []));
  };

  const logout = () => { localStorage.removeItem('jc_admin_token'); localStorage.removeItem('jc_admin'); router.push('/admin'); };

  const updateOrderStatus = async (order, status, paymentStatus) => {
    await authFetch(`/api/orders/${order.id}`, { method: 'PATCH', body: JSON.stringify({ status, paymentStatus }) });
    toast.success('Order updated');
    refresh();
    setOrderView(null);
  };

  const saveProduct = async (prod) => {
    const url = prod.id ? `/api/products/${prod.id}` : '/api/products';
    const method = prod.id ? 'PUT' : 'POST';
    const res = await authFetch(url, { method, body: JSON.stringify(prod) });
    if (res.ok) { toast.success(prod.id ? 'Product updated' : 'Product added'); refresh(); setShowProdForm(false); setProductEdit(null); }
    else toast.error('Failed');
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await authFetch(`/api/products/${id}`, { method: 'DELETE' });
    toast.success('Deleted'); refresh();
  };

  const saveCategory = async (cat) => {
    const url = cat.id ? `/api/categories/${cat.id}` : '/api/categories';
    const method = cat.id ? 'PUT' : 'POST';
    const res = await authFetch(url, { method, body: JSON.stringify(cat) });
    if (res.ok) { toast.success(cat.id ? 'Category updated' : 'Category added'); fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])); setShowCatForm(false); setCategoryEdit(null); }
    else toast.error('Failed');
  };

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    await authFetch(`/api/categories/${id}`, { method: 'DELETE' });
    toast.success('Deleted');
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      return o.orderId.toLowerCase().includes(q) || o.customer.fullName.toLowerCase().includes(q) || o.customer.phone?.includes(q) || o.customer.email?.toLowerCase().includes(q);
    }
    return true;
  });

  if (!token) return null;

  return (
    <div className="min-h-screen bg-primary-50/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-primary-100 flex flex-col p-4 sticky top-0 h-screen">
        <div className="px-2 py-4">
          <div className="font-display text-2xl font-bold text-gradient-luxury">Jeevikaa</div>
          <div className="text-[10px] tracking-[0.3em] text-gold-dark">A D M I N</div>
        </div>
        <nav className="flex-1 mt-6 space-y-1">
          {NAV.map(n => (
            <button key={n.key} onClick={() => setTab(n.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === n.key ? 'bg-primary text-white shadow-soft' : 'hover:bg-primary-50 text-foreground/80'}`}>
              <n.icon className="w-4 h-4" /> {n.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-primary-100 pt-4">
          <div className="px-3 pb-3">
            <div className="text-sm font-semibold">{admin?.name}</div>
            <div className="text-xs text-muted-foreground">{admin?.email}</div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-50 text-red-600"><LogOut className="w-4 h-4" /> Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {tab === 'dashboard' && (
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {admin?.name}. Here's what's happening at Jeevikaa Couture today.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { icon: IndianRupee, label: "Today's Revenue", value: `₹${(stats?.todaysRevenue || 0).toLocaleString('en-IN')}`, color: 'from-primary to-primary-700' },
                { icon: TrendingUp, label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, color: 'from-gold to-gold-dark' },
                { icon: ShoppingBag, label: "Today's Orders", value: stats?.todaysOrders || 0, color: 'from-purple-500 to-purple-700' },
                { icon: Clock, label: 'Pending Orders', value: stats?.pending || 0, color: 'from-orange-500 to-red-500' },
                { icon: CheckCircle2, label: 'Delivered', value: stats?.delivered || 0, color: 'from-green-500 to-green-700' },
                { icon: ShoppingBag, label: 'Total Orders', value: stats?.totalOrders || 0, color: 'from-blue-500 to-blue-700' },
                { icon: Package, label: 'Products', value: stats?.productCount || 0, color: 'from-pink-500 to-pink-700' },
                { icon: Tag, label: 'Categories', value: stats?.categoryCount || 0, color: 'from-indigo-500 to-indigo-700' },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-primary-100 shadow-soft">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.color} text-white flex items-center justify-center mb-3`}><c.icon className="w-5 h-5" /></div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                  <div className="font-display text-2xl font-bold mt-1">{c.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-white rounded-2xl border border-primary-100 shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-primary-100"><h3 className="font-display text-xl font-bold">Recent Orders</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-primary-50/40 text-left"><tr><th className="px-4 py-3 font-semibold">Order ID</th><th className="px-4 py-3 font-semibold">Customer</th><th className="px-4 py-3 font-semibold">Amount</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Date</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 10).map(o => (
                      <tr key={o.id} className="border-t border-primary-100/50 hover:bg-primary-50/30 cursor-pointer" onClick={() => setOrderView(o)}>
                        <td className="px-4 py-3 font-mono text-xs">{o.orderId}</td>
                        <td className="px-4 py-3">{o.customer.fullName}</td>
                        <td className="px-4 py-3 font-semibold text-primary">₹{o.total.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>{o.status.replace(/_/g,' ')}</span></td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan="5" className="text-center py-10 text-muted-foreground">No orders yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <h1 className="font-display text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground mt-1">{filteredOrders.length} of {orders.length} orders</p>
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <div className="flex-1 min-w-[240px]">
                <Input placeholder="Search by Order ID (e.g. JC202607260001), name, phone, or email…" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} className="h-10 rounded-full" />
              </div>
              <div className="w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 rounded-full"><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g,' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {(orderSearch || statusFilter !== 'all') && <Button size="sm" variant="outline" onClick={() => { setOrderSearch(''); setStatusFilter('all'); }} className="rounded-full">Clear</Button>}
            </div>
            <div className="mt-6 bg-white rounded-2xl border border-primary-100 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-primary-50/40 text-left"><tr><th className="px-4 py-3 font-semibold">Order</th><th className="px-4 py-3 font-semibold">Customer</th><th className="px-4 py-3 font-semibold">Amount</th><th className="px-4 py-3 font-semibold">Payment</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3"></th></tr></thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o.id} className="border-t border-primary-100/50 hover:bg-primary-50/30 cursor-pointer" onClick={() => setOrderView(o)}>
                        <td className="px-4 py-3"><div className="font-mono text-xs">{o.orderId}</div><div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString('en-IN')}</div></td>
                        <td className="px-4 py-3"><div className="font-medium">{o.customer.fullName}</div><div className="text-xs text-muted-foreground">{o.customer.phone}</div></td>
                        <td className="px-4 py-3 font-semibold text-primary">₹{o.total.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3"><span className="text-xs uppercase font-semibold">{o.paymentMethod}</span>{o.utrNumber && <div className="text-[10px] text-muted-foreground">UTR: {o.utrNumber}</div>}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>{o.status.replace(/_/g,' ')}</span></td>
                        <td className="px-4 py-3"><Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setOrderView(o); }}><Eye className="w-3.5 h-3.5" /></Button></td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && <tr><td colSpan="6" className="text-center py-10 text-muted-foreground">{orderSearch || statusFilter !== 'all' ? 'No orders match your search' : 'No orders yet'}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div>
            <div className="flex justify-between items-center">
              <div><h1 className="font-display text-3xl font-bold">Products</h1><p className="text-muted-foreground mt-1">{products.length} products</p></div>
              <Button onClick={() => { setProductEdit({ name: '', slug: '', sku: '', category: 'sarees', price: 0, discountPrice: 0, description: '', shortDescription: '', material: '', fabric: '', colors: [], sizes: [], stock: 10, images: [], thumbnail: '', tags: [], trending: false, featured: false, bestSeller: false, newArrival: true, hotDeal: false }); setShowProdForm(true); }} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
            </div>
            <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-primary-100 shadow-soft overflow-hidden flex">
                  <img src={p.thumbnail} className="w-24 h-32 object-cover" alt="" />
                  <div className="flex-1 p-3">
                    <div className="text-xs text-muted-foreground uppercase">{p.category}</div>
                    <div className="font-display font-semibold line-clamp-1">{p.name}</div>
                    <div className="text-sm font-semibold text-primary mt-1">₹{(p.discountPrice || p.price).toLocaleString('en-IN')}</div>
                    <div className="text-xs text-muted-foreground">Stock: {p.stock}</div>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="outline" onClick={() => { setProductEdit(p); setShowProdForm(true); }}><Edit className="w-3 h-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => deleteProduct(p.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'categories' && (
          <div>
            <div className="flex justify-between items-center">
              <div><h1 className="font-display text-3xl font-bold">Categories</h1><p className="text-muted-foreground mt-1">{categories.length} categories</p></div>
              <Button onClick={() => { setCategoryEdit({ name: '', slug: '', description: '', banner: '', thumbnail: '', status: 'active', displayOrder: 0 }); setShowCatForm(true); }} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Add Category</Button>
            </div>
            <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-primary-100 shadow-soft overflow-hidden group">
                  <div className="relative">
                    <img src={c.thumbnail} className="w-full h-32 object-cover" alt="" />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={() => { setCategoryEdit(c); setShowCatForm(true); }}><Edit className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600" onClick={() => deleteCategory(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="font-display font-bold text-lg">{c.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">/{c.slug}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2 mt-1">{c.description}</div>
                    <div className="text-xs mt-2"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">{c.status}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Category Form Dialog */}
      <Dialog open={showCatForm} onOpenChange={setShowCatForm}>
        <DialogContent className="max-w-lg">
          {categoryEdit && (<>
            <DialogHeader><DialogTitle className="font-display text-2xl">{categoryEdit.id ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={categoryEdit.name} onChange={e => setCategoryEdit({ ...categoryEdit, name: e.target.value, slug: categoryEdit.id ? categoryEdit.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') })} /></div>
              <div><Label>Slug</Label><Input value={categoryEdit.slug} onChange={e => setCategoryEdit({ ...categoryEdit, slug: e.target.value })} className="font-mono" /></div>
              <div><Label>Description</Label><Textarea rows={2} value={categoryEdit.description || ''} onChange={e => setCategoryEdit({ ...categoryEdit, description: e.target.value })} /></div>
              <div><Label>Thumbnail Image URL</Label><Input value={categoryEdit.thumbnail || ''} onChange={e => setCategoryEdit({ ...categoryEdit, thumbnail: e.target.value, banner: categoryEdit.banner || e.target.value })} placeholder="https://..." /></div>
              <div><Label>Banner Image URL</Label><Input value={categoryEdit.banner || ''} onChange={e => setCategoryEdit({ ...categoryEdit, banner: e.target.value })} placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Display Order</Label><Input type="number" value={categoryEdit.displayOrder || 0} onChange={e => setCategoryEdit({ ...categoryEdit, displayOrder: +e.target.value })} /></div>
                <div><Label>Status</Label>
                  <Select value={categoryEdit.status || 'active'} onValueChange={v => setCategoryEdit({ ...categoryEdit, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              {categoryEdit.thumbnail && <img src={categoryEdit.thumbnail} className="w-full h-32 object-cover rounded-lg" alt="preview" />}
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => { setShowCatForm(false); setCategoryEdit(null); }}>Cancel</Button>
              <Button onClick={() => saveCategory(categoryEdit)} disabled={!categoryEdit.name || !categoryEdit.slug}>{categoryEdit.id ? 'Update' : 'Create'}</Button>
            </div>
          </>)}
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={!!orderView} onOpenChange={() => setOrderView(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {orderView && (<>
            <DialogHeader><DialogTitle className="font-display text-2xl">Order {orderView.orderId}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-primary-50/40"><div className="text-xs text-muted-foreground">Customer</div><div className="font-semibold">{orderView.customer.fullName}</div><div>{orderView.customer.phone}</div><div className="text-xs">{orderView.customer.email}</div></div>
                <div className="p-3 rounded-lg bg-primary-50/40"><div className="text-xs text-muted-foreground">Shipping to</div><div className="text-sm">{orderView.customer.address}, {orderView.customer.city}, {orderView.customer.state} - {orderView.customer.pincode}</div></div>
              </div>
              <div className="p-3 rounded-lg bg-primary-50/40 text-sm">
                <div className="text-xs text-muted-foreground mb-2">Items</div>
                {orderView.items.map((it, i) => <div key={i} className="flex justify-between py-1"><span>{it.name}{it.size ? ' · '+it.size : ''}{it.color ? ' · '+it.color : ''} × {it.qty}</span><span className="font-semibold">₹{(it.price * it.qty).toLocaleString('en-IN')}</span></div>)}
                <div className="border-t border-primary-100 mt-2 pt-2 flex justify-between font-bold text-primary"><span>Total</span><span>₹{orderView.total.toLocaleString('en-IN')}</span></div>
              </div>
              <div className="p-3 rounded-lg bg-primary-50/40 text-sm">
                <div className="text-xs text-muted-foreground">Payment</div>
                <div className="font-semibold uppercase">{orderView.paymentMethod}</div>
                {orderView.utrNumber && <div>UTR: <span className="font-mono">{orderView.utrNumber}</span></div>}
                <div className="text-xs">Status: {orderView.paymentStatus}</div>
              </div>
              {orderView.paymentStatus === 'pending_verification' && (
                <div className="p-3 rounded-lg border-2 border-yellow-200 bg-yellow-50">
                  <div className="font-semibold text-sm mb-2">⚠ Payment Verification Pending</div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateOrderStatus(orderView, 'confirmed', 'verified')} className="bg-green-600 hover:bg-green-700">✓ Approve Payment</Button>
                    <Button size="sm" variant="outline" onClick={() => updateOrderStatus(orderView, 'cancelled', 'failed')} className="border-red-300 text-red-600">✗ Reject</Button>
                  </div>
                </div>
              )}
              {orderView.statusHistory?.length > 0 && (
                <div className="p-3 rounded-lg bg-primary-50/40">
                  <div className="text-xs text-muted-foreground mb-2">Status History</div>
                  <div className="space-y-2">
                    {orderView.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium capitalize">{h.status.replace(/_/g,' ')}</div>
                          <div className="text-xs text-muted-foreground">{new Date(h.at).toLocaleString('en-IN')}</div>
                          {h.note && <div className="text-xs text-foreground/80 italic">"{h.note}"</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label>Update Status</Label>
                <Select onValueChange={v => updateOrderStatus(orderView, v)} defaultValue={orderView.status}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g,' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </>)}
        </DialogContent>
      </Dialog>

      {/* Product Form Dialog */}
      <Dialog open={showProdForm} onOpenChange={setShowProdForm}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {productEdit && (<>
            <DialogHeader><DialogTitle className="font-display text-2xl">{productEdit.id ? 'Edit' : 'Add'} Product</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Name</Label><Input value={productEdit.name} onChange={e => setProductEdit({ ...productEdit, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') })} /></div>
              <div><Label>SKU</Label><Input value={productEdit.sku} onChange={e => setProductEdit({ ...productEdit, sku: e.target.value })} /></div>
              <div><Label>Category</Label>
                <Select value={productEdit.category} onValueChange={v => setProductEdit({ ...productEdit, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Price</Label><Input type="number" value={productEdit.price} onChange={e => setProductEdit({ ...productEdit, price: +e.target.value })} /></div>
              <div><Label>Discount Price</Label><Input type="number" value={productEdit.discountPrice} onChange={e => setProductEdit({ ...productEdit, discountPrice: +e.target.value })} /></div>
              <div><Label>Stock</Label><Input type="number" value={productEdit.stock} onChange={e => setProductEdit({ ...productEdit, stock: +e.target.value })} /></div>
              <div><Label>Material</Label><Input value={productEdit.material} onChange={e => setProductEdit({ ...productEdit, material: e.target.value })} /></div>
              <div className="col-span-2"><Label>Short Description</Label><Input value={productEdit.shortDescription} onChange={e => setProductEdit({ ...productEdit, shortDescription: e.target.value })} /></div>
              <div className="col-span-2"><Label>Description</Label><Textarea rows={3} value={productEdit.description} onChange={e => setProductEdit({ ...productEdit, description: e.target.value })} /></div>
              <div className="col-span-2"><Label>Image URLs (comma separated)</Label><Textarea rows={2} value={(productEdit.images || []).join(', ')} onChange={e => { const imgs = e.target.value.split(',').map(x => x.trim()).filter(Boolean); setProductEdit({ ...productEdit, images: imgs, thumbnail: imgs[0] || productEdit.thumbnail }); }} /></div>
              <div><Label>Sizes (comma)</Label><Input value={(productEdit.sizes || []).join(', ')} onChange={e => setProductEdit({ ...productEdit, sizes: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })} /></div>
              <div><Label>Colors (hex, comma)</Label><Input value={(productEdit.colors || []).join(', ')} onChange={e => setProductEdit({ ...productEdit, colors: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })} /></div>
              <div className="col-span-2 flex flex-wrap gap-3">
                {['trending','featured','bestSeller','newArrival','hotDeal'].map(k => (
                  <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!productEdit[k]} onChange={e => setProductEdit({ ...productEdit, [k]: e.target.checked })} /> {k}</label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => { setShowProdForm(false); setProductEdit(null); }}>Cancel</Button>
              <Button onClick={() => saveProduct(productEdit)}>{productEdit.id ? 'Update' : 'Create'}</Button>
            </div>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
