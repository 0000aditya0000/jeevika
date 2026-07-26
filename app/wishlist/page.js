'use client';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, hydrated } = useCart();
  if (!hydrated) return <div className="container py-20 text-center">Loading...</div>;

  if (wishlist.length === 0) return (
    <div className="container mx-auto px-4 py-20 text-center max-w-md">
      <div className="w-24 h-24 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-6"><Heart className="w-10 h-10 text-primary" /></div>
      <h1 className="font-display text-3xl font-bold">Your wishlist is empty</h1>
      <p className="text-muted-foreground mt-3">Tap the heart on any piece you love to save it here.</p>
      <Link href="/shop"><Button size="lg" className="mt-8 rounded-full px-8">Explore Collections</Button></Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      <h1 className="font-display text-4xl font-bold mb-8">Wishlist <span className="text-primary text-2xl">({wishlist.length})</span></h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {wishlist.map((p, i) => (
          <div key={i} className="group relative bg-white rounded-2xl overflow-hidden border border-primary-100 shadow-soft hover:shadow-luxury transition-shadow">
            <Link href={`/products/${p.slug}`} className="block aspect-[3/4] bg-primary-50"><img src={p.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={p.name} /></Link>
            <div className="p-4">
              <Link href={`/products/${p.slug}`} className="font-display font-semibold line-clamp-1 hover:text-primary">{p.name}</Link>
              <div className="font-semibold text-primary mt-1">₹{p.price.toLocaleString('en-IN')}</div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => { addToCart({ ...p, qty: 1 }); toast.success('Added to bag'); }} className="flex-1 rounded-full"><ShoppingBag className="w-3.5 h-3.5 mr-1" /> Add</Button>
                <Button size="sm" variant="outline" onClick={() => toggleWishlist(p)} className="rounded-full p-0 w-9 h-9"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
