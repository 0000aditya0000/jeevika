import './globals.css';
import { Playfair_Display, Poppins } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/components/CartProvider';
import StoreShell from '@/components/StoreShell';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-poppins', display: 'swap' });

export const metadata = {
  title: 'Jeevikaa Couture — Where Elegance Becomes Legacy',
  description: 'Jeevikaa Couture — founded by Priyanka Kaushik. Fashion created with heart, inspired by love. Premium ethnic wear designed to become a timeless part of your story.',
  keywords: 'sarees, lehengas, kurtis, gowns, indian women fashion, bridal wear, luxury couture, Jeevikaa Couture',
  openGraph: { title: 'Jeevikaa Couture', description: 'Where Elegance Becomes Legacy.', type: 'website' },
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
