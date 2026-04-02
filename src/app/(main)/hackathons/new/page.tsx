import { HackathonFormClient } from "@/components/hackathon-form-client";

export default async function NewHackathonPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <HackathonFormClient error={error ?? null} />
    </div>
  );
}
