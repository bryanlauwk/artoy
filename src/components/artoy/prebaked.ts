import type { Creation } from "./useCreatorSession";
import lunarieArt from "@/assets/artoy/lunarie.png";
import booboiArt from "@/assets/artoy/booboi.png";
import jaygyiiArt from "@/assets/artoy/jaygyii.png";
import lunarieCharacter from "@/assets/artoy/case-study/lunarie-character-v1.webp";
import lunarieFigurine from "@/assets/artoy/case-study/lunarie-figurine-v1.webp";
import lunarieConcepts from "@/assets/artoy/case-study/lunarie-concepts-v1.webp";
import booboiConcepts from "@/assets/artoy/case-study/booboi-concepts-v1.webp";
import jaygyiiConcepts from "@/assets/artoy/case-study/jaygyii-concepts-v1.webp";
import lunarieCollectible from "@/assets/artoy/game/lunarie-collectible-v1.webp";
import booboiCollectible from "@/assets/artoy/game/booboi-collectible-v1.webp";
import jaygyiiCollectible from "@/assets/artoy/game/jaygyii-collectible-v1.webp";
import mysteriousIsland from "@/assets/artoy/game/mysterious-island-v1.webp";
import worldRelics from "@/assets/artoy/game/world-relics-v1.webp";

export type SampleCharacter = {
  id: string;
  name: string;
  image: string;
  results: Creation[];
};

const collection = (
  identity: string,
  universe: string,
  figurine: string,
  miniature: string,
  charm: string,
): Creation[] => [
  { label: "Character Identity", kind: "experience", image: identity },
  { label: "Illustrated Universe", kind: "experience", image: universe },
  { label: "Character Figurine", kind: "merch", image: figurine },
  { label: "Miniature World", kind: "merch", image: miniature },
  { label: "Acrylic Charm", kind: "merch", image: charm },
];

export const SAMPLE_CHARACTERS: SampleCharacter[] = [
  {
    id: "lunarie",
    name: "Lunarie",
    image: lunarieArt,
    results: collection(
      lunarieCharacter,
      mysteriousIsland,
      lunarieFigurine,
      lunarieCollectible,
      lunarieConcepts,
    ),
  },
  {
    id: "booboi",
    name: "BooBoi",
    image: booboiArt,
    results: collection(
      booboiArt,
      worldRelics,
      booboiCollectible,
      booboiConcepts,
      booboiConcepts,
    ),
  },
  {
    id: "jaygyii",
    name: "Jaygyii",
    image: jaygyiiArt,
    results: collection(
      jaygyiiArt,
      mysteriousIsland,
      jaygyiiCollectible,
      jaygyiiConcepts,
      jaygyiiConcepts,
    ),
  },
];
