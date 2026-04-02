"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseOptionalFloat(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function createHackathonForm(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    redirect("/hackathons/new?error=title");
  }

  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugRaw || title);

  const startsRaw = String(formData.get("starts_at") ?? "");
  const endsRaw = String(formData.get("ends_at") ?? "");
  const starts_at = new Date(startsRaw).toISOString();
  const ends_at = new Date(endsRaw).toISOString();

  if (Number.isNaN(Date.parse(startsRaw)) || Number.isNaN(Date.parse(endsRaw))) {
    redirect("/hackathons/new?error=date");
  }

  const status = String(formData.get("status") ?? "draft");
  const allowed = ["draft", "published", "cancelled", "completed"];
  const safeStatus = allowed.includes(status) ? status : "draft";

  const { error } = await supabase.from("hackathons").insert({
    organizer_id: user.id,
    title,
    slug,
    description: String(formData.get("description") ?? "").trim() || null,
    starts_at,
    ends_at,
    timezone: String(formData.get("timezone") ?? "UTC").trim() || "UTC",
    city: String(formData.get("city") ?? "").trim() || null,
    country: String(formData.get("country") ?? "").trim() || null,
    latitude: parseOptionalFloat(formData.get("latitude")),
    longitude: parseOptionalFloat(formData.get("longitude")),
    website_url: String(formData.get("website_url") ?? "").trim() || null,
    status: safeStatus,
  });

  if (error) {
    redirect(`/hackathons/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  redirect(`/hackathons/${slug}`);
}
