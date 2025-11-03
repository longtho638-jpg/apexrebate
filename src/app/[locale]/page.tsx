import { redirect } from "next/navigation";

// ✅ Safe multi-locale redirect (always enabled)
export default function LocaleRedirect({
  params,
}: {
  params: { locale: string };
}) {
  const supportedLocales = ["vi", "en"];
  const { locale } = params;

  // Validate locale
  const isValidLocale = supportedLocales.includes(locale);
  
  if (!isValidLocale) {
    redirect("/uiux-v3");
  }

  const target = locale === "vi" ? "/vi/uiux-v3" : "/uiux-v3";
  redirect(target);
}
