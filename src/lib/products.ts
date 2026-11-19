import iphoneNatural from "@/assets/iphone-natural.jpg";
import iphoneBlue from "@/assets/iphone-blue.jpg";

import s24Black from "@/assets/s24-black.jpg";
import s24Gray from "@/assets/s24-gray.jpg";
import macBlack from "@/assets/macbook-black.jpg";
import macSilver from "@/assets/macbook-silver.jpg";
import ps5Console from "@/assets/ps5-console.jpg";
import ps5Controller from "@/assets/ps5-controller.jpg";
import sonyBlack from "@/assets/sony-black.jpg";
import sonySilver from "@/assets/sony-silver.jpg";

export type Slide = { image: string; label: string; swatch: string };
export type Bid = { id: string; user: string; amountEtb: number; at: number; mine?: boolean };
export type Comment = { id: string; user: string; text: string; at: number; mine?: boolean };
export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  specs: string[];
  slides: Slide[];
  postedAt: number;
  views: number;
  likes: number;
  liked: boolean;
  bids: Bid[];
  comments: Comment[];
};

// Swatch values are display-only product colors shown as small dots under the slider.
type SeedItem = Omit<Product, "postedAt" | "bids" | "comments" | "liked"> & {
  seedBids: [string, number][];
  seedComments: [string, string][];
};
const SEED: SeedItem[] = [
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    tagline: "256GB · ታይታኒየም",
    description:
      "አዲስ፣ ያልተከፈተ iPhone 15 Pro Max። A17 Pro ቺፕ፣ 48MP ካሜራ በ5x ቴሌፎቶ ዙም እና ቀላል የታይታኒየም አካል።",
    specs: ["6.7\" Super Retina XDR", "A17 Pro ቺፕ", "256GB ማከማቻ", "48MP + 5x ቴሌፎቶ", "USB‑C"],
    slides: [
      { image: iphoneNatural, label: "Natural Titanium", swatch: "oklch(0.78 0.02 75)" },
      { image: iphoneBlue, label: "Blue Titanium", swatch: "oklch(0.45 0.06 250)" },
      
    ],{ image: iphoneGold, label: "Gold Titanium" },
    views: 2840,
    likes: 312,
    seedBids: [["አበበ ተ.", 50], ["ሰላም ገ.", 58], ["ዮናስ ም.", 66]],
    seedComments: [["ሔለን ደ.", "ዋው! በ50 ብር መጀመሩ ድንቅ ነው 🔥"], ["ቢኒያም ከ.", "Blue Titanium ነው የምፈልገው"]],
  },
  {
    id: "galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    tagline: "512GB · S Pen",
    description:
      "Galaxy S24 Ultra ከ Galaxy AI ጋር። 200MP ካሜራ፣ የተካተተ S Pen እና ጠንካራ የታይታኒየም ፍሬም።",
    specs: ["6.8\" QHD+ AMOLED", "Snapdragon 8 Gen 3", "512GB ማከማቻ", "200MP ካሜራ", "S Pen ተካቷል"],
    slides: [
      { image: s24Black, label: "Titanium Black", swatch: "oklch(0.22 0.01 260)" },
      { image: s24Gray, label: "Titanium Gray", swatch: "oklch(0.55 0.01 250)" },
    ],
    views: 1960,
    likes: 204,
    seedBids: [["ማርታ ሀ.", 50], ["ዳዊት ሰ.", 55]],
    seedComments: [["ሳሙኤል በ.", "S Pen አብሮ ይመጣል?"]],
  },
  {
    id: "macbook-pro-m3",
    name: "MacBook Pro M3",
    tagline: "14\" · 16GB · 512GB",
    description:
      "MacBook Pro 14 ኢንች በ M3 ቺፕ። እስከ 22 ሰዓት የሚቆይ ባትሪ እና Liquid Retina XDR ስክሪን።",
    specs: ["14.2\" Liquid Retina XDR", "Apple M3 ቺፕ", "16GB RAM", "512GB SSD", "እስከ 22 ሰዓት ባትሪ"],
    slides: [
      { image: macBlack, label: "Space Black", swatch: "oklch(0.24 0.012 260)" },
      { image: macSilver, label: "Silver", swatch: "oklch(0.88 0.005 250)" },
    ],
    views: 1475,
    likes: 168,
    seedBids: [["ኤፍሬም ጌ.", 50], ["ትዕግስት አ.", 61], ["ናትናኤል ወ.", 70], ["ሩት ተ.", 74]],
    seedComments: [["ኤፍሬም ጌ.", "ለዲዛይን ስራ ፍጹም ነው"]],
  },
  {
    id: "ps5-slim",
    name: "PlayStation 5 Slim",
    tagline: "1TB · Disc Edition",
    description:
      "PS5 Slim ከ DualSense መቆጣጠሪያ ጋር። ፈጣን 1TB SSD፣ 4K ጨዋታ እና ቀጭን አዲስ ዲዛይን።",
    specs: ["1TB SSD", "4K እስከ 120fps", "Disc Drive", "DualSense ተካቷል", "Ray tracing"],
    slides: [
      { image: ps5Console, label: "Console", swatch: "oklch(0.95 0.005 250)" },
      { image: ps5Controller, label: "DualSense Bundle", swatch: "oklch(0.3 0.02 260)" },
    ],
    views: 2210,
    likes: 275,
    seedBids: [["ሚኪያስ ደ.", 50], ["ቤተልሔም ሙ.", 52], ["ካሌብ ዘ.", 57]],
    seedComments: [["ካሌብ ዘ.", "FIFA ለመጫወት እየጠበቅኩ ነው ⚽"], ["ሊዲያ ፍ.", "መቼ ነው የሚደርሰው?"]],
  },
  {
    id: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5",
    tagline: "Noise Cancelling",
    description:
      "በኢንዱስትሪው ቀዳሚ የድምፅ መከላከያ (ANC) ያለው Sony WH-1000XM5። እስከ 30 ሰዓት ባትሪ እና ግልጽ ጥሪዎች።",
    specs: ["Industry-leading ANC", "30 ሰዓት ባትሪ", "ፈጣን ቻርጅ 3 ደቂቃ = 3 ሰዓት", "Multipoint Bluetooth", "LDAC Hi‑Res"],
    slides: [
      { image: sonyBlack, label: "Black", swatch: "oklch(0.22 0.01 260)" },
      { image: sonySilver, label: "Platinum Silver", swatch: "oklch(0.86 0.006 250)" },
    ],
    views: 980,
    likes: 121,
    seedBids: [["ፍቅሩ ለ.", 50]],
    seedComments: [],
  },
];

export function seedProducts(postedAt: number): Product[] {
  return SEED.map(({ seedBids, seedComments, ...p }) => ({
    ...p,
    postedAt,
    liked: false,
    bids: seedBids.map(([user, amountEtb], i) => ({
      id: `${p.id}-b${i}`,
      user,
      amountEtb,
      at: postedAt + (i + 1) * 47 * 60 * 1000,
    })),
    comments: seedComments.map(([user, text], i) => ({
      id: `${p.id}-c${i}`,
      user,
      text,
      at: postedAt + (i + 1) * 90 * 60 * 1000,
    })),
  }));
}

/** Ids of the auction items, used by the server to reject bids on unknown products. */

// ሁሉም ምርቶች 3 ቀለማት (ነጭ፣ ናይት ብላክ፣ ወርቃማ) እንዲኖራቸው የሚያደርግ
SEED.forEach((item) => {
  if (item.slides.length >= 2) {
    item.slides[0] = { ...item.slides[0]!, label: "White", swatch: "#F8FAFC" };
    item.slides[1] = { ...item.slides[1]!, label: "Night Black", swatch: "#0F172A" };
    if (item.slides.length === 2) {
      item.slides.push({
        image: item.slides[0]!.image,
        label: "Gold",
        swatch: "#D4AF37",
      });
    }
  }
});
SEED.push(
  {
    id: "luxury-3d-villa",
    name: "የቅንጦት 3D ዘመናዊ ቪላ ቤት (Luxury Villa)",
    tagline: "500 ካሬ · ባለ 2 ፎቅ ዘመናዊ 3D ዲዛይን",
    description:
      "በአዲስ አበባ እምብርት የሚገኝ ባለ 500 ካሬ ሜትር የቅንጦት 3D ዘመናዊ ቪላ ቤት። 5 መኝታ ክፍሎች፣ ዘመናዊ ሳሎን እና የመዋኛ ገንዳ ያለው። ወደ ጎን ስክሮል በማድረግ የተለያዩ 3D ዲዛይኖችን ይመልከቱ።",
    specs: [
      "500 ካሬ ሜትር ሙሉ ይዞታ",
      "5 ዘመናዊ መኝታ ክፍሎች እና 6 መታጠቢያ",
      "የግል መዋኛ ገንዳ እና ጋራዥ",
      "ሙሉ 3D Smart Home ዲዛይን",
    ],
    slides: [
      { image: macBlack, label: "ዲዛይን 1፡ ውጫዊ 3D ቪላ" },
      { image: macSilver, label: "ዲዛይን 2፡ የመዋኛ ገንዳ እይታ" },
      { image: sonyBlack, label: "ዲዛይን 3፡ የውስጥ 3D ሳሎን" },
    ],
    views: 14250,
    likes: 1840,
    seedBids: [["ዳዊት መ.", 601], ["ሰላም ታ.", 605]],
    seedComments: [["ብሩክ አ.", "ይህ 3D ቤት በጣም ያምራል! ተጫርቻለሁ"]],
  },
  {
    id: "luxury-3d-car",
    name: "የቅንጦት 3D ስፖርት መኪና (Luxury SUV 2026)",
    tagline: "V8 Turbo · ሙሉ 3D ዘመናዊ ዲዛይን",
    description:
      "የቅርብ ጊዜ ሞዴል የቅንጦት 3D ስፖርት መኪና። ባለ ሙሉ ፓኖራሚክ ጣሪያ እና ዘመናዊ የቆዳ ሳሎን ያለው። ወደ ጎን ስክሮል በማድረግ የተለያዩ 3D ዲዛይኖችን ይመልከቱ።",
    specs: [
      "2026 ሞዴል V8 Twin-Turbo ሞተር",
      "ሙሉ የቆዳ 3D የውስጥ ሳሎን",
      "አውቶማቲክ የመንዳት ቴክኖሎጂ",
      "0 ኪሎ ሜትር የነዳ አዲስ መኪና",
    ],
    slides: [
      { image: ps5Console, label: "ዲዛይን 1፡ የፊት 3D ስፖርት" },
      { image: ps5Controller, label: "ዲዛይን 2፡ የጎን 3D ቅርጽ" },
      { image: sonySilver, label: "ዲዛይን 3፡ የውስጥ 3D ሳሎን" },
    ],
    views: 11890,
    likes: 1520,
    seedBids: [["ዮሐንስ በ.", 602], ["ሄለን ግ.", 610]],
    seedComments: [["ሳሙኤል ተ.", "የመኪናው 3D ዲዛይን በጣም ያምራል!"]],
  }
);
PRODUCT_IDS.push("luxury-3d-villa", "luxury-3d-car");
export const PRODUCT_IDS = SEED.map((p) => p.id);
