/**
 * Configuración centralizada de la tienda Sol de Oro
 */
export const SITE_CONFIG = {
  name: 'Sol de Oro Joyería & Compraventa',
  shortName: 'Sol de Oro',
  description: 'Piezas exclusivas en Oro de 18K con certificación y garantía de por vida. Avalúos transparentes y compra de oro.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://joyer-a-sol-de-oro.vercel.app',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP || '573126249176',
  logoUrl: '/logo.webp',
  storeHeroBgUrl: '/local.webp',
  address: 'Barrio Fatima',
  city: 'El Remolino, Taminango, Nariño',
  country: 'Colombia',
  googleMapsUrl: 'https://maps.app.goo.gl/AHRoJkCtHsAfeBwz6',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61582655280439',
  instagramUrl: 'https://www.instagram.com/sol_de_oro_compraventa',
  tiktokUrl: 'https://www.tiktok.com/@compraventa_soldeoro',
} as const;

/**
 * Genera el enlace directo a WhatsApp con mensaje codificado
 */
export function getWhatsAppUrl(customMessage?: string): string {
  const defaultMsg = 'Hola *Sol de Oro*, me gustaría recibir asesoría personalizada sobre sus joyas en Oro de 18K.';
  const message = customMessage || defaultMsg;
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
