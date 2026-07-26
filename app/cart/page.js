'use client';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, cartSubtotal, hydrated } = useCart();

  if (!hydrated) return <div className="container py-20 text-center">Loading...</div>;

  const shipping = cartSubtotal >= 2999 ? 0 : cartSubtotal > 0 ? 149 : 0;
  const total = cartSubtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-24 h-24 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-6"><ShoppingBag className="w-10 h-10 text-primary" /></div>
        <h1 className="font-display text-3xl font-bold">Your bag is empty</h1>
        <p className="text-muted-foreground mt-3">Add a few pieces of luxury to your bag — they're waiting for you.</p>
        <Link href="/shop"><Button size="lg" className="mt-8 rounded-full px-8">Continue Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      <h1 className="font-display text-4xl font-bold mb-8">Shopping Bag <span className="text-primary text-2xl">({cart.length})</span></h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl border border-primary-100 bg-white hover:shadow-soft transition-shadow">
              <Link href={`/products/${item.slug}`} className="w-24 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-primary-50">
                <img src={item.thumbnail} className="w-full h-full object-cover" alt={item.name} />
              </Link>
              <div className="flex-1">
                <Link href={`/products/${item.slug}`} className="font-display text-lg font-semibold hover:text-primary">{item.name}</Link>
                <div className="text-xs text-muted-foreground mt-1">{item.size && `Size: ${item.size}`}{item.color && <> · <span className="inline-flex items-center gap-1">Color <span className="w-3 h-3 rounded-full inline-block border" style={{ background: item.color }} /></span></>}</div>
                <div className="font-semibold text-primary mt-2">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="inline-flex items-center border rounded-full">
                    <button onClick={() => updateQty(i, item.qty - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-primary-50 rounded-full"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => updateQty(i, item.qty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-primary-50 rounded-full"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <button onClick={() => removeFromCart(i)} className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1"><Trash2 className="w-4 h-4" /> Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-3xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 p-6 shadow-soft">
            <h3 className="font-display text-xl font-bold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{cartSubtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : `₹${shipping}`}</span></div>
              {shipping > 0 && <div className="text-xs text-primary">Add ₹{(2999 - cartSubtotal).toLocaleString('en-IN')} more for FREE shipping</div>}
            </div>
            <div className="border-t border-primary-100 mt-4 pt-4 flex justify-between font-display text-xl font-bold text-primary">
              <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <Link href="/checkout"><Button size="lg" className="w-full mt-6 rounded-full h-12 font-semibold">Checkout <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <Link href="/shop" className="block text-center text-sm text-primary hover:underline mt-3">Continue shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
