/* ============================================================
   Domain models — shared by the demo store and the Supabase layer.
   Field names mirror the prototype (data.js) so screens port 1:1.
   ============================================================ */

export type Tone = "" | "pool" | "sunset" | "palm" | "grape" | "coral" | "night";
export type Cat = "hospedaje" | "transporte" | "actividades" | "comida" | "general";
export type PriceUnit = "total" | "pp" | "ppd";
export type TripStatus = "planeando" | "idea" | "completado";
export type MemberRole = "host" | "guest";
export type ResearchType = "tiktok" | "flight" | "link" | "note";

/** A person in the context of a trip (profile + membership). */
export interface Person {
  id: string;
  name: string;
  initials: string;
  color: string;
  avatarUrl?: string | null;
  /** organizer of the active trip (role === 'host') */
  host?: boolean;
  /** confirmed attendance for the active trip */
  confirmed?: boolean;
}

export interface MemberInfo {
  role: MemberRole;
  confirmed: boolean;
}

export interface Trip {
  id: string;
  name: string;
  sub: string;
  tone: Tone;
  emoji: string;
  status: TripStatus;
  /** display string e.g. "19–23 jun 2026" or "Sin fecha" */
  dates: string;
  startDate?: string | null;
  endDate?: string | null;
  daysLeft: number | null;
  /** headcount used for budgeting (people_count) */
  people: number;
  goalPerPerson: number;
  active?: boolean;
  coverUrl?: string | null;
  memberIds: string[];
  /** per-trip role + confirmation, keyed by person id */
  memberInfo: Record<string, MemberInfo>;
  ownerId?: string;
}

export interface OptionItem {
  id: string;
  trip: string;
  cat: Cat;
  tone: Tone;
  emoji: string;
  title: string;
  subtitle: string;
  price: number;
  unit: PriceUnit;
  priceNote: string;
  /** key/value chips, e.g. [["Alberca","Privada"],["Recámaras","3"]] */
  meta: [string, string][];
  link: string;
  winner: boolean;
  coverUrl?: string | null;
  /** personId -> rating 1..5 */
  votes: Record<string, number>;
}

export interface ResearchItem {
  id: string;
  trip: string;
  type: ResearchType;
  cat: Cat;
  tone: Tone;
  title: string;
  source: string;
  note: string;
  /** display name of saver */
  saved: string;
  savedById?: string;
  /** option id this was converted into, or null */
  converted: string | null;
}

export interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  tone: Tone;
  /** [emoji, text] pairs */
  items: [string, string][];
}

export interface CatMetaEntry {
  label: string;
  icon: string;
  color: string;
}

/* ---- budget engine output ---- */
export interface CatBudget {
  subtotal: number;
  perPerson: number;
  note: string;
  winners: OptionItem[];
}
export interface Budget {
  byCat: Record<string, CatBudget>;
  total: number;
  perCap: number;
  decided: number;
  progress: number;
  optCount: number;
}
