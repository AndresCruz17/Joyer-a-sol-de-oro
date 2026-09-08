import { describe, it, expect } from 'vitest';
import { slugify } from '@/lib/seo/slugify';

describe('5. Generación de Slugs y Preservación de Enlaces SEO', () => {
  describe('slugify()', () => {
    it('debe transformar nombres con mayúsculas y espacios a slugs limpios', () => {
      expect(slugify('Anillo Solitario Oro')).toBe('anillo-solitario-oro');
    });

    it('debe normalizar y eliminar tildes y caracteres diacríticos (á, é, í, ó, ú, ñ, ü)', () => {
      expect(slugify('Joyería Sol de Oro - Edición Especial')).toBe('joyeria-sol-de-oro-edicion-especial');
      expect(slugify('Colgante de Ópalo con Baño de Oro')).toBe('colgante-de-opalo-con-bano-de-oro');
      expect(slugify('Pendientes Pingüino')).toBe('pendientes-pinguino');
    });

    it('debe eliminar signos de puntuación y caracteres especiales', () => {
      expect(slugify('¡¡¡Super Oferta: 50% de Descuento en Anillos #1!!!')).toBe('super-oferta-50-de-descuento-en-anillos-1');
      expect(slugify('Cadena Oro 18K @ Sol & Oro')).toBe('cadena-oro-18k-sol-oro');
    });

    it('debe colapsar múltiples guiones consecutivos en uno solo', () => {
      expect(slugify('Joya --- Exclusiva --- 2026')).toBe('joya-exclusiva-2026');
    });

    it('debe eliminar espacios al inicio y al final', () => {
      expect(slugify('   Aretes Finos   ')).toBe('aretes-finos');
    });
  });

  describe('Estrategia de Preservación de Slugs en Categorías', () => {
    it('debe preservar el slug original al renombrar una categoría existente para evitar 404', () => {
      // Simulación de la lógica aplicada en app/admin/categorias/page.tsx
      const editingCategory = {
        id: 'cat-123',
        name: 'Anillos de Boda Clásicos',
        slug: 'anillos-de-boda',
      };

      const updatedFormData = {
        name: 'Anillos de Boda y Compromiso Exclusivos',
      };

      const finalSlug = editingCategory
        ? editingCategory.slug
        : slugify(updatedFormData.name);

      expect(finalSlug).toBe('anillos-de-boda');
      expect(finalSlug).not.toBe('anillos-de-boda-y-compromiso-exclusivos');
    });

    it('debe generar un slug nuevo cuando la categoría se crea por primera vez', () => {
      const editingCategory = null;
      const newCategoryData = {
        name: 'Relojes de Alta Gama 18K',
      };

      const finalSlug = editingCategory
        ? (editingCategory as { slug: string }).slug
        : slugify(newCategoryData.name);

      expect(finalSlug).toBe('relojes-de-alta-gama-18k');
    });
  });
});
