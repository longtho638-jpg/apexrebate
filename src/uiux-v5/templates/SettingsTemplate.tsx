// src/uiux-v5/templates/SettingsTemplate.tsx
import NavBar from "@/uiux-v5/molecules/NavBar";
import Footer from "@/uiux-v5/molecules/Footer";
import Section from "@/uiux-v5/atoms/Section";
import Container from "@/uiux-v5/atoms/Container";
import Card from "@/uiux-v5/atoms/Card";
import Input from "@/uiux-v5/atoms/Input";
import Button from "@/uiux-v5/atoms/Button";

export default function SettingsTemplate({ user }: { 
  user: { 
    name: string; 
    email: string; 
  } 
}) {
  return (
    <>
      <NavBar />

      <Section>
        <Container className="max-w-xl">
          <Card className="space-y-6">
            <h2 className="text-2xl font-bold text-midnight">Cài đặt tài khoản</h2>

            <Input placeholder="Tên" defaultValue={user.name} />
            <Input placeholder="Email" defaultValue={user.email} />

            <Button variant="primary" className="w-full">
              Lưu thay đổi
            </Button>
          </Card>
        </Container>
      </Section>

      <Footer />
    </>
  );
}