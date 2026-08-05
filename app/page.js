'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronRight, Sparkles, Star, ShieldCheck, Truck, Gem, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductCard from '@/components/ProductCard';
import { toast } from 'sonner';

const HERO_SLIDES = [
  { image: 'https://images.pexels.com/photos/37628608/pexels-photo-37628608.jpeg', badge: 'JEEVIKAA COUTURE', title: 'Where Elegance\nBecomes Legacy', sub: 'Fashion created with heart, inspired by love — premium fabrics, thoughtful craftsmanship, and timeless elegance for every woman.', cta1: 'Shop Bridal', cta1Href: '/shop?category=lehengas', cta2: 'Our Story', cta2Href: '/about' },
  { image: 'https://images.unsplash.com/photo-1617039487629-6babdcb2a24b', badge: 'NEW COLLECTION', title: 'Peony Bloom\nEdit', sub: 'A romantic ode to spring — dreamy pinks, delicate embroidery, and floaty silhouettes made to twirl.', cta1: 'Shop Now', cta1Href: '/shop?filter=new', cta2: 'Explore', cta2Href: '/shop' },
  { image: 'https://images.unsplash.com/photo-1610173827043-9db50e0d8ef9', badge: 'BEST SELLERS', title: 'Draped in\nheritage', sub: 'From Kanjivaram to Banarasi — discover sarees that carry a thousand years of craft.', cta1: 'Shop Sarees', cta1Href: '/shop?category=sarees', cta2: 'Discover', cta2Href: '/shop' },
];

export default function Home() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, []);
  const [slide, setSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/products?limit=12').then(r => r.json()).then(d => setProducts(d.products || []));
    fetch('/api/testimonials').then(r => r.json()).then(d => setTestimonials(d.testimonials || []));
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setSlide(emblaApi.selectedScrollSnap()));
    const t = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => clearInterval(t);
  }, [emblaApi]);

  const trending = products.filter(p => p.trending).slice(0, 8);
  const newArrivals = products.filter(p => p.newArrival).slice(0, 4);
  const hotDeals = products.filter(p => p.hotDeal).slice(0, 4);
  const bestSellers = products.filter(p => p.bestSeller).slice(0, 4);

  const submitNewsletter = async (e) => { e.preventDefault(); if (!email) return; await fetch('/api/newsletter', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) }); toast.success('You\'re on the list! ✨'); setEmail(''); };

  const CATEGORIES_TILES = [
    { name: 'Sarees', slug: 'sarees', image: 'https://images.unsplash.com/flagged/photo-1551854716-8b811be39e7e', count: '120+ styles' },
    { name: 'Lehengas', slug: 'lehengas', image: 'https://images.unsplash.com/photo-1654764746225-e63f5e90facd', count: '80+ styles' },
    { name: 'Kurtis', slug: 'kurtis', image: 'https://images.pexels.com/photos/35521738/pexels-photo-35521738.jpeg', count: '200+ styles' },
    { name: 'Gowns', slug: 'gowns', image: 'https://images.unsplash.com/photo-1600685890506-593fdf55949b', count: '45+ styles' },
    { name: 'Suits', slug: 'suits', image: 'https://images.pexels.com/photos/15906956/pexels-photo-15906956.jpeg', count: '90+ styles' },
    { name: 'Co-ord Sets', slug: 'co-ord-sets', image: 'https://images.pexels.com/photos/8770996/pexels-photo-8770996.jpeg', count: '60+ styles' },
  ];

  return (
    <div className="overflow-hidden">
      {/* HERO SLIDER */}
      <section className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {HERO_SLIDES.map((s, i) => (
              <div key={i} className="relative flex-[0_0_100%] min-w-0 h-[70vh] md:h-[85vh]">
                <img src={s.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-6 lg:px-12">
                    <motion.div key={slide} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl text-white">
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-xs md:text-sm tracking-widest text-accent font-medium mb-6"><Sparkles className="w-3.5 h-3.5" /> {s.badge}</span>
                      <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] whitespace-pre-line mb-6">{s.title}</h1>
                      <p className="text-lg md:text-xl text-white/85 mb-8 max-w-lg leading-relaxed">{s.sub}</p>
                      <div className="flex flex-wrap gap-3">
                        <Link href={s.cta1Href}><Button size="lg" className="bg-white text-primary hover:bg-accent hover:text-accent-foreground h-12 px-8 rounded-full font-semibold shadow-xl">{s.cta1} <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
                        <Link href={s.cta2Href}><Button size="lg" variant="outline" className="h-12 px-8 rounded-full border-white/40 bg-white/5 text-white hover:bg-white hover:text-primary backdrop-blur-sm">{s.cta2}</Button></Link>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => emblaApi?.scrollTo(i)} className={`h-1.5 rounded-full transition-all ${slide === i ? 'w-10 bg-accent' : 'w-6 bg-white/50'}`} />
          ))}
        </div>
      </section>

      {/* USP STRIP */}
      <section className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[{ i: Truck, t: 'Free Shipping', s: 'On orders ₹2,999+' }, { i: ShieldCheck, t: 'Secure Payment', s: 'COD & UPI available' }, { i: Gem, t: 'Handpicked Quality', s: 'Curated with care' }, { i: Star, t: '10,000+ Happy Women', s: '4.9★ average rating' }].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-50 text-primary flex items-center justify-center flex-shrink-0"><f.i className="w-5 h-5" /></div>
                <div>
                  <div className="font-semibold text-sm">{f.t}</div>
                  <div className="text-xs text-muted-foreground">{f.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 bg-gradient-to-b from-white to-primary-50/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="text-xs tracking-[0.4em] text-primary font-semibold mb-3">EXPLORE THE EDIT</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold luxury-border inline-block">Shop by Category</h2>
            <p className="mt-8 text-muted-foreground max-w-lg mx-auto">Curated collections designed for every occasion, every mood, and every version of you.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {CATEGORIES_TILES.map((c, i) => (
              <motion.div key={c.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                <Link href={`/shop?category=${c.slug}`} className="group relative block rounded-3xl overflow-hidden aspect-[4/5] shadow-soft hover:shadow-luxury transition-all">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <div className="text-xs text-accent tracking-widest font-medium">{c.count}</div>
                    <h3 className="font-display text-2xl md:text-3xl font-bold">{c.name}</h3>
                    <div className="mt-2 flex items-center gap-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Shop now <ChevronRight className="w-4 h-4" /></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs tracking-[0.4em] text-primary font-semibold mb-2">HOT RIGHT NOW</div>
              <h2 className="font-display text-3xl md:text-5xl font-bold">Trending Pieces</h2>
            </div>
            <Link href="/shop?filter=trending" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">View all <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {trending.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* HOT DEALS BANNER */}
      {hotDeals.length > 0 && (
        <section className="py-14 bg-gradient-to-r from-primary via-primary-500 to-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #FFD700 0%, transparent 30%), radial-gradient(circle at 80% 50%, #FFB6C1 0%, transparent 30%)' }} />
          <div className="container mx-auto px-4 lg:px-8 relative">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="text-xs tracking-[0.4em] text-accent font-semibold mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> LIMITED TIME</div>
                <h2 className="font-display text-3xl md:text-5xl font-bold">Hot Deals</h2>
                <p className="text-white/80 mt-2">Up to 50% off on selected styles</p>
              </div>
              <Link href="/shop?filter=hotdeal" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-accent hover:gap-2 transition-all">Shop all deals <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {hotDeals.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS + BESTSELLERS */}
      <section className="py-20 bg-primary-50/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="text-xs tracking-[0.4em] text-primary font-semibold mb-2">JUST IN</div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold">New Arrivals</h2>
                </div>
                <Link href="/shop?filter=new" className="text-sm font-medium text-primary hover:underline">See all</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">{newArrivals.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
            </div>
            <div>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="text-xs tracking-[0.4em] text-primary font-semibold mb-2">CROWD FAVOURITES</div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold">Best Sellers</h2>
                </div>
                <Link href="/shop?filter=bestseller" className="text-sm font-medium text-primary hover:underline">See all</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">{bestSellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-xs tracking-[0.4em] text-primary font-semibold mb-3">LOVE NOTES</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold luxury-border inline-block">From our Muses</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-3xl p-6 shadow-soft border border-primary-100/50 hover:shadow-luxury transition-shadow">
                <div className="flex gap-0.5 text-accent mb-3">{[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}</div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-4">“{t.text}”</p>
                <div className="flex items-center gap-3 pt-4 border-t border-primary-100/50">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-primary via-primary-700 to-primary-800 p-10 md:p-16 text-white text-center">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, #FFD700 0%, transparent 40%), radial-gradient(circle at 70% 80%, #FFB6C1 0%, transparent 40%)' }} />
            <div className="relative max-w-2xl mx-auto">
              <Sparkles className="w-10 h-10 text-accent mx-auto mb-4" />
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Join the Jeevikaa list</h2>
              <p className="text-white/85 mb-8">Be the first to know about new collections, private previews & exclusive offers. Get 10% off your first order.</p>
              <form onSubmit={submitNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="Enter your email" className="pl-11 h-12 bg-white/10 border-white/25 text-white placeholder:text-white/60 focus-visible:ring-accent" />
                </div>
                <Button type="submit" size="lg" className="h-12 px-8 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">Subscribe</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
