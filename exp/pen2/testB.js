const heatmap = document.getElementById("heatmap");
heatmap.style.gridTemplateColumns = "repeat(12, 24px)";

const YEARS = [2025, 2024, 2023, 2022];
const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
};
const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const activityData = Object.fromEntries(
  YEARS.map(y => [y, new Array(12).fill(0)])
);

const DATE_FIELDS = ["createdDate", "date", "created", "published", "timestamp"];

function parseArchiveDate(str) {
  if (typeof str !== "string") return null;
  const s = str.replace(/\s+/g, " ").trim();
  let m = s.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,)?\s+(\d{4})$/);
  if (!m) return null;

  const monthName = m[1].toLowerCase();
  const month = MONTHS[monthName];
  const year = parseInt(m[3], 10);

  if (month === undefined || isNaN(year)) return null;
  return { year, month };
}

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

console.group("Heatmap aggregation");
console.log("Items counted:", seen);
YEARS.forEach(y => console.log(y, activityData[y]));
console.groupEnd();

function getColor(count) {
  const cap = 5;
  const factor = Math.min(count / cap, 1);
  const min = 0.18;
  const t = min + factor * (1 - min);

  const g = [86, 222, 147];
  const [r, gg, b] = g.map(c => Math.round(c * t));
  return `rgb(${r}, ${gg}, ${b})`;
}

YEARS.forEach(year => {
  for (let m = 0; m < 12; m++) {
    const count = activityData[year][m];
    const cell = document.createElement("div");
    cell.className = "month-cell";
    cell.style.backgroundColor = getColor(count);
    cell.title = `${MONTH_ABBR[m]} ${year}`;
    heatmap.appendChild(cell);
  }
});
