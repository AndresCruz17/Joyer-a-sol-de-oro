import WhatsAppButton from '@/components/layout/WhatsAppButton';
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sol de Oro — Joyería Fina en Oro 18K",
  description: "Diseños exclusivos de joyería en oro de 18 kilates.",
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
        {/* Botón Flotante Global de WhatsApp */}
        <WhatsAppButton phoneNumber="573001234567" />
      </body>
    </html>
  );
}