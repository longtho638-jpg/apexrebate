'use client';

export default function HeroSection({ t }: { t: any }) {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          {t('hero.title')}
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mb-8">
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/auth/signup"
            className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-blue-50 transition"
          >
            {t('hero.cta')}
          </a>
          <a
            href="/how-it-works"
            className="px-8 py-3 border border-white text-white font-medium rounded-lg hover:bg-white/10 transition"
          >
            {t('hero.learnMore')}
          </a>
        </div>
      </div>
    </section>
  );
}
