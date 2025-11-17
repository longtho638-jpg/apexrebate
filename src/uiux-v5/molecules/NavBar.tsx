// src/uiux-v5/molecules/NavBar.tsx
"use client";

import Link from "next/link";
import Container from "@/uiux-v5/atoms/Container";
import Button from "@/uiux-v5/atoms/Button";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const SUPPORTED_LOCALES = ["en", "vi", "th", "id"];

type NavBarProps = {
  locale?: string;
};

export default function NavBar({ locale }: NavBarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";

  const { localePath, v5BasePath } = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const detectedLocale = SUPPORTED_LOCALES.includes(segments[0])
      ? segments[0]
      : locale || "en";
    const resolvedLocale = locale || detectedLocale;
    const baseLocalePath = `/${resolvedLocale}`;
    const baseV5Path = `${baseLocalePath}/v5`;

    return {
      localePath: baseLocalePath,
      v5BasePath: baseV5Path,
    };
  }, [locale, pathname]);

  const navLinks = [
    { href: `${v5BasePath}/home`, label: "Trang chủ" },
    { href: `${v5BasePath}/calculator`, label: "Máy tính" },
    { href: `${localePath}/wall-of-fame`, label: "Danh vọng" },
    { href: `${localePath}/hang-soi`, label: "Hang Sói" },
    { href: `${localePath}/tools`, label: "Tools Market" },
    { href: `${localePath}/faq`, label: "FAQ" },
    { href: `${localePath}/how-it-works`, label: "How It Works" },
  ];

  const authLinks = {
    signin: `${localePath}/auth/signin`,
    signup: `${localePath}/auth/signup`,
    dashboard: `${localePath}/dashboard`,
  };

  return (
    <nav className="w-full bg-midnight/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <Container className="flex items-center justify-between h-20">
        {/* Logo */}
        <Link href={`${v5BasePath}/home`} className="text-offWhite text-xl font-semibold">
          ApexRebate
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <NavLink key={href} href={href} label={label} />
          ))}

          <div className="flex items-center gap-3">
            <Link href={authLinks.signin}>
              <Button variant="ghost" size="sm" className="text-offWhite">
                Sign In
              </Button>
            </Link>
            <Link href={authLinks.signup}>
              <Button variant="primary" size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-offWhite text-2xl"
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
      </Container>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-midnight px-6 pb-6 space-y-4">
          {navLinks.map(({ href, label }) => (
            <NavLink key={href} href={href} label={label} />
          ))}
          <Link href={authLinks.signin} className="block">
            <Button variant="ghost" className="w-full text-offWhite">
              Sign In
            </Button>
          </Link>
          <Link href={authLinks.signup} className="block">
            <Button variant="primary" className="w-full">
              Sign Up
            </Button>
          </Link>
          <Link href={authLinks.dashboard} className="block">
            <Button variant="outline" className="w-full">
              Dashboard
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-offWhite/80 hover:text-teal transition-colors text-sm font-medium"
    >
      {label}
    </Link>
  );
}
