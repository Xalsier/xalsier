const OPACITY_DIFFERENTIAL = 0.1; // Global variable for opacity differential
function parseDateRange(dateString) {
  const parts = dateString.split(' - ');
  let startDate = null;
  let endDate = null;
  if (parts[0]) {
    startDate = new Date(parts[0].trim());
  }
  if (parts[1] && parts[1].toLowerCase() !== 'present') {
    endDate = new Date(parts[1].trim());
  } else if (parts[1] && parts[1].toLowerCase() === 'present') {
    endDate = new Date(); // Current date for "Present"
  } else {
    endDate = startDate; // If only one date, assume it's a point in time
  }
  if (isNaN(startDate.getTime())) startDate = null;
  if (isNaN(endDate.getTime())) endDate = null;
  return { startDate, endDate };
}
function processProjects(rawApps) {
  const processed = [];
  const projectGroups = {}; // To group by name for potential future versioning
  rawApps.forEach(app => {
    const { startDate, endDate } = parseDateRange(app.update);
    const projectData = {
      ...app,
      startDate,
      endDate,
      versionNum: 1,
      totalVersions: 1,
      opacity: 1,
    };
    if (!projectGroups[app.name]) {
      projectGroups[app.name] = [];
    }
    projectGroups[app.name].push(projectData);
    processed.push(projectData);
  });
  return processed;
}
const processedApps = processProjects(apps);
function renderInfographic() {
  const container = document.getElementById('timeline-infographic');
  if (!container) return;
  container.innerHTML = '';
  const timelineProjects = processedApps.filter(p => p.startDate && p.endDate && !p.hideOnTimeline);
  if (timelineProjects.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--white);">No projects with valid timelines to display.</p>';
    return;
  }
  let minDate = new Date(Math.min(...timelineProjects.map(p => p.startDate.getTime())));
  let maxDate = new Date(Math.max(...timelineProjects.map(p => p.endDate.getTime())));
  minDate.setMonth(minDate.getMonth() - 3);
  maxDate.setMonth(maxDate.getMonth() + 3);
  const svgWidth = container.clientWidth;
  const isMobile = window.innerWidth <= 768;
  const dynamicMarginLeft = isMobile ? 50 : 180;
  const margin = { top: 30, right: 20, bottom: 30, left: dynamicMarginLeft };
  const barHeight = 20;
  const barSpacing = 45;
  const chartHeight = (timelineProjects.length * barSpacing) - (barSpacing - barHeight) + 10;
  const svgHeight = margin.top + chartHeight + margin.bottom;
  const chartWidth = svgWidth - margin.left - margin.right;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);
  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  svg.style.overflow = 'visible';
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);
  const xScale = (date) => {
    return (date.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime()) * chartWidth;
  };
  const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxisLine.setAttribute('x1', 0);
  xAxisLine.setAttribute('y1', chartHeight);
  xAxisLine.setAttribute('x2', chartWidth);
  xAxisLine.setAttribute('y2', chartHeight);
  xAxisLine.setAttribute('class', 'timeline-axis-line');
  g.appendChild(xAxisLine);
  if (!isMobile) {
    let currentYear = minDate.getFullYear();
    while (currentYear <= maxDate.getFullYear()) {
      const tickDate = new Date(currentYear, 0, 1);
      const xPos = xScale(tickDate);
      if (xPos >= 0 && xPos <= chartWidth) {
        const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tickLine.setAttribute('x1', xPos);
        tickLine.setAttribute('y1', chartHeight);
        tickLine.setAttribute('x2', xPos);
        tickLine.setAttribute('y2', chartHeight + 6);
        tickLine.setAttribute('class', 'timeline-tick-line');
        g.appendChild(tickLine);
        const tickLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tickLabel.setAttribute('x', xPos);
        tickLabel.setAttribute('y', chartHeight + 20);
        tickLabel.setAttribute('text-anchor', 'middle');
        tickLabel.setAttribute('class', 'timeline-label');
        tickLabel.textContent = currentYear;
        g.appendChild(tickLabel);
      }
      currentYear++;
    }
  }
  timelineProjects.forEach((project, index) => {
    const yPos = index * barSpacing;
    const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    labelGroup.setAttribute('class', 'project-label-group');
    labelGroup.setAttribute('transform', `translate(0, ${yPos + barHeight / 2})`);
    labelGroup.addEventListener('click', () => showProjectDetails(project.name));
    g.appendChild(labelGroup);
    const iconSquareSize = 24;
    const iconSquare = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    iconSquare.setAttribute('x', -iconSquareSize - 10);
    iconSquare.setAttribute('y', -iconSquareSize / 2);
    iconSquare.setAttribute('width', iconSquareSize);
    iconSquare.setAttribute('height', iconSquareSize);
    iconSquare.setAttribute('rx', 4);
    iconSquare.setAttribute('ry', 4);
    iconSquare.setAttribute('class', 'project-icon-square');
    labelGroup.appendChild(iconSquare);
    if (project.svg) {
      fetch(`./svg/${project.svg}`)
        .then(res => res.text())
        .then(svgContent => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(svgContent, 'image/svg+xml');
          const svgElement = doc.documentElement;
          svgElement.setAttribute('x', -iconSquareSize - 10 + 2);
          svgElement.setAttribute('y', -iconSquareSize / 2 + 2);
          svgElement.setAttribute('width', iconSquareSize - 4);
          svgElement.setAttribute('height', iconSquareSize - 4);
          svgElement.setAttribute('class', 'project-icon-svg');
          svgElement.setAttribute('viewBox', svgElement.getAttribute('viewBox') || '0 0 24 24');
          svgElement.setAttribute('fill', 'var(--bg-color)');
          labelGroup.appendChild(svgElement);
        })
        .catch(err => {
          console.warn(`Failed to load SVG for infographic: ${project.svg}`, err);
        });
    }
    if (!isMobile) {
      const textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textLabel.setAttribute('x', -iconSquareSize - 10 - 5);
      textLabel.setAttribute('y', 0);
      textLabel.setAttribute('dy', '0.35em');
      textLabel.setAttribute('text-anchor', 'end');
      textLabel.setAttribute('class', 'project-label-text');
      textLabel.textContent = project.name;
      labelGroup.appendChild(textLabel);
    }
    const barX = xScale(project.startDate);
    const barWidth = xScale(project.endDate) - barX;
    const projectBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    projectBar.setAttribute('x', barX);
    projectBar.setAttribute('y', yPos);
    projectBar.setAttribute('width', barWidth);
    projectBar.setAttribute('height', barHeight);
    projectBar.setAttribute('class', 'project-bar');
    projectBar.setAttribute('opacity', project.opacity);
    g.appendChild(projectBar);
    if (project.description && project.description.includes('<span class="status">Abandoned</span>')) {
      const indicatorWidth = 15;
      const indicatorX = xScale(project.endDate); 

      const abandonedIndicator = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      abandonedIndicator.setAttribute('x', indicatorX);
      abandonedIndicator.setAttribute('y', yPos);
      abandonedIndicator.setAttribute('width', indicatorWidth);
      abandonedIndicator.setAttribute('height', barHeight);
      abandonedIndicator.setAttribute('class', 'abandoned-indicator');
      g.appendChild(abandonedIndicator);
    }
  });
  container.appendChild(svg);
}