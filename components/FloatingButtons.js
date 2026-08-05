'use client';
import { useEffect, useState } from 'react';
import { MessageCircle, ArrowUp, Phone } from 'lucide-react';

export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <>
      <a href="https://wa.me/919266722100?text=Hi%20Jeevikaa%20Couture!" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-luxury flex items-center justify-center hover:scale-110 transition-transform animate-float" aria-label="WhatsApp">
        <MessageCircle className="w-6 h-6" />
      </a>
      <a href="tel:+919266722100" className="fixed bottom-24 right-6 z-30 w-12 h-12 bg-primary text-white rounded-full shadow-luxury flex items-center justify-center hover:scale-110 transition-transform" aria-label="Call">
        <Phone className="w-5 h-5" />
      </a>
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 left-6 z-30 w-11 h-11 bg-white shadow-luxury border border-primary-100 text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Top">
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
