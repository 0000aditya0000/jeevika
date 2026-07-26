'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';

const CATS = [
  { name: 'All', slug: '' },
  { name: 'Sarees', slug: 'sarees' },
  { name: 'Lehengas', slug: 'lehengas' },
  { name: 'Kurtis', slug: 'kurtis' },
  { name: 'Gowns', slug: 'gowns' },
  { name: 'Suits', slug: 'suits' },
  { name: 'Co-ord Sets', slug: 'co-ord-sets' },
];

function ShopContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const category = sp.get('category') || '';
  const q = sp.get('q') || '';
  const filter = sp.get('filter') || '';
  const [sort, setSort] = useState('newest');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (q) params.set('q', q);
    if (filter) params.set('filter', filter);
    if (sort) params.set('sort', sort);
    fetch(`/api/products?${params}`).then(r => r.json()).then(d => { setProducts(d.products || []); setLoading(false); });
  }, [category, q, filter, sort]);

  const setCategory = (slug) => { const p = new URLSearchParams(sp.toString()); if (slug) p.set('category', slug); else p.delete('category'); router.push(`/shop?${p}`); };

  const heading = q ? `Results for “${q}”` : filter === 'new' ? 'New Arrivals' : filter === 'trending' ? 'Trending Now' : filter === 'bestseller' ? 'Best Sellers' : filter === 'hotdeal' ? 'Hot Deals' : category ? CATS.find(c => c.slug === category)?.name || 'Shop' : 'Shop All';

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50/40 py-14 md:py-20">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="text-xs tracking-[0.4em] text-primary font-semibold mb-3">JEEVIKAA COUTURE</div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-6xl font-bold luxury-border inline-block">{heading}</motion.h1>
          <p className="mt-8 text-muted-foreground max-w-xl mx-auto">Explore handcrafted pieces designed to make you feel like royalty.</p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 md:top-20 z-20 bg-white/95 backdrop-blur border-b border-primary-100">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            {CATS.map(c => (
              <button key={c.slug} onClick={() => setCategory(c.slug)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${(category === c.slug || (!category && !c.slug)) ? 'bg-primary text-white shadow-md' : 'bg-primary-50 text-primary hover:bg-primary-100'}`}>{c.name}</button>
            ))}
            <div className="flex-shrink-0 ml-auto flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <select value={sort} onChange={e => setSort(e.target.value)} className="text-sm bg-transparent border-0 focus:ring-0 font-medium">
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl shimmer-bg animate-shimmer" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="font-display text-2xl font-bold">No products found</h3>
              <p className="text-muted-foreground mt-2">Try a different filter or category</p>
              <Button className="mt-6 rounded-full" onClick={() => router.push('/shop')}>View all products</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ShopPage() {
  return <Suspense fallback={<div className="py-20 text-center">Loading...</div>}><ShopContent /></Suspense>;
}
