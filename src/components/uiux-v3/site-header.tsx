'use client'

import Link from 'next/link'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link href="/uiux-v3" className="flex items-center gap-2 font-semibold tracking-tight text-foreground" data-i18n="nav.brand">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">AR</span>
          ApexRebate UI/UX v3
        </Link>
        <nav aria-label="Chuyển hướng chính" className="hidden items-center gap-1 md:flex">
          <Link
            href="#features"
            data-i18n="nav.features"
            className={cn(
              'rounded-full px-3 py-2 text-sm font-medium transition-colors',
              'text-muted-foreground hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
            )}
          >
            Bộ component
          </Link>
          <Link
            href="#tokens"
            data-i18n="nav.tokens"
            className={cn(
              'rounded-full px-3 py-2 text-sm font-medium transition-colors',
              'text-muted-foreground hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
            )}
          >
            Design tokens
          </Link>
          <Link
            href="#workflow"
            data-i18n="nav.workflow"
            className={cn(
              'rounded-full px-3 py-2 text-sm font-medium transition-colors',
              'text-muted-foreground hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
            )}
          >
            Luồng làm việc
          </Link>
          <Link
            href="#accessibility"
            data-i18n="nav.accessibility"
            className={cn(
              'rounded-full px-3 py-2 text-sm font-medium transition-colors',
              'text-muted-foreground hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
            )}
          >
            Truy cập
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden md:inline-flex" data-i18n="nav.mode">
            Hybrid Mode ⚡
          </Badge>
          <ThemeToggle />
          <Button asChild size="sm" data-i18n="nav.docs">
            <Link href="#workflow">Tài liệu Canvas</Link>
          </Button>
        </div>
      </div>
      <nav className="md:hidden">
        <div className="container flex snap-x gap-2 overflow-x-auto pb-3 pt-2">
          <Link
            href="#features"
            data-i18n="nav.features.mobile"
            className="snap-start rounded-full bg-muted/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Bộ component
          </Link>
          <Link
            href="#tokens"
            data-i18n="nav.tokens.mobile"
            className="snap-start rounded-full bg-muted/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Design tokens
          </Link>
          <Link
            href="#workflow"
            data-i18n="nav.workflow.mobile"
            className="snap-start rounded-full bg-muted/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Luồng làm việc
          </Link>
          <Link
            href="#accessibility"
            data-i18n="nav.accessibility.mobile"
            className="snap-start rounded-full bg-muted/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Truy cập
          </Link>
        </div>
      </nav>
    </header>
  )
}
