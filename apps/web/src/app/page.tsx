import { Button } from "@/components/ui";

// Placeholder until the public landing page ships (build step 2).
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cobalt-950 px-5 text-center text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.3em]">See you on</p>
      <h1 className="font-display-caps text-[64px] md:text-[128px]">19th – 24th Jan, 2027</h1>
      <Button href="/register" variant="accent" display size="lg">
        Register Now
      </Button>
    </main>
  );
}
