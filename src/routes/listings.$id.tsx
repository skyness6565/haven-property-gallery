import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BedDouble, Bath, Maximize, MapPin, Check, ArrowLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { listingQuery, formatPrice } from "@/lib/listings";

export const Route = createFileRoute("/listings/$id")({
  head: () => ({
    meta: [
      { title: "Residence details — Maison Haven" },
      { name: "description", content: "Photos, price and full details for this Maison Haven residence." },
      { property: "og:title", content: "Residence details — Maison Haven" },
      { property: "og:description", content: "Photos, price and full details for this residence." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ListingPage,
});

function ListingPage() {
  const { id } = Route.useParams();
  const { data: l, isLoading } = useQuery(listingQuery(id));
  const [active, setActive] = useState(0);

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />All residences</Link>
        {isLoading && <div className="mt-8 aspect-[16/9] animate-pulse bg-muted" />}
        {!isLoading && !l && <p className="mt-10">This residence is no longer available.</p>}
        {l && (
          <>
            <div className="mt-8 aspect-[16/9] overflow-hidden bg-muted">
              {l.imageUrls[active] && <img src={l.imageUrls[active]} alt={l.title} className="h-full w-full object-cover" />}
            </div>
            {l.imageUrls.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {l.imageUrls.map((u, i) => (
                  <button key={u} onClick={() => setActive(i)} className={`h-20 w-28 shrink-0 overflow-hidden ${i === active ? "ring-2 ring-accent" : "opacity-60 hover:opacity-100"}`}>
                    <img src={u} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-14 grid gap-14 md:grid-cols-[1fr_340px]">
              <div>
                <p className="eyebrow text-accent">{l.property_type}</p>
                <h1 className="mt-3 text-5xl md:text-6xl">{l.title}</h1>
                <p className="mt-3 flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-4 w-4" />{l.location}</p>
                <p className="mt-10 whitespace-pre-line text-lg leading-relaxed">{l.description}</p>
                {l.amenities.length > 0 && (
                  <>
                    <h2 className="mt-14 text-3xl">Amenities</h2>
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {l.amenities.map((a) => <li key={a} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" />{a}</li>)}
                    </ul>
                  </>
                )}
              </div>
              <aside className="h-fit border bg-card p-8">
                <p className="eyebrow text-muted-foreground">Price</p>
                <p className="mt-2 font-display text-4xl">{formatPrice(l.price, l.price_period)}</p>
                <div className="mt-8 space-y-3 border-t pt-6 text-sm">
                  <p className="flex justify-between"><span className="flex items-center gap-2"><BedDouble className="h-4 w-4" />Bedrooms</span>{l.bedrooms}</p>
                  <p className="flex justify-between"><span className="flex items-center gap-2"><Bath className="h-4 w-4" />Bathrooms</span>{l.bathrooms}</p>
                  {l.area_sqm > 0 && <p className="flex justify-between"><span className="flex items-center gap-2"><Maximize className="h-4 w-4" />Area</span>{l.area_sqm} m²</p>}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const w = window as unknown as { smartsupp?: (...args: unknown[]) => void };
                    w.smartsupp?.("chat:open");
                  }}
                  className="mt-8 block w-full cursor-pointer bg-primary py-3 text-center text-sm text-primary-foreground hover:opacity-90"
                >
                  Enquire about this home
                </button>
              </aside>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
