'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Share2, Star, Check, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/CartProvider';
import ProductCard from '@/components/ProductCard';
import { toast } from 'sonner';

export default function ProductDetail({ params }) {
  const { slug } = use(params);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [pin, setPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  useEffect(() => {
    fetch(`/api/products/${slug}`).then(r => r.json()).then(d => {
      setProduct(d.product);
      setRelated(d.related || []);
      setColor(d.product?.colors?.[0] || null);
      setSize(d.product?.sizes?.[0] || null);
    });
  }, [slug]);

  if (!product) return <div className="container mx-auto px-4 py-20 grid md:grid-cols-2 gap-10"><div className="aspect-square shimmer-bg animate-shimmer rounded-3xl" /><div className="space-y-4"><div className="h-8 shimmer-bg animate-shimmer rounded-lg w-3/4" /><div className="h-6 shimmer-bg animate-shimmer rounded-lg w-1/2" /><div className="h-32 shimmer-bg animate-shimmer rounded-lg" /></div></div>;

  const displayPrice = product.discountPrice || product.price;
  const discount = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const handleAdd = () => { addToCart({ productId: product.id, name: product.name, slug: product.slug, price: displayPrice, thumbnail: product.thumbnail, size, color, qty }); toast.success(`Added ${qty} × ${product.name} to bag`); };
  const handleBuyNow = () => { handleAdd(); window.location.href = '/checkout'; };
  const checkPin = () => { if (pin.length !== 6) { setPinMsg('Please enter a valid 6-digit PIN'); return; } setPinMsg(`✨ Delivers to ${pin} · Expected in 5-7 days · COD available`); };

  return (
    <div>
      <div className="container mx-auto px-4 lg:px-8 py-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link> / <Link href="/shop" className="hover:text-primary">Shop</Link> / <Link href={`/shop?category=${product.category}`} className="hover:text-primary capitalize">{product.category}</Link> / <span className="text-foreground">{product.name}</span>
      </div>

      <section className="container mx-auto px-4 lg:px-8 pb-14">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Gallery */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto no-scrollbar">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImg === i ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
              <motion.div key={activeImg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-[3/4] rounded-3xl overflow-hidden bg-primary-50 shadow-luxury">
                <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-semibold">{product.category}</div>
            <h1 className="font-display text-3xl md:text-5xl font-bold mt-2">{product.name}</h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-0.5 text-accent">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
              <span className="text-sm text-muted-foreground">{product.rating?.toFixed(1)} · {product.reviewCount} reviews</span>
            </div>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-primary">₹{displayPrice.toLocaleString('en-IN')}</span>
              {discount > 0 && <>
                <span className="text-xl text-muted-foreground line-through">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{discount}% OFF</span>
              </>}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</div>

            <p className="text-sm text-foreground/80 mt-6 leading-relaxed">{product.description}</p>

            {product.colors?.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold mb-2">Colour</div>
                <div className="flex gap-2">
                  {product.colors.map((c, i) => (
                    <button key={i} onClick={() => setColor(c)} className={`w-10 h-10 rounded-full border-2 relative ${color === c ? 'border-primary ring-2 ring-primary/30' : 'border-white ring-1 ring-black/10'}`} style={{ background: c }}>
                      {color === c && <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-semibold">Size</div>
                  <button className="text-xs text-primary hover:underline">Size guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s, i) => (
                    <button key={i} onClick={() => setSize(s)} className={`min-w-[52px] h-11 px-4 rounded-lg border-2 text-sm font-medium transition-all ${size === s ? 'border-primary bg-primary text-white' : 'border-input bg-white hover:border-primary'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="text-sm font-semibold mb-2">Quantity</div>
              <div className="inline-flex items-center border rounded-full overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-primary-50"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-11 h-11 flex items-center justify-center hover:bg-primary-50"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button onClick={handleAdd} size="lg" variant="outline" className="flex-1 h-14 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold"><ShoppingBag className="w-5 h-5 mr-2" /> Add to Bag</Button>
              <Button onClick={handleBuyNow} size="lg" className="flex-1 h-14 rounded-full font-semibold">Buy Now</Button>
              <Button onClick={() => { toggleWishlist({ productId: product.id, name: product.name, slug: product.slug, price: displayPrice, thumbnail: product.thumbnail }); toast.success('Updated wishlist ♡'); }} size="lg" variant="outline" className="h-14 w-14 rounded-full p-0"><Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-primary text-primary' : ''}`} /></Button>
            </div>

            {/* Delivery check */}
            <div className="mt-6 p-4 rounded-2xl bg-primary-50/50 border border-primary-100">
              <div className="text-sm font-semibold mb-2 flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /> Check delivery</div>
              <div className="flex gap-2">
                <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter PIN code" className="flex-1 h-10 rounded-lg border px-3 text-sm focus:outline-none focus:border-primary" />
                <Button onClick={checkPin} variant="outline" className="rounded-lg border-primary text-primary">Check</Button>
              </div>
              {pinMsg && <div className="text-xs text-primary mt-2">{pinMsg}</div>}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[{ i: Truck, t: 'Free Shipping', s: 'Above ₹2,999' }, { i: RotateCcw, t: '7-Day Returns', s: 'No questions asked' }, { i: ShieldCheck, t: 'Secure Payment', s: 'COD available' }].map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-white border border-primary-100">
                  <f.i className="w-5 h-5 mx-auto text-primary" />
                  <div className="text-xs font-semibold mt-1">{f.t}</div>
                  <div className="text-[10px] text-muted-foreground">{f.s}</div>
                </div>
              ))}
            </div>

            {/* Specs */}
            <div className="mt-8 rounded-2xl border border-primary-100 divide-y">
              <div className="grid grid-cols-2 p-4 text-sm"><span className="text-muted-foreground">Material</span><span className="font-medium">{product.material}</span></div>
              <div className="grid grid-cols-2 p-4 text-sm"><span className="text-muted-foreground">Fabric</span><span className="font-medium">{product.fabric}</span></div>
              <div className="grid grid-cols-2 p-4 text-sm"><span className="text-muted-foreground">SKU</span><span className="font-medium">{product.sku}</span></div>
              <div className="grid grid-cols-2 p-4 text-sm"><span className="text-muted-foreground">Availability</span><span className="font-medium text-green-600">{product.stock > 0 ? `In stock (${product.stock} left)` : 'Out of stock'}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-14 bg-primary-50/40">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8">You may also love</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
