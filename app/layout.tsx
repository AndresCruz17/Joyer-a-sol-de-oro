import WhatsAppButton from '@/components/layout/WhatsAppButton';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body className="relative">
        {children}
        {/* Botón Flotante Global */}
        <WhatsAppButton phoneNumber="573001234567" />
      </body>
    </html>
  );
}