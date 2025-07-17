function createAppItem(app) {
  const siteLinkHTML = app.site
    ? `<a href="${app.site}" class="site-link link-green" target="_blank">site</a>`
    : '';

  const codeClass = !app.code
    ? 'link-gray'
    : app.cur === false
      ? 'link-red'
      : 'link-green';

  const moreLink = app.more
    ? `<span class="more-link" onclick='toggleAppModal(true, ${JSON.stringify(app.more)})'>(more)</span>`
    : '';

  // Extract <span class="status...">...</span> from the start of the description
  let statusSpan = '';
  let cleanDescription = app.description || '';
  const statusMatch = cleanDescription.match(/<span class="status[^"]*">[^<]*<\/span>/);

  if (statusMatch) {
    statusSpan = statusMatch[0]; // the full <span>...</span>
    cleanDescription = cleanDescription.replace(statusSpan, '').trimStart(); // remove it from the rest
  }

  const descriptionHTML = cleanDescription + (app.more ? moreLink : '');

  const iconBoxHTML = app.svg
    ? `<div class="svg-placeholder" data-svg="${app.svg}"></div>`
    : '';

  const html = `
    <div class="app-item">
      <div class="app-item-header">
        <div class="icon-box">${iconBoxHTML}</div>
        <div class="app-details">
          <div class="title">${app.name} ${statusSpan}</div>
          <div class="app-links">
            <a class="${codeClass}" href="${app.code || '#'}" target="_blank">code</a>
            ${siteLinkHTML}
          </div>
          <div class="updated">${app.update}</div>
        </div>
      </div>
      <div class="app-description">${descriptionHTML}</div>
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  const element = wrapper.firstElementChild;

  // Handle SVG fetching
  const svgPlaceholder = element.querySelector('.svg-placeholder');
  if (svgPlaceholder) {
    const svgFile = svgPlaceholder.dataset.svg;
    fetch(`./svg/${svgFile}`)
      .then(res => res.text())
      .then(svg => {
        svgPlaceholder.outerHTML = svg;
      })
      .catch(err => {
        console.warn(`Failed to load SVG: ${svgFile}`, err);
      });
  }

  return element;
}


function renderSections() {
  const container = document.getElementById('app-container');
  const sections = ["Featured", "Games", "Other"];

  sections.forEach(section => {
    const sec = document.createElement('div');
    sec.className = 'app-section';

    const title = document.createElement('div');
    title.className = 'app-section-title';
    title.textContent = section;

    sec.appendChild(title);

    apps
      .filter(app => app.section === section)
      .forEach(app => {
        sec.appendChild(createAppItem(app));
      });

    container.appendChild(sec);
  });
}


// 🔧 Stub or actual implementation depending on app
function toggleAppModal(open, data) {
  console.log('Modal toggle:', open, data);
  // Implement modal behavior here
}


// 👋 Kickoff when DOM is ready
document.addEventListener('DOMContentLoaded', renderSections);
