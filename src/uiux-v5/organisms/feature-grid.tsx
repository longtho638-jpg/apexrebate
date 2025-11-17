export const FeatureGrid = () => (
  <section className="grid gap-6 md:grid-cols-3 mt-12">
    {['Feature 1', 'Feature 2', 'Feature 3'].map((feature, i) => (
      <div key={i} className="rounded-lg border p-6">
        <h3 className="font-semibold text-lg">{feature}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Description of {feature}
        </p>
      </div>
    ))}
  </section>
)
