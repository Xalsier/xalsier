const DEFAULT_MAX_NOTICE_INDEX = 12;

const ANNOUNCEMENT_DATA = window.announcementData || {
  avatarSrc: './thumb/fuwa35.svg', 
  avatarTitle: "(Fuwa) Xalsier's profile on Social Media.",
  avatarAlt: 'A drawing of the character Fuwa.',
  name: 'Xalsier'
};

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body || document.getElementsByTagName('body')[0];
  const isArchive = (body && (body.dataset && body.dataset.archive === 'true')) || body.getAttribute && body.getAttribute('data-archive') === 'true';

  // --- PATH CONSTANTS (Adjusted for Archive Mode) ---
  const AVATAR_BASE_PATH = isArchive ? '..' : '.';
  const AVATAR_SRC_PATH = `${AVATAR_BASE_PATH}/thumb/fuwa35.svg`; 
  
  const NOTICE_DIR = isArchive ? '../md/not/' : './md/not/';
  const NOTICE_FILE = idx => `${NOTICE_DIR}${idx}.md`;
  // ----------------------------------------------------

  const staticAvatar = document.getElementById('announcement-avatar');
  const staticName = document.getElementById('announcement-name');
  const staticDate = document.getElementById('announcement-date');
  const staticMessage = document.getElementById('announcement-message');
  const staticCard = staticMessage ? staticMessage.closest('.announcement-card') : document.querySelector('.announcement-card');

  // Load avatar into static card
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
    // Determine the link for the "Previous" button (which links to the archive)
    const historyLinkHref = isArchive ? '../notice.html' : './notice.html';
    
    // --- Footer is ONLY rendered if NOT in archive mode ---
    let footerHTML = '';
    if (!isArchive) {
      footerHTML = `
        <div class="announcement-footer">
          <a href="${historyLinkHref}" class="announcement-history-link">Previous</a>
        </div>
      `;
    }
    // ------------------------------------------------------

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
        if (!response.ok) {
          throw new Error(`Notice file not found: ${path} (status ${response.status})`);
        }
        return response.text().then(md => {
          const { dateString, html } = parseMarkdown(md);

          if (useStaticForZero && staticMessage && staticDate) {
            staticDate.textContent = dateString;
            staticMessage.innerHTML = html;

            let staticFooter = staticCard ? staticCard.querySelector('.announcement-footer') : null;
            
            // --- Static Card Footer Logic (Only display button if NOT archive) ---
            if (!isArchive) {
                if (!staticFooter) {
                    staticFooter = document.createElement('div');
                    staticFooter.className = 'announcement-footer';
                    if (staticCard) staticCard.appendChild(staticFooter);
                }
                if (staticFooter && !staticFooter.querySelector('.announcement-history-link')) {
                    // Link to the archive page from the main page
                    const historyLinkHref = './archive/notice.html';
                    staticFooter.innerHTML = `<a href="${historyLinkHref}" class="announcement-history-link">Previous</a>`;
                }
            } else if (staticFooter) {
                // If in archive mode, ensure the static footer is empty
                staticFooter.innerHTML = '';
            }
            // -----------------------------------------------------------------------

            return { index, usedStatic: true };
          } else {
            // This renders all dynamically created cards
            const card = createAnnouncementCardHTML(dateString, html);
            const parent = getAppendParent();
            parent.appendChild(card);
            return { index, usedStatic: false };
          }
        });
      });
  }

  async function loadAllNotices() {
    // Load 0.md first (for the static card, which will now have an empty footer if isArchive is true)
    await loadAndRender(0, true).catch(() => {});

    if (!isArchive) return;

    const maxIndex = DEFAULT_MAX_NOTICE_INDEX;
    let promise = Promise.resolve();
    
    // Iterate backwards from the static maximum down to 1
    for (let i = maxIndex; i >= 1; i--) {
      // loadAndRender(i, false) uses createAnnouncementCardHTML, which correctly omits the footer.
      promise = promise.then(() => loadAndRender(i, false).catch(err => {
        console.warn(`Notice file not found: ${NOTICE_FILE(i)} - Continuing to previous index...`);
      }));
    }
  }

  async function loadStaticNotice() {
    await loadAndRender(0, true).catch(err => {
      console.error('Error fetching notice 0.md:', err);
    });
  }

  if (isArchive) {
    loadAllNotices();
  } else {
    loadStaticNotice();
  }
});