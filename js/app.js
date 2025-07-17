    function createAppItem(app) {
    const container = document.createElement('div');
    container.className = 'app-item';
  
    // Icon box
    const iconBox = document.createElement('div');
    iconBox.className = 'icon-box';
    if (app.svg) {
      fetch(`/svg/${app.svg}`)
        .then(res => res.text())
        .then(svg => {
          iconBox.innerHTML = svg;
        });
    }
  
    // Text section
    const detail = document.createElement('div');
    detail.className = 'app-details';
  
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = app.name;
  
    const links = document.createElement('div');
    links.className = 'app-links';
  
    const codeLink = document.createElement('a');
    codeLink.textContent = 'code';
    codeLink.href = app.code || '#';
    codeLink.target = '_blank';
    codeLink.className = !app.code ? 'link-gray' : (app.cur === false ? 'link-red' : 'link-green');
    links.appendChild(codeLink);
  
    if (app.site) {
      const siteLink = document.createElement('a');
      siteLink.href = app.site;
      siteLink.textContent = 'site';
      siteLink.target = '_blank';
      siteLink.className = 'link-green';
      links.appendChild(siteLink);
    }
  
    const updated = document.createElement('div');
    updated.className = 'updated';
    updated.textContent = app.update;
  
    // Description + More Link
    const descBox = document.createElement('div');
    descBox.className = 'app-description';
  
    if (app.description) {
      descBox.innerHTML = app.description;
      if (app.more) {
        const more = document.createElement('span');
        more.textContent = ' (more)';
        more.className = 'more-link';
        more.onclick = () => toggleAppModal(true, app.more);
        descBox.appendChild(more);
      }
    }
  
    detail.appendChild(title);
    detail.appendChild(links);
    detail.appendChild(updated);
    detail.appendChild(descBox);
    container.appendChild(iconBox);
    container.appendChild(detail);
    return container;
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
  
  document.addEventListener('DOMContentLoaded', renderSections);
  