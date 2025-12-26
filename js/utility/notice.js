const DEFAULT_MAX_NOTICE_INDEX = 15;

const ANNOUNCEMENT_DATA = window.announcementData || {
  avatarSrc: './thumb/fuwa35.svg', 
  avatarTitle: "(Fuwa) Xalsier's profile on Social Media.",
  avatarAlt: 'A drawing of the character Fuwa.',
  name: 'Xalsier'
};

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body || document.getElementsByTagName('body')[0];
  const isArchive = (body && (body.dataset && body.dataset.archive === 'true')) || (body.getAttribute && body.getAttribute('data-archive') === 'true');

  const AVATAR_BASE_PATH = isArchive ? '..' : '.';
  const AVATAR_SRC_PATH = `${AVATAR_BASE_PATH}/thumb/fuwa35.svg`; 
  
  const NOTICE_DIR = isArchive ? '../md/not/' : './md/not/';
  const NOTICE_FILE = idx => `${NOTICE_DIR}${idx}.md`;

  const staticAvatar = document.getElementById('announcement-avatar');
  const staticName = document.getElementById('announcement-name');
  const staticDate = document.getElementById('announcement-date');
  const staticMessage = document.getElementById('announcement-message');
  const staticCard = staticMessage ? staticMessage.closest('.announcement-card') : document.querySelector('.announcement-card');

  if (staticAvatar) {
    staticAvatar.src = AVATAR_SRC_PATH;
    staticAvatar.title = ANNOUNCEMENT_DATA.avatarTitle;
    staticAvatar.alt = ANNOUNCEMENT_DATA.avatarAlt;
  }
  if (staticName) staticName.textContent = ANNOUNCEMENT_DATA.name;

  function parseMarkdown(markdown) {
    const dateRegex = /^\s*{{\s*([^}]+)\s*}}/m;
    const match = markdown.match(dateRegex);
    const dateString = match ? match[1].trim() : 'Date not found';
    let content = markdown.replace(dateRegex, '').trim();

    const paragraphs = content
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');

    return { dateString, html: paragraphs || '' };
  }

  function createAnnouncementCardHTML(dateString, htmlContent) {
    const historyLinkHref = isArchive ? '../notice.html' : './notice.html';
    
    let footerHTML = '';
    if (!isArchive) {
      footerHTML = `<div class="announcement-footer"><a href="${historyLinkHref}" class="announcement-history-link">Previous</a></div>`;
    }

    const card = document.createElement('div');
    card.className = 'announcement-card';
    card.innerHTML = `
      <div class="announcement-header">
        <img class="announcement-avatar" src="${AVATAR_SRC_PATH}" alt="${ANNOUNCEMENT_DATA.avatarAlt}" title="${ANNOUNCEMENT_DATA.avatarTitle}">
        <div class="announcement-name-date">
          <span class="announcement-name">${ANNOUNCEMENT_DATA.name}</span>
          <span class="announcement-date">${dateString}</span>
        </div>
      </div>
      <div class="announcement-message">${htmlContent}</div>
      ${footerHTML}
    `;
    return card;
  }

  function getAppendParent() {
    if (staticCard && staticCard.parentNode) return staticCard.parentNode;
    const explicitContainer = document.getElementById('announcement-container');
    if (explicitContainer) return explicitContainer;
    return document.body;
  }

  async function loadAndRender(index, useStaticForZero = false) {
    const path = NOTICE_FILE(index);
    const response = await fetch(path);
    
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || contentType.includes("text/html")) {
      throw new Error("Not a valid notice file");
    }

    const md = await response.text();
    const { dateString, html } = parseMarkdown(md);

    if (useStaticForZero && staticMessage && staticDate) {
      staticDate.textContent = dateString;
      staticMessage.innerHTML = html;

      if (!isArchive) {
        let staticFooter = staticCard.querySelector('.announcement-footer');
        if (!staticFooter) {
          staticFooter = document.createElement('div');
          staticFooter.className = 'announcement-footer';
          staticCard.appendChild(staticFooter);
        }
        staticFooter.innerHTML = `<a href="./archive/notice.html" class="announcement-history-link">Previous</a>`;
      }
    } else {
      const card = createAnnouncementCardHTML(dateString, html);
      getAppendParent().appendChild(card);
    }
  }

  async function init() {
    try {
      await loadAndRender(0, true);
    } catch (e) {
      console.warn("Notice 0 not found");
    }

    if (isArchive) {
      for (let i = DEFAULT_MAX_NOTICE_INDEX; i >= 1; i--) {
        try {
          await loadAndRender(i, false);
        } catch (err) {
          // Continues to next index if one is missing, but skips HTML redirects
          continue; 
        }
      }
    }
  }

  init();
});