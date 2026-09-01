import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import WhatsAppFloat from '@/components/ui/WhatsAppFloat';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://joyer-a-sol-de-oro.vercel.app'),
  title: 'Sol de Oro — Alta Joyería en Oro 18K',
  description: 'Piezas exclusivas en Oro de 18K con certificación y garantía de por vida.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-stone-950 text-stone-100 antialiased selection:bg-amber-500 selection:text-stone-950">
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}