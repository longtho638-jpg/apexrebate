import SettingsTemplate from "@/uiux-v5/templates/SettingsTemplate";

export default async function SettingsV5({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = {
    name: "Admin User",
    email: "admin@apexrebate.com"
  };

  return <SettingsTemplate locale={locale} user={user} />;
}
