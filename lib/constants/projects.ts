/**
 * Projects list for UI. Static for now.
 * TODO: Replace with DB or CMS when backend is ready.
 */
export const PROJECTS = [
  { slug: "markaz", name: "Markaz-e-Mujaddidiyya", short: "Central hub for learning and guidance under Prof. Dr. Waseem Ahmed Farooqi." },
  { slug: "education", name: "Education & Curriculum", short: "Structured courses and materials in Tafseer, Ahadees, Fiqah, and spiritual disciplines." },
  { slug: "outreach", name: "Outreach & Publications", short: "Books, lectures, and resources for the wider community." },
] as const;

export type ProjectSlug = (typeof PROJECTS)[number]["slug"];
