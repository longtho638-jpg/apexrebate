// src/uiux-v5/templates/CalculatorTemplate.tsx
import NavBar from "@/uiux-v5/molecules/NavBar";
import Footer from "@/uiux-v5/molecules/Footer";
import Section from "@/uiux-v5/atoms/Section";
import Container from "@/uiux-v5/atoms/Container";
import Card from "@/uiux-v5/atoms/Card";
import Input from "@/uiux-v5/atoms/Input";
import Button from "@/uiux-v5/atoms/Button";

export default function CalculatorTemplate({ onCalculate }: { 
  onCalculate: () => void 
}) {
  return (
    <>
      <NavBar />

      <Section>
        <Container className="max-w-xl">
          <Card className="space-y-6">
            <h2 className="text-2xl font-bold text-midnight">Máy tính hoàn phí</h2>

            <Input placeholder="Khối lượng giao dịch (USD)" />
            <Input placeholder="Sàn giao dịch" />

            <Button variant="primary" className="w-full" onClick={onCalculate}>
              Tính toán
            </Button>
          </Card>
        </Container>
      </Section>

      <Footer />
    </>
  );
}