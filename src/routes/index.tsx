import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/artoy/Nav";
import { Hero } from "@/components/artoy/Hero";
import { HowItWorks } from "@/components/artoy/HowItWorks";
import { CreatorUniverses } from "@/components/artoy/CreatorUniverses";
import { TryItNow } from "@/components/artoy/TryItNow";
import { SiteFooter } from "@/components/artoy/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARTOY — Turn Your Art Into A Playable Universe" },
      {
        name: "description",
        content:
          "ARTOY helps artists and creators turn their characters into mini games, collectible toys, virtual pets, trading cards and merch experiences.",
      },
      { property: "og:title", content: "ARTOY — Turn Your Art Into A Playable Universe" },
      {
        property: "og:description",
        content:
          "Upload your character. ARTOY transforms it into mini games, collectible toys, virtual pets, trading cards and merch experiences.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <CreatorUniverses />
        <TryItNow />
      </main>
      <SiteFooter />
    </>
  );
}
