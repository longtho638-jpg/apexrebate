'use client';

export default function FeaturesGrid({ t }: { t: any }) {
  const features = [
    {
      title: t('features.cashback.title'),
      desc: t('features.cashback.description'),
      icon: '💸'
    },
    {
      title: t('features.apexPro.title'),
      desc: t('features.apexPro.description'),
      icon: '📊'
    },
    {
      title: t('features.community.title'),
      desc: t('features.community.description'),
      icon: '🐺'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-8 shadow hover:shadow-lg transition"
          >
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
