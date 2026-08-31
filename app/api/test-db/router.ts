import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. Validar si Next.js está leyendo las variables de entorno
  if (!url || !key) {
    return NextResponse.json(
      {
        connected: false,
        error: 'Las variables de entorno no están configuradas en el servidor.',
        envCheck: {
          hasUrl: !!url,
          hasKey: !!key,
        },
      },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(url, key);

    // 2. Realizar una consulta de prueba a la base de datos
    const { data, error, status } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          connected: false,
          error: `Error de Supabase: ${error.message}`,
          code: error.code,
          details: error.details,
          hint: 'Revisa las políticas RLS en Supabase o el nombre de la tabla.',
        },
        { status: 400 }
      );
    }

    // 3. Conexión exitosa
    return NextResponse.json({
      connected: true,
      message: '¡Conexión con Supabase establecida correctamente!',
      httpStatus: status,
      recordsFound: data ? data.length : 0,
      sampleData: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        connected: false,
        error: `Excepción del servidor: ${err.message}`,
      },
      { status: 500 }
    );
  }
}