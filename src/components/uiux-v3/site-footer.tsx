import Link from 'next/link'

const sectionConfig = [
  {
    title: 'Product',
    links: [
      { href: '#objectives', label: 'Components' },
      { href: '#roadmap', label: 'Tokens' },
      { href: '#tasks', label: 'Workflow' },
    ],
  },
  {
    title: 'Operations',
    links: [
      { href: '#governance', label: 'Accessibility' },
      { href: '#experts', label: 'QA' },
      { href: '/docs/automation', label: 'Monitoring' },
    ],
  },
] as const

export async function SiteFooter() {
  const year = new Date().getFullYear()
  // Hardcoded text thay vì getTranslations
  const tagline = 'ApexRebate UI/UX'
  const description = 'A cross-platform plan to deliver unified trader experience with modern design system.'
  const copyright = `© ${year} ApexRebate. All rights reserved.`

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container grid gap-8 py-12 md:grid-cols-[2fr,1fr,1fr]">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {tagline}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        {sectionConfig.map(section => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              {section.title}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {section.links.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
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
          <span>{copyright}</span>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
