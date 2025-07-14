

const STAR_SVG = (filled) => `
  <svg class="star ${filled ? 'filled' : 'empty'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <polygon points="10,1 12.5,7 19,7.5 14,12 15.5,18 10,14.5 4.5,18 6,12 1,7.5 7.5,7" />
  </svg>
`;

const reviews = [
  { author: 'Iris Chang', title: 'The Rape of Nanking: The Forgotten Holocaust of World War II', rating: 5, tags: ['History'] },
  { author: 'Southwell, Gareth', title: 'What Would Marx Do?: How the Greatest Political Theorists Would Solve Your Everyday Problems.', rating: 4, tags: ['Socialism', 'Philosophy'] },
  { author: 'Marx, Karl', title: 'The Communist Manifesto.', rating: 4, tags: ['Socialism'] },
  { author: 'Lenin, Vladimir', title: 'The State and Revolution', rating: 3, tags: ['Socialism'] },
  { author: 'Ross, Kristin', title: 'Communal Luxury: The Political Imaginary of the Paris Commune', rating: 3, tags: ['Socialism', 'History'] },
  { author: 'Freire, Paulo', title: 'Pedagogy of the Oppressed', rating: 2, tags: ['Philosophy'] },
  { author: 'Kyabgon, Traleg', title: "Karma: What It Is, What It Isn't, Why It Matters", rating: 2, tags: ['Philosophy'] },
  { author: 'Engels, Friedrich', title: 'Socialism: Utopian and Scientific', rating: 1, tags: ['Socialism'] },
  { author: 'Machiavelli, Niccolò', title: 'The Prince', rating: 1, tags: ['Philosophy'] },
  { author: 'Seneca', title: 'How to Do the Right Thing: An Ancient Guide to Treating People Fairly', rating: 1, tags: ['Philosophy'] }
];

const currentlyReading = [
  { title: "Orientalism by Edward Said", rating: 5 },
  { title: "The Emperor's Handbook by Marcus Aurelius", rating: 2 }
];

const reviewContainer = document.getElementById('reviews');
const currentlyReadingContainer = document.getElementById('currentlyReading');
const filterButtons = document.getElementById('filterButtons');
let activeTag = 'All';

function buildReviewItem(r, isFaded) {
  const div = document.createElement('div');
  div.className = 'review-item';
  if (isFaded) div.style.opacity = '0.3';

  const info = document.createElement('div');
  info.innerHTML = `${r.author}, <em>${r.title}</em>`;

  const starContainer = document.createElement('div');
  starContainer.className = 'stars';

  for (let i = 1; i <= 5; i++) {
    starContainer.innerHTML += STAR_SVG(i <= r.rating);
  }

  div.appendChild(info);
  div.appendChild(starContainer);
  return div;
}

function renderReviews() {
  reviewContainer.innerHTML = '';

  // Sort all by rating descending
  const sorted = reviews.slice().sort((a, b) => b.rating - a.rating);

  sorted.forEach(r => {
    const tags = r.tags || [];
    const isMatch = activeTag === 'All' || tags.includes(activeTag);
    const item = buildReviewItem(r, !isMatch);
    reviewContainer.appendChild(item);
  });
}

function buildCurrentlyReadingItem(book) {
  const div = document.createElement('div');
  div.className = 'review-item';

  const info = document.createElement('div');
  info.textContent = book.title;

  const starContainer = document.createElement('div');
  starContainer.className = 'stars';

  for (let i = 1; i <= 5; i++) {
    starContainer.innerHTML += STAR_SVG(i <= book.rating);
  }

  div.appendChild(info);
  div.appendChild(starContainer);
  return div;
}

// Render currently reading once
currentlyReading.forEach(book => {
  currentlyReadingContainer.appendChild(buildCurrentlyReadingItem(book));
});

// Initial review render
renderReviews();

// Filter toggle logic
filterButtons.addEventListener('click', (e) => {
  if (!e.target.classList.contains('filter-btn')) return;

  // Remove previous active state
  Array.from(filterButtons.children).forEach(btn => btn.classList.remove('active'));

  // Set new active
  e.target.classList.add('active');
  activeTag = e.target.getAttribute('data-tag');
  renderReviews();
});
