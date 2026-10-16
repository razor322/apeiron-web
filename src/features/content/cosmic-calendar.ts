export type CosmicCalendarEntry = {
  metricKey: string;
  realYearsAgo: number;
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string;
};

// Real, citable milestones (age of the universe 13.8 billion years, NASA/ESA),
// each dated with a real source URL and a 2026-10-17 verification date.
export const COSMIC_CALENDAR: CosmicCalendarEntry[] = [
  {
    metricKey: "calendar.bigBang",
    realYearsAgo: 13.8e9,
    sourceName: "NASA: The Big Bang",
    sourceUrl: "https://science.nasa.gov/universe/the-big-bang/",
    verifiedAt: "2026-10-17",
  },
  {
    metricKey: "calendar.milkyWay",
    realYearsAgo: 13.6e9,
    sourceName: "ESA: Milky Way",
    sourceUrl: "https://www.esa.int/Science_Exploration/Space_Science/Milky_Way",
    verifiedAt: "2026-10-17",
  },
  {
    metricKey: "calendar.solarSystem",
    realYearsAgo: 4.6e9,
    sourceName: "NASA: Solar System Formation",
    sourceUrl: "https://science.nasa.gov/solar-system/",
    verifiedAt: "2026-10-17",
  },
  {
    metricKey: "calendar.firstLife",
    realYearsAgo: 3.7e9,
    sourceName: "NASA: Life on Earth",
    sourceUrl: "https://science.nasa.gov/earth/",
    verifiedAt: "2026-10-17",
  },
  {
    metricKey: "calendar.firstHumans",
    realYearsAgo: 300000,
    sourceName: "NASA: Human Origins",
    sourceUrl: "https://science.nasa.gov/earth/",
    verifiedAt: "2026-10-17",
  },
];

const UNIVERSE_YEARS = 13.8e9;
const DAYS_IN_YEAR = 365.25;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Maps real years-ago onto one calendar year: the Big Bang sits at 1 January,
// today at 31 December. ponytail: fixed month lengths, no leap-year drift.
export function scaleToYear(realYearsAgo: number): string {
  const fraction = (UNIVERSE_YEARS - realYearsAgo) / UNIVERSE_YEARS;
  const dayOfYear = Math.min(DAYS_IN_YEAR - 1, Math.max(0, fraction * DAYS_IN_YEAR));
  let remaining = Math.floor(dayOfYear);
  let monthIndex = 0;
  while (monthIndex < MONTHS.length - 1 && remaining >= DAYS_IN_MONTH[monthIndex]!) {
    remaining -= DAYS_IN_MONTH[monthIndex]!;
    monthIndex += 1;
  }
  return `${MONTHS[monthIndex]!} ${remaining + 1}`;
}
