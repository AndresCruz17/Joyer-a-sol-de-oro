interface ProductSchemaProps {
  name: string;
  description: string;
  image?: string;
  price?: number;
  url: string;
}

export default function ProductSchema({
  name,
  description,
  image,
  price,
  url,
}: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: name,
    image: image || 'https://tujoyeria.com/og-default.jpg',
    description: description,
    brand: {
      '@type': 'Brand',
      name: 'NombreDeTuMarca',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'COP',
      price: price || '0',
      availability: 'https://schema.org/InStock',
      url: url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}