// src/uiux-v5/molecules/NavBar.tsx
"use client";

import Link from "next/link";
import Container from "@/uiux-v5/atoms/Container";
import Button from "@/uiux-v5/atoms/Button";
import { useState } from "react";
import clsx from "clsx";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-midnight/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <Container className="flex items-center justify-between h-20">
        
        {/* Logo */}
        <Link href="/" className="text-offWhite text-xl font-semibold">
          ApexRebate
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/calculator" label="Máy tính" />
          <NavLink href="/wall-of-fame" label="Danh vọng" />
          <NavLink href="/hang-soi" label="Hang Sói" />
          <NavLink href="/tools" label="Tools Market" />

          <Button variant="primary" size="sm">
            Dashboard
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-offWhite"
        >
          ☰
        </button>

      </Container>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-midnight px-6 pb-6 space-y-4">
          <NavLink href="/calculator" label="Máy tính" />
          <NavLink href="/wall-of-fame" label="Danh vọng" />
          <NavLink href="/hang-soi" label="Hang Sói" />
          <NavLink href="/tools" label="Tools Market" />
          <Button variant="primary" className="w-full">
            Dashboard
          </Button>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-offWhite/70 hover:text-teal transition-colors text-sm font-medium"
    >
      {label}
    </Link>
  );
}