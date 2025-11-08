'use client'

import Link from 'next/link'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '#objectives', key: 'sections.objectives', label: 'UX Objectives' },
  { href: '#roadmap', key: 'sections.roadmap', label: 'Roadmap' },
  { href: '#tasks', key: 'sections.tasks', label: 'Tasks' },
  { href: '#experts', key: 'sections.experts', label: 'Experts' },
  { href: '#governance', key: 'sections.governance', label: 'Governance' },
] as const

export function SiteHeader() {
  // Hardcoded text thay vì useTranslations do uiux-v3 messages đã bị remove
  const brand = 'AR ApexRebate UI/UX v3'
  const ariaMain = 'Primary navigation'
  const mode = 'Hybrid Mode ⚡'
  const docs = 'Canvas playbook'

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link
          href="/uiux-v3"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
          data-i18n="nav.brand"
        >
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">AR</span>
          {brand}
        </Link>
        <nav aria-label={ariaMain} className="hidden items-center gap-1 md:flex">
          {navItems.map(item => (
            <Link
              key={item.key}
              href={item.href}
              data-i18n={`nav.${item.key}`}
              className={cn(
                'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                'text-muted-foreground hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden md:inline-flex" data-i18n="nav.mode">
            {mode}
          </Badge>
          <ThemeToggle />
          <Button asChild size="sm" data-i18n="nav.docs">
            <Link href="#tasks">{docs}</Link>
          </Button>
        </div>
      </div>
      <nav className="md:hidden" aria-label={ariaMain}>
        <div className="container flex snap-x gap-2 overflow-x-auto pb-3 pt-2">
          {navItems.map(item => (
            <Link
              key={item.key}
              href={item.href}
              data-i18n={`nav.${item.key}`}
              className="snap-start rounded-full bg-muted/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
