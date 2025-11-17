export const PartnerLogoGrid = ({ partners }: { partners: Array<{ name: string; logo: string }> }) => (
  <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
    {partners.map((partner, i) => (
      <div key={i} className="flex items-center justify-center rounded-lg border p-6">
        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {partner.name}
        </span>
      </div>
    ))}
  </div>
)
