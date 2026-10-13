import { lazy, Suspense, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { Transformation } from "@/components/artoy/Transformation";
import { Community } from "@/components/artoy/Community";
import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/artoy/Nav";
import { Hero } from "@/components/artoy/Hero";
import { HowItWorks } from "@/components/artoy/HowItWorks";
const TryItNow = lazy(() =>
  import("@/components/artoy/TryItNow").then((module) => ({ default: module.TryItNow })),
);
import { useCreatorSession } from "@/components/artoy/useCreatorSession";
import { SiteFooter } from "@/components/artoy/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARTOY — Your Character. Its World. Your Collection." },
      {
        name: "description",
        content:
          "Upload your character and create its illustrated world, collectible concepts, product views, packaging and themed editions.",
      },
      { property: "og:title", content: "ARTOY — Your Character. Its World. Your Collection." },
      {
        property: "og:description",
        content:
          "Upload your character, generate AI artwork and merch concepts, and download your favorites.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const creatorTrigger = useRef<HTMLElement | null>(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [initialFile, setInitialFile] = useState<File>();
  const creatorSession = useCreatorSession(initialFile);
  function openCreator(file?: File) {
    creatorTrigger.current = document.activeElement as HTMLElement;
    setInitialFile(file);
    setCreatorOpen(true);
  }
  return (
    <div className="artoy-home">
      <a href="#main" className="artoy-skip">
        Skip to content <ArrowRight size={16} />
      </a>
      <Nav onCreate={() => openCreator()} />
      <main id="main">
        <Hero onCreate={openCreator} hasSession={!!creatorSession.source} />
        <Transformation />
        <Community onCreate={() => openCreator()} />
        <HowItWorks onCreate={() => openCreator()} />
      </main>
      <SiteFooter />
      <Dialog open={creatorOpen} onOpenChange={setCreatorOpen}>
        <DialogContent
          className="artoy-creator-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const trigger = creatorTrigger.current;
            if (trigger?.isConnected) trigger.focus();
            else document.querySelector<HTMLButtonElement>(".artoy-upload .artoy-cta")?.focus();
          }}
        >
          <DialogTitle className="sr-only">Create your ARTOY universe</DialogTitle>
          <DialogDescription className="sr-only">
            Upload character artwork or choose a sample to create and explore your collectible
            collection.
          </DialogDescription>
          <Suspense
            fallback={
              <p className="p-12" role="status">
                Opening your creative studio…
              </p>
            }
          >
            <TryItNow session={creatorSession} />
          </Suspense>
        </DialogContent>
      </Dialog>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
