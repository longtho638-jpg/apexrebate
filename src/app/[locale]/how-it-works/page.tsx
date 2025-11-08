import { useTranslations } from 'next-intl';

export default function HowItWorksPage() {
  const t = useTranslations('howItWorks');

  return (
    <>
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <div className="container mx-auto px-4 py-16 max-w-4xl flex-1">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-slate-600">{t('description')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900">{t('step1')}</h3>
            <p className="text-slate-600">Create your ApexRebate account for free in minutes with basic information.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900">{t('step2')}</h3>
            <p className="text-slate-600">Our team will verify your identity and guide you through connecting your trading account.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900">{t('step3')}</h3>
            <p className="text-slate-600">Trade normally on supported exchanges. ApexRebate automatically tracks and calculates your rebates.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-yellow-600">4</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900">{t('step4')}</h3>
            <p className="text-slate-600">Receive rebates regularly in your account. Track your performance and optimize your profits.</p>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold mb-4 text-slate-900">Why Choose ApexRebate?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">40%</div>
              <p className="text-slate-600">Average rebate rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <p className="text-slate-600">24/7 Support</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <p className="text-slate-600">Maximum Security</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
