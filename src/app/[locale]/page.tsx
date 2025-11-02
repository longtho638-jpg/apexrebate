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
    // Unsupported locale → fallback to Vietnamese
    redirect("/vi/uiux-v3");
  }

  // ✅ Valid locale → redirect to localized UI/UX v3
  redirect(`/${locale}/uiux-v3`);
}