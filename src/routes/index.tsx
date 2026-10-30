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
          <p className="animate-rise mt-6 max-w-2xl text-lg leading-relaxed opacity-80">Every residence is verified in person, priced with total honesty and offered with our full, heartfelt attention — because you deserve nothing less than the best.</p>
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
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="eyebrow text-accent">About us</p>
          <h2 className="mt-3 max-w-4xl text-5xl md:text-6xl">A house is only a building until someone chooses to love it.</h2>
          <div className="mt-12 grid gap-12 md:grid-cols-2">
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>Maison Haven began with a simple, stubborn belief: that finding a place to live should feel as considered and as joyful as the home itself. We are a small, devoted team of advisors, photographers and inspectors who visit every residence in person, in honest daylight, before it is ever permitted to join the collection. Nothing here is listed on trust alone.</p>
              <p>Every corner is photographed, every price is stated plainly, every detail is checked and checked again until it is genuinely worthy of your time, your money and your trust. We turn away far more homes than we accept, because "good enough" has never once felt like enough for the people who live with us.</p>
            </div>
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>We measure our success in quiet, wonderful moments — the exhale at the doorway, the laughter that fills the kitchen, the first peaceful night in a place that finally feels right. That is why we are uncompromising about quality, meticulous about detail, and heartfelt about the people we are privileged to serve.</p>
              <p>When you choose a home with us, you are not scrolling through a catalogue of listings. You are being looked after by people who care deeply about where you will wake up tomorrow, and who remain behind you long after the keys change hands.</p>
            </div>
          </div>

          <div className="mt-20 grid gap-x-10 gap-y-12 border-t pt-16 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Curated by hand", "Every residence is personally viewed, photographed and selected before it appears here. If it does not move us, it is never offered to you."],
              ["Radically transparent", "Complete pricing, honest descriptions and every detail laid out plainly from the very first look. No hidden charges, no surprises at signing, no small print."],
              ["Unwavering standards", "Only the exceptional, the immaculate and the genuinely beautiful earn a place in the collection. We would rather show you less and show you better."],
              ["Attentive to you", "One dedicated advisor walks beside you from the first question to keys in hand, answering everything with patience, clarity and warmth."],
              ["Care that continues", "Our relationship does not end at the doorway. We stay reachable, responsive and grateful long after you have settled in."],
              ["Priced with integrity", "The figure you are shown is the figure you pay. Every price is agreed in advance, in writing, and honoured without exception."],
            ].map(([t, d]) => (
              <div key={t}>
                <h3 className="text-3xl">{t}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="eyebrow text-gold">Why it matters</p>
          <h2 className="mt-3 max-w-4xl text-5xl md:text-6xl">Why choosing your home from us is worth it</h2>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed opacity-70">
            Where you live shapes your mornings, your peace of mind, your commute, your savings and your sense of belonging. A decision that consequential should never be left to chance, to a photograph that flatters, or to a stranger who disappears the day you sign. Choosing from a collection we have already vetted, priced honestly and stand behind is not a formality — it is the difference between signing a lease and coming home.
          </p>
          <div className="mt-16 grid gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["You are protected from the first look", "Every home is verified in person before it appears, so the residence you fall in love with is exactly the one you are handed the keys to."],
              ["You are given the best, not the easiest", "We accept only a small fraction of the homes offered to us, so what is in front of you is already the finest available."],
              ["You are never guessing about money", "Prices are complete, honest and agreed in advance, so nothing is ever added at signing."],
              ["You are never alone in the process", "One dedicated advisor, reachable and accountable, from your first question to your very first night."],
              ["You are choosing people, not listings", "We answer personally for every home we present, and we remain behind you long after the paperwork is done."],
              ["You move in without a single reservation", "Nothing is rushed, nothing is hidden and nothing is oversold — only a home you can love completely."],
            ].map(([t, d], i) => (
              <div key={t} className="border-t border-gold/30 pt-6">
                <p className="eyebrow text-gold">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-2xl">{t}</h3>
                <p className="mt-3 leading-relaxed opacity-65">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-16 max-w-3xl font-display text-3xl leading-snug md:text-4xl">
            We give the best because you deserve the best — and because a home is never a transaction. It is the beginning of a life.
          </p>
          <a href="/#residences" className="eyebrow mt-10 inline-block w-fit border-b border-gold pb-1 text-gold">Browse the collection</a>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
