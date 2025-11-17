export const ToolCard = ({ name, description, category }: { name: string; description: string; category: string }) => (
  <div className="rounded-lg border p-6 hover:shadow-lg transition-shadow">
    <div className="text-xs font-semibold text-blue-600 uppercase">{category}</div>
    <h3 className="mt-2 text-lg font-semibold">{name}</h3>
    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </div>
)
