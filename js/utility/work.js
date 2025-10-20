document.addEventListener('DOMContentLoaded', (event) => {
  // Define your stories in a JavaScript array
  // worksData is assumed to be defined elsewhere and available in scope
  // Example structure:
  /*
  const worksData = [
      { title: 'The Shadow Chronicle', genre: 'Fantasy', description: 'A tale of forgotten magic.', notes: 'Drafting in progress.', img: 'path/to/cover1.jpg' },
      { title: 'Silent Cosmos', genre: 'Sci-Fi', description: 'Exploring the void.', notes: 'Outline complete.', img: null }
  ];
  */

  // Get the container where the cards will be built
  const worksContainer = document.getElementById('works-container');

  // Create the main works section
  const upcomingWorksDiv = document.createElement('div');
  upcomingWorksDiv.className = 'upcoming-works fade-in';

  const heading = document.createElement('h2');
  heading.textContent = 'Written Works';
  upcomingWorksDiv.appendChild(heading);

  // Create the container for all the cards
  const worksCardsDiv = document.createElement('div');
  worksCardsDiv.className = 'works-cards';

  // Loop through the data and build each card
  worksData.forEach(work => {
    // Create the main card container
    const workCard = document.createElement('div');
    workCard.className = 'work-card';

    // --- NEW: Cover Art Rectangle (Left Side) ---
    const workCoverContainer = document.createElement('div');
    workCoverContainer.className = 'work-cover-container';

    if (work.img) {
      const coverImage = document.createElement('img');
      coverImage.src = work.img;
      coverImage.alt = `Cover art for ${work.title}`;
      coverImage.className = 'work-cover-image';
      workCoverContainer.appendChild(coverImage);
    } else {
      // Add a class for the green background when no image is present
      workCoverContainer.classList.add('no-cover-art');
    }

    // Prepend the cover container to the main card
    workCard.appendChild(workCoverContainer);
    // ---------------------------------------------

    // Create a container for the textual content to easily manage layout
    const workContent = document.createElement('div');
    workContent.className = 'work-content';

    // Create the header section
    const workCardHeader = document.createElement('div');
    workCardHeader.className = 'work-card-header';

    const workTitle = document.createElement('h3');
    workTitle.className = 'work-title';
    workTitle.textContent = work.title;

    const workGenre = document.createElement('span');
    workGenre.className = 'work-genre';
    workGenre.textContent = work.genre;

    // Append title and genre to the header
    workCardHeader.appendChild(workTitle);
    workCardHeader.appendChild(workGenre);

    // Create the description and notes
    const workDescription = document.createElement('p');
    workDescription.className = 'work-description';
    workDescription.textContent = work.description;

    const workNotes = document.createElement('div');
    workNotes.className = 'work-notes';
    workNotes.textContent = work.notes;

    // Append content parts to the content container
    workContent.appendChild(workCardHeader);
    workContent.appendChild(workDescription);
    workContent.appendChild(workNotes);

    // Append the content container to the main card
    workCard.appendChild(workContent);

    // Append the complete card to the cards container
    worksCardsDiv.appendChild(workCard);
  });

  // Append the card container to the main works section
  upcomingWorksDiv.appendChild(worksCardsDiv);

  // Append the whole structure to the HTML
  if (worksContainer) {
    worksContainer.appendChild(upcomingWorksDiv);
  }
});