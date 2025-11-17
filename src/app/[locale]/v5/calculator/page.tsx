import CalculatorTemplate from "@/uiux-v5/templates/CalculatorTemplate";

export default async function CalculatorV5({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <CalculatorTemplate locale={locale} />;
}
