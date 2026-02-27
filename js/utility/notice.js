const DEFAULT_MAX_NOTICE_INDEX = 20;

const ANNOUNCEMENT_DATA = window.announcementData || {
  avatarSrc: './thumb/fuwa35.svg',
  avatarTitle: "(Fuwa) Xalsier's profile on Social Media.",
  avatarAlt: 'A drawing of the character Fuwa.',
  name: 'Xalsier'
};

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body || document.getElementsByTagName('body')[0];

  const isArchive =
    (body && body.dataset && body.dataset.archive === 'true') ||
    (body.getAttribute && body.getAttribute('data-archive') === 'true');

  const AVATAR_BASE_PATH = isArchive ? '..' : '.';
  const AVATAR_SRC_PATH = `${AVATAR_BASE_PATH}/thumb/fuwa35.svg`;

  const NOTICE_DIR = isArchive ? '../md/not/' : './md/not/';
  const NOTICE_FILE = idx => `${NOTICE_DIR}${idx}.md`;

  // 👇 Tags JSON (placed in ../json/)
  const TAGS_FILE = isArchive ? '../json/tags.json' : './json/tags.json';
  let TAG_MAP = {};

  const staticAvatar = document.getElementById('announcement-avatar');
  const staticName = document.getElementById('announcement-name');
  const staticDate = document.getElementById('announcement-date');
  const staticMessage = document.getElementById('announcement-message');
  const staticCard = staticMessage
    ? staticMessage.closest('.announcement-card')
    : document.querySelector('.announcement-card');

  if (staticAvatar) {
    staticAvatar.src = AVATAR_SRC_PATH;
    staticAvatar.title = ANNOUNCEMENT_DATA.avatarTitle;
    staticAvatar.alt = ANNOUNCEMENT_DATA.avatarAlt;
  }

  if (staticName) {
    staticName.textContent = ANNOUNCEMENT_DATA.name;
  }

  /* ===========================
     TAG LOADING
  =========================== */

  async function loadTags() {
    try {
      const response = await fetch(TAGS_FILE);
      if (!response.ok) throw new Error();

      const data = await response.json();
      TAG_MAP = Object.fromEntries(data);
    } catch {
      console.warn('Tags JSON not found or invalid.');
      TAG_MAP = {};
    }
  }

  function renderTagsIntoHeader(headerElement, index) {
    const tags = TAG_MAP[index] || [];
    if (!tags.length) return;

    let container = headerElement.querySelector('.announcement-tags');

    if (!container) {
      container = document.createElement('div');
      container.className = 'announcement-tags';
      headerElement.prepend(container);
    }

    container.innerHTML = tags
      .map(tag => `<span class="announcement-tag">${tag}</span>`)
      .join('');
  }

  /* ===========================
     MARKDOWN PARSER
  =========================== */

  function parseMarkdown(markdown) {
    const dateRegex = /^\s*{{\s*([^}]+)\s*}}/m;
    const dateMatch = markdown.match(dateRegex);
    const dateString = dateMatch ? dateMatch[1].trim() : 'Date not found';

    let content = markdown.replace(dateRegex, '').trim();

    const mirrorRegex = /{{\s*(X|BSKY)\s*\|\s*([^}]+)\s*}}/gi;
    const mirrors = [];

    content = content.replace(mirrorRegex, (_, type, url) => {
      const upper = type.toUpperCase();
      mirrors.push({
        type: upper,
        label: upper === 'X' ? 'Tweet' : 'Bsky',
        url: url.trim()
      });
      return '';
    });

    const paragraphs = content
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');

    return {
      dateString,
      html: paragraphs || '',
      mirrors
    };
  }

  /* ===========================
     CARD CREATION
  =========================== */

  function createAnnouncementCardHTML(index, dateString, htmlContent, mirrors = []) {
    const historyLinkHref = isArchive ? '../notice.html' : './notice.html';

    const mirrorLinks = mirrors
      .map(
        m =>
          `<a href="${m.url}" class="announcement-mirror-link" target="_blank" rel="noopener">${m.label}</a>`
      )
      .join(' · ');

    let footerHTML = '';

    if (!isArchive || mirrors.length) {
      footerHTML = `
        <div class="announcement-footer">
          ${!isArchive
            ? `<a href="${historyLinkHref}" class="announcement-history-link">Previous</a>`
            : ''}
          ${mirrorLinks
            ? `<span class="announcement-mirrors">${mirrorLinks}</span>`
            : ''}
        </div>
      `;
    }

    const card = document.createElement('div');
    card.className = 'announcement-card';

    card.innerHTML = `
      <div class="announcement-header">
        <img
          class="announcement-avatar"
          src="${AVATAR_SRC_PATH}"
          alt="${ANNOUNCEMENT_DATA.avatarAlt}"
          title="${ANNOUNCEMENT_DATA.avatarTitle}"
        >
        <div class="announcement-name-date">
          <span class="announcement-name">${ANNOUNCEMENT_DATA.name}</span>
          <span class="announcement-date">${dateString}</span>
        </div>
      </div>
      <div class="announcement-message">${htmlContent}</div>
      ${footerHTML}
    `;

    // Insert tags after header creation
    const header = card.querySelector('.announcement-header');
    renderTagsIntoHeader(header, index);

    return card;
  }

  function getAppendParent() {
    if (staticCard && staticCard.parentNode) return staticCard.parentNode;
    const explicitContainer = document.getElementById('announcement-container');
    if (explicitContainer) return explicitContainer;
    return document.body;
  }

  /* ===========================
     NOTICE LOADER
  =========================== */

  async function loadAndRender(index, useStaticForZero = false) {
    const path = NOTICE_FILE(index);
    const response = await fetch(path);

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || contentType.includes('text/html')) {
      throw new Error('Not a valid notice file');
    }

    const md = await response.text();
    const { dateString, html, mirrors } = parseMarkdown(md);

    if (useStaticForZero && staticMessage && staticDate) {
      staticDate.textContent = dateString;
      staticMessage.innerHTML = html;

      const header = staticCard.querySelector('.announcement-header');
      renderTagsIntoHeader(header, index);

      let staticFooter = staticCard.querySelector('.announcement-footer');

      if (!staticFooter && (!isArchive || mirrors.length)) {
        staticFooter = document.createElement('div');
        staticFooter.className = 'announcement-footer';
        staticCard.appendChild(staticFooter);
      }

      if (staticFooter) {
        const mirrorLinks = mirrors
          .map(
            m =>
              `<a href="${m.url}" class="announcement-mirror-link" target="_blank" rel="noopener">${m.label}</a>`
          )
          .join(' · ');

        staticFooter.innerHTML = `
          ${!isArchive
            ? `<a href="./archive/notice.html" class="announcement-history-link">Previous</a>`
            : ''}
          ${mirrorLinks
            ? `<span class="announcement-mirrors">${mirrorLinks}</span>`
            : ''}
        `;
      }
    } else {
      const card = createAnnouncementCardHTML(index, dateString, html, mirrors);
      getAppendParent().appendChild(card);
    }
  }

  /* ===========================
     INIT
  =========================== */

  async function init() {
    await loadTags();

    try {
      await loadAndRender(0, true);
    } catch {
      console.warn('Notice 0 not found');
    }

    if (isArchive) {
      for (let i = DEFAULT_MAX_NOTICE_INDEX; i >= 1; i--) {
        try {
          await loadAndRender(i, false);
        } catch {
          continue;
        }
      }
    }
  }

  init();
});