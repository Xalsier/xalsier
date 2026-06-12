let eyeSVG = "";

async function loadSVG() {
  const res = await fetch("./svg/icon/eye.svg");
  eyeSVG = await res.text();
}

/* GENERIC CARD BUILDER */
function createCard(item) {
  const card = document.createElement("div");
  card.className = "card";

  const thumb = document.createElement("div");
  thumb.className = "thumb";
  if (item.thumb) thumb.style.backgroundImage = `url(${item.thumb})`;
  
  const overlay = document.createElement("div");
  overlay.className = "thumb-overlay";
  overlay.innerHTML = `<div class="thumb-title">${item.title}</div>`;
  thumb.appendChild(overlay);

  const meta = document.createElement("div");
  meta.className = "meta";

  // Tag Container
  const tagContainer = document.createElement("div");
  tagContainer.className = "tag-container";
  if (item.tags) {
    item.tags.forEach(tagText => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = tagText;
      tagContainer.appendChild(tag);
    });
  }
  meta.appendChild(tagContainer);

  // Stats: Views Left, Date Right
  const stats = document.createElement("div");
  stats.className = "stats";
  stats.style.display = "flex";
  stats.style.justifyContent = "space-between";
  stats.innerHTML = `
    <span class="views">${eyeSVG} ${item.views}</span>
    <span class="date">${item.date}</span>
  `;
  meta.appendChild(stats);

  card.appendChild(thumb);
  card.appendChild(meta);
  return card;
}

/* DEBATE CARD BUILDER */
function createDebateCard(item) {
  const card = document.createElement("div");
  card.className = "card debate-card";
  
  card.innerHTML = `
    <div class="thumb" style="background: var(--green); display: flex; align-items: center; justify-content: center; color: var(--bg-color); font-weight: bold; text-align: center; padding: 10px;">
      ${item.title}
    </div>
    <div class="meta">
      <div class="tag-container">
        ${item.tags ? item.tags.map(t => `<span class="tag">${t}</span>`).join('') : ''}
      </div>
      <div class="stats" style="display: flex; justify-content: space-between;">
        <span class="views">${eyeSVG} ${item.views}</span>
        <span class="date">${item.date}</span>
      </div>
    </div>
  `;
  return card;
}

/* INITIALIZE PAGE */
async function init() {
  await loadSVG();
  
  const tracks = {
    eventTrack: events,
    debateTrack: debates,
    twitchTrack: streams.filter(s => s.platform === "twitch"),
    picartoTrack: streams.filter(s => s.platform === "picarto")
  };

  for (const [id, data] of Object.entries(tracks)) {
    const el = document.getElementById(id);
    if (el) {
      data.forEach(item => {
        el.appendChild(id === 'debateTrack' ? createDebateCard(item) : createCard(item));
      });
    }
  }
}

// Function for isolated pages
async function initDebatesOnly(containerId) {
  await loadSVG();
  const container = document.getElementById(containerId);
  if (container) {
    debates.forEach(d => container.appendChild(createDebateCard(d)));
  }
}

init();