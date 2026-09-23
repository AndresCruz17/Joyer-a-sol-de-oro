'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { deleteStorageFiles } from '@/lib/storage/image-utils';

interface DeleteProps {
    id: string;
    name: string;
    imageUrl?: string | null;
    images?: string[] | null;
}

export default function DeleteProductButton({ id, name, imageUrl, images }: DeleteProps) {
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar la joya "${name}"? Esta acción no se puede deshacer.`);
        if (!confirmed) return;

        setDeleting(true);
        const supabase = createClient();

        try {
            // 1. Recopilar todas las imágenes asociadas al producto (portada + galería)
            const allImages = Array.from(
                new Set([imageUrl, ...(images || [])].filter(Boolean) as string[])
            );

            // 2. Eliminar el producto de la base de datos
            const { error: dbError } = await supabase.from('products').delete().eq('id', id);

            if (dbError) throw dbError;

            // 3. Si se eliminó de la BD, limpiar todos los archivos de Storage
            if (allImages.length > 0) {
                await deleteStorageFiles(supabase, allImages, 'products');
            }

            // 4. Recargar datos en la interfaz
            router.refresh();
        } catch (err: any) {
            console.error('Error al eliminar producto:', err);
            alert(`Error al eliminar el producto: ${err.message || 'Ocurrió un error inesperado.'}`);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-xs font-sans disabled:opacity-50 active:scale-[0.97] cursor-pointer"
        >
            {deleting ? 'Borrando...' : 'Eliminar'}
        </button>
    );
}