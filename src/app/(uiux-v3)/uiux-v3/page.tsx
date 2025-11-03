import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/features/uiux-v3/components'
import { ToastShowcase } from '@/components/uiux-v3/toast-showcase'

export const metadata: Metadata = {
  title: 'UI/UX v3 — Tailwind-Only Canvas',
  description:
    'Canvas Hybrid Mode giúp clean rebuild ApexRebate UI với Tailwind CSS thuần, dark mode và i18n tự động.',
}

export default async function UiUxV3Page() {
  const t = await getTranslations('uiuxV3')

  const objectiveKeys = ['objectives.clarity', 'objectives.onboarding', 'objectives.automation'] as const
  const objectives = objectiveKeys.map(key => ({
    key,
    title: t(`${key}.title`),
    description: t(`${key}.description`),
    bullets: t.raw(`${key}.bullets`) as string[],
  }))

  const roadmapKeys = ['roadmap.seed', 'roadmap.tree', 'roadmap.forest', 'roadmap.ground'] as const
  const roadmap = roadmapKeys.map(key => ({
    key,
    title: t(`${key}.title`),
    bullets: t.raw(`${key}.bullets`) as string[],
  }))

  const tasks = t.raw('tasks.items') as { phase: string; steps: string[] }[]
  const experts = t.raw('experts.advisors') as { name: string; summary: string; actions: string[] }[]
  const guardrails = t.raw('governance.pillars') as string[]

  return (
    <div className="space-y-20">
      <section id="hero" className="space-y-8">
        <div className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background p-10 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" data-i18n="hero.badgePrimary">
              {t('hero.badgePrimary')}
            </Badge>
            <Badge data-i18n="hero.badgeSecondary">{t('hero.badgeSecondary')}</Badge>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl" data-i18n="hero.title">
              {t('hero.title')}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground" data-i18n="hero.subtitle">
              {t('hero.subtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" data-i18n="hero.primary">
              <Link href="#roadmap">{t('hero.primary')}</Link>
            </Button>
            <Button variant="outline" size="lg" asChild data-i18n="hero.secondary">
              <Link href="#tasks">{t('hero.secondary')}</Link>
            </Button>
            <ToastShowcase />
          </div>
        </div>
      </section>

      <section id="objectives" className="space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold" data-i18n="objectives.heading">
            {t('objectives.heading')}
          </h2>
          <p className="max-w-2xl text-muted-foreground" data-i18n="objectives.description">
            {t('objectives.description')}
          </p>
        </header>
        <div className="cq-container grid gap-6 cq-cols-1 cq-cols-2 cq-cols-3">
          {objectives.map(objective => (
            <Card key={objective.key} className="border-border/60 bg-background/80 shadow-sm transition-all hover:border-border">
              <CardHeader className="space-y-3">
                <Badge variant="secondary" data-i18n={`${objective.key}.title`}>
                  {objective.title}
                </Badge>
                <CardTitle data-i18n={`${objective.key}.title`}>{objective.title}</CardTitle>
                <CardDescription data-i18n={`${objective.key}.description`}>
                  {objective.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <ul className="space-y-2">
                  {objective.bullets.map((item, index) => (
                    <li key={index} className="flex items-start gap-2" data-i18n={`${objective.key}.bullets.${index}`}>
                      <span className="mt-1 size-2 rounded-full bg-primary/70" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="roadmap" className="space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold" data-i18n="roadmap.heading">
            {t('roadmap.heading')}
          </h2>
          <p className="max-w-2xl text-muted-foreground" data-i18n="roadmap.description">
            {t('roadmap.description')}
          </p>
        </header>
        <div className="cq-container grid gap-6 cq-cols-1 cq-cols-2">
          {roadmap.map(stage => (
            <Card key={stage.key} className="bg-background/90 shadow-sm">
              <CardHeader>
                <CardTitle data-i18n={`${stage.key}.title`}>{stage.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {stage.bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-3" data-i18n={`${stage.key}.bullets.${index}`}>
                      <span className="mt-1.5 size-2 rounded-full bg-emerald-500" aria-hidden />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="tasks" className="space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold" data-i18n="tasks.heading">
            {t('tasks.heading')}
          </h2>
          <p className="max-w-2xl text-muted-foreground" data-i18n="tasks.description">
            {t('tasks.description')}
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {tasks.map((task, index) => (
            <Card key={task.phase} className="border-border/70 bg-background/85 shadow-sm">
              <CardHeader>
                <Badge variant="secondary" data-i18n={`tasks.items.${index}.phase`}>
                  {task.phase}
                </Badge>
                <CardTitle data-i18n={`tasks.items.${index}.phase`}>{task.phase}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {task.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-2" data-i18n={`tasks.items.${index}.steps.${stepIndex}`}>
                      <span className="mt-1 size-2 rounded-full bg-primary/70" aria-hidden />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="experts" className="space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold" data-i18n="experts.heading">
            {t('experts.heading')}
          </h2>
          <p className="max-w-2xl text-muted-foreground" data-i18n="experts.description">
            {t('experts.description')}
          </p>
        </header>
        <div className="cq-container grid gap-6 cq-cols-1 cq-cols-2">
          {experts.map((advisor, index) => (
            <Card key={advisor.name} className="bg-background/90 shadow-sm">
              <CardHeader className="space-y-2">
                <Badge variant="outline" data-i18n={`experts.advisors.${index}.name`}>
                  {advisor.name}
                </Badge>
                <CardTitle data-i18n={`experts.advisors.${index}.summary`}>{advisor.summary}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {advisor.actions.map((action, actionIndex) => (
                    <li
                      key={actionIndex}
                      className="flex items-start gap-2"
                      data-i18n={`experts.advisors.${index}.actions.${actionIndex}`}
                    >
                      <span className="mt-1 size-2 rounded-full bg-primary/70" aria-hidden />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="governance" className="space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold" data-i18n="governance.heading">
            {t('governance.heading')}
          </h2>
          <p className="max-w-2xl text-muted-foreground" data-i18n="governance.description">
            {t('governance.description')}
          </p>
        </header>
        <Card className="bg-background/90">
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-sm text-muted-foreground">
              {guardrails.map((item, index) => (
                <li key={index} className="flex items-start gap-3" data-i18n={`governance.pillars.${index}`}>
                  <span className="mt-1.5 size-2 rounded-full bg-emerald-500" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <CardFooter className="flex items-center gap-4 p-0 pt-2">
              <Button asChild size="sm" data-i18n="governance.cta">
                <Link href={t('governance.ctaHref')}>{t('governance.cta')}</Link>
              </Button>
            </CardFooter>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
