'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface WhatsAppButtonProps {
  /** Número de teléfono en formato internacional sin +. Ej: "573001234567" */
  phoneNumber?: string;
  /** Nombre del producto a cotizar */
  productName?: string;
  /** Precio del producto en COP */
  productPrice?: number;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function WhatsAppButton({
  phoneNumber = '573001234567',
  productName,
  productPrice,
}: WhatsAppButtonProps) {
  // ───────────────────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────────────────

  const buildWhatsAppMessage = (): string => {
    const defaultMessage = '¡Hola! Me gustaría recibir información sobre su joyería.';

    if (!productName) {
      return defaultMessage;
    }

    const formattedPrice = productPrice
      ? ` ($${productPrice.toLocaleString('es-CO')} COP)`
      : '';

    return `¡Hola! Me interesa solicitar una cotización de la joya: *${productName}*${formattedPrice}. ¿Podrían darme más detalles?`;
  };

  const getWhatsAppLink = (): string => {
    const message = buildWhatsAppMessage();
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-medium px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 group"
    >
      <MessageCircle className="w-6 h-6 fill-current" />

      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out text-sm">
        Cotizar por WhatsApp
      </span>
    </a>
  );
}