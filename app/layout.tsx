import type { Metadata } from 'next';
import { Bodoni_Moda, Plus_Jakarta_Sans } from 'next/font/google';
import WhatsAppFloat from '@/components/ui/WhatsAppFloat';
import './globals.css';

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
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
    <html
      lang="es"
      className={`${plusJakarta.variable} ${bodoni.variable}`}
    >
      <body className="bg-stone-950 text-stone-100 font-sans antialiased selection:bg-amber-500 selection:text-stone-950">
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}