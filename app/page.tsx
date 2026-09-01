import { Metadata } from 'next';
import HomePageClient from './HomePageClient';

// METADATA OFICIAL PARA MOTOR DE BÚSQUEDA Y REDES SOCIALES
export const metadata: Metadata = {
  title: 'Sol de Oro Joyería & Compraventa | Oro 18K Ley 750 Medellín',
  description:
    'Compramos tu oro al mejor precio del mercado con avalúos inmediatos. Joyería fina en Oro Nacional 18 Kilates, diseños personalizados y envíos asegurados en Colombia.',
  keywords: [
    'compra de oro Nariño',
    'compra de oro Colombia',
    'joyeria oro 18k',
    'oro ley 750',
    'vender oro Nariño',
    'vender oro Colombia',
    'avaluo de oro',
    'joyas personalizadas colombia',
  ],
  openGraph: {
    title: 'Sol de Oro Joyería & Compraventa | Oro 18K Certificado',
    description:
      'Avalúos transparentes y pago inmediato por tu oro. Explora nuestro catálogo de alta joyería.',
    url: 'https://soldeoro.com', // Reemplazar por tu dominio real
    siteName: 'Sol de Oro Joyería',
    images: [
      {
        url: '/og-image.jpg', // Recomienda crear una imagen de 1200x630px en public/
        width: 1200,
        height: 630,
        alt: 'Sol de Oro Joyería & Compraventa',
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://soldeoro.com',
  },
};

export default function Page() {
  return <HomePageClient />;
}