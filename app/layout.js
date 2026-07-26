import './globals.css';
import { Playfair_Display, Poppins } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/components/CartProvider';
import StoreShell from '@/components/StoreShell';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-poppins', display: 'swap' });

export const metadata = {
  title: 'Jeevikaa Couture — Luxury Women\'s Fashion | Sarees, Lehengas & More',
  description: 'Discover handcrafted luxury from Jeevikaa Couture — premium sarees, lehengas, gowns, kurtis and more, designed for the modern Indian woman.',
  keywords: 'sarees, lehengas, kurtis, gowns, indian women fashion, bridal wear, luxury couture',
  openGraph: { title: 'Jeevikaa Couture', description: 'Luxury women\'s fashion, handcrafted in India.', type: 'website' },
};

const App = ({ children }) => {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <body>
        <CartProvider>
          <StoreShell>{children}</StoreShell>
          <Toaster position="top-center" richColors />
        </CartProvider>
      </body>
    </html>
  );
};

export default App;
