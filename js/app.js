const originalAppContainer = document.getElementById('app-container');
const projectSectionsContainer = document.createElement('div');
projectSectionsContainer.id = 'project-sections-container';
originalAppContainer.appendChild(projectSectionsContainer);

function createAppItem(app) {
  const siteLinkHTML = app.site
    ? `<a href="${app.site}" class="site-link link-green" target="_blank">site</a>`
    : '';

  const codeClass = !app.code
    ? 'link-gray'
    : app.cur === false
      ? 'link-red'
      : 'link-green';

  const codeLinkHTML = `<a class="${codeClass}" href="${app.code || '#'}" target="_blank">code</a>`;

  let statusSpan = '';
  let cleanDescription = app.description || '';
  const statusMatch = cleanDescription.match(/<span class="status[^"]*">[^<]*<\/span>/);

  if (statusMatch) {
    statusSpan = statusMatch[0];
    cleanDescription = cleanDescription.replace(statusMatch[0], '').trimStart();
  }

  const moreLink = app.more
    ? `<span class="more-link" onclick='toggleAppModal(true, ${JSON.stringify(app.more)})'>(more)</span>`
    : '';

  const descriptionHTML = cleanDescription + (app.more ? moreLink : '');

  const iconBoxHTML = app.svg
    ? `<div class="svg-placeholder" data-svg="${app.svg}"></div>`
    : '';

  const html = `
    <div class="app-item" data-project-name="${app.name}">
      <div class="app-item-header">
        <div class="icon-box">${iconBoxHTML}</div>
        <div class="app-details">
          <div class="title">${app.name} ${statusSpan}</div>
          <div class="app-links">
            ${codeLinkHTML}
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

  const svgPlaceholder = element.querySelector('.svg-placeholder');
  if (svgPlaceholder) {
    const svgFile = svgPlaceholder.dataset.svg;
    fetch(`./svg/${svgFile}`)
      .then(res => res.text())
      .then(svg => {
        svgPlaceholder.innerHTML = svg;
        const svgElement = svgPlaceholder.querySelector('svg');
        if (svgElement) {
          svgElement.setAttribute('width', '100%');
          svgElement.setAttribute('height', '100%');
          svgElement.setAttribute('viewBox', svgElement.getAttribute('viewBox') || '0 0 24 24');
          svgElement.setAttribute('fill', 'var(--bg-color)');
        }
      })
      .catch(err => {
        console.warn(`Failed to load SVG: ${svgFile}`, err);
      });
  }

  return element;
}

// Function to show a specific project section and update active tab
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.app-section').forEach(section => {
    section.classList.add('hidden');
  });

  // Show the target section
  const targetSection = document.querySelector(`.app-section[data-section-name="${sectionName}"]`);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }

  // Update active tab styling
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  const activeTab = document.querySelector(`.nav-tab[data-section="${sectionName}"]`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
}

function renderSections() {
  const container = document.getElementById('project-sections-container');
  const sections = ["Featured", "Games", "Other"];

  sections.forEach(section => {
    const sec = document.createElement('div');
    sec.className = 'app-section';
    sec.dataset.sectionName = section;

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

  // Initially show only the "Featured" section
  showSection("Featured");
}

// Function to show a specific project section and highlight a project
function showProjectDetails(projectName) {
  // First, ensure the correct section is visible
  const targetProject = apps.find(app => app.name === projectName);
  if (targetProject) {
    showSection(targetProject.section); // Show the section where the project resides
  }

  // Remove highlight from all items
  document.querySelectorAll('.app-item').forEach(item => {
    item.classList.remove('highlight');
  });

  // Highlight the target project and scroll to it
  const projectElement = document.querySelector(`.app-item[data-project-name="${projectName}"]`);
  if (projectElement) {
    projectElement.classList.add('highlight');
    projectElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function toggleAppModal(open, data) {
  console.log('App Modal toggle:', open, data);
}

document.addEventListener('DOMContentLoaded', () => {
  renderSections();

  // Add event listeners for the new navigation tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (event) => {
      const sectionName = event.target.dataset.section;
      showSection(sectionName);
    });
  });
});
