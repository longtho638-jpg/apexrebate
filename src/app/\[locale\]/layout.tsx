import { LocaleSync } from './locale-sync';

export default async function LocaleLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LocaleSync />
      {children}
    </>
  );
}
