document.addEventListener('DOMContentLoaded', (event) => {
  const worksContainer = document.getElementById('works-container');
  const upcomingWorksDiv = document.createElement('div');
  upcomingWorksDiv.className = 'upcoming-works fade-in';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Written Works';
  upcomingWorksDiv.appendChild(heading);

  // Helper to render sections
  const renderSection = (title, dataArray) => {
    const section = document.createElement('div');
    section.innerHTML = `<h3>${title}</h3>            <br>`;
    const cardsDiv = document.createElement('div');
    cardsDiv.className = 'works-cards';

    dataArray.forEach(work => {
      const workCard = document.createElement('div');
      workCard.className = 'work-card';
      
      // Image Handling
      if (work.img) {
        workCard.innerHTML = `<div class="work-cover-container"><img src="${work.img}" alt="${work.title}" class="work-cover-image" onerror="this.parentElement.classList.add('image-error--green'); this.style.display='none';"></div>`;
      } else {
        workCard.classList.add('no-image-work');
      }

      // Content Injection
      workCard.insertAdjacentHTML('beforeend', `
        <div class="work-content">
          <div class="work-card-header">
            <h3 class="work-title">${work.title}</h3>
          </div>
          <p class="work-description">${work.description}</p>
          <div class="work-notes">${work.notes}</div>
        </div>
      `);
      cardsDiv.appendChild(workCard);
    });

    section.appendChild(cardsDiv);
    upcomingWorksDiv.appendChild(section);
  };

  // Render the two categories
  renderSection('Novels', novels);
  renderSection('Short Stories', shortStories);

  if (worksContainer) worksContainer.appendChild(upcomingWorksDiv);
});