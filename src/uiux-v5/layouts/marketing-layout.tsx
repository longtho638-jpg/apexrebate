import { RootLayout } from './root-layout'

export const MarketingLayout = ({ children }: { children: React.ReactNode }) => (
  <RootLayout>
    <div className="space-y-16">{children}</div>
  </RootLayout>
)
