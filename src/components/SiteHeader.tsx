import { Link } from "@tanstack/react-router";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={overlay ? "absolute inset-x-0 top-0 z-20 text-ink-foreground" : "border-b bg-background"}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl tracking-wide">Maison Haven</Link>
        <nav className="flex items-center gap-8 text-sm">
          <a href="/#residences" className="opacity-80 hover:opacity-100">Residences</a>
          <a href="/#about" className="opacity-80 hover:opacity-100">About</a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-3xl">Maison Haven</p>
          <p className="mt-2 text-sm opacity-60">Considered residences, carefully curated.</p>
        </div>
        <p className="text-xs opacity-50">© {new Date().getFullYear()} Maison Haven. All rights reserved.</p>
      </div>
    </footer>
  );
}
