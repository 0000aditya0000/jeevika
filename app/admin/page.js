'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@jeevikaacouture.com');
  const [password, setPassword] = useState('Jeevikaa@2025');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('jc_admin_token')) router.push('/admin/dashboard');
  }, [router]);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('jc_admin_token', data.token);
        localStorage.setItem('jc_admin', JSON.stringify(data.admin));
        toast.success('Welcome back ✨');
        router.push('/admin/dashboard');
      } else toast.error(data.error || 'Login failed');
    } catch { toast.error('Login failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative bg-gradient-to-br from-primary via-primary-700 to-primary-800 items-center justify-center p-12 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, #FFD700 0%, transparent 40%), radial-gradient(circle at 70% 80%, #FFB6C1 0%, transparent 40%)' }} />
        <div className="relative max-w-md">
          <div className="font-display text-5xl font-bold">Jeevikaa</div>
          <div className="text-sm tracking-[0.4em] text-accent mt-1">C O U T U R E</div>
          <div className="w-16 h-0.5 bg-accent mt-8" />
          <h2 className="font-display text-3xl mt-6">Admin Dashboard</h2>
          <p className="text-white/85 mt-4 leading-relaxed">Welcome back. Manage your products, orders, customers, and everything that makes Jeevikaa Couture come alive.</p>
          <div className="mt-10 space-y-3 text-sm text-white/80">
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-accent" /> Secure JWT-authenticated access</div>
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> Real-time order & inventory tracking</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="font-display text-3xl font-bold text-gradient-luxury">Jeevikaa</div>
            <div className="text-xs tracking-[0.3em] text-gold-dark mt-1">C O U T U R E</div>
          </div>
          <h1 className="font-display text-3xl font-bold">Sign in</h1>
          <p className="text-muted-foreground text-sm mt-2">Enter your admin credentials to continue.</p>
          <div className="mt-8 space-y-4">
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 h-11" required /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 h-11" required /></div>
            <Button type="submit" size="lg" disabled={loading} className="w-full rounded-full h-12 font-semibold"><Lock className="w-4 h-4 mr-2" /> {loading ? 'Signing in...' : 'Sign In'}</Button>
          </div>
          <div className="mt-6 text-xs text-muted-foreground text-center p-3 rounded-lg bg-primary-50/50">Default: <b>admin@jeevikaacouture.com</b> / <b>Jeevikaa@2025</b></div>
        </form>
      </div>
    </div>
  );
}
