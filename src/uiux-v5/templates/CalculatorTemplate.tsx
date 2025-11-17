// src/uiux-v5/templates/CalculatorTemplate.tsx
"use client";

import NavBar from "@/uiux-v5/molecules/NavBar";
import Footer from "@/uiux-v5/molecules/Footer";
import Section from "@/uiux-v5/atoms/Section";
import Container from "@/uiux-v5/atoms/Container";
import Card from "@/uiux-v5/atoms/Card";
import Input from "@/uiux-v5/atoms/Input";
import Button from "@/uiux-v5/atoms/Button";

export default function CalculatorTemplate({ locale = "en", onCalculate }: {
  locale?: string;
  onCalculate?: () => void
}) {
  return (
    <>
      <NavBar locale={locale} />

      <Section>
        <Container className="max-w-xl">
          <Card className="space-y-6">
            <h2 className="text-2xl font-bold text-midnight">Máy tính hoàn phí</h2>

            <Input placeholder="Khối lượng giao dịch (USD)" />
            <Input placeholder="Sàn giao dịch" />

            <Button variant="primary" className="w-full" onClick={onCalculate || (() => console.log('Calculate clicked'))}>
              Tính toán
            </Button>
          </Card>
        </Container>
      </Section>

      <Footer locale={locale} />
    </>
  );
}
