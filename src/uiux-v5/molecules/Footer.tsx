// src/uiux-v5/molecules/Footer.tsx
import Container from "@/uiux-v5/atoms/Container";

export default function Footer() {
  return (
    <footer className="bg-midnight text-offWhite py-16 mt-20 border-t border-white/10">
      <Container className="grid grid-cols-1 md:grid-cols-4 gap-10">

        <div>
          <h3 className="text-lg font-semibold mb-4">ApexRebate</h3>
          <p className="text-offWhite/70 leading-relaxed">
            Tối ưu hóa lợi nhuận cho trader nghiêm túc.
          </p>
        </div>

        <FooterGroup
          title="Sản phẩm"
          items={[
            ["Hoàn phí", "/calculator"],
            ["ApexPro", "/apex-pro"],
            ["Hang Sói", "/hang-soi"],
          ]}
        />

        <FooterGroup
          title="Công ty"
          items={[
            ["Về chúng tôi", "/about"],
            ["Liên hệ", "/contact"],
            ["Điều khoản", "/terms"],
          ]}
        />

        <FooterGroup
          title="Đối tác"
          items={[
            ["Binance", "#"],
            ["Bybit", "#"],
            ["OKX", "#"],
          ]}
        />

      </Container>

      <Container className="pt-12 mt-12 border-t border-white/10 text-center">
        <p className="text-offWhite/50 text-sm">
          © 2025 ApexRebate. Tất cả quyền được bảo lưu.
        </p>
      </Container>
    </footer>
  );
}

function FooterGroup({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <h4 className="font-semibold mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map(([label, url]) => (
          <li key={url}>
            <a href={url} className="text-offWhite/60 hover:text-teal transition-colors text-sm">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}