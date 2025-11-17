// src/uiux-v5/organisms/DashboardHeader.tsx
import Container from "@/uiux-v5/atoms/Container";
import KPICard from "@/uiux-v5/molecules/KPICard";
import Section from "@/uiux-v5/atoms/Section";

export default function DashboardHeader({ stats }: { 
  stats: { 
    totalSavings: string; 
    monthSavings: string; 
    volume: string; 
    rank: string; 
    trend1?: number; 
    trend2?: number; 
    trend3?: number; 
  } 
}) {
  return (
    <Section className="bg-midnight text-offWhite pb-20 pt-28 relative">
      <Container>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">
          Dashboard
        </h1>
        <p className="text-offWhite/60 max-w-2xl mb-10">
          Chào mừng trở lại! Đây là trung tâm kiểm soát lợi nhuận ApexRebate của bạn.
        </p>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard label="Tổng tiết kiệm" value={stats.totalSavings} trend={stats.trend1} />
          <KPICard label="Tháng này" value={stats.monthSavings} trend={stats.trend2} />
          <KPICard label="Khối lượng giao dịch" value={stats.volume} trend={stats.trend3} />
          <KPICard label="Hạng" value={stats.rank} />
        </div>

      </Container>
    </Section>
  );
}