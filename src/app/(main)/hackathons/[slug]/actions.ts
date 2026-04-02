"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function setParticipation(
  hackathonId: string,
  slug: string,
  join: boolean,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Not signed in" };
  }

  if (join) {
    const { error } = await supabase.from("hackathon_participations").insert({
      hackathon_id: hackathonId,
      user_id: user.id,
    });
    // 23505 = unique_violation (already joined)
    if (error && error.code !== "23505") {
      return { ok: false as const, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("hackathon_participations")
      .delete()
      .eq("hackathon_id", hackathonId)
      .eq("user_id", user.id);
    if (error) return { ok: false as const, error: error.message };
  }

  revalidatePath("/me/hackathons");
  revalidatePath(`/hackathons/${slug}`);
  return { ok: true as const };
}
