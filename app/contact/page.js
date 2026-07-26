'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const submit = (e) => { e.preventDefault(); toast.success("Thanks! We'll get back within 24 hours."); setForm({ name: '', email: '', message: '' }); };

  return (
    <div className="container mx-auto px-4 py-14 max-w-5xl">
      <div className="text-center mb-14">
        <div className="text-xs tracking-[0.4em] text-primary font-semibold mb-3">WE'D LOVE TO HEAR FROM YOU</div>
        <h1 className="font-display text-4xl md:text-6xl font-bold luxury-border inline-block">Get in Touch</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-10">
        <form onSubmit={submit} className="space-y-4 bg-white rounded-3xl p-6 md:p-8 border border-primary-100 shadow-soft">
          <div><Label>Full Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" required /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" required /></div>
          <div><Label>Message</Label><Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-1" rows={5} required /></div>
          <Button type="submit" size="lg" className="w-full rounded-full h-12">Send Message</Button>
        </form>
        <div className="space-y-4">
          {[{ i: MapPin, t: 'Visit our store', s: 'Fashion Street, Bandra West\nMumbai, Maharashtra 400050' }, { i: Phone, t: 'Call us', s: '+91 98765 43210\nMon–Sat, 10 AM – 8 PM' }, { i: Mail, t: 'Email us', s: 'hello@jeevikaacouture.com\nsupport@jeevikaacouture.com' }, { i: MessageCircle, t: 'WhatsApp', s: '+91 98765 43210\nQuick support 24/7' }].map((c, i) => (
            <div key={i} className="p-5 rounded-2xl bg-primary-50/50 border border-primary-100 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0"><c.i className="w-5 h-5" /></div>
              <div><div className="font-semibold">{c.t}</div><div className="text-sm text-muted-foreground whitespace-pre-line">{c.s}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
