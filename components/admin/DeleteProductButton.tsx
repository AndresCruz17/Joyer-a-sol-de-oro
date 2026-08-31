'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface DeleteProps {
    id: string;
    name: string;
    imageUrl?: string | null;
}

export default function DeleteProductButton({ id, name, imageUrl }: DeleteProps) {
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar la joya "${name}"? Esta acción no se puede deshacer.`);
        if (!confirmed) return;

        setDeleting(true);
        const supabase = createClient();

        try {
            // 1. Borrar la imagen de Supabase Storage si existe
            if (imageUrl) {
                const pathParts = imageUrl.split('/storage/v1/object/public/products/');
                if (pathParts.length > 1) {
                    const filePath = pathParts[1];
                    await supabase.storage.from('products').remove([filePath]);
                }
            }

            // 2. Eliminar el producto de la tabla
            const { error } = await supabase.from('products').delete().eq('id', id);

            if (error) throw error;

            // 3. Recargar datos en la interfaz
            router.refresh();
        } catch (err: any) {
            alert(`Error al eliminar el producto: ${err.message}`);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1 rounded border border-red-900/60 bg-red-950/20 text-red-400 hover:bg-red-900/40 hover:border-red-500 transition-colors disabled:opacity-50"
        >
            {deleting ? 'Borrando...' : 'Eliminar'}
        </button>
    );
}