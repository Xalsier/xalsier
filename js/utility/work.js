document.addEventListener('DOMContentLoaded', (event) => {
  const worksContainer = document.getElementById('works-container');

  const upcomingWorksDiv = document.createElement('div');
  upcomingWorksDiv.className = 'upcoming-works fade-in';

  const heading = document.createElement('h2');
  heading.textContent = 'Written Works';
  upcomingWorksDiv.appendChild(heading);

  const worksCardsDiv = document.createElement('div');
  worksCardsDiv.className = 'works-cards';

  worksData.forEach(work => {
    const workCard = document.createElement('div');
    workCard.className = 'work-card';

    // Check if an image path exists (not null)
    if (work.img) {
      const workCoverContainer = document.createElement('div');
      workCoverContainer.className = 'work-cover-container';

      const coverImage = document.createElement('img');
      coverImage.src = work.img;
      coverImage.alt = `Cover art for ${work.title}`;
      coverImage.className = 'work-cover-image';

      // --- New Code for Image Error Handling ---
      coverImage.onerror = function() {
        workCoverContainer.classList.add('image-error--green');
        coverImage.style.display = 'none'; // Hide the broken image icon
      };
      // -----------------------------------------
      
      workCoverContainer.appendChild(coverImage);
      workCard.appendChild(workCoverContainer); // Append cover container only if img exists
    } else {
      // If work.img is null, the workCoverContainer is never created.
      // We add a class to the card to allow the content to take up full space.
      workCard.classList.add('no-image-work');
    }

    const workContent = document.createElement('div');
    workContent.className = 'work-content';

    const workCardHeader = document.createElement('div');
    workCardHeader.className = 'work-card-header';

    const workTitle = document.createElement('h3');
    workTitle.className = 'work-title';
    workTitle.textContent = work.title;

    const workGenre = document.createElement('span');
    workGenre.className = 'work-genre';
    workGenre.textContent = work.genre;

    workCardHeader.appendChild(workTitle);
    workCardHeader.appendChild(workGenre);

    const workDescription = document.createElement('p');
    workDescription.className = 'work-description';
    workDescription.textContent = work.description;

    const workNotes = document.createElement('div');
    workNotes.className = 'work-notes';
    workNotes.textContent = work.notes;

    workContent.appendChild(workCardHeader);
    workContent.appendChild(workDescription);
    workContent.appendChild(workNotes);

    workCard.appendChild(workContent);

    worksCardsDiv.appendChild(workCard);
  });

  upcomingWorksDiv.appendChild(worksCardsDiv);

  if (worksContainer) {
    worksContainer.appendChild(upcomingWorksDiv);
  }
});