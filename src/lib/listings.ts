import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Listing = Tables<"listings"> & { imageUrls: string[] };
export const BUCKET = "listing-images";

async function withUrls(rows: Tables<"listings">[]): Promise<Listing[]> {
  const paths = Array.from(new Set(rows.flatMap((r) => r.images)));
  const map = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60 * 6);
    data?.forEach((d) => d.path && d.signedUrl && map.set(d.path, d.signedUrl));
  }
  return rows.map((r) => ({ ...r, imageUrls: r.images.map((p) => map.get(p)).filter(Boolean) as string[] }));
}

export const listingsQuery = () =>
  queryOptions({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return withUrls(data);
    },
  });

export const listingQuery = (id: string) =>
  queryOptions({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return (await withUrls([data]))[0];
    },
  });

export function formatPrice(n: number | string, period: string) {
  const v = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n));
  return period === "once" ? v : `${v} / ${period}`;
}
