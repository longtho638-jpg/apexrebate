// src/uiux-v5/molecules/PricingCard.tsx
import Card from "@/uiux-v5/atoms/Card";
import Button from "@/uiux-v5/atoms/Button";
import Badge from "@/uiux-v5/atoms/Badge";

export default function PricingCard({ title, price, features, highlight }: { 
  title: string; 
  price: string; 
  features: string[]; 
  highlight?: boolean; 
}) {
  return (
    <Card
      className={`relative ${highlight ? "border-2 border-teal shadow-glassGlow" : ""}`}
    >
      {highlight && (
        <Badge type="success" className="absolute -top-3 right-4">Hot</Badge>
      )}

      <h3 className="text-xl font-semibold mb-4 text-midnight">{title}</h3>
      <p className="text-4xl font-bold text-teal mb-8">{price}</p>

      <ul className="space-y-3 mb-8">
        {features.map((f, index) => (
          <li key={index} className="text-textSecondary text-sm">{f}</li>
        ))}
      </ul>

      <Button size="md" className="w-full">Chọn gói</Button>
    </Card>
  );
}