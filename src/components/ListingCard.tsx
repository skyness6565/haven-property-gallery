import { Link } from "@tanstack/react-router";
import { BedDouble, Bath, Maximize, MapPin } from "lucide-react";
import { formatPrice, type Listing } from "@/lib/listings";

export function ListingCard({ l }: { l: Listing }) {
  return (
    <Link to="/listings/$id" params={{ id: l.id }} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {l.imageUrls[0] ? (
          <img src={l.imageUrls[0]} alt={l.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No photo</div>
        )}
        {l.featured && <span className="eyebrow absolute left-4 top-4 bg-background px-3 py-1.5 text-foreground">Featured</span>}
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl leading-tight">{l.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{l.location}</p>
        </div>
        <p className="whitespace-nowrap font-medium">{formatPrice(l.price, l.price_period)}</p>
      </div>
      <div className="mt-3 flex gap-5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4" />{l.bedrooms} bd</span>
        <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" />{l.bathrooms} ba</span>
        {l.area_sqm > 0 && <span className="flex items-center gap-1.5"><Maximize className="h-4 w-4" />{l.area_sqm} m²</span>}
      </div>
    </Link>
  );
}
