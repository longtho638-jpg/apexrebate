import { redirect } from "next/navigation";

export default function LocaleRedirect({
  params,
}: {
  params: { locale: string };
}) {
  const supportedLocales = ["vi", "en"];
  const { locale } = params;

  // ✅ Nếu locale được hỗ trợ → chuyển hướng tới UI/UX v3
  if (supportedLocales.includes(locale)) {
    redirect(`/${locale}/uiux-v3`);
  }

  // 🚧 Nếu locale khác (chưa có), fallback sang tiếng Việt
  redirect("/vi/uiux-v3");
}