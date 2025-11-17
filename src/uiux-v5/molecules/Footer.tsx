// src/uiux-v5/molecules/Footer.tsx
import Container from "@/uiux-v5/atoms/Container";
import Link from "next/link";

type FooterProps = {
  locale?: string;
};

export default function Footer({ locale = "en" }: FooterProps) {
  const baseLocalePath = `/${locale}`;
  const v5BasePath = `${baseLocalePath}/v5`;

  const groups = [
    {
      title: "Sản phẩm",
      links: [
        { label: "Trang chủ", href: `${v5BasePath}/home` },
        { label: "Hoàn phí", href: `${v5BasePath}/calculator` },
        { label: "Hang Sói", href: `${baseLocalePath}/hang-soi` },
      ],
    },
    {
      title: "Công ty",
      links: [
        { label: "Về chúng tôi", href: `${baseLocalePath}/about` },
        { label: "Liên hệ", href: `${baseLocalePath}/contact` },
        { label: "Điều khoản", href: `${baseLocalePath}/terms` },
      ],
    },
    {
      title: "Tài nguyên",
      links: [
        { label: "Wall of Fame", href: `${baseLocalePath}/wall-of-fame` },
        { label: "Tools Market", href: `${baseLocalePath}/tools` },
        { label: "FAQ", href: `${baseLocalePath}/faq` },
      ],
    },
    {
      title: "Đối tác",
      links: [
        { label: "Binance", href: "https://www.binance.com" },
        { label: "Bybit", href: "https://www.bybit.com" },
        { label: "OKX", href: "https://www.okx.com" },
      ],
    },
  ];

  return (
    <footer className="bg-midnight text-offWhite py-16 mt-20 border-t border-white/10">
      <Container className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-lg font-semibold mb-4">ApexRebate</h3>
          <p className="text-offWhite/70 leading-relaxed">
            Tối ưu hóa lợi nhuận cho trader nghiêm túc.
          </p>
        </div>

        {groups.map((group) => (
          <FooterGroup key={group.title} title={group.title} links={group.links} />
        ))}
      </Container>

      <Container className="pt-12 mt-12 border-t border-white/10 text-center">
        <p className="text-offWhite/50 text-sm">
          © {new Date().getFullYear()} ApexRebate. Tất cả quyền được bảo lưu.
        </p>
      </Container>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-semibold mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map(({ label, href }) => (
          <li key={`${title}-${label}`}>
            <Link
              href={href}
              className="text-offWhite/60 hover:text-teal transition-colors text-sm"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
