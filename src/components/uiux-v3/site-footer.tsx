import Link from 'next/link'

const FOOTER_LINKS = [
  {
    title: 'Sản phẩm',
    i18nKey: 'footer.product',
    links: [
      { href: '#features', label: 'Component kit', i18nKey: 'footer.product.components' },
      { href: '#tokens', label: 'Design tokens', i18nKey: 'footer.product.tokens' },
      { href: '#workflow', label: 'Quy trình build', i18nKey: 'footer.product.workflow' },
    ],
  },
  {
    title: 'Vận hành',
    i18nKey: 'footer.ops',
    links: [
      { href: '#accessibility', label: 'Chuẩn truy cập', i18nKey: 'footer.ops.accessibility' },
      { href: '#qa', label: 'QA checklist', i18nKey: 'footer.ops.qa' },
      { href: '#monitoring', label: 'Monitoring', i18nKey: 'footer.ops.monitoring' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container grid gap-8 py-12 md:grid-cols-[2fr,1fr,1fr]">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground" data-i18n="footer.tagline">
            ApexRebate Hybrid Mode Canvas
          </p>
          <p className="max-w-sm text-sm text-muted-foreground" data-i18n="footer.description">
            Bộ khởi tạo UI/UX v3 giúp rebuild toàn bộ trải nghiệm người dùng với Tailwind CSS thuần, hỗ trợ dark mode, container queries và i18n tự động.
          </p>
        </div>
        {FOOTER_LINKS.map(section => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground" data-i18n={section.i18nKey}>
              {section.title}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {section.links.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    data-i18n={link.i18nKey}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 bg-background py-4">
        <div className="container flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span data-i18n="footer.copyright">© {new Date().getFullYear()} ApexRebate. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" data-i18n="footer.legal.privacy">
              Privacy
            </Link>
            <Link href="/terms" data-i18n="footer.legal.terms">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
