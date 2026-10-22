import { appearanceThemes } from "../appearance/themes";

export type ShowroomPlan = "starter" | "growth" | "professional" | "enterprise";
export type ThemeTier = "core" | "composition" | "collection";
export type ShowroomTheme = {
  id: string;
  name: string;
  tier: ThemeTier;
  description: string;
  mood: string;
  layout:
    | "executive"
    | "analytic"
    | "editorial"
    | "warm"
    | "ledger"
    | "command"
    | "bento"
    | "seasonal";
  canvas: string;
  surface: string;
  ink: string;
  muted: string;
  nav: string;
  primary: string;
  onPrimary: string;
  accent: string;
  border: string;
  series: readonly [string, string, string];
  radius: number;
  texture: "none" | "frost" | "heritage" | "bloom" | "luxe";
};

const emerald = appearanceThemes["premium-emerald"];
const midnight = appearanceThemes["midnight-emerald"];

export const showroomThemes: readonly ShowroomTheme[] = [
  {
    id: "emerald",
    name: "Emerald Executive",
    tier: "core",
    mood: "Confident & composed",
    description:
      "Deep forest navigation, an emerald welcome and a balanced executive canvas.",
    layout: "executive",
    canvas: emerald.canvas,
    surface: emerald.surface,
    ink: emerald.ink,
    muted: emerald.muted,
    nav: emerald.forest,
    primary: emerald.primary,
    onPrimary: emerald.primaryInk,
    accent: emerald.gold,
    border: emerald.border,
    series: ["#087C57", "#285D85", "#8B5F15"],
    radius: 20,
    texture: "none",
  },
  {
    id: "ocean",
    name: "Ocean Intelligence",
    tier: "core",
    mood: "Clarity at a glance",
    description:
      "Crisp navy architecture, expansive analytics and calm cyan accents.",
    layout: "analytic",
    canvas: "#EFF5FB",
    surface: "#FFFFFF",
    ink: "#122B49",
    muted: "#475F79",
    nav: "#102C4E",
    primary: "#125AA6",
    onPrimary: "#FFFFFF",
    accent: "#54D2D0",
    border: "#BACDDF",
    series: ["#125AA6", "#007A7C", "#8152A5"],
    radius: 12,
    texture: "none",
  },
  {
    id: "amethyst",
    name: "Royal Amethyst",
    tier: "core",
    mood: "An academic point of view",
    description:
      "An editorial academic workspace with a capsule rail and considered typography.",
    layout: "editorial",
    canvas: "#F5F1FA",
    surface: "#FFFFFF",
    ink: "#322343",
    muted: "#655371",
    nav: "#39224F",
    primary: "#6D3AA0",
    onPrimary: "#FFFFFF",
    accent: "#D8B56D",
    border: "#D5C5E2",
    series: ["#6D3AA0", "#A65163", "#32726F"],
    radius: 25,
    texture: "none",
  },
  {
    id: "sunrise",
    name: "Sunrise Academy",
    tier: "core",
    mood: "People before paperwork",
    description:
      "Warm ivory, terracotta and an action-led layout that feels welcoming.",
    layout: "warm",
    canvas: "#FFF6EC",
    surface: "#FFFFFF",
    ink: "#472D20",
    muted: "#735744",
    nav: "#733C22",
    primary: "#A6431D",
    onPrimary: "#FFFFFF",
    accent: "#F0B847",
    border: "#E7CDB6",
    series: ["#A6431D", "#2C756D", "#7C5295"],
    radius: 22,
    texture: "none",
  },
  {
    id: "slate",
    name: "Slate Professional",
    tier: "core",
    mood: "Quietly effective",
    description:
      "A restrained light rail, precise data rows and a clean operational hierarchy.",
    layout: "ledger",
    canvas: "#F3F5F7",
    surface: "#FFFFFF",
    ink: "#243247",
    muted: "#526176",
    nav: "#243247",
    primary: "#365778",
    onPrimary: "#FFFFFF",
    accent: "#BDB08A",
    border: "#C6CFD9",
    series: ["#365778", "#3B7664", "#86596B"],
    radius: 7,
    texture: "none",
  },
  {
    id: "midnight",
    name: "Midnight Command",
    tier: "core",
    mood: "Focus after hours",
    description:
      "Free dark appearance, mint signals and an exception-first command board.",
    layout: "command",
    canvas: midnight.canvas,
    surface: midnight.surface,
    ink: midnight.ink,
    muted: midnight.muted,
    nav: midnight.forest,
    primary: midnight.primary,
    onPrimary: midnight.primaryInk,
    accent: midnight.gold,
    border: midnight.border,
    series: ["#90DBB8", "#81B4F0", "#E4C779"],
    radius: 13,
    texture: "none",
  },
  {
    id: "obsidian",
    name: "Obsidian Gold",
    tier: "composition",
    mood: "Understated distinction",
    description:
      "Charcoal surfaces, warm gold rules and spacious, editorial insight cards.",
    layout: "editorial",
    canvas: "#141414",
    surface: "#22211F",
    ink: "#FAF5E9",
    muted: "#C7BFB0",
    nav: "#0C0C0C",
    primary: "#E2BF73",
    onPrimary: "#211B10",
    accent: "#E2BF73",
    border: "#71654F",
    series: ["#E2BF73", "#A3C4CF", "#C5A7D8"],
    radius: 4,
    texture: "none",
  },
  {
    id: "aurora",
    name: "Aurora Insights",
    tier: "composition",
    mood: "A more expressive perspective",
    description:
      "An indigo-to-teal atmosphere and a modular, insight-led bento board.",
    layout: "bento",
    canvas: "#EFF3FA",
    surface: "#FFFFFF",
    ink: "#232D50",
    muted: "#53617A",
    nav: "#202C52",
    primary: "#4B48A8",
    onPrimary: "#FFFFFF",
    accent: "#71D6BC",
    border: "#C3CEE1",
    series: ["#4B48A8", "#007B72", "#A44569"],
    radius: 24,
    texture: "none",
  },
  {
    id: "winter-frost",
    name: "Winter Frost",
    tier: "collection",
    mood: "Fresh thinking, crystal clear",
    description:
      "Original frost geometry, translucent ice-blue panels and a wide analytical stage.",
    layout: "analytic",
    canvas: "#EDF5FA",
    surface: "#FFFFFF",
    ink: "#19354D",
    muted: "#49647A",
    nav: "#173F5C",
    primary: "#1D6492",
    onPrimary: "#FFFFFF",
    accent: "#A3D9E4",
    border: "#ABC8D8",
    series: ["#1D6492", "#54749A", "#3C827B"],
    radius: 15,
    texture: "frost",
  },
  {
    id: "autumn-heritage",
    name: "Autumn Heritage",
    tier: "collection",
    mood: "Warmth with a sense of place",
    description:
      "Original woven-paper texture, copper leaf graphics and a journal-like workboard.",
    layout: "warm",
    canvas: "#F8F1E6",
    surface: "#FFFCF6",
    ink: "#493124",
    muted: "#715847",
    nav: "#623D2A",
    primary: "#99451E",
    onPrimary: "#FFFFFF",
    accent: "#D8AE66",
    border: "#DCC4A4",
    series: ["#99451E", "#5A7147", "#8C5470"],
    radius: 6,
    texture: "heritage",
  },
  {
    id: "spring-bloom",
    name: "Spring Bloom",
    tier: "collection",
    mood: "Room for every new beginning",
    description:
      "Original botanical line art, petal-shaped cards and a light, generous campus canvas.",
    layout: "bento",
    canvas: "#F4F6EC",
    surface: "#FFFFFF",
    ink: "#2D4032",
    muted: "#526859",
    nav: "#294E3B",
    primary: "#386B4B",
    onPrimary: "#FFFFFF",
    accent: "#DCA6B4",
    border: "#BDCCB8",
    series: ["#386B4B", "#98546B", "#566EA0"],
    radius: 28,
    texture: "bloom",
  },
  {
    id: "midnight-luxe",
    name: "Midnight Luxe",
    tier: "collection",
    mood: "An evening edition",
    description:
      "Original Art Deco linework, velvet navy surfaces and a panoramic gold-accented board.",
    layout: "seasonal",
    canvas: "#111B2D",
    surface: "#1C2940",
    ink: "#F5EFE0",
    muted: "#C2C9D8",
    nav: "#0A1424",
    primary: "#DFBF79",
    onPrimary: "#1F1A10",
    accent: "#DFBF79",
    border: "#68738A",
    series: ["#DFBF79", "#91BFD6", "#B6A0D5"],
    radius: 5,
    texture: "luxe",
  },
];

const aliases = new Map([
  ["premium-emerald", "emerald"],
  ["midnight-emerald", "midnight"],
]);

export function resolveShowroomTheme(id: string): ShowroomTheme {
  if (id === "classic-light") {
    const classic = appearanceThemes["classic-light"];
    return {
      ...showroomThemes[4],
      id,
      name: "Classic Light",
      canvas: classic.canvas,
      surface: classic.surface,
      ink: classic.ink,
      muted: classic.muted,
      nav: classic.forest,
      primary: classic.primary,
      onPrimary: classic.primaryInk,
      accent: classic.gold,
      border: classic.border,
    };
  }
  return (
    showroomThemes.find((theme) => theme.id === (aliases.get(id) ?? id)) ??
    showroomThemes[0]
  );
}

/** A showroom simulation only. Never use this helper for application authority. */
export function demoThemeAvailable(tier: ThemeTier, plan: ShowroomPlan) {
  return (
    tier === "core" ||
    (tier === "composition" && plan !== "starter") ||
    plan === "professional" ||
    plan === "enterprise"
  );
}

export const showroomRoles = [
  {
    id: "owner",
    name: "Organization Owner",
    title: "Your school. A clearer perspective.",
    scope: "Demo school · selected academic session",
    navigation: [
      "Overview",
      "Management",
      "Finance",
      "Assessment",
      "Action Center",
    ],
  },
  {
    id: "principal",
    name: "Principal / Headteacher",
    title: "Make every school day count.",
    scope: "Demo school · academic operations",
    navigation: [
      "Overview",
      "Attendance",
      "Teaching",
      "Assessment",
      "Action Center",
    ],
  },
  {
    id: "teacher",
    name: "Teacher",
    title: "More time for the classroom.",
    scope: "Demo teacher · assigned classes and subjects",
    navigation: [
      "My day",
      "Teaching",
      "Attendance",
      "Score sheets",
      "Messages",
    ],
  },
  {
    id: "finance",
    name: "Bursar / Finance",
    title: "Confidence in every school transaction.",
    scope: "Demo school Finance · NGN",
    navigation: [
      "Overview",
      "Billing",
      "Payments",
      "Expenses",
      "Reconciliation",
    ],
  },
  {
    id: "admissions",
    name: "Admissions Officer",
    title: "Welcome their next chapter.",
    scope: "Demo school · application snapshot",
    navigation: [
      "Overview",
      "Applications",
      "Offers",
      "Documents",
      "Action Center",
    ],
  },
  {
    id: "guardian",
    name: "Parent / Guardian",
    title: "A closer connection to their school day.",
    scope: "Demo family · selected linked learner",
    navigation: [
      "My family",
      "Attendance",
      "Published results",
      "Invoice summary",
      "Messages",
    ],
  },
  {
    id: "student",
    name: "Student",
    title: "Your learning, beautifully organized.",
    scope: "Demo learner · personal published information",
    navigation: ["My records", "Attendance", "Published results", "Notices"],
  },
  {
    id: "platform",
    name: "Platform Owner",
    title: "A future view of the SchoolFlow platform.",
    scope: "Concept only · privileged milestone is separate",
    navigation: [
      "Platform overview",
      "Registrations",
      "Subscriptions",
      "Operations",
      "Security",
    ],
  },
] as const;

export type ShowroomRole = (typeof showroomRoles)[number]["id"];
