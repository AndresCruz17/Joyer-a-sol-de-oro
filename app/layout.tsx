import WhatsAppButton from '@/components/layout/WhatsAppButton';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://soldeoro.com'),
  title: 'Sol de Oro — Alta Joyería en Oro 18K',
  description: 'Piezas exclusivas en Oro de 18K con certificación y garantía de por vida.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO">
      <body className="antialiased bg-stone-950 text-stone-100 relative min-h-screen">
        {children}
        {/* Botón Flotante Global Persistente */}
        <WhatsAppButton phoneNumber="573001234567" /> 
      </body>
    </html>
  );
}