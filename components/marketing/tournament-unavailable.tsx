import { SiteHeader } from "@/components/marketing/site-header";

export function TournamentUnavailable() {
  return (
    <main className="relative min-h-[50vh] bg-rw-navy pb-20 pt-28 text-white">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="font-display text-2xl">The Rusty Wedge Golf Scramble</p>
        <p className="mt-4 text-white/80">
          Tournament details are not available yet. Check back soon.
        </p>
      </div>
    </main>
  );
}
