const NOTICE_DIR = './md/not/';
const NOTICE_FILE = idx => `${NOTICE_DIR}${idx}.md`;

const DEFAULT_MAX_NOTICE_INDEX = 15;

const ANNOUNCEMENT_DATA = window.announcementData || {
  avatarSrc: './thumb/fuwa35.svg',
  avatarTitle: "(Fuwa) Xalsier's profile on Social Media.",
  avatarAlt: 'A drawing of the character Fuwa.',
  name: 'Xalsier'
};

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body || document.getElementsByTagName('body')[0];
  const isArchive = (body && (body.dataset && body.dataset.archive === 'true')) || body.getAttribute && body.getAttribute('data-archive') === 'true';

  const staticAvatar = document.getElementById('announcement-avatar');
  const staticName = document.getElementById('announcement-name');
  const staticDate = document.getElementById('announcement-date');
  const staticMessage = document.getElementById('announcement-message');
  const staticCard = staticMessage ? staticMessage.closest('.announcement-card') : document.querySelector('.announcement-card');

  if (staticAvatar) {
    staticAvatar.src = ANNOUNCEMENT_DATA.avatarSrc;
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
      <div class="announcement-footer">
        <a href="./notice.html" class="announcement-history-link">Previous</a>
      </div>
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
            if (!staticFooter) {
                staticFooter = document.createElement('div');
                staticFooter.className = 'announcement-footer';
                if (staticCard) staticCard.appendChild(staticFooter);
            }
            if (staticFooter && !staticFooter.querySelector('.announcement-history-link')) {
                staticFooter.innerHTML = `<a href="./notice.html" class="announcement-history-link">Previous</a>`;
            }

            return { index, usedStatic: true };
          } else {
            const card = createAnnouncementCardHTML(dateString, html);
            const parent = getAppendParent();
            parent.appendChild(card);
            return { index, usedStatic: false };
          }
        });
      });
  }

  async function loadAllNotices() {
    await loadAndRender(0, true).catch(() => {});

    if (!isArchive) return;

    let maxIndex = DEFAULT_MAX_NOTICE_INDEX;
    let currentIdx = 1;
    let dynamicIndexFound = false;

    while (true) {
      try {
        const response = await fetch(NOTICE_FILE(currentIdx));
        if (!response.ok) {
          maxIndex = currentIdx - 1;
          dynamicIndexFound = true;
          break;
        }
        currentIdx++;
        if (currentIdx > DEFAULT_MAX_NOTICE_INDEX + 50) {
            break;
        }
      } catch (err) {
        maxIndex = currentIdx - 1;
        dynamicIndexFound = true;
        break;
      }
    }

    if (dynamicIndexFound === false && currentIdx > DEFAULT_MAX_NOTICE_INDEX) {
      maxIndex = DEFAULT_MAX_NOTICE_INDEX;
      console.warn('Dynamic notice index check failed to find a definitive stop; using DEFAULT_MAX_NOTICE_INDEX.');
    } else if (dynamicIndexFound === true) {
      console.info(`Dynamic notice index found: ${maxIndex}`);
    } else {
        maxIndex = DEFAULT_MAX_NOTICE_INDEX;
    }

    const finalMaxIndex = dynamicIndexFound ? maxIndex : DEFAULT_MAX_NOTICE_INDEX;

    let promise = Promise.resolve();
    for (let i = finalMaxIndex; i >= 1; i--) {
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