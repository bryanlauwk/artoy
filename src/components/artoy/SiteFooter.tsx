import { Instagram, Music2, Youtube, Twitter, MessageCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-[min(1200px,94vw)] flex-col items-center justify-between gap-4 py-7 text-xs text-muted-foreground md:flex-row">
        <div className="flex items-baseline gap-2">
          <span className="text-gradient-brand text-lg font-black tracking-[-0.04em]">
            ARTOY
          </span>
        </div>

        <div className="flex gap-5 text-foreground/70">
          <a href="#" aria-label="Discord"><MessageCircle className="size-4" /></a>
          <a href="#" aria-label="Instagram"><Instagram className="size-4" /></a>
          <a href="#" aria-label="TikTok"><Music2 className="size-4" /></a>
          <a href="#" aria-label="YouTube"><Youtube className="size-4" /></a>
          <a href="#" aria-label="X / Twitter"><Twitter className="size-4" /></a>
        </div>
        <div>© 2026 ARTOY. All rights reserved.</div>
      </div>
    </footer>
  );
}
