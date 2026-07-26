'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import FloatingButtons from './FloatingButtons';

export default function StoreShell({ children }) {
  const pathname = usePathname() || '';
  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return <>{children}</>;
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}
