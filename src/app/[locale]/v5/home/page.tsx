import HomepageTemplate from "@/uiux-v5/templates/HomepageTemplate";

export default async function HomeV5({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <HomepageTemplate locale={locale} />;
}
