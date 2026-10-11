import bunnyAtlas from "@/assets/artoy/bunny-universe.png";

// One shared illustration atlas keeps the character consistent across all four outputs.
const positions = {
  character: "translate(0, 0)",
  game: "translate(-50%, 0)",
  collectible: "translate(0, -50%)",
  pet: "translate(-50%, -50%)",
};
export function BunnyArtwork({ variant, alt }: { variant: keyof typeof positions; alt: string }) {
  return (
    <span className="bunny-artwork">
      <img
        src={bunnyAtlas}
        alt={alt}
        loading="lazy"
        width="1254"
        height="1254"
        style={{ transform: positions[variant] }}
      />
    </span>
  );
}
