'use client';

import { useState, useEffect } from 'react';
import { GoldPriceData, FALLBACK_GOLD_PRICE } from '@/lib/gold/gold-types';

export function useGoldPrice(initialData?: GoldPriceData) {
  const [goldPrice, setGoldPrice] = useState<GoldPriceData>(
    initialData || FALLBACK_GOLD_PRICE
  );
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si ya tenemos datos iniciales recientes, no hace falta volver a consultar inmediatamente
    if (initialData) {
      return;
    }

    let isMounted = true;

    async function fetchPrice() {
      try {
        setLoading(true);
        const res = await fetch('/api/gold-price');
        if (!res.ok) throw new Error('Error al consultar /api/gold-price');
        const json = await res.json();
        if (json.success && json.data && isMounted) {
          setGoldPrice(json.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPrice();

    return () => {
      isMounted = false;
    };
  }, [initialData]);

  return {
    goldPrice,
    loading,
    error,
  };
}
