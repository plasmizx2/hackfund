export type HackathonStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "completed";

export type Hackathon = {
  id: string;
  organizer_id: string;
  title: string;
  slug: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  venue_name: string | null;
  address_line: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  website_url: string | null;
  status: HackathonStatus;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  hackathon_id: string;
  created_by: string;
  title: string;
  tagline: string | null;
  description: string | null;
  demo_url: string | null;
  repo_url: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Award = {
  id: string;
  hackathon_id: string;
  project_id: string | null;
  placement: number | null;
  label: string | null;
  category: string | null;
  prize_amount_cents: number;
  currency: string;
  announced_at: string | null;
  created_at: string;
};

export type HackathonParticipation = {
  id: string;
  hackathon_id: string;
  user_id: string;
  created_at: string;
};
