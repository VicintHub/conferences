export type Hotel = {
  slug: string;
  name: string;
  area: string;
  price_kobo: number;
  distance_km: number;
  drive_minutes: number;
  conference_rate: boolean;
  /** Only present on hotels where the conference rate applies. */
  rate_code: string | null;
  image: string | null;
  amenities: string[];
  shuttle_note: string | null;
  phone: string | null;
  whatsapp: string | null;
};

export type Shuttle = { id: number; name: string; schedule: string };
export type Venue = { name: string; address: string; lat: number; lng: number };
export type Travel = { venue: Venue; hotels: Hotel[]; shuttles: Shuttle[] };

export type Budget = "all" | "under20" | "mid" | "conference";

export const budgets: { key: Budget; label: string }[] = [
  { key: "all", label: "All" },
  { key: "under20", label: "Under ₦20k" },
  { key: "mid", label: "₦20k–₦35k" },
  { key: "conference", label: "Conference rate" },
];

const NAIRA_20K = 2_000_000;
const NAIRA_35K = 3_500_000;

export function inBudget(h: Hotel, b: Budget): boolean {
  switch (b) {
    case "under20":
      return h.price_kobo < NAIRA_20K;
    case "mid":
      return h.price_kobo >= NAIRA_20K && h.price_kobo <= NAIRA_35K;
    case "conference":
      return h.conference_rate;
    default:
      return true;
  }
}
