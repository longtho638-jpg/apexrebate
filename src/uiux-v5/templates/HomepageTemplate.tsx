// src/uiux-v5/templates/HomepageTemplate.tsx
import Hero from "@/uiux-v5/organisms/Hero";
import NavBar from "@/uiux-v5/molecules/NavBar";
import Footer from "@/uiux-v5/molecules/Footer";
import Section from "@/uiux-v5/atoms/Section";
import Container from "@/uiux-v5/atoms/Container";
import Card from "@/uiux-v5/atoms/Card";
import Button from "@/uiux-v5/atoms/Button";

export default function HomepageTemplate({ locale = "en" }: { locale?: string }) {
  return (
    <>
      <NavBar locale={locale} />

      <Hero />

      {/* Features Section */}
      <Section>
        <Container className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <h3 className="text-xl font-bold text-midnight">Trải nghiệm 10x</h3>
            <p className="text-textSecondary text-sm mt-3">
              Giao diện UI 5.1 giúp người dùng thao tác nhanh – rõ – gọn.
            </p>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-midnight">Dữ liệu minh bạch</h3>
            <p className="text-textSecondary text-sm mt-3">
              Theo dõi tiết kiệm, khối lượng, lịch sử – theo chuẩn Fintech.
            </p>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-midnight">Công cụ mạnh mẽ</h3>
            <p className="text-textSecondary text-sm mt-3">
              Bộ công cụ ApexPro + Calculators + Hang Sói.
            </p>
          </Card>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="bg-offWhite">
        <Container className="text-center">
          <h2 className="text-3xl font-bold text-midnight mb-4">
            Sẵn sàng tối ưu hóa lợi nhuận?
          </h2>
          <p className="text-textSecondary mb-8">
            Bắt đầu miễn phí – chỉ mất 60 giây để kích hoạt tài khoản.
          </p>
          <Button size="lg" variant="primary">Mở tài khoản</Button>
        </Container>
      </Section>

      <Footer locale={locale} />
    </>
  );
}
