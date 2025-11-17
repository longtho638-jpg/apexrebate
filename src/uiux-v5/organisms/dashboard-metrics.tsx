export const DashboardMetrics = ({ loading, data }: { loading?: boolean; data?: any[] }) => (
  <div className="space-y-4">
    {loading ? (
      <div>Loading...</div>
    ) : (
      data?.map((item, i) => (
        <div key={i} className="rounded-lg border p-4">
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-2xl">{item.value}</p>
        </div>
      ))
    )}
  </div>
)
