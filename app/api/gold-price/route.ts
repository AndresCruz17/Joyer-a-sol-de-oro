import { NextResponse } from 'next/server';
import { getLiveGoldPrice } from '@/lib/gold/gold-service';

export const revalidate = 14400; // 4 horas en segundos

export async function GET() {
  try {
    const data = await getLiveGoldPrice();
    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=14400, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error en /api/gold-price:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'No se pudo obtener la cotización del oro',
      },
      { status: 500 }
    );
  }
}
