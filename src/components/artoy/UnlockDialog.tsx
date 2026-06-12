import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Copy, CreditCard, Check, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUnlock?: () => void | Promise<void>;
  isGenerating?: boolean;
}

const REF_LINK = "artoy.app/r/nova-7421";

export function UnlockDialog({ open, onOpenChange, onUnlock, isGenerating = false }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${REF_LINK}`);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — try manually");
    }
  };

  const shareText = encodeURIComponent(
    "I'm turning my art into a playable universe with @artoy. Join with my link and we both unlock early access ✨",
  );
  const shareUrl = encodeURIComponent(`https://${REF_LINK}`);

  const shareTargets = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${shareText}%20${shareUrl}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${shareUrl}&text=${shareText}` },
    { label: "IG", copy: true },
    { label: "TikTok", copy: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-background/95 p-0 backdrop-blur-xl">
        <div
          className="rounded-lg p-6 md:p-8"
          style={{
            background:
              "radial-gradient(60% 60% at 80% 0%, color-mix(in oklab, var(--pink) 18%, transparent), transparent 70%), radial-gradient(50% 50% at 0% 100%, color-mix(in oklab, var(--purple) 22%, transparent), transparent 70%)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight md:text-3xl">
              Your universe is <span className="text-gradient-brand">ready</span> ✨
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground/70">
              Unlock all 5 experiences + HD downloads. Pick your path.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Pay */}
            <div className="flex flex-col rounded-2xl border border-border bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-foreground/70">
                <CreditCard className="size-3.5" /> Pay to unlock
              </div>
              <div className="mt-2 text-4xl font-black tracking-tight">
                $9<span className="ml-1 text-xs font-bold text-muted-foreground">one-time</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Instant access. No referrals needed.
              </p>
              <button
                onClick={() => toast.success("Payments coming soon — you're on the list")}
                className="bg-gradient-brand shadow-glow mt-auto pt-0 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-white"
              >
                Unlock with payment
              </button>
            </div>

            {/* Refer */}
            <div
              className="flex flex-col rounded-2xl p-5"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--pink) 16%, transparent), color-mix(in oklab, var(--cyan) 14%, transparent))",
                border: "1px solid color-mix(in oklab, var(--pink) 40%, transparent)",
              }}
            >
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-pink">
                <Share2 className="size-3.5" /> Refer 3 friends · free
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background/50 p-1.5">
                <span className="flex-1 truncate px-2 text-xs font-semibold text-foreground/90">
                  {REF_LINK}
                </span>
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-foreground/90 px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-background hover:bg-foreground"
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {shareTargets.map((t) =>
                  t.copy ? (
                    <button
                      key={t.label}
                      onClick={copy}
                      className="rounded-full border border-border bg-white/[0.04] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground/80 hover:bg-white/[0.08]"
                    >
                      {t.label}
                    </button>
                  ) : (
                    <a
                      key={t.label}
                      href={t.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-border bg-white/[0.04] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-foreground/80 hover:bg-white/[0.08]"
                    >
                      {t.label}
                    </a>
                  ),
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/70">
                  <span>0 / 3 friends joined</span>
                  <span>Founders' wall</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-0 bg-gradient-to-r from-pink to-cyan" />
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-foreground/70">
                When 3 friends join with your link, your universe unlocks free — and you get added
                to the Founders' wall.
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Either way, you keep 100% of your IP
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
