async function fetchSLO() {
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/admin/slo/summary`, { cache: "no-store" });
  return r.json();
}

export default async function SLOPage() {
  const data = await fetchSLO();
  const { ok, alert, thresholds } = data;
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">SLO Dashboard</h1>
      <p className="text-sm text-neutral-600 mb-4">
        Ngưỡng: p95_edge ≤ {thresholds.p95_edge}ms · error_rate ≤ {(thresholds.error_rate * 100).toFixed(2)}%
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl border border-neutral-200">
          <div className="text-xs text-neutral-500 font-medium">Routes OK</div>
          <div className="text-3xl font-semibold text-green-600 mt-1">{ok}</div>
        </div>
        <div className="p-4 rounded-2xl border border-neutral-200">
          <div className="text-xs text-neutral-500 font-medium">Routes ALERT</div>
          <div className={`text-3xl font-semibold mt-1 ${alert>0?"text-red-600":"text-green-600"}`}>{alert}</div>
        </div>
        <div className="p-4 rounded-2xl border border-neutral-200">
          <div className="text-xs text-neutral-500 font-medium">Total Routes</div>
          <div className="text-3xl font-semibold text-neutral-700 mt-1">{ok + alert}</div>
        </div>
        <div className="p-4 rounded-2xl border border-neutral-200">
          <div className="text-xs text-neutral-500 font-medium">Health %</div>
          <div className="text-3xl font-semibold text-blue-600 mt-1">{ok + alert > 0 ? ((ok / (ok + alert)) * 100).toFixed(0) : 0}%</div>
        </div>
      </div>
      <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="p-3 text-left font-semibold text-neutral-700">Route</th>
              <th className="p-3 text-right font-semibold text-neutral-700">Count</th>
              <th className="p-3 text-right font-semibold text-neutral-700">Errors</th>
              <th className="p-3 text-right font-semibold text-neutral-700">p95 (ms)</th>
              <th className="p-3 text-right font-semibold text-neutral-700">p99 (ms)</th>
              <th className="p-3 text-right font-semibold text-neutral-700">error_rate</th>
              <th className="p-3 text-center font-semibold text-neutral-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.rows?.map((r:any)=>(
              <tr key={r.route} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="p-3 font-mono text-neutral-900">{r.route}</td>
                <td className="p-3 text-right text-neutral-700">{r.count.toLocaleString()}</td>
                <td className="p-3 text-right text-neutral-700">{r.errors}</td>
                <td className={`p-3 text-right font-medium ${r.p95_ms <= thresholds.p95_edge ? 'text-green-600' : 'text-red-600'}`}>
                  {r.p95_ms}
                </td>
                <td className="p-3 text-right text-neutral-700">{r.p99_ms}</td>
                <td className={`p-3 text-right font-medium ${r.error_rate <= thresholds.error_rate ? 'text-green-600' : 'text-red-600'}`}>
                  {(r.error_rate * 100).toFixed(2)}%
                </td>
                <td className="p-3 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    r.status==="OK" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
        <p className="text-xs text-neutral-600">
          📊 <strong>Nguồn dữ liệu:</strong> <code className="bg-white px-2 py-1 rounded">evidence/otel/summary.json</code> (mặc định). 
          Đặt biến <code className="bg-white px-2 py-1 rounded">SLO_JSON_PATH</code> để trỏ tới file collector export.
        </p>
      </div>
    </div>
  );
}
