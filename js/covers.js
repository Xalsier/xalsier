// Piano covers data
const pianoCovers = [
    {
      id: 1,
      title: "Chopin - Waltz in A minor - B. 150 Op Posth",
      date: "28 Aug, 2020",
      youtubeId: "4eKwJTrDovc",
      url: "https://youtu.be/4eKwJTrDovc?si=UYBkz5OvBFh57Tc5",
      tags: ["Classical", "Chopin", "Waltz"],
      description: "I used this theme as the evil guy theme for a rpg campaign I did that year.",
    },
    {
      id: 2,
      title: "The Other Promise - Piano Cover",
      date: "24 March, 2020",
      youtubeId: "7F7oyfDXwEE",
      url: "https://youtu.be/7F7oyfDXwEE?si=kPswSK6Dd_4r6JDf",
      tags: ["Video Game", "Kingdom Hearts", "Soundtrack", "Fandom"],
      description: "",
    },
    {
      id: 3,
      title: "Nowhere To Run • Piano Cover",
      date: "May 1, 2020",
      youtubeId: "Z3so5Uh8LBA",
      url: "https://youtu.be/Z3so5Uh8LBA?si=1mPslAjs5PpL5rpQ",
      tags: ["FNAF", "Fandom", "Video Game"],
      description: "A powerful and dramatic musical piece",
    },
    {
      id: 4,
      title: "Eight Melodies • Piano Cover",
      date: "29 Jan, 2020",
      youtubeId: "hUrPdxanEac",
      url: "https://youtu.be/hUrPdxanEac?si=94YUOTF8qYP3kpV3",
      tags: ["Video Game", "EarthBound", "Fandom"],
      description: "The iconic melody from EarthBound/Mother series",
    },
  ]
  
  let activeFilter = "All"
  
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
    renderCovers()
    setupScrollAnimations()
    setupFilterButtons()
    addVideoLoadingStates()
  })
  
  function setupScrollAnimations() {
    const fadeElements = document.querySelectorAll(".fade-in")
    fadeElements.forEach((el) => observer.observe(el))
  }
  
  function renderCovers() {
    const coversGrid = document.getElementById("covers-grid")
    if (!coversGrid) return
  
    // Filter covers based on active filter
    const filteredCovers =
      activeFilter === "All" ? pianoCovers : pianoCovers.filter((cover) => cover.tags.includes(activeFilter))
  
    // Clear existing covers
    coversGrid.innerHTML = ""
  
    // Create cover cards
    filteredCovers.forEach((cover, index) => {
      const coverCard = createCoverCard(cover, index)
      coversGrid.appendChild(coverCard)
    })
  }
  
  function createCoverCard(cover, index) {
    const card = document.createElement("div")
    card.className = "cover-card"
    card.style.animationDelay = `${index * 0.1}s`
  
    card.innerHTML = `
      <div class="cover-header">
        <h2 class="cover-title">${cover.title}</h2>
        <div class="cover-date">${cover.date}</div>
        <div class="cover-tags">
          ${cover.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
      </div>
      
      <div class="video-container">
        <iframe 
          src="https://www.youtube.com/embed/${cover.youtubeId}?rel=0&modestbranding=1"
          title="${cover.title}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>
      </div>
      
      <div class="cover-stats">
        <span class="cover-description">${cover.description}</span>
        <a href="${cover.url}" target="_blank" class="watch-on-youtube">Watch on YouTube</a>
      </div>
    `
  
    return card
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
      activeFilter = e.target.getAttribute("data-tag")
  
      // Re-render covers with new filter
      renderCovers()
    })
  }
  
  // Utility function to extract YouTube video ID from URL
  function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }
  
  // Add keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Close any open modals
      const modal = document.getElementById("navModal")
      if (modal && modal.style.display === "flex") {
        // Assuming toggleModal is a function that needs to be defined elsewhere
        // For the sake of this example, we'll just log a message
        console.log("Close modal")
      }
    }
  })
  
  // Add loading states for videos
  function addVideoLoadingStates() {
    const videoContainers = document.querySelectorAll(".video-container")
  
    videoContainers.forEach((container) => {
      const iframe = container.querySelector("iframe")
  
      iframe.addEventListener("load", () => {
        container.classList.remove("loading")
      })
  
      // Add loading class initially
      container.classList.add("loading")
    })
  }
  