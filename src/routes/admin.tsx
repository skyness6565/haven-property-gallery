import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Trash2, Pencil, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BUCKET, listingsQuery, formatPrice, type Listing } from "@/lib/listings";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Maison Haven" },
      { name: "description", content: "Manage Maison Haven residences." },
      { property: "og:title", content: "Admin — Maison Haven" },
      { property: "og:description", content: "Manage residences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return setIsAdmin(null);
    supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        {session === undefined ? null : !session ? (
          <AuthForm />
        ) : isAdmin === false ? (
          <div className="max-w-md">
            <h1 className="text-4xl">No admin access</h1>
            <p className="mt-3 text-muted-foreground">This account ({session.user.email}) isn't an admin.</p>
            <Button className="mt-6" variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
          </div>
        ) : isAdmin ? (
          <Dashboard email={session.user.email ?? ""} />
        ) : null}
      </main>
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (res.error) { toast.error(res.error.message); return; }
    if (mode === "up" && !res.data.session) toast.success("Check your email to confirm your account.");
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-5 py-10">
      <p className="eyebrow text-accent">Admin</p>
      <h1 className="text-5xl">{mode === "in" ? "Sign in" : "Create account"}</h1>
      <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="space-y-2"><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <Button type="submit" className="w-full" disabled={busy}>{mode === "in" ? "Sign in" : "Sign up"}</Button>
      <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="text-sm text-muted-foreground underline">
        {mode === "in" ? "First time? Create the admin account" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}

const empty = { title: "", description: "", price: "", price_period: "month", location: "", bedrooms: "1", bathrooms: "1", area_sqm: "", property_type: "Apartment", amenities: "", featured: false };

function Dashboard({ email }: { email: string }) {
  const qc = useQueryClient();
  const { data = [] } = useQuery(listingsQuery());
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof empty, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  function startEdit(l: Listing) {
    setEditing(l);
    setKeptImages(l.images);
    setFiles([]);
    setForm({
      title: l.title, description: l.description, price: String(l.price), price_period: l.price_period, location: l.location,
      bedrooms: String(l.bedrooms), bathrooms: String(l.bathrooms), area_sqm: String(l.area_sqm || ""), property_type: l.property_type,
      amenities: l.amenities.join(", "), featured: l.featured,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() { setEditing(null); setForm(empty); setFiles([]); setKeptImages([]); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const f of files) {
        const path = `${crypto.randomUUID()}.${f.name.split(".").pop() || "jpg"}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type });
        if (error) throw error;
        uploaded.push(path);
      }
      const row = {
        title: form.title, description: form.description, price: Number(form.price) || 0, price_period: form.price_period,
        location: form.location, bedrooms: Number(form.bedrooms) || 0, bathrooms: Number(form.bathrooms) || 0,
        area_sqm: Number(form.area_sqm) || 0, property_type: form.property_type, featured: form.featured,
        amenities: form.amenities.split(",").map((s) => s.trim()).filter(Boolean),
        images: [...keptImages, ...uploaded],
      };
      const { error } = editing
        ? await supabase.from("listings").update(row).eq("id", editing.id)
        : await supabase.from("listings").insert(row);
      if (error) throw error;
      if (editing) {
        const removed = editing.images.filter((p) => !keptImages.includes(p));
        if (removed.length) await supabase.storage.from(BUCKET).remove(removed);
      }
      toast.success(editing ? "Listing updated" : "Listing published");
      reset();
      qc.invalidateQueries();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(l: Listing) {
    if (!confirm(`Delete "${l.title}"?`)) return;
    const { error } = await supabase.from("listings").delete().eq("id", l.id);
    if (error) { toast.error(error.message); return; }
    if (l.images.length) await supabase.storage.from(BUCKET).remove(l.images);
    toast.success("Deleted");
    qc.invalidateQueries();
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow text-accent">Dashboard</p>
          <h1 className="mt-2 text-5xl">Manage residences</h1>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          {email} · <button className="underline" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>

      <form onSubmit={save} className="mt-10 grid gap-5 border bg-card p-8 md:grid-cols-2">
        <h2 className="text-3xl md:col-span-2">{editing ? "Edit listing" : "Add a new house"}</h2>
        <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Sunlit 2-bed loft" /></div>
        <div className="space-y-2"><Label>Location</Label><Input required value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Lekki Phase 1, Lagos" /></div>
        <div className="space-y-2"><Label>Property type</Label>
          <select value={form.property_type} onChange={(e) => set("property_type", e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            {["Apartment", "Penthouse", "Duplex", "Studio", "Townhouse", "Villa", "Bungalow"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-2"><Label>Price (USD)</Label><Input required type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} /></div>
        <div className="space-y-2"><Label>Price is</Label>
          <select value={form.price_period} onChange={(e) => set("price_period", e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="month">Per month</option><option value="year">Per year</option><option value="night">Per night</option><option value="once">Sale price</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3 md:col-span-2">
          <div className="space-y-2"><Label>Bedrooms</Label><Input type="number" min={0} value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} /></div>
          <div className="space-y-2"><Label>Bathrooms</Label><Input type="number" min={0} value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} /></div>
          <div className="space-y-2"><Label>Area (m²)</Label><Input type="number" min={0} value={form.area_sqm} onChange={(e) => set("area_sqm", e.target.value)} /></div>
        </div>
        <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        <div className="space-y-2 md:col-span-2"><Label>Amenities (comma separated)</Label><Input value={form.amenities} onChange={(e) => set("amenities", e.target.value)} placeholder="Pool, Gym, 24/7 Security, Parking" /></div>

        <div className="space-y-3 md:col-span-2">
          <Label>Photos</Label>
          <div className="flex flex-wrap gap-3">
            {editing && keptImages.map((p) => {
              const url = editing.imageUrls[editing.images.indexOf(p)];
              return (
                <div key={p} className="relative h-24 w-32 overflow-hidden bg-muted">
                  {url && <img src={url} alt="" className="h-full w-full object-cover" />}
                  <button type="button" onClick={() => setKeptImages((k) => k.filter((x) => x !== p))} className="absolute right-1 top-1 bg-background p-1"><X className="h-3 w-3" /></button>
                </div>
              );
            })}
            {files.map((f, i) => (
              <div key={i} className="relative h-24 w-32 overflow-hidden bg-muted">
                <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))} className="absolute right-1 top-1 bg-background p-1"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed text-xs text-muted-foreground hover:bg-muted">
              <Upload className="h-4 w-4" />Add photos
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles((fs) => [...fs, ...Array.from(e.target.files ?? [])])} />
            </label>
          </div>
        </div>

        <label className="flex items-center gap-3 md:col-span-2"><Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />Feature on homepage</label>

        <div className="flex gap-3 md:col-span-2">
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Publish listing"}</Button>
          {editing && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}
        </div>
      </form>

      <h2 className="mt-16 text-3xl">All listings ({data.length})</h2>
      <div className="mt-6 divide-y border-y">
        {data.map((l) => (
          <div key={l.id} className="flex items-center gap-5 py-4">
            <div className="h-16 w-24 shrink-0 overflow-hidden bg-muted">{l.imageUrls[0] && <img src={l.imageUrls[0]} alt="" className="h-full w-full object-cover" />}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{l.title}</p>
              <p className="text-sm text-muted-foreground">{l.location} · {formatPrice(l.price, l.price_period)} · {l.images.length} photos</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => startEdit(l)}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(l)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {data.length === 0 && <p className="py-6 text-muted-foreground">No listings yet. Add your first house above.</p>}
      </div>
    </div>
  );
}
