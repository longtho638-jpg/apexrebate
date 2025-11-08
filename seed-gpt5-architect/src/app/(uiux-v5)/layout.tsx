import React from "react";
import Link from "next/link";
import "@/src/theme/tokens.css";

export default function Layout({ children }: { children: React.ReactNode }) {
return (
<div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
<header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/75 backdrop-blur-sm">
<nav className="max-w-7xl mx-auto flex items-center justify-between p-4">
<div className="flex items-center gap-2">
  <span className="w-8 h-8 bg-wolf-600 rounded-lg"></span>
<h1 className="text-xl font-semibold text-zinc-100">ApexRebate 2025</h1>
</div>
<div className="flex gap-6 text-sm text-zinc-400">
<Link href="/vi/dashboard" className="hover:text-wolf-400 transition">Dashboard</Link>
  <Link href="/vi/tools" className="hover:text-amber-400 transition">Tools</Link>
    <Link href="/vi/hang-soi" className="hover:text-zinc-200 transition">Hang Sói</Link>
      <Link href="/vi/wall-of-fame" className="hover:text-zinc-200 transition">WOF</Link>
    </div>
    </nav>
    </header>
      <main className="max-w-7xl mx-auto p-6">{children}</main>
      <footer className="border-t border-zinc-800/60 py-10 text-sm text-zinc-400 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col justify-between gap-6 sm:flex-row">
            <p>© 2025 ApexRebate. Evidence‑First Cashback.</p>
            <nav className="flex gap-6">
              <a className="hover:text-white" href="/privacy">Privacy</a>
              <a className="hover:text-white" href="/tos">Terms</a>
              <a className="hover:text-white" href="/status">Status</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
