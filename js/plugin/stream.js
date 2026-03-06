let eyeSVG = "";

async function loadSVG() {
  const res = await fetch("./svg/icon/eye.svg");
  eyeSVG = await res.text();
}




/* CARD BUILDER */

function createCard(item) {

  const card = document.createElement("div");
  card.className = "card";

  const thumb = document.createElement("div");
  thumb.className = "thumb";

  if (item.thumb) {
    thumb.style.backgroundImage = `url(${item.thumb})`;
  }

  /* THUMB OVERLAY */

  const overlay = document.createElement("div");
  overlay.className = "thumb-overlay";

  const title = document.createElement("div");
  title.className = "thumb-title";
  title.textContent = item.title;

  overlay.appendChild(title);
  thumb.appendChild(overlay);

  /* META SECTION */

  const meta = document.createElement("div");
  meta.className = "meta";

  /* TAG CONTAINER */

  const tagContainer = document.createElement("div");
  tagContainer.className = "tag-container";

  item.tags.forEach(tagText => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = tagText;
    tagContainer.appendChild(tag);
  });

  meta.appendChild(tagContainer);

  /* STATS */

  const stats = document.createElement("div");
  stats.className = "stats";

  stats.innerHTML = `
    <span class="views">
      ${eyeSVG} ${item.views}
    </span>
    <span class="date">${item.date}</span>
  `;

  meta.appendChild(stats);

  /* EVENT CLICK HANDLER */

  if (item.modal) {

    card.style.cursor = "pointer";

    card.addEventListener("click", () => {
      openEventPopup({
        title: item.title,
        synopsis: item.modal.synopsis,
        link: item.modal.link
      });
    });

  }

  card.appendChild(thumb);
  card.appendChild(meta);

  return card;
}


/* EVENT POPUP SYSTEM */

function openEventPopup(data) {

  const backdrop = document.createElement("div");
  backdrop.className = "event-popup-backdrop";

  const popup = document.createElement("div");
  popup.className = "event-popup";

  popup.innerHTML = `
    <h2>${data.title}</h2>

    <p>${data.synopsis}</p>

    <a href="${data.link}" target="_blank" class="event-popup-link">
      Link
    </a>

    <button class="event-popup-close">Close</button>
  `;

  backdrop.appendChild(popup);
  document.body.appendChild(backdrop);

  const closeBtn = popup.querySelector(".event-popup-close");

  closeBtn.onclick = () => backdrop.remove();

  backdrop.onclick = e => {
    if (e.target === backdrop) backdrop.remove();
  };
}


/* INITIALIZE PAGE */

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