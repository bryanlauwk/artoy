import { useState } from "react";

export function Waitlist() {
  const [done, setDone] = useState(false);

  return (
    <section id="waitlist" className="py-11">
      <div
        className="panel-surface mx-auto w-[min(1180px,92vw)] p-7 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(139,92,246,.75), rgba(255,79,189,.62)), radial-gradient(circle at 15% 70%, rgba(38,225,209,.28), transparent 28%)",
        }}
      >
        <h2 className="mb-2.5 text-4xl font-bold tracking-[-0.03em]">
          Be part of the first creator universes
        </h2>
        <p className="mx-auto max-w-xl text-lg leading-[1.7] text-white/90">
          Join the waitlist and get early access when ARTOY opens for selected artists and
          creators.
        </p>
        <form
          className="mt-6 grid grid-cols-1 gap-2.5 md:grid-cols-[1fr_1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
            (e.target as HTMLFormElement).reset();
          }}
        >
          <input
            required
            placeholder="Your name"
            className="w-full rounded-xl border border-border bg-white/95 px-3.5 py-3.5 font-semibold text-gray-900"
          />
          <input
            required
            type="email"
            placeholder="Email address"
            className="w-full rounded-xl border border-border bg-white/95 px-3.5 py-3.5 font-semibold text-gray-900"
          />
          <input
            placeholder="IG / TikTok handle"
            className="w-full rounded-xl border border-border bg-white/95 px-3.5 py-3.5 font-semibold text-gray-900"
          />
          <button
            type="submit"
            className="bg-gradient-brand shadow-glow rounded-xl px-5 py-3.5 font-extrabold text-white"
          >
            Join Waitlist →
          </button>
        </form>
        {done && (
          <p className="mt-5 font-extrabold">
            You're on the list. Your art universe is waiting ✨
          </p>
        )}
      </div>
    </section>
  );
}
