/**
 * Seed script for dev/test: platform_news, platform_events.
 * Run: npm run db:seed
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (Service role bypasses RLS; anon key cannot insert into platform_news/events.)
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, key);

async function seed() {
  console.log("Seeding platform_news...");
  const { data: existingNews } = await supabase.from("platform_news").select("id").limit(1);
  if (existingNews && existingNews.length > 0) {
    console.log("platform_news already has data, skipping.");
  } else {
    const { error: newsErr } = await supabase.from("platform_news").insert({
      title: "Welcome to the Learning Portal",
      excerpt:
        "Explore the modules and enroll when you are ready. No pressure — learn at your pace.",
      body: "Welcome to the Khanqah Mujaddidiyya learning portal. Browse the modules, enroll when you feel ready, and progress at your own pace.",
      published_at: new Date().toISOString(),
      sort_order: 0,
    });
    if (newsErr) console.error("platform_news insert error:", newsErr);
    else console.log("Inserted welcome news.");
  }

  console.log("Seeding platform_events...");
  const { data: existingEvents } = await supabase.from("platform_events").select("id").limit(1);
  if (existingEvents && existingEvents.length > 0) {
    console.log("platform_events already has data, skipping.");
  } else {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const { error: eventsErr } = await supabase.from("platform_events").insert({
      title: "Weekly Study Circle",
      description: "Join us for a guided study session.",
      event_date: nextWeek.toISOString().slice(0, 10),
      event_time: "10:00",
      location: "Online",
    });
    if (eventsErr) console.error("platform_events insert error:", eventsErr);
    else console.log("Inserted sample event.");
  }

  console.log("Seed complete.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
