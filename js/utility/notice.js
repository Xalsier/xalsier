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
      footerHTML = `
        <div class="announcement-footer">
          <a href="${historyLinkHref}" class="announcement-history-link">Previous</a>
        </div>
      `;
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

  function loadAndRender(index, useStaticForZero = false) {
    const path = NOTICE_FILE(index);
    return fetch(path)
      .then(response => {
        const contentType = response.headers.get("content-type");
        if (!response.ok || (contentType && contentType.includes("text/html"))) {
          throw new Error(`Invalid file at ${path}`);
        }
        return response.text();
      })
      .then(md => {
        const { dateString, html } = parseMarkdown(md);

        if (useStaticForZero && staticMessage && staticDate) {
          staticDate.textContent = dateString;
          staticMessage.innerHTML = html;

          let staticFooter = staticCard ? staticCard.querySelector('.announcement-footer') : null;
          
          if (!isArchive) {
              if (!staticFooter) {
                  staticFooter = document.createElement('div');
                  staticFooter.className = 'announcement-footer';
                  if (staticCard) staticCard.appendChild(staticFooter);
              }
              if (staticFooter && !staticFooter.querySelector('.announcement-history-link')) {
                  const historyLinkHref = './archive/notice.html';
                  staticFooter.innerHTML = `<a href="${historyLinkHref}" class="announcement-history-link">Previous</a>`;
              }
          } else if (staticFooter) {
              staticFooter.innerHTML = '';
          }

          return { index, usedStatic: true };
        } else {
          const card = createAnnouncementCardHTML(dateString, html);
          const parent = getAppendParent();
          parent.appendChild(card);
          return { index, usedStatic: false };
        }
      });
  }

  async function loadAllNotices() {
    try {
      await loadAndRender(0, true);
    } catch (e) {}

    if (!isArchive) return;

    for (let i = DEFAULT_MAX_NOTICE_INDEX; i >= 1; i--) {
      try {
        await loadAndRender(i, false);
      } catch (err) {
        break;
      }
    }
  }

  if (isArchive) {
    loadAllNotices();
  } else {
    loadAndRender(0, true).catch(() => {});
  }
});