export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD') // Separa caracteres con tilde de su letra
        .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
        .replace(/\s+/g, '-') // Reemplaza espacios por guiones
        .replace(/[^\w\-]+/g, '') // Elimina caracteres especiales
        .replace(/\-\-+/g, '-'); // Reemplaza múltiples guiones por uno solo
}

// Ejemplo de uso:
// slugify("¡Anillo de Compromiso en Oro Rosa!") -> "anillo-de-compromiso-en-oro-rosa"