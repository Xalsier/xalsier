let eyeSVG = "";

async function loadSVG() {
  const res = await fetch("./svg/icon/eye.svg");
  eyeSVG = await res.text();
}


// STREAM DATA

const streams = [
  { title:"Bow Only Run + Consumables", tags:["Lies of P","No Mic", "PS4"], views:9, date:"March 5", thumb:"./thumb/stream/6.jpg" },
  { title:"Ranked Zero Build (Plat III)", tags:["Fortnite","No Mic", "PS4"], views:5, date:"March 5", thumb:"./thumb/stream/1.jpg" },
  { title:"Ranked Zero Build (Plat II)", tags:["Fortnite","No Mic", "PS4"], views:4, date:"March 3", thumb:"./thumb/stream/2.jpg" },
  { title:"Ranked Zero Build (Plat II)", tags:["Fortnite","No Mic", "PS4"], views:7, date:"March 2", thumb:"./thumb/stream/3.jpg" },
  { title:"Ranked Zero Build (Plat I)", tags:["Fortnite","No Mic", "PS4"], views:7, date:"March 1", thumb:"./thumb/stream/4.jpg" },
  { title:"Ranked Zero Build (Gold III)", tags:["Fortnite","No Mic", "PS4"], views:3, date:"February 27", thumb:"./thumb/stream/5.jpg" }
];


// EVENT DATA

const events = [
  {
    title: "Book AMA (VC) - Prion Rorschach",
    tags: ["Online Convention (TEC)"],
    views: "???",
    date: "April 17-19",
    thumb: ""
  }
];


// CARD BUILDER

function createCard(item) {

  const card = document.createElement("div");
  card.className = "card";

  const thumb = document.createElement("div");
  thumb.className = "thumb";

  if (item.thumb) {
    thumb.style.backgroundImage = `url(${item.thumb})`;
  }

  const overlay = document.createElement("div");
  overlay.className = "thumb-overlay";

  const title = document.createElement("div");
  title.className = "thumb-title";
  title.textContent = item.title;

  overlay.appendChild(title);
  thumb.appendChild(overlay);

  const meta = document.createElement("div");
  meta.className = "meta";


  // TAG CONTAINER
  const tagContainer = document.createElement("div");
  tagContainer.className = "tag-container";

  item.tags.forEach(tagText => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = tagText;
    tagContainer.appendChild(tag);
  });


  meta.appendChild(tagContainer);


  const stats = document.createElement("div");
  stats.className = "stats";

  stats.innerHTML = `
    <span class="views">
      ${eyeSVG} ${item.views}
    </span>
    <span class="date">${item.date}</span>
  `;

  meta.appendChild(stats);

  card.appendChild(thumb);
  card.appendChild(meta);

  return card;
}


// INITIALIZE PAGE

async function init() {

  await loadSVG();

  const eventTrack = document.getElementById("eventTrack");
  const streamTrack = document.getElementById("streamTrack");

  if (eventTrack) {
    events.forEach(event => {
      eventTrack.appendChild(createCard(event));
    });
  }

  if (streamTrack) {
    streams.forEach(stream => {
      streamTrack.appendChild(createCard(stream));
    });
  }

}

init();