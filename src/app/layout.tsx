export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  )
}