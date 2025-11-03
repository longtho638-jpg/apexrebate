import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

const sectionConfig = [
  {
    titleKey: 'product.title',
    links: [
      { href: '#objectives', labelKey: 'product.components' },
      { href: '#roadmap', labelKey: 'product.tokens' },
      { href: '#tasks', labelKey: 'product.workflow' },
    ],
  },
  {
    titleKey: 'ops.title',
    links: [
      { href: '#governance', labelKey: 'ops.accessibility' },
      { href: '#experts', labelKey: 'ops.qa' },
      { href: '/docs/automation', labelKey: 'ops.monitoring' },
    ],
  },
] as const

export async function SiteFooter() {
  const t = await getTranslations('uiuxV3.footer')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container grid gap-8 py-12 md:grid-cols-[2fr,1fr,1fr]">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground" data-i18n="footer.tagline">
            {t('tagline')}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground" data-i18n="footer.description">
            {t('description')}
          </p>
        </div>
        {sectionConfig.map(section => (
          <div key={section.titleKey} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground" data-i18n={`footer.${section.titleKey}`}>
              {t(section.titleKey)}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {section.links.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    data-i18n={`footer.${link.labelKey}`}
                    className="transition-colors hover:text-foreground"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 bg-background py-4">
        <div className="container flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span data-i18n="footer.copyright">{t('copyright', { year })}</span>
          <div className="flex gap-4">
            <Link href="/privacy" data-i18n="footer.legal.privacy">
              {t('legal.privacy')}
            </Link>
            <Link href="/terms" data-i18n="footer.legal.terms">
              {t('legal.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
