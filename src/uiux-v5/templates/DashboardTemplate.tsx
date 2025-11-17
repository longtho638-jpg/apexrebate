// src/uiux-v5/templates/DashboardTemplate.tsx
import NavBar from "@/uiux-v5/molecules/NavBar";
import Footer from "@/uiux-v5/molecules/Footer";
import DashboardHeader from "@/uiux-v5/organisms/DashboardHeader";
import ChartShell from "@/uiux-v5/molecules/ChartShell";
import Section from "@/uiux-v5/atoms/Section";
import Container from "@/uiux-v5/atoms/Container";

export default function DashboardTemplate({ locale = "en", stats, charts }: { 
  locale?: string;
  stats: { 
    totalSavings: string; 
    monthSavings: string; 
    volume: string; 
    rank: string; 
    trend1?: number; 
    trend2?: number; 
    trend3?: number; 
  }; 
  charts: { 
    history: React.ReactNode; 
    exchanges: React.ReactNode; 
  } 
}) {
  return (
    <>
      <NavBar locale={locale} />

      <DashboardHeader stats={stats} />

      <Section>
        <Container className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <ChartShell title="Lịch sử tiết kiệm">
            {charts.history}
          </ChartShell>

          <ChartShell title="Phân bổ theo sàn">
            {charts.exchanges}
          </ChartShell>

        </Container>
      </Section>

      <Footer locale={locale} />
    </>
  );
}
