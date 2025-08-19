// Make sure your archive_config.js (which defines ARCHIVE_ITEMS) loads BEFORE this script

const heatmap = document.getElementById("heatmap");

// Fixed years and 12 months each
const YEARS = [2025, 2024, 2023, 2022];
const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
};
const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Initialize counts
const activityData = Object.fromEntries(
  YEARS.map(y => [y, new Array(12).fill(0)])
);

// Some people love changing property names, so we try a few common ones
const DATE_FIELDS = ["createdDate", "date", "created", "published", "timestamp"];

// Parse "Month DD, YYYY" OR "Month DD YYYY"
function parseArchiveDate(str) {
  if (typeof str !== "string") return null;
  const s = str.replace(/\s+/g, " ").trim();

  // Try "Month DD, YYYY" or "Month DD YYYY"
  let m = s.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,)?\s+(\d{4})$/);
  if (!m) return null;

  const monthName = m[1].toLowerCase();
  const month = MONTHS[monthName];
  const year = parseInt(m[3], 10);

  if (month === undefined || isNaN(year)) return null;
  return { year, month };
}

// Fill counts
let seen = 0;
ARCHIVE_ITEMS.forEach(item => {
  let raw = null;
  for (const key of DATE_FIELDS) {
    if (item && typeof item[key] === "string" && item[key].trim()) {
      raw = item[key];
      break;
    }
  }
  if (!raw) return;

  const parsed = parseArchiveDate(raw);
  if (!parsed) {
    console.warn("Unparseable date:", raw);
    return;
  }

  const { year, month } = parsed;
  if (year < 2022 || year > 2025) return;

  activityData[year][month] += 1;
  seen++;
});

// Quick sanity log
console.group("Heatmap aggregation");
console.log("Items counted:", seen);
YEARS.forEach(y => console.log(y, activityData[y]));
console.groupEnd();

// Map count -> greener color. 5+ entries counts as high activity.
function getColor(count) {
  const cap = 5;
  const factor = Math.min(count / cap, 1); // 0..1
  const min = 0.18; // keep low values darker, not black
  const t = min + factor * (1 - min); // 0.18..1

  // Scale the provided green
  const g = [86, 222, 147];
  const [r, gg, b] = g.map(c => Math.round(c * t));
  return `rgb(${r}, ${gg}, ${b})`;
}

// Build the grid (2025 top row -> 2022 bottom row)
YEARS.forEach(year => {
  const yearLabel = document.createElement("div");
  yearLabel.className = "year-label";
  yearLabel.textContent = year;
  heatmap.appendChild(yearLabel);

  for (let m = 0; m < 12; m++) {
    const count = activityData[year][m];
    const cell = document.createElement("div");
    cell.className = "month-cell";
    cell.dataset.count = count;
    cell.style.backgroundColor = getColor(count);
    cell.title = `${MONTH_ABBR[m]} ${year}: ${count}`;
    heatmap.appendChild(cell);
  }
});
