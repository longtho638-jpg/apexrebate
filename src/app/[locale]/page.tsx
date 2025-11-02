import { redirect } from "next/navigation";

// ✅ Safe multi-locale redirect with feature flag
export default function LocaleRedirect({
  params,
}: {
  params: { locale: string };
}) {
  const supportedLocales = ["vi", "en"];
  const { locale } = params;

  // Feature flag: disable redirect for testing/debugging
  const ENABLE_UIUX_REDIRECT = process.env.NEXT_PUBLIC_ENABLE_UIUX_REDIRECT !== 'false';
  
  if (!ENABLE_UIUX_REDIRECT) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Home OK</h1>
          <p className="text-gray-600">UI/UX v3 redirect disabled</p>
          <a href={`/${locale}/uiux-v3`} className="text-blue-600 underline mt-4 block">
            Visit UI/UX v3 manually
          </a>
        </div>
      </div>
    );
  }

  // Validate locale
  const isValidLocale = supportedLocales.includes(locale);
  
  if (!isValidLocale) {
    // Unsupported locale → fallback to Vietnamese
    redirect("/vi/uiux-v3");
  }

  // ✅ Valid locale → redirect to localized UI/UX v3
  redirect(`/${locale}/uiux-v3`);
}