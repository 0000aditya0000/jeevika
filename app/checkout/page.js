'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Truck, ShieldCheck, QrCode, Wallet, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function Checkout() {
  const { cart, cartSubtotal, clearCart, hydrated } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState({ fullName: '', phone: '', email: '', address: '', city: '', state: '', pincode: '', landmark: '', altPhone: '', notes: '' });

  if (hydrated && cart.length === 0) {
    if (typeof window !== 'undefined') router.push('/cart');
    return null;
  }

  const shipping = cartSubtotal >= 2999 ? 0 : 149;
  const total = cartSubtotal + shipping;

  const submitOrder = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
        customer, items: cart, paymentMethod, utrNumber: paymentMethod === 'qr' ? utrNumber : null,
      }) });
      const data = await res.json();
      if (data.order) {
        clearCart();
        router.push(`/order-success?orderId=${data.order.orderId}&method=${paymentMethod}`);
      } else toast.error(data.error || 'Something went wrong');
    } catch { toast.error('Failed to place order'); }
    setSubmitting(false);
  };

  const canProceed = customer.fullName && customer.phone && customer.email && customer.address && customer.city && customer.state && customer.pincode;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <h1 className="font-display text-4xl font-bold mb-2">Checkout</h1>
      <div className="flex items-center gap-2 text-sm mb-8">
        <span className={step >= 1 ? 'text-primary font-semibold' : 'text-muted-foreground'}>1. Shipping</span>
        <span className="text-muted-foreground">→</span>
        <span className={step >= 2 ? 'text-primary font-semibold' : 'text-muted-foreground'}>2. Payment</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 ? (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-primary-100 shadow-soft">
              <h2 className="font-display text-2xl font-bold mb-6">Shipping Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Full Name *</Label><Input value={customer.fullName} onChange={e => setCustomer({ ...customer, fullName: e.target.value })} className="mt-1" /></div>
                <div><Label>Phone *</Label><Input value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} className="mt-1" /></div>
                <div className="md:col-span-2"><Label>Email *</Label><Input type="email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} className="mt-1" /></div>
                <div className="md:col-span-2"><Label>Address *</Label><Textarea value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} className="mt-1" rows={2} /></div>
                <div><Label>City *</Label><Input value={customer.city} onChange={e => setCustomer({ ...customer, city: e.target.value })} className="mt-1" /></div>
                <div><Label>State *</Label><Input value={customer.state} onChange={e => setCustomer({ ...customer, state: e.target.value })} className="mt-1" /></div>
                <div><Label>PIN Code *</Label><Input value={customer.pincode} onChange={e => setCustomer({ ...customer, pincode: e.target.value.replace(/\D/g,'').slice(0,6) })} className="mt-1" /></div>
                <div><Label>Landmark</Label><Input value={customer.landmark} onChange={e => setCustomer({ ...customer, landmark: e.target.value })} className="mt-1" /></div>
                <div><Label>Alternate Phone</Label><Input value={customer.altPhone} onChange={e => setCustomer({ ...customer, altPhone: e.target.value })} className="mt-1" /></div>
                <div className="md:col-span-2"><Label>Order Notes</Label><Textarea value={customer.notes} onChange={e => setCustomer({ ...customer, notes: e.target.value })} className="mt-1" rows={2} placeholder="Any special instructions?" /></div>
              </div>
              <Button size="lg" disabled={!canProceed} onClick={() => setStep(2)} className="mt-6 rounded-full px-8">Continue to Payment →</Button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-primary-100 shadow-soft">
              <h2 className="font-display text-2xl font-bold mb-6">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary-50' : 'border-input hover:border-primary/40'}`}>
                  <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2"><Wallet className="w-5 h-5" /> Cash on Delivery</div>
                    <div className="text-sm text-muted-foreground mt-1">Pay when you receive your order. Safe & convenient.</div>
                  </div>
                </label>
                <label className={`flex gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'qr' ? 'border-primary bg-primary-50' : 'border-input hover:border-primary/40'}`}>
                  <input type="radio" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2"><QrCode className="w-5 h-5" /> UPI / QR Payment</div>
                    <div className="text-sm text-muted-foreground mt-1">Scan and pay via any UPI app. Enter UTR after payment.</div>
                  </div>
                </label>
              </div>

              {paymentMethod === 'qr' && (
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-white border border-primary-100">
                  <div className="grid md:grid-cols-[220px_1fr] gap-6">
                    <div className="aspect-square bg-white rounded-2xl border-2 border-dashed border-primary-200 flex items-center justify-center p-4">
                      <div className="text-center">
                        <img alt="QR" src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=jeevikaacouture@upi%26pn=Jeevikaa%20Couture%26am=${total}%26cu=INR`} className="w-40 h-40 mx-auto" />
                        <div className="text-xs text-muted-foreground mt-2">Scan with any UPI app</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Merchant</span><span className="font-semibold">Jeevikaa Couture</span></div>
                      <div className="flex justify-between items-center"><span className="text-muted-foreground">UPI ID</span><span className="font-semibold flex items-center gap-2">jeevikaacouture@upi <button onClick={() => { navigator.clipboard.writeText('jeevikaacouture@upi'); toast.success('Copied'); }}><Copy className="w-3 h-3" /></button></span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-primary text-lg">₹{total.toLocaleString('en-IN')}</span></div>
                      <div className="pt-3">
                        <Label>Enter UTR / Transaction ID *</Label>
                        <Input value={utrNumber} onChange={e => setUtrNumber(e.target.value)} placeholder="12-digit UTR from your UPI app" className="mt-1" />
                        <div className="text-xs text-muted-foreground mt-1">You'll find UTR in your UPI app's transaction history.</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-xs bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-yellow-900">⚠ Your order will be confirmed after payment verification (approx. 30 mins). Confirmation email will follow.</div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-full">← Back</Button>
                <Button size="lg" disabled={submitting || (paymentMethod === 'qr' && !utrNumber)} onClick={submitOrder} className="flex-1 rounded-full font-semibold">{submitting ? 'Placing order...' : `Place Order – ₹${total.toLocaleString('en-IN')}`}</Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-3xl bg-white border border-primary-100 p-6 shadow-soft">
            <h3 className="font-display text-xl font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <img src={item.thumbnail} className="w-14 h-16 rounded-lg object-cover" alt="" />
                  <div className="flex-1">
                    <div className="font-medium line-clamp-1">{item.name}</div>
                    <div className="text-xs text-muted-foreground">Qty {item.qty}{item.size && ` · ${item.size}`}</div>
                    <div className="font-semibold text-primary text-sm">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-primary-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{cartSubtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span></div>
              <div className="flex justify-between font-bold text-lg text-primary pt-2 border-t border-primary-100"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-primary" /> Estimated delivery in 5-7 days</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Secure & encrypted payment</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
