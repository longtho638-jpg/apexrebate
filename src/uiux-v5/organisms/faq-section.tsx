export const FAQSection = () => (
  <section className="mt-20">
    <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
    <div className="space-y-4 max-w-3xl mx-auto">
      {[
        { q: 'How does it work?', a: 'Our platform connects with major exchanges to provide rebates.' },
        { q: 'When do I get paid?', a: 'Payouts are processed weekly.' },
        { q: 'Are there any hidden fees?', a: 'No hidden fees. Our service is completely transparent.' }
      ].map((faq, i) => (
        <details key={i} className="rounded-lg border p-4">
          <summary className="font-semibold cursor-pointer">{faq.q}</summary>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{faq.a}</p>
        </details>
      ))}
    </div>
  </section>
)
