import DashboardTemplate from "@/uiux-v5/templates/DashboardTemplate";

export default async function DashboardV5({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const stats = {
    totalSavings: "$50,000",
    monthSavings: "$0",
    volume: "$10.0M",
    rank: "DIAMOND",
    trend1: 5,
    trend2: -2,
    trend3: 10
  };

  const charts = {
    history: <div>Chart placeholder</div>,
    exchanges: <div>Chart placeholder</div>
  };

  return <DashboardTemplate locale={locale} stats={stats} charts={charts} />;
}
