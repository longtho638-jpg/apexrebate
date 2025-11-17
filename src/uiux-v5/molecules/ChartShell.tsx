// src/uiux-v5/molecules/ChartShell.tsx
import Card from "@/uiux-v5/atoms/Card";

export default function ChartShell({ title, children }: { 
  title: string; 
  children: React.ReactNode; 
}) {
  return (
    <Card className="w-full">
      <h3 className="text-lg font-semibold mb-6 text-midnight">{title}</h3>
      <div className="w-full h-[300px]">{children}</div>
    </Card>
  );
}