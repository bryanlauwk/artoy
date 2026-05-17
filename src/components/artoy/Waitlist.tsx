import { useState } from "react";
import { ArrowRight, Sparkles, Gift, Star, Users } from "lucide-react";
import cat from "@/assets/artoy/waitlist-cat.png";
import girl from "@/assets/artoy/waitlist-girl.png";

export function Waitlist() {
  const [done, setDone] = useState(false);

  return (
    <section id="waitlist" className="relative py-20">
      <div className="mx-auto w-[min(1280px,96vw)]">
        <div
          className="relative overflow-hidden rounded-[36px]"
          style={{
            background:
              "radial-gradient(circle at 20% 80%, rgba(38,225,209,.22), transparent 38%), linear-gradient(135deg, rgba(139,92,246,.85), rgba(255,79,189,.7))",
          }}
        >
          {/* Painted edge fades */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(15,15,30,0.45) 100%)",
            }}
          />

          {/* Left mascot — cat */}
          <img
            src={cat}
            alt=""
            aria-hidden
            loading="lazy"
            className="pointer-events-none absolute bottom-0 left-0 hidden h-[88%] w-auto select-none md:block"
            style={{
              WebkitMaskImage:
                "radial-gradient(80% 90% at 35% 60%, #000 60%, transparent 100%)",
              maskImage:
                "radial-gradient(80% 90% at 35% 60%, #000 60%, transparent 100%)",
            }}
          />

          {/* Right mascot — Nova with cat */}
          <img
            src={girl}
            alt=""
            aria-hidden
            loading="lazy"
            className="pointer-events-none absolute bottom-0 right-0 hidden h-[92%] w-auto select-none md:block"
            style={{
              WebkitMaskImage:
                "radial-gradient(80% 90% at 65% 60%, #000 60%, transparent 100%)",
              maskImage:
                "radial-gradient(80% 90% at 65% 60%, #000 60%, transparent 100%)",
            }}
          />

          {/* Handwritten accent */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-[14%] top-[18%] hidden -rotate-6 text-sm font-bold italic text-white/85 md:block"
            style={{ fontFamily: "'Caveat', 'Brush Script MT', cursive" }}
          >
            Let's build your universe together ✦
          </span>

          {/* Content */}
          <div className="relative z-10 px-6 py-14 md:px-[18%] md:py-20">
            <div className="text-center">
              <h2 className="text-3xl font-black uppercase leading-[0.95] tracking-[-0.025em] text-white md:text-5xl">
                Be part of the first<br />
                <span className="text-gradient-brand">creator universes</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-white/90 md:text-base">
                Join the waitlist and get early access, exclusive rewards and creator benefits.
              </p>

              <form
                className="mx-auto mt-7 grid w-full max-w-xl grid-cols-1 gap-2.5 md:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setDone(true);
                  (e.target as HTMLFormElement).reset();
                }}
              >
                <input
                  required
                  placeholder="Your name"
                  className="w-full rounded-2xl border-0 bg-white/95 px-4 py-3.5 text-sm font-semibold text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <input
                  required
                  type="email"
                  placeholder="Email address"
                  className="w-full rounded-2xl border-0 bg-white/95 px-4 py-3.5 text-sm font-semibold text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <input
                  placeholder="Your creator name (IG / TikTok)"
                  className="w-full rounded-2xl border-0 bg-white/95 px-4 py-3.5 text-sm font-semibold text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white md:col-span-2"
                />
                <select
                  required
                  defaultValue=""
                  className="w-full rounded-2xl border-0 bg-white/95 px-4 py-3.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-white md:col-span-2"
                >
                  <option value="" disabled>
                    What type of creator are you?
                  </option>
                  <option>Illustrator</option>
                  <option>Comic / Manga Artist</option>
                  <option>Concept Artist</option>
                  <option>Content Creator</option>
                  <option>Brand / Studio</option>
                </select>
                <button
                  type="submit"
                  className="bg-gradient-brand shadow-glow inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-extrabold uppercase tracking-[0.14em] text-white transition-transform hover:scale-[1.02] md:col-span-2"
                >
                  Join the Waitlist <ArrowRight className="size-4" />
                </button>
              </form>

              {done && (
                <p className="mt-4 text-sm font-extrabold text-white">
                  You're on the list. Your universe is waiting ✨
                </p>
              )}

              <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-white/90">
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
          </div>
        </div>
      </div>
    </section>
  );
}
