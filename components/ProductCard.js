'use client';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from './CartProvider';
import { toast } from 'sonner';

export default function ProductCard({ product, index = 0 }) {
  const { toggleWishlist, isInWishlist, addToCart } = useCart();
  const discount = product.discountPrice && product.discountPrice < product.price ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const displayPrice = product.discountPrice || product.price;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: (index % 8) * 0.05 }} className="group relative">
      <div className="relative overflow-hidden rounded-2xl bg-primary-50 aspect-[3/4] shadow-soft">
        <Link href={`/products/${product.slug}`}>
          <img src={product.thumbnail || product.images?.[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
          {product.images?.[1] && (
            <img src={product.images[1]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" loading="lazy" />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">-{discount}% OFF</span>}
          {product.newArrival && <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">NEW</span>}
          {product.bestSeller && <span className="bg-gradient-to-r from-gold-dark to-gold text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">BESTSELLER</span>}
        </div>

        {/* Wishlist */}
        <button onClick={(e) => { e.preventDefault(); toggleWishlist({ productId: product._id || product.id, name: product.name, slug: product.slug, price: displayPrice, thumbnail: product.thumbnail }); toast.success(isInWishlist(product._id || product.id) ? 'Removed from wishlist' : 'Added to wishlist ♡'); }} className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
          <Heart className={`w-4 h-4 ${isInWishlist(product._id || product.id) ? 'fill-primary text-primary' : 'text-primary'}`} />
        </button>

        {/* Quick add */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button onClick={(e) => { e.preventDefault(); addToCart({ productId: product._id || product.id, name: product.name, slug: product.slug, price: displayPrice, thumbnail: product.thumbnail, size: product.sizes?.[0], color: product.colors?.[0], qty: 1 }); toast.success('Added to bag'); }} className="w-full bg-white/95 backdrop-blur hover:bg-primary hover:text-white text-primary font-medium text-sm py-2.5 rounded-full shadow-md flex items-center justify-center gap-2 transition-colors">
            <ShoppingBag className="w-4 h-4" /> Quick Add
          </button>
        </div>
      </div>

      <div className="mt-3 px-1">
        <Link href={`/products/${product.slug}`} className="block">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category}</div>
          <h3 className="font-display text-base md:text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="font-semibold text-primary">₹{displayPrice.toLocaleString('en-IN')}</span>
            {discount > 0 && <span className="text-sm text-muted-foreground line-through">₹{product.price.toLocaleString('en-IN')}</span>}
            {discount > 0 && <span className="text-xs text-green-600 font-semibold">Save ₹{(product.price - product.discountPrice).toLocaleString('en-IN')}</span>}
          </div>
          {product.colors?.length > 0 && (
            <div className="flex gap-1 mt-2">
              {product.colors.slice(0, 4).map((c, i) => <span key={i} className="w-3 h-3 rounded-full border border-white ring-1 ring-black/10" style={{ background: c }} />)}
            </div>
          )}
        </Link>
      </div>
    </motion.div>
  );
}
