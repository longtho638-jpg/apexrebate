import Link from 'next/link'
import type { Metadata } from 'next'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from '@/features/uiux-v3/components'

export const metadata: Metadata = {
  title: 'UI/UX v3 — Tailwind-Only Canvas',
  description: 'Canvas Hybrid Mode giúp clean rebuild ApexRebate UI với Tailwind CSS thuần, dark mode và i18n tự động.',
}

const featureHighlights = [
  {
    title: 'Component primitives',
    description: 'Button, card, table, skeleton, toast và input đều được tối ưu sẵn cho Tailwind thuần.',
    i18nKey: 'features.primitives',
  },
  {
    title: 'Container queries',
    description: 'Grid linh hoạt dựa trên chiều rộng thực tế của component thay vì breakpoint màn hình.',
    i18nKey: 'features.containers',
  },
  {
    title: 'Design tokens',
    description: 'Màu sắc, radius, typography mapping sang CSS custom properties đồng bộ.',
    i18nKey: 'features.tokens',
  },
]

const tokens = [
  { name: '--radius', value: '10px', usage: 'Border radius chuẩn cho component', i18nKey: 'tokens.radius' },
  { name: '--background', value: 'oklch(1 0 0)', usage: 'Nền sáng mặc định', i18nKey: 'tokens.background' },
  { name: '--primary', value: 'oklch(0.205 0 0)', usage: 'Màu nhấn thương hiệu', i18nKey: 'tokens.primary' },
]

const workflow = [
  {
    title: 'Thiết lập canvas',
    description: 'Khởi tạo route /uiux-v3 với header, skip link và footer chuẩn.',
    i18nKey: 'workflow.setup',
  },
  {
    title: 'Mapping component',
    description: 'Import primitives từ thư viện Tailwind-only và mapping vào UI thực tế.',
    i18nKey: 'workflow.mapping',
  },
  {
    title: 'Tự động i18n',
    description: 'Chạy script extract-i18n để xuất JSON dựa trên data-i18n.',
    i18nKey: 'workflow.i18n',
  },
]

const accessibilityChecklist = [
  { item: 'Skip link tới nội dung chính', i18nKey: 'accessibility.skip' },
  { item: 'Nút toggle dark mode với sr-only label', i18nKey: 'accessibility.theme' },
  { item: 'Keyboard focus ring rõ ràng trên nav', i18nKey: 'accessibility.focus' },
]

function ToastShowcase() {
  'use client'

  const { toast } = useToast()

  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast({
          title: 'Canvas đã sẵn sàng',
          description: 'Trigger toast này khi hoàn tất refactor luồng UI.',
        })
      }
      data-i18n="hero.toast"
    >
      Gửi toast kiểm thử
    </Button>
  )
}

export default function UiUxV3Page() {
  return (
    <div className="space-y-20">
      <section id="hero" className="space-y-8">
        <div className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background p-10 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" data-i18n="hero.badge">
              Hybrid Mode ⚡ Tailwind Only
            </Badge>
            <Badge data-i18n="hero.badge.secondary">Clean rebuild</Badge>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl" data-i18n="hero.title">
              Canvas UI/UX v3 cho ApexRebate
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground" data-i18n="hero.subtitle">
              Sẵn sàng để tái thiết toàn bộ giao diện với Tailwind thuần, dark mode, container queries và module i18n tự động.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" data-i18n="hero.primary">
              <Link href="#workflow">Bắt đầu rebuild</Link>
            </Button>
            <Button variant="outline" size="lg" asChild data-i18n="hero.secondary">
              <Link href="#features">Xem component kit</Link>
            </Button>
            <ToastShowcase />
          </div>
        </div>
      </section>

      <section id="features" className="space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold" data-i18n="features.heading">Bộ component nền tảng</h2>
          <p className="max-w-2xl text-muted-foreground" data-i18n="features.description">
            Các primitive được chuẩn hóa với spacing, radius và màu sắc đồng bộ, hỗ trợ container queries ngay trong class tiện ích.
          </p>
        </header>
        <div className="cq-container grid gap-6 cq-cols-1 cq-cols-2 cq-cols-3">
          {featureHighlights.map(feature => (
            <Card key={feature.title} className="border-border/60 bg-background/80 shadow-sm transition-all hover:border-border">
              <CardHeader className="space-y-3">
                <Badge variant="secondary" data-i18n={`${feature.i18nKey}.badge`}>
                  {feature.title}
                </Badge>
                <CardTitle data-i18n={`${feature.i18nKey}.title`}>{feature.title}</CardTitle>
                <CardDescription data-i18n={`${feature.i18nKey}.description`}>
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full rounded-2xl bg-muted/40" />
                <p className="text-sm text-muted-foreground" data-i18n={`${feature.i18nKey}.note`}>
                  Skeleton preview thể hiện trạng thái tải mặc định.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="tokens" className="space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold" data-i18n="tokens.heading">Design tokens</h2>
          <p className="max-w-2xl text-muted-foreground" data-i18n="tokens.description">
            Quản trị biến màu sắc và radius thống nhất cho mọi module, đồng bộ với Tailwind config mới.
          </p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle data-i18n="tokens.table.title">Bảng mapping tokens</CardTitle>
            <CardDescription data-i18n="tokens.table.description">
              Các giá trị được xuất trực tiếp từ CSS custom properties, sẵn sàng cho tài liệu hoá và audit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead data-i18n="tokens.table.token">Token</TableHead>
                  <TableHead data-i18n="tokens.table.value">Giá trị</TableHead>
                  <TableHead data-i18n="tokens.table.usage">Mục đích</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map(token => (
                  <TableRow key={token.name}>
                    <TableCell data-i18n={`${token.i18nKey}.name`}>{token.name}</TableCell>
                    <TableCell data-i18n={`${token.i18nKey}.value`}>{token.value}</TableCell>
                    <TableCell data-i18n={`${token.i18nKey}.usage`}>{token.usage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center gap-4">
            <div className="flex items-center gap-2" data-i18n="tokens.example.label">
              <Label htmlFor="token-preview">Preview class</Label>
              <Input id="token-preview" value="bg-primary text-primary-foreground rounded-lg" readOnly />
            </div>
            <Button variant="outline" size="sm" data-i18n="tokens.copy">
              Sao chép
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section id="workflow" className="space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold" data-i18n="workflow.heading">Quy trình vận hành canvas</h2>
          <p className="max-w-2xl text-muted-foreground" data-i18n="workflow.description">
            Các bước tuần tự để refactor UI hiện tại sang chuẩn Tailwind-only với i18n tự động.
          </p>
        </header>
        <div className="cq-container grid gap-6 cq-cols-1 cq-cols-2">
          {workflow.map(step => (
            <Card key={step.title} className="bg-background/90 shadow-sm">
              <CardHeader>
                <CardTitle data-i18n={`${step.i18nKey}.title`}>{step.title}</CardTitle>
                <CardDescription data-i18n={`${step.i18nKey}.description`}>
                  {step.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="accessibility" className="space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold" data-i18n="accessibility.heading">Chuẩn truy cập & QA</h2>
          <p className="max-w-2xl text-muted-foreground" data-i18n="accessibility.description">
            Checklist giúp đảm bảo canvas tuân thủ WCAG 2.2, hỗ trợ keyboard và dark mode liền mạch.
          </p>
        </header>
        <Card>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {accessibilityChecklist.map(item => (
                <li
                  key={item.i18nKey}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/90 p-4 shadow-xs"
                  data-i18n={item.i18nKey}
                >
                  <span className="mt-1.5 size-2 rounded-full bg-emerald-500" aria-hidden />
                  <span>{item.item}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/80 p-4" id="qa" data-i18n="qa.note">
              Lưu ý: chạy <code className="rounded bg-muted/80 px-2 py-1">npm run i18n:extract</code> sau mỗi lần cập nhật copy để đồng bộ file JSON.
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="monitoring" className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold" data-i18n="monitoring.heading">Monitor & rollout</h2>
          <p className="max-w-2xl text-muted-foreground" data-i18n="monitoring.description">
            Theo dõi Lighthouse + axe trong CI và cấu hình rollout theo từng module UI.
          </p>
        </header>
        <Card className="bg-background/90">
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground" data-i18n="monitoring.instructions">
              Thêm stage kiểm thử tự động trong pipeline để chạy <code className="rounded bg-muted/80 px-2 py-1">npm run lint</code> và các script Lighthouse/axe trước khi deploy.
            </p>
            <Button asChild size="sm" data-i18n="monitoring.cta">
              <Link href="/docs/automation">Mở tài liệu automation</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
