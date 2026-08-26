'use client';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  productName?: string;
  productPrice?: number | string;
}

export default function WhatsAppButton({
  phoneNumber = '573001234567',
  productName,
  productPrice,
}: WhatsAppButtonProps) {
  // Construcción segura del mensaje sin lanzar TypeErrors si los datos son undefined
  const message = productName
    ? `Hola, estoy interesado en la joya: ${productName}${
        productPrice ? ` ($${Number(productPrice).toLocaleString('es-CO')} COP)` : ''
      }`
    : 'Hola, me gustaría recibir asesoría sobre su joyería.';

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
    >
      Contactar por WhatsApp
    </a>
  );
}