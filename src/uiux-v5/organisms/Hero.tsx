// src/uiux-v5/organisms/Hero.tsx
import Container from "@/uiux-v5/atoms/Container";
import Section from "@/uiux-v5/atoms/Section";
import Button from "@/uiux-v5/atoms/Button";
import Card from "@/uiux-v5/atoms/Card";
import Badge from "@/uiux-v5/atoms/Badge";

export default function Hero() {
  return (
    <Section className="relative bg-gradient-to-br from-midnight via-midnight/80 to-midnight text-offWhite pt-40 pb-32 overflow-hidden">

      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal/10 to-transparent blur-3xl" />

      <Container className="relative z-10 text-center">

        <Badge type="success" className="mx-auto mb-6">
          UI 5.1 Visual Engine
        </Badge>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.15]">
          Xây sản phẩm 10x nhanh hơn  
          <span className="text-teal"> và đẹp hơn</span>
        </h1>

        <p className="text-offWhite/70 text-xl md:text-2xl max-w-3xl mx-auto mb-12">
          Blueprint UI 5.1 giúp bạn tạo UI cao cấp trong vài phút —  
          không cần designer, không cần chỉnh sửa thủ công.
        </p>

        {/* CTA */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Button size="lg" variant="primary">Bắt đầu ngay</Button>
          <Button size="lg" variant="outline">Xem tài liệu</Button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="bg-midnight/40 backdrop-blur-lg border border-white/10">
            <h3 className="font-semibold text-xl mb-2">Production-ready</h3>
            <p className="text-offWhite/60 text-sm">
              Tất cả component tinh chỉnh theo tokens Phase 1.
            </p>
          </Card>

          <Card className="bg-midnight/40 backdrop-blur-lg border border-white/10">
            <h3 className="font-semibold text-xl mb-2">Hiệu suất 5.1</h3>
            <p className="text-offWhite/60 text-sm">
              Load nhanh, không flicker, tối ưu mobile-first.
            </p>
          </Card>

          <Card className="bg-midnight/40 backdrop-blur-lg border border-white/10">
            <h3 className="font-semibold text-xl mb-2">Dễ tùy chỉnh</h3>
            <p className="text-offWhite/60 text-sm">
                Chỉ cần đổi token là đổi toàn hệ thống.
            </p>
          </Card>
        </div>

      </Container>
    </Section>
  );
}