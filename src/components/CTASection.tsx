'use client';

import Link from 'next/link';

export default function CTASection({ t }: { t: any }) {
  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {t('cta.title', { default: t('calculator.title', { default: 'Calculator' }) })}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('cta.description', {
            default: t('calculator.description', {
              default: 'Estimate your potential rebates and earnings easily.'
            })
          })}
        </p>
        <Link
          href="/calculator"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {t('cta.button', { default: t('hero.ctaPrimary', { default: 'Get Started' }) })}
        </Link>
      </div>
    </section>
  );
}
