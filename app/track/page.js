'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, CheckCircle2, Truck, Home as HomeIcon, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STAGES = [
  { key: 'placed', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'packed', label: 'Packed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: HomeIcon },
];

const STATUS_LABEL = { placed: 'Placed', payment_pending: 'Payment Pending Verification', confirmed: 'Confirmed', processing: 'Processing', packed: 'Packed', shipped: 'Shipped', in_transit: 'In Transit', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

function TrackContent() {
  const sp = useSearchParams();
  const [id, setId] = useState(sp.get('id') || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const track = async (orderIdRaw) => {
    const orderId = (orderIdRaw || '').trim().toUpperCase();
    if (!orderId) { setError('Please enter your Order ID'); return; }
    setLoading(true); setError(''); setOrder(null);
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(orderId)}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || `Order "${orderId}" not found. Please check the ID (starts with JC) and try again.`);
      } else if (data.order) {
        setOrder(data.order);
        setId(orderId);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (e) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const q = sp.get('id'); if (q) track(q); }, [sp]);

  const isCancelled = order?.status === 'cancelled';
  const isPaymentPending = order?.status === 'payment_pending';
  const currentIdx = order ? STAGES.findIndex(s => s.key === order.status) : -1;

  return (
    <div className="container mx-auto px-4 py-14 max-w-3xl">
      <div className="text-center mb-10">
        <div className="text-xs tracking-[0.4em] text-primary font-semibold mb-3">SHIPMENT TRACKING</div>
        <h1 className="font-display text-4xl md:text-5xl font-bold luxury-border inline-block">Track your Order</h1>
      </div>

      <div className="flex gap-3 max-w-md mx-auto">
        <Input value={id} onChange={e => setId(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && track(id)} placeholder="e.g. JC202607260001" className="h-12 rounded-full" />
        <Button onClick={() => track(id)} disabled={loading} className="h-12 rounded-full px-6">{loading ? 'Tracking...' : 'Track'}</Button>
      </div>

      {loading && <div className="mt-10 text-center text-muted-foreground">Fetching your order...</div>}
      {error && !loading && (
        <div className="mt-10 text-center max-w-md mx-auto p-6 rounded-2xl bg-red-50 border border-red-200">
          <div className="text-3xl mb-2">📦</div>
          <div className="text-destructive font-medium">{error}</div>
          <div className="text-xs text-muted-foreground mt-2">Order IDs start with <span className="font-mono font-bold">JC</span> followed by 12 digits (e.g. <span className="font-mono">JC202607260001</span>).</div>
        </div>
      )}

      {order && (
        <div className="mt-10 bg-white rounded-3xl border border-primary-100 p-6 md:p-8 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-primary-100">
            <div>
              <div className="text-xs text-muted-foreground">Order ID</div>
              <div className="font-display text-xl font-bold">{order.orderId}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Placed on</div>
              <div className="font-semibold">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-display text-xl font-bold text-primary">₹{order.total.toLocaleString('en-IN')}</div>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-primary-50 text-primary text-xs font-semibold">{STATUS_LABEL[order.status] || order.status}</div>
          </div>

          {isCancelled ? (
            <div className="mt-8 p-6 rounded-2xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3"><XCircle className="w-6 h-6" /> This order was cancelled.</div>
          ) : isPaymentPending ? (
            <div className="mt-8 p-6 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-900">
              <div className="font-semibold flex items-center gap-2">⏳ Payment Verification Pending</div>
              <div className="text-sm mt-2">Your payment {order.utrNumber && <>with UTR <span className="font-mono font-semibold">{order.utrNumber}</span></>} is being verified. You'll receive a confirmation email within approximately 30 minutes.</div>
            </div>
          ) : (
            <div className="mt-8">
              <div className="flex justify-between relative">
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-primary-100" />
                <div className="absolute top-5 left-5 h-0.5 bg-primary transition-all" style={{ width: `calc((100% - 2.5rem) * ${Math.max(0, currentIdx) / (STAGES.length - 1)})` }} />
                {STAGES.map((s, i) => {
                  const done = i <= currentIdx;
                  const Ic = s.icon;
                  return (
                    <div key={s.key} className="relative flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${done ? 'bg-primary text-white shadow-md' : 'bg-white border-2 border-primary-100 text-primary-300'}`}><Ic className="w-4 h-4" /></div>
                      <div className={`text-[10px] md:text-xs mt-2 text-center ${done ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Delivery to</div>
              <div className="font-semibold">{order.customer.fullName}</div>
              <div className="text-sm text-muted-foreground">{order.customer.address}, {order.customer.city}, {order.customer.state} - {order.customer.pincode}</div>
              <div className="text-sm text-muted-foreground mt-1">📞 {order.customer.phone}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Items ({order.items.length})</div>
              <div className="space-y-2">
                {order.items.map((it, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <img src={it.thumbnail} className="w-10 h-12 rounded-md object-cover" alt="" />
                    <div className="flex-1"><div className="font-medium line-clamp-1">{it.name}</div><div className="text-xs text-muted-foreground">Qty {it.qty}</div></div>
                    <div className="font-semibold">₹{(it.price * it.qty).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Track() {
  return <Suspense fallback={<div className="py-20 text-center">Loading...</div>}><TrackContent /></Suspense>;
}
