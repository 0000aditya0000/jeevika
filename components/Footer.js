import Link from 'next/link';
import { Instagram, Facebook, Youtube, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#1a0510] via-[#2d0a1e] to-[#1a0510] text-white/85 mt-24">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-3xl font-bold text-white">Jeevikaa</div>
            <div className="text-xs tracking-[0.3em] text-accent font-medium mt-1">C O U T U R E</div>
            <p className="text-sm text-accent/90 mt-3 font-display italic">Where Elegance Becomes Legacy.</p>
            <p className="text-sm text-white/60 mt-3 leading-relaxed">Fashion created with heart, inspired by love, and designed to become a timeless part of your story.</p>
            <div className="flex gap-3 mt-5">
              <a href="https://www.instagram.com/jeevikaa_couture?igsh=cWloNm5iNDB0eWdx&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors" aria-label="YouTube"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-display text-lg text-accent mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/shop?category=sarees" className="hover:text-accent transition-colors">Sarees</Link></li>
              <li><Link href="/shop?category=lehengas" className="hover:text-accent transition-colors">Lehengas</Link></li>
              <li><Link href="/shop?category=kurtis" className="hover:text-accent transition-colors">Kurtis</Link></li>
              <li><Link href="/shop?category=gowns" className="hover:text-accent transition-colors">Gowns</Link></li>
              <li><Link href="/shop?filter=new" className="hover:text-accent transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg text-accent mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/track" className="hover:text-accent transition-colors">Track Order</Link></li>
              <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="hover:text-accent transition-colors">About</Link></li>
              <li><a href="#" className="hover:text-accent transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Refund Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg text-accent mb-4">Reach Us</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-accent flex-shrink-0" /><a href="tel:+919266722100" className="hover:text-accent transition-colors">+91 92667 22100</a></li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-accent flex-shrink-0" /><a href="mailto:hello@jeevikaacouture.com" className="hover:text-accent transition-colors">hello@jeevikaacouture.com</a></li>
              <li className="flex items-center gap-2"><Instagram className="w-4 h-4 text-accent flex-shrink-0" /><a href="https://www.instagram.com/jeevikaa_couture?igsh=cWloNm5iNDB0eWdx&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">@jeevikaa_couture</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
          <div>© {new Date().getFullYear()} Jeevikaa Couture. Handcrafted with love in India.</div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
