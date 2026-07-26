'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from './CartProvider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CATEGORIES = [
  { name: 'Sarees', slug: 'sarees' },
  { name: 'Lehengas', slug: 'lehengas' },
  { name: 'Kurtis', slug: 'kurtis' },
  { name: 'Gowns', slug: 'gowns' },
  { name: 'Suits', slug: 'suits' },
  { name: 'Co-ord Sets', slug: 'co-ord-sets' },
];

export default function Header() {
  const { cartCount, wishlist } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll(); window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitSearch = (e) => { e.preventDefault(); if (q.trim()) { router.push(`/shop?q=${encodeURIComponent(q)}`); setShowSearch(false); } };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-primary via-primary-500 to-primary text-white text-xs md:text-sm py-2 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="mx-8">✨ Free shipping on orders above ₹2,999</span>
          <span className="mx-8">🎁 Extra 10% off on your first order · Code: FIRST10</span>
          <span className="mx-8">💫 Handcrafted with love in India</span>
          <span className="mx-8">✨ Free shipping on orders above ₹2,999</span>
          <span className="mx-8">🎁 Extra 10% off on your first order · Code: FIRST10</span>
          <span className="mx-8">💫 Handcrafted with love in India</span>
        </div>
      </div>

      <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'glass shadow-soft' : 'bg-white/90 backdrop-blur-sm'}`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <button className="p-2" aria-label="Menu"><Menu className="w-6 h-6" /></button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <div className="mt-8 space-y-1">
                  <Link href="/" className="block py-3 px-4 hover:bg-primary/5 rounded-lg">Home</Link>
                  <Link href="/shop" className="block py-3 px-4 hover:bg-primary/5 rounded-lg">Shop All</Link>
                  {CATEGORIES.map(c => (
                    <Link key={c.slug} href={`/shop?category=${c.slug}`} className="block py-3 px-4 hover:bg-primary/5 rounded-lg">{c.name}</Link>
                  ))}
                  <Link href="/track" className="block py-3 px-4 hover:bg-primary/5 rounded-lg">Track Order</Link>
                  <Link href="/about" className="block py-3 px-4 hover:bg-primary/5 rounded-lg">About</Link>
                  <Link href="/contact" className="block py-3 px-4 hover:bg-primary/5 rounded-lg">Contact</Link>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex-1 lg:flex-none flex justify-center lg:justify-start">
              <div className="text-center lg:text-left">
                <div className="font-display text-2xl md:text-3xl font-bold text-gradient-luxury leading-none">Jeevikaa</div>
                <div className="text-[10px] md:text-xs tracking-[0.3em] text-gold-dark font-medium mt-0.5">C O U T U R E</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-primary transition-colors">Shop <ChevronDown className="w-3 h-3" /></button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white rounded-2xl shadow-luxury p-6 min-w-[520px] grid grid-cols-2 gap-2 border border-primary-100">
                    {CATEGORIES.map(c => (
                      <Link key={c.slug} href={`/shop?category=${c.slug}`} className="px-4 py-2 rounded-lg hover:bg-primary-50 hover:text-primary transition-colors">
                        <div className="font-medium">{c.name}</div>
                      </Link>
                    ))}
                    <Link href="/shop" className="px-4 py-2 rounded-lg hover:bg-primary-50 hover:text-primary transition-colors col-span-2 border-t border-primary-100 mt-2 pt-3">
                      <div className="font-medium text-gradient-luxury">View All Collections →</div>
                    </Link>
                  </div>
                </div>
              </div>
              <Link href="/shop?filter=new" className="hover:text-primary transition-colors">New Arrivals</Link>
              <Link href="/shop?filter=trending" className="hover:text-primary transition-colors">Trending</Link>
              <Link href="/track" className="hover:text-primary transition-colors">Track Order</Link>
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-1 md:gap-2">
              <button onClick={() => setShowSearch(v => !v)} className="p-2 hover:bg-primary/5 rounded-full transition-colors" aria-label="Search"><Search className="w-5 h-5" /></button>
              <Link href="/wishlist" className="p-2 hover:bg-primary/5 rounded-full transition-colors relative" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{wishlist.length}</span>}
              </Link>
              <Link href="/cart" className="p-2 hover:bg-primary/5 rounded-full transition-colors relative" aria-label="Cart">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cartCount}</span>}
              </Link>
              <Link href="/admin" className="p-2 hover:bg-primary/5 rounded-full transition-colors hidden md:inline-flex" aria-label="Account"><User className="w-5 h-5" /></Link>
            </div>
          </div>

          {/* Search bar */}
          {showSearch && (
            <form onSubmit={submitSearch} className="pb-4 animate-fade-up">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search for sarees, lehengas, kurtis..." className="pl-11 pr-11 h-12 rounded-full border-primary-200 focus-visible:ring-primary" />
                <button type="button" onClick={() => setShowSearch(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-primary/5 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {['Bridal Lehenga','Silk Saree','Anarkali','Party Gown','Co-ord Set'].map(t => (
                  <button key={t} type="button" onClick={() => { setQ(t); router.push(`/shop?q=${encodeURIComponent(t)}`); setShowSearch(false); }} className="text-xs px-3 py-1 rounded-full bg-primary-50 hover:bg-primary-100 text-primary-700 transition-colors">{t}</button>
                ))}
              </div>
            </form>
          )}
        </div>
      </header>
    </>
  );
}
