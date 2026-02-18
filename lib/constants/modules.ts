/**
 * Learning module slugs and labels for UI.
 * TODO: Replace with DB-driven list when backend is ready.
 */
export const LEARNING_MODULES = [
  { slug: "tafseer", name: "Tafseer" },
  { slug: "ahadees", name: "Ahadees" },
  { slug: "fiqah", name: "Fiqah" },
  { slug: "tajweed", name: "Tajweed" },
  { slug: "seerat-e-tayyabah", name: "Seerat-e-Tayyabah" },
  { slug: "sunnat-e-rasul", name: "Sunnat-e-Rasul" },
  { slug: "zikar", name: "Zikar" },
  { slug: "zikar-e-lataif", name: "Zikar-e-Lataif" },
  { slug: "muraqbah", name: "Muraqbah" },
] as const;

export type ModuleSlug = (typeof LEARNING_MODULES)[number]["slug"];

/** Image path per module (same as home card). Files under /public/assets/Modules/. */
export const MODULE_IMAGES: Record<ModuleSlug, string> = {
  tafseer: "/assets/Modules/tafseer.jpg",
  ahadees: "/assets/Modules/ahadith.jpg",
  fiqah: "/assets/Modules/fiqah.jpg",
  tajweed: "/assets/Modules/tajweed.jpg",
  "seerat-e-tayyabah": "/assets/Modules/seerat-e-tayyabah.jpg",
  "sunnat-e-rasul": "/assets/Modules/sunnat-e-rasul.jpg",
  zikar: "/assets/Modules/zikar.jpg",
  "zikar-e-lataif": "/assets/Modules/zikar-e-lataif.jpg",
  muraqbah: "/assets/Modules/muraqbah.jpg",
};
