'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Copy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

function Success() {
  const sp = useSearchParams();
  const orderId = sp.get('orderId');
  const method = sp.get('method');
  const isQr = method === 'qr';

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center shadow-luxury animate-float">
          {isQr ? <Sparkles className="w-10 h-10 text-white" /> : <CheckCircle2 className="w-10 h-10 text-white" />}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mt-6">{isQr ? 'Payment Received!' : 'Order Confirmed!'}</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          {isQr ? "Your payment has been submitted successfully. After verification, you'll receive your order confirmation email within approximately 30 minutes." : "Thank you for shopping with Jeevikaa Couture. Your order has been placed successfully and we've sent you a confirmation email."}
        </p>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mt-10 rounded-3xl bg-gradient-to-br from-primary-50 via-white to-primary-50/40 border border-primary-100 p-6 md:p-8 shadow-soft">
        <div className="text-center">
          <div className="text-xs tracking-widest text-primary font-semibold">ORDER ID</div>
          <div className="font-display text-2xl md:text-3xl font-bold mt-2 flex items-center justify-center gap-3">
            {orderId}
            <button onClick={() => { navigator.clipboard.writeText(orderId); toast.success('Order ID copied'); }} className="text-primary hover:bg-primary/10 p-1.5 rounded-full"><Copy className="w-4 h-4" /></button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">Save this ID to track your order anytime</div>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          <Link href={`/track?id=${orderId}`}><Button size="lg" className="w-full rounded-full h-12"><Package className="w-4 h-4 mr-2" /> Track Order</Button></Link>
          <Link href="/shop"><Button size="lg" variant="outline" className="w-full rounded-full h-12 border-primary text-primary hover:bg-primary hover:text-white">Continue Shopping</Button></Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccess() {
  return <Suspense fallback={<div className="py-20 text-center">Loading...</div>}><Success /></Suspense>;
}
