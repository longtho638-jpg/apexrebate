export const DashboardHeader = ({ metrics }: { metrics: Array<{ label: string; value: string }> }) => (
  <div className="rounded-lg border p-6">
    <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {metrics.map((metric, i) => (
        <div key={i} className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</div>
          <div className="text-2xl font-bold mt-1">{metric.value}</div>
        </div>
      ))}
    </div>
  </div>
)
