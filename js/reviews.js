// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible")
    }
  })
}, observerOptions)



// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  renderCharacterResearch()
  renderMangaComics()
  renderUnsortedBooks()
  setupScrollAnimations()
  setupFilterButtons()
  initializeQuotes()
})

function initializeQuotes() {
  console.log("Initializing quotes...", characterQuotes) // Debug log
  if (characterQuotes && characterQuotes.length > 0) {
    displayRandomQuotes()
  } else {
    console.log("No quotes found or characterQuotes is empty")
  }
}

function displayRandomQuotes() {
  const quotesContainer = document.getElementById("quotes-container")
  if (!quotesContainer) {
    console.log("Quotes container not found")
    return
  }

  console.log("Displaying quotes...", characterQuotes.length, "quotes available")

  // Clear existing quotes
  quotesContainer.innerHTML = ""

  // Determine how many quotes to show (7-8 random quotes)
  const numQuotes = Math.floor(Math.random() * 2) + 7 // 7 to 8 quotes

  // Get random quotes without repetition
  const shuffledQuotes = [...characterQuotes].sort(() => 0.5 - Math.random())
  const selectedQuotes = shuffledQuotes.slice(0, numQuotes)

  console.log("Selected quotes:", selectedQuotes.length)

  // Create quote cards
  selectedQuotes.forEach((quote, index) => {
    const quoteCard = document.createElement("div")
    quoteCard.className = "quote-card"
    quoteCard.style.animationDelay = `${index * 0.1}s`

    const quoteContent = document.createElement("div")
    quoteContent.className = `quote-text ${quote.type}`
    quoteContent.textContent = quote.text

    const quoteAttribution = document.createElement("div")
    quoteAttribution.className = "quote-attribution"
    quoteAttribution.textContent = `— ${quote.character}`

    quoteCard.appendChild(quoteContent)
    quoteCard.appendChild(quoteAttribution)
    quotesContainer.appendChild(quoteCard)
  })
}

function setupScrollAnimations() {
  const fadeElements = document.querySelectorAll(".fade-in")
  fadeElements.forEach((el) => observer.observe(el))
}

function renderCharacterResearch() {
  // Roxie sections
  renderBookList("roxie-currently-reading", characterResearchBooks.currentlyReading, "Roxie Research")
  renderBookList("roxie-want-to-read", characterResearchBooks.wantToRead, "Roxie Research")
  renderBookList("roxie-completed", characterResearchBooks.completed, "Roxie Research")
}

function renderBookList(containerId, books, characterTag) {
  const container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML = ""

  books.forEach((book) => {
    if (book.tags && book.tags.includes(characterTag)) {
      const bookElement = createBookItem(book)
      container.appendChild(bookElement)
    }
  })
}

function createBookItem(book) {
  const div = document.createElement("div")
  div.className = "book-item"
  div.onclick = () => showReviewModal(book)

  const title = document.createElement("div")
  title.className = "book-title"
  title.textContent = book.title

  const author = document.createElement("div")
  author.className = "book-author"
  author.textContent = book.author

  div.appendChild(title)
  div.appendChild(author)

  if (book.rating) {
    const rating = document.createElement("div")
    rating.className = "book-rating"
    for (let i = 1; i <= 5; i++) {
      rating.innerHTML += STAR_SVG(i <= book.rating)
    }
    div.appendChild(rating)
  }

  return div
}

function renderBookGrid(containerId, books) {
  const container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML = ""

  books.forEach((book) => {
    const bookCard = createBookCard(book)
    container.appendChild(bookCard)
  })
}

function createBookCard(book) {
  const div = document.createElement("div")
  div.className = "book-card"
  div.onclick = () => showReviewModal(book)

  const title = document.createElement("div")
  title.className = "book-title"
  title.innerHTML = `<em>${book.title}</em>`
  if (book.read) {
    title.innerHTML += ` <span class="read-date">(Read on ${book.read})</span>`
  }

  const author = document.createElement("div")
  author.className = "book-author"
  author.textContent = book.author

  const rating = document.createElement("div")
  rating.className = "book-rating"
  for (let i = 1; i <= 5; i++) {
    rating.innerHTML += STAR_SVG(i <= book.rating)
  }

  div.appendChild(title)
  div.appendChild(author)
  div.appendChild(rating)

  if (book.mini) {
    const miniQuote = document.createElement("div")
    miniQuote.className = "mini-quote"
    miniQuote.textContent = `"${book.mini}"`
    div.appendChild(miniQuote)
  }

  // Add images if they exist
  if (book.images && book.images.length > 0) {
    const imagesContainer = document.createElement("div")
    imagesContainer.className = "book-images"

    book.images.slice(0, 3).forEach((image) => {
      const img = document.createElement("img")
      img.src = image.src
      img.alt = image.caption || "Book related image"
      img.className = "book-thumbnail"
      img.onclick = (e) => {
        e.stopPropagation()
        showImageModal(image.src, image.caption)
      }
      imagesContainer.appendChild(img)
    })

    div.appendChild(imagesContainer)
  }

  return div
}

function renderMangaComics() {
  renderVolumeGrid("kh-volumes", mangaComicsData.kingdomHearts)
  renderVolumeGrid("ds-volumes", mangaComicsData.demonSlayer)
  renderVolumeGrid("be-volumes", mangaComicsData.beastars)
}

function renderVolumeGrid(containerId, seriesData) {
  const container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML = ""

  seriesData.volumes.forEach((volume) => {
    const volumeSlot = document.createElement("div")
    volumeSlot.className = `volume-slot ${volume.read ? "read" : ""}`
    volumeSlot.textContent = volume.number

    if (volume.read) {
      volumeSlot.onclick = () => showReviewModal(volume)
    }

    container.appendChild(volumeSlot)
  })
}

function renderUnsortedBooks() {
  const container = document.getElementById("unsorted-books")
  if (!container) return

  const filteredBooks =
    activeTag === "All" ? unsortedBooks : unsortedBooks.filter((book) => book.tags && book.tags.includes(activeTag))

  container.innerHTML = ""

  // Sort by rating descending
  const sortedBooks = filteredBooks.sort((a, b) => b.rating - a.rating)

  sortedBooks.forEach((book) => {
    const bookCard = createBookCard(book)
    container.appendChild(bookCard)
  })
}

function setupFilterButtons() {
  const filterButtons = document.getElementById("filterButtons")
  if (!filterButtons) return

  filterButtons.addEventListener("click", (e) => {
    if (!e.target.classList.contains("filter-btn")) return

    // Remove previous active state
    Array.from(filterButtons.children).forEach((btn) => btn.classList.remove("active"))

    // Set new active
    e.target.classList.add("active")
    activeTag = e.target.getAttribute("data-tag")
    renderUnsortedBooks()
  })
}

function showReviewModal(book) {
  const modal = document.getElementById("reviewModal")
  const content = document.getElementById("reviewContent")

  let modalHTML = ""

  // Handle manga volumes differently
  if (book.number) {
    modalHTML = `
      <h2>Volume ${book.number}</h2>
      ${book.title ? `<p><strong>Title:</strong> ${book.title}</p>` : ""}
      ${book.read_date ? `<p><strong>Read on:</strong> ${book.read_date}</p>` : ""}
    `
  } else {
    modalHTML = `
      <h2>${book.title}</h2>
      ${book.author ? `<p><strong>Author:</strong> ${book.author}</p>` : ""}
      ${book.read ? `<p><strong>Read on:</strong> ${book.read}</p>` : ""}
    `
  }

  if (book.rating) {
    modalHTML += '<div class="book-rating">'
    for (let i = 1; i <= 5; i++) {
      modalHTML += STAR_SVG(i <= book.rating)
    }
    modalHTML += "</div>"
  }

  if (book.mini) {
    modalHTML += `<div class="mini-quote">"${book.mini}"</div>`
  }

  if (book.tags) {
    modalHTML += `<p style="margin-top: 20px;"><strong>Tags:</strong> ${book.tags.join(", ")}</p>`
  }

  content.innerHTML = modalHTML
  modal.style.display = "flex"
}

function closeReviewModal() {
  const modal = document.getElementById("reviewModal")
  modal.style.display = "none"
}

// Close modal when clicking outside
document.getElementById("reviewModal").addEventListener("click", (e) => {
  if (e.target.id === "reviewModal") {
    closeReviewModal()
  }
})

function showImageModal(src, caption) {
  const modal = document.getElementById("imageModal")
  const modalImage = document.getElementById("modalImage")
  const imageCaption = document.getElementById("imageCaption")

  modalImage.src = src
  imageCaption.textContent = caption || ""
  modal.style.display = "flex"
}

function closeImageModal() {
  const modal = document.getElementById("imageModal")
  modal.style.display = "none"
}

// Close image modal when clicking outside
document.getElementById("imageModal").addEventListener("click", (e) => {
  if (e.target.id === "imageModal") {
    closeImageModal()
  }
})
