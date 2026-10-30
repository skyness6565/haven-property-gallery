import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import hero from "@/assets/hero.jpg";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { ListingCard } from "@/components/ListingCard";
import { listingsQuery } from "@/lib/listings";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Haven — Curated Apartments & Residences" },
      { name: "description", content: "Discover refined apartments and homes for rent and sale, each hand-selected for light, craft and location." },
      { property: "og:title", content: "Maison Haven — Curated Apartments & Residences" },
      { property: "og:description", content: "Refined apartments and homes, hand-selected for light, craft and location." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data = [], isLoading } = useQuery(listingsQuery());
  const [q, setQ] = useState("");
  const [beds, setBeds] = useState(0);
  const filtered = useMemo(
    () => data.filter((l) => (l.title + l.location).toLowerCase().includes(q.toLowerCase()) && l.bedrooms >= beds),
    [data, q, beds],
  );

  return (
    <div>
      <section className="relative h-[92vh] min-h-[600px] overflow-hidden">
        <img src={hero} alt="Sunlit apartment overlooking the city" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
        <div className="bg-veil absolute inset-0" />
        <SiteHeader overlay />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-20 text-ink-foreground">
          <p className="eyebrow animate-rise opacity-80">Residences · Rentals · Sales</p>
          <h1 className="animate-rise mt-5 max-w-4xl text-6xl leading-[0.95] md:text-8xl">Homes with a sense of quiet.</h1>
          <a href="#residences" className="eyebrow animate-rise mt-10 w-fit border-b border-gold pb-1 text-gold">View residences</a>
        </div>
      </section>

      <section id="residences" className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-accent">The collection</p>
            <h2 className="mt-3 text-5xl">Available residences</h2>
          </div>
          <div className="flex gap-3">
            <Input placeholder="Search city or name" value={q} onChange={(e) => setQ(e.target.value)} className="w-56" />
            <select value={beds} onChange={(e) => setBeds(Number(e.target.value))} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value={0}>Any beds</option>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+ beds</option>)}
            </select>
          </div>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse bg-muted" />)}
          {filtered.map((l) => <ListingCard key={l.id} l={l} />)}
        </div>
        {!isLoading && filtered.length === 0 && (
          <p className="mt-10 text-muted-foreground">No residences listed yet — check back soon.</p>
        )}
      </section>

      <section id="about" className="border-t bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-3">
          {[
            ["Curated", "Every home is personally viewed and selected before it joins the collection."],
            ["Transparent", "Clear pricing and honest details — no surprises at signing."],
            ["Attentive", "A dedicated advisor guides you from first viewing to keys in hand."],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="text-3xl">{t}</h3>
              <p className="mt-3 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
