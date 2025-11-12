import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });
const geist_mono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "{{PROJECT_NAME}}",
  description: "Next.js Agentic project from Relay Factory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geist_mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
