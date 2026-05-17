import { useState } from "react";
import { ArrowRight, Sparkles, Gift, Star, Users } from "lucide-react";
import cat from "@/assets/artoy/waitlist-cat.png";
import girl from "@/assets/artoy/waitlist-girl.png";

export function Waitlist() {
  const [done, setDone] = useState(false);

  return (
    <section id="waitlist" className="py-12">
      <div
        className="relative mx-auto w-[min(1200px,94vw)] overflow-hidden rounded-[28px] border border-border p-6 md:p-10"
        style={{
          background:
            "linear-gradient(135deg, rgba(139,92,246,.78), rgba(255,79,189,.62)), radial-gradient(circle at 15% 80%, rgba(38,225,209,.25), transparent 32%)",
        }}
      >
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[200px_1fr_200px]">
          <img
            src={cat}
            alt="ARTOY companion cat"
            loading="lazy"
            className="hidden h-auto w-full md:block"
          />
          <div className="text-center">
            <h2 className="text-3xl font-black uppercase tracking-[-0.02em] md:text-4xl">
              Be part of the first<br />creator universes
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/90">
              Join the waitlist and get early access, exclusive rewards and creator benefits.
            </p>
            <form
              className="mx-auto mt-6 grid w-full max-w-xl grid-cols-1 gap-2.5 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
                (e.target as HTMLFormElement).reset();
              }}
            >
              <input
                required
                placeholder="Your name"
                className="w-full rounded-xl border-0 bg-white/90 px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-500"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                className="w-full rounded-xl border-0 bg-white/90 px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-500"
              />
              <input
                placeholder="Your creator name (IG / TikTok)"
                className="w-full rounded-xl border-0 bg-white/90 px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-500 md:col-span-2"
              />
              <select
                required
                defaultValue=""
                className="w-full rounded-xl border-0 bg-white/90 px-4 py-3 text-sm font-semibold text-gray-900 md:col-span-2"
              >
                <option value="" disabled>What type of creator are you?</option>
                <option>Illustrator</option>
                <option>Comic / Manga Artist</option>
                <option>Concept Artist</option>
                <option>Content Creator</option>
                <option>Brand / Studio</option>
              </select>
              <button
                type="submit"
                className="bg-gradient-brand shadow-glow inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-extrabold uppercase tracking-[0.14em] text-white md:col-span-2"
              >
                Join the Waitlist <ArrowRight className="size-4" />
              </button>
            </form>
            {done && (
              <p className="mt-4 text-sm font-extrabold">
                You're on the list. Your universe is waiting ✨
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Early Access
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Gift className="size-3.5" /> Exclusive Rewards
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-3.5" /> Priority Support
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" /> Creator Community
              </span>
            </div>
          </div>
          <img
            src={girl}
            alt="Pink-haired creator with companion"
            loading="lazy"
            className="hidden h-auto w-full md:block"
          />
        </div>
      </div>
    </section>
  );
}
