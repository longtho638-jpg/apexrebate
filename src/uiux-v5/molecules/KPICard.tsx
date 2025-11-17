// src/uiux-v5/molecules/KPICard.tsx
import Card from "@/uiux-v5/atoms/Card";

export default function KPICard({ label, value, trend }: { 
  label: string; 
  value: string; 
  trend?: number; 
}) {
  return (
    <Card className="text-center">
      <p className="text-sm text-textSecondary mb-2">{label}</p>
      <p className="text-3xl font-bold text-midnight">{value}</p>
      {trend !== undefined && (
        <span
          className={`text-sm ${trend > 0 ? "text-success" : "text-danger"}`}
        >
          {trend > 0 ? `+${trend}%` : `${trend}%`}
        </span>
      )}
    </Card>
  );
}