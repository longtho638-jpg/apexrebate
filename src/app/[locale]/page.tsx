import { redirect } from 'next/navigation'

export default function LocaleHome({ params }: { params: { locale: string } }) {
  const locale = params?.locale || 'vi'
  redirect(`/${locale}/dashboard`)
}
