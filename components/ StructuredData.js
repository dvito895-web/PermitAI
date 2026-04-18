/*
export default function StructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'PermitAI',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: 'https://permitai.eu',
        description: 'Analysez votre PLU en 3 minutes. 36 000 communes indexées. CERFA auto-rempli.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '4800',
          bestRating: '5',
        },
      },
      {
        '@type': 'Organization',
        name: 'PermitAI',
        url: 'https://permitai.eu',
        logo: 'https://permitai.eu/logo.png',
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'contact@permitai.eu',
          contactType: 'customer service',
          availableLanguage: 'French',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'Mes données sont-elles sécurisées ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui. Toutes les données sont chiffrées et conformes RGPD.' } },
          { '@type': 'Question', name: 'Puis-je annuler à tout moment ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui. Sans engagement, résiliation en 1 clic.' } },
          { '@type': 'Question', name: 'Toutes les communes sont-elles couvertes ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui. Les 36 000 communes de France sont indexées.' } },
        ],
      },
    ],
  };
 
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
*/