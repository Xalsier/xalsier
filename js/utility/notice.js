/* notice.js
   - Put this at ./js/utility/notice.js (or replace your current file)
   - Update MAX_NOTICE_INDEX when you add new md files (e.g., change to 6 if you add 6.md)
*/

const MAX_NOTICE_INDEX = 10;      // <-- update this when you add new notices (5 means files 0.md..5.md exist)
const NOTICE_DIR = './md/not/';  // base path for your .md files
const NOTICE_FILE = idx => `${NOTICE_DIR}${idx}.md`;

// prefer the announcementData defined in utility.js; fallback to a safe default
const ANNOUNCEMENT_DATA = window.announcementData || {
  avatarSrc: './thumb/fuwa.jpg',
  avatarTitle: "(Fuwa) Xalsier's profile on Social Media.",
  avatarAlt: 'A drawing of the character Fuwa.',
  name: 'Xalsier'
};

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body || document.getElementsByTagName('body')[0];
  const isArchive = (body && (body.dataset && body.dataset.archive === 'true')) || body.getAttribute && body.getAttribute('data-archive') === 'true';

  // DOM references for the static card (index.html uses these IDs)
  const staticAvatar = document.getElementById('announcement-avatar');
  const staticName = document.getElementById('announcement-name');
  const staticDate = document.getElementById('announcement-date');
  const staticMessage = document.getElementById('announcement-message');
  const staticCard = staticMessage ? staticMessage.closest('.announcement-card') : document.querySelector('.announcement-card');

  // Ensure avatar + name are set on the static card immediately (utility.js probably already does this,
  // but harmless to set again to keep archive / non-archive consistent)
  if (staticAvatar) {
    staticAvatar.src = ANNOUNCEMENT_DATA.avatarSrc;
    staticAvatar.title = ANNOUNCEMENT_DATA.avatarTitle;
    staticAvatar.alt = ANNOUNCEMENT_DATA.avatarAlt;
  }
  if (staticName) staticName.textContent = ANNOUNCEMENT_DATA.name;

  // simple parser: extracts date from {{date}} at top and converts paragraphs to <p> blocks
  function parseMarkdown(markdown) {
    const dateRegex = /^\s*{{\s*([^}]+)\s*}}/m;
    const match = markdown.match(dateRegex);
    const dateString = match ? match[1].trim() : 'Date not found';
    let content = markdown.replace(dateRegex, '').trim();

    // break into paragraphs on blank lines, preserve single-line breaks as <br>
    const paragraphs = content
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');

    return { dateString, html: paragraphs || '' };
  }

  function createAnnouncementCardHTML(dateString, htmlContent) {
    const card = document.createElement('div');
    card.className = 'announcement-card';
    card.innerHTML = `
      <div class="announcement-header">
        <img class="announcement-avatar" src="${ANNOUNCEMENT_DATA.avatarSrc}" alt="${ANNOUNCEMENT_DATA.avatarAlt}" title="${ANNOUNCEMENT_DATA.avatarTitle}">
        <div class="announcement-name-date">
          <span class="announcement-name">${ANNOUNCEMENT_DATA.name}</span>
          <span class="announcement-date">${dateString}</span>
        </div>
      </div>
      <div class="announcement-message">${htmlContent}</div>
    `;
    return card;
  }

  // append logic: prefer the parent of the static card, otherwise an #announcement-container, otherwise body
  function getAppendParent() {
    if (staticCard && staticCard.parentNode) return staticCard.parentNode;
    const explicitContainer = document.getElementById('announcement-container');
    if (explicitContainer) return explicitContainer;
    return document.body;
  }

  // load a single notice .md and either fill static card (if index===0 and static exists) OR create+append a new card
  function loadAndRender(index, useStaticForZero = false) {
    const path = NOTICE_FILE(index);
    return fetch(path)
      .then(response => {
        if (!response.ok) {
          console.warn(`Notice file not found: ${path} (status ${response.status})`);
          return null;
        }
        return response.text().then(md => {
          const { dateString, html } = parseMarkdown(md);
          if (useStaticForZero && staticMessage && staticDate) {
            staticDate.textContent = dateString;
            staticMessage.innerHTML = html;
            return { index, usedStatic: true };
          } else {
            const card = createAnnouncementCardHTML(dateString, html);
            const parent = getAppendParent();
            parent.appendChild(card);
            return { index, usedStatic: false };
          }
        });
      })
      .catch(err => {
        console.error('Error fetching notice:', path, err);
        return null;
      });
  }

  if (isArchive) {
    // Required order: 0, MAX, MAX-1, ..., 1
    const sequence = [0];
    for (let i = MAX_NOTICE_INDEX; i >= 1; i--) sequence.push(i);

    // Load sequentially to guarantee DOM insertion order (no race condition)
    sequence.reduce((promise, idx) => {
      return promise.then(() => loadAndRender(idx, idx === 0));
    }, Promise.resolve());
  } else {
    // non-archive: only fill the static card with 0.md (do not create extra cards or alter the DOM layout)
    loadAndRender(0, true);
  }
});
