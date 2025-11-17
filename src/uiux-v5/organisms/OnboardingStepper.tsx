// src/uiux-v5/organisms/OnboardingStepper.tsx
import Container from "@/uiux-v5/atoms/Container";
import Card from "@/uiux-v5/atoms/Card";
import Button from "@/uiux-v5/atoms/Button";
import Divider from "@/uiux-v5/atoms/Divider";

export default function OnboardingStepper({ steps, current }: { 
  steps: { title: string; description: string }[]; 
  current: number; 
}) {
  return (
    <Container className="max-w-2xl py-20">

      <h2 className="text-3xl font-bold text-midnight mb-10 text-center">
        Hoàn tất các bước để kích hoạt tài khoản
      </h2>

      <Card className="space-y-8">

        {steps.map((step, index) => (
          <div key={index}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-midnight">
                  {step.title}
                </h3>
                <p className="text-textSecondary text-sm">{step.description}</p>
              </div>

              {index < current ? (
                <span className="text-success font-medium">✓</span>
              ) : index === current ? (
                <Button size="sm">Tiếp tục</Button>
              ) : (
                <span className="text-textSecondary">•</span>
              )}
            </div>

            {index < steps.length - 1 && <Divider />}
          </div>
        ))}

      </Card>
    </Container>
  );
}