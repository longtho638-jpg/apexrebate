import React from "react";
import "@/src/theme/tokens.css";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface text-neutral font-sans">
      <header className="sticky top-0 bg-white/70 backdrop-blur-md shadow-sm">
        <nav className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold text-primary">ApexRebate 2025</h1>
          <div className="flex gap-6 text-sm">
            <a href="/vi/dashboard" className="hover:text-accent">
              Dashboard
            </a>
            <a href="/vi/tools" className="hover:text-accent">
              Tools
            </a>
            <a href="/vi/hang-soi" className="hover:text-accent">
              Hang Sói
            </a>
            <a href="/vi/wall-of-fame" className="hover:text-accent">
              WOF
            </a>
          </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}
