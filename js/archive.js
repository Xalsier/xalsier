class ArchiveApp {
    constructor() {
      this.currentPage = 1
      this.itemsPerPage = 9
      this.activeFilters = new Map()
      this.filteredItems = []
      this.archiveItems = []
      this.isSearching = false
      this.errors = []
      this.hasSearched = false
      this.init()
    }
  
    init() {
        this.setupEventListeners()
        this.loadItems()
        
        // Add "new" (history:Recent) filter by default
        const defaultFilterId = "history-Recent"
        this.activeFilters.set(defaultFilterId, {
          type: "history",
          name: "Recent",
          display: "Recent",
        })
      
        this.renderActiveFilters()
        this.filterItems()
        this.currentPage = 1
        this.showGallery()
        this.renderGallery()
        this.renderPagination()
      }
      
  
    setupEventListeners() {
      // Filter select boxes
      document.getElementById("metaFilter").addEventListener("change", (e) => {
        this.handleFilterChange(e.target.value, e.target)
      })
  
      document.getElementById("characterFilter").addEventListener("change", (e) => {
        this.handleFilterChange(e.target.value, e.target)
      })
  
      document.getElementById("attributeFilter").addEventListener("change", (e) => {
        this.handleFilterChange(e.target.value, e.target)
      })
  
      // Modal events
      document.getElementById("modalClose").addEventListener("click", () => {
        this.closeModal()
      })
  
      document.getElementById("imageModal").addEventListener("click", (e) => {
        if (e.target.classList.contains("modal-backdrop")) {
          this.closeModal()
        }
      })
  
      document.getElementById("viewTagsBtn").addEventListener("click", () => {
        this.toggleTags()
      })
  
      // Keyboard events
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeModal()
        }
      })
  
      // Search button
      document.getElementById("searchBtn").addEventListener("click", () => {
        this.performSearch()
      })
    }
  
    handleFilterChange(filterValue, selectElement) {
      if (!filterValue) return
  
      const [filterType, filterName] = filterValue.split(":")
      const filterId = `${filterType}-${filterName}`
  
      // Don't add duplicate filters
      if (this.activeFilters.has(filterId)) {
        selectElement.value = ""
        return
      }
  
      // Add filter
      this.activeFilters.set(filterId, {
        type: filterType,
        name: filterName,
        display: filterName,
      })
  
      // Reset select
      selectElement.value = ""
  
      // Update display
      this.renderActiveFilters()
      this.updateCharacterProfile()
    }
  
    removeFilter(filterId) {
      this.activeFilters.delete(filterId)
      this.renderActiveFilters()
      this.updateCharacterProfile()
    }
  
    renderActiveFilters() {
      const container = document.getElementById("activeFilters")
      container.innerHTML = ""
  
      this.activeFilters.forEach((filter, filterId) => {
        const bubble = document.createElement("div")
        bubble.className = `filter-bubble ${filter.type}`
        bubble.innerHTML = `
          ${filter.display}
          <button class="remove-filter" onclick="archiveApp.removeFilter('${filterId}')">&times;</button>
        `
        container.appendChild(bubble)
      })
    }
  
    loadItems() {
      this.archiveItems = ARCHIVE_ITEMS || []
      this.filteredItems = [...this.archiveItems]
    }
  
    filterItems() {
      this.filteredItems = this.archiveItems.filter((item) => {
        return Array.from(this.activeFilters.values()).every((filter) => {
          switch (filter.type) {
            case "project":
              return item.project === filter.name
            case "background":
              return item.background === filter.name
            case "filter":
              return item.filters.includes(filter.name)
            case "history":
              // For history, we'll sort later
              return true
            case "character":
              return item.characters.includes(filter.name)
            case "species":
              return item.species.includes(filter.name)
            case "gender":
              return item.gender.includes(filter.name)
            case "bodyType":
              return item.bodyType.includes(filter.name)
            case "furColor":
              return item.furColor.includes(filter.name)
            case "tag":
                // Check if item's tags array includes the filter name
                return item.tags && item.tags.includes(filter.name)
            default:
              return true
          }
        })
      })
  
      // Handle history sorting
      const historyFilter = Array.from(this.activeFilters.values()).find((f) => f.type === "history")
      if (historyFilter) {
        if (historyFilter.name === "Recent") {
          this.filteredItems.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
        } else if (historyFilter.name === "Oldest") {
          this.filteredItems.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate))
        }
      }
    }
  
    updateCharacterProfile() {
      const characterFilters = Array.from(this.activeFilters.values()).filter((f) => f.type === "character")
      const profileSection = document.getElementById("characterProfileSection")
  
      if (characterFilters.length === 1) {
        const characterName = characterFilters[0].name
        const characterInfo = characterData && characterData[characterName]
  
        if (characterInfo) {
          this.showCharacterProfile(characterInfo)
          profileSection.style.display = "block"
        } else {
          profileSection.style.display = "none"
        }
      } else {
        profileSection.style.display = "none"
      }
    }
  
    showCharacterProfile(character) {
      document.getElementById("profileImage").src = character.image
      document.getElementById("profileName").textContent = character.name
      document.getElementById("profileProject").textContent = character.project
      document.getElementById("profileDescription").textContent = character.description
      document.getElementById("profileBackground").textContent = character.background
  
      const traitsContainer = document.getElementById("profileTraits")
      traitsContainer.innerHTML = ""
      character.traits.forEach((trait) => {
        const traitTag = document.createElement("span")
        traitTag.className = "trait-tag"
        traitTag.textContent = trait
        traitsContainer.appendChild(traitTag)
      })
    }
  
    showGallery() {
      const gallerySection = document.getElementById("gallerySection")
      gallerySection.classList.add("visible")
    }
  
    renderGallery() {
      const grid = document.getElementById("galleryGrid")
      const startIndex = (this.currentPage - 1) * this.itemsPerPage
      const endIndex = startIndex + this.itemsPerPage
      const pageItems = this.filteredItems.slice(startIndex, endIndex)
  
      grid.innerHTML = ""
  
      if (pageItems.length === 0) {
        grid.innerHTML = '<div style="text-align: center; color: var(--white); padding: 2rem;">No items to display</div>'
        return
      }
  
      pageItems.forEach((item) => {
        const galleryItem = this.createGalleryItem(item)
        grid.appendChild(galleryItem)
      })
    }
  
    createGalleryItem(item) {
      const itemElement = document.createElement("div")
      itemElement.className = "gallery-item"
      itemElement.addEventListener("click", () => this.openModal(item))
  
      const imageContainer = document.createElement("div")
      imageContainer.className = "gallery-item-image"
  
      // Create image element
      const img = document.createElement("img")
      img.src = item.image
      img.alt = item.title
      
      img.onerror = () => {
        // Keep green square visible if image fails
        console.log("Image failed to load:", item.image)
      }
  
      img.onload = () => {
        const resolutionTag = `${img.naturalWidth}x${img.naturalHeight}`
        
        if (!item.tags.includes(resolutionTag)) {
          item.tags.push(resolutionTag) // Add resolution as a dynamic tag
        }
      
        console.log("Added resolution tag:", resolutionTag)
      }
      
  
      // Add image to container (green square is background)
      imageContainer.appendChild(img)
  
      const infoContainer = document.createElement("div")
      infoContainer.className = "gallery-item-info"
  
      // Get filter status
      const filterStatus = item.filters && item.filters.length > 0 ? item.filters[0] : "Unknown"
      const filterClass = `filter-${filterStatus.toLowerCase()}`
  
// Determine which subtitle to show
const allowedMeta = ["Explicit", "Scrap", "Violent"];
const subtitle =
  allowedMeta.includes(item.meta) ? item.meta : item.species || "";

infoContainer.innerHTML = `
  <div class="gallery-item-title">${item.title}</div>
  ${subtitle ? `<div class="gallery-item-filter ${filterClass}">${subtitle}</div>` : ""}
`;

  
      itemElement.appendChild(imageContainer)
      itemElement.appendChild(infoContainer)
  
      return itemElement
    }
  
    renderPagination() {
      const pagination = document.getElementById("pagination")
      const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage)
  
      if (totalPages <= 1) {
        pagination.innerHTML = ""
        return
      }
  
      let paginationHTML = ""
  
      // Previous button
      paginationHTML += `
        <button class="page-btn" ${this.currentPage === 1 ? "disabled" : ""} 
                onclick="archiveApp.changePage(${this.currentPage - 1})">
          ←
        </button>
      `
  
      // Page numbers
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
          paginationHTML += `
            <button class="page-btn ${i === this.currentPage ? "active" : ""}" 
                    onclick="archiveApp.changePage(${i})">
              ${i}
            </button>
          `
        } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
          paginationHTML += `<span class="page-btn" style="cursor: default;">...</span>`
        }
      }
  
      // Next button
      paginationHTML += `
        <button class="page-btn" ${this.currentPage === totalPages ? "disabled" : ""} 
                onclick="archiveApp.changePage(${this.currentPage + 1})">
          →
        </button>
      `
  
      pagination.innerHTML = paginationHTML
    }
  
    changePage(page) {
      const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage)
      if (page < 1 || page > totalPages) return
  
      this.currentPage = page
      this.renderGallery()
      this.renderPagination()
  
      // Scroll to gallery
      document.getElementById("galleryGrid").scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  
    openModal(item) {
      const modal = document.getElementById("imageModal")
      const modalImage = document.getElementById("modalImage")
      const modalTitle = document.getElementById("modalTitle")
      const modalDate = document.getElementById("modalDate")
      const modalMirrors = document.getElementById("modalMirrors")
      const modalTags = document.getElementById("modalTags")
      const modalImageContainer = document.querySelector(".modal-image-container")
  
      // Set content
      modalImage.src = item.image
      modalImage.alt = item.title
      modalTitle.textContent = item.title
      modalDate.textContent = new Date(item.createdDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
      
      if (item.image.startsWith("./svg/")) {
        modalImageContainer.style.background = "var(--green)"
      } else if (item.image.startsWith("./img/")) {
        modalImageContainer.style.background = "var(--bg-color)"
      } else {
        modalImageContainer.style.background = "" // fallback or default
      }

// 1. Define inline path map for known platforms
const platformIconMap = {
    twitter: "./svg/soc/x.svg",
    bluesky: "./svg/soc/blue.svg",
    instagram: "./svg/soc/insta.svg"
  };
  
  modalMirrors.innerHTML = "";
  
  item.mirrors.forEach((mirror) => {
    const link = document.createElement("a");
    link.href = mirror.url;
    link.target = "_blank";
    link.className = "mirror-link";
  
    // 2. Check if we have a known path for the platform
    const svgPath = platformIconMap[mirror.platform];
  
    // 3. Build the inner HTML
    if (svgPath) {
      const iconId = "icon"; // Assuming #icon is used in all files
  
      link.innerHTML = `
        <svg class="mirror-icon" viewBox="0 0 24 24" fill="currentColor">
          <use href="${svgPath}#${iconId}"></use>
        </svg>
        ${mirror.platform.charAt(0).toUpperCase() + mirror.platform.slice(1)}
      `;
  
      // 4. Check if the SVG actually loads — use <use>'s onerror detection via a workaround
      // Create a temporary <img> to test load
      const testImg = new Image();
      testImg.onerror = () => {
        console.warn(`SVG failed to load for ${mirror.platform}: ${svgPath}`);
      };
      testImg.src = svgPath; // this won't check #icon, but will detect missing file
  
    } else {
      // If not mapped, fallback to text-only or minimal markup
      link.textContent = mirror.platform.charAt(0).toUpperCase() + mirror.platform.slice(1);
    }
  
    modalMirrors.appendChild(link);
  });
  
  
      // Render tags (hidden initially)
      modalTags.innerHTML = ""
      item.tags.forEach((tag) => {
        const tagElement = document.createElement("span")
        tagElement.className = "tag"
        tagElement.textContent = tag
        modalTags.appendChild(tagElement)
      })
  
      // Show modal
      modal.style.display = "block"
      document.body.style.overflow = "hidden"
    }
  
    closeModal() {
      const modal = document.getElementById("imageModal")
      modal.style.display = "none"
      document.body.style.overflow = ""
  
      // Hide tags
      document.getElementById("modalTags").style.display = "none"
      document.getElementById("viewTagsBtn").textContent = "View Tags"
    }
  
    toggleTags() {
      const tagsContainer = document.getElementById("modalTags")
      const button = document.getElementById("viewTagsBtn")
  
      if (tagsContainer.style.display === "none") {
        tagsContainer.style.display = "flex"
        button.textContent = "Hide Tags"
      } else {
        tagsContainer.style.display = "none"
        button.textContent = "View Tags"
      }
    }

    async performSearch() {
        if (this.isSearching) return
      
        this.isSearching = true
        this.errors = []
      
        const searchBtn = document.getElementById("searchBtn")
        const progressContainer = document.getElementById("progressContainer")
        const progressFill = document.getElementById("progressFill")
        const progressText = document.getElementById("progressText")
        const errorDisplay = document.getElementById("errorDisplay")
      
        errorDisplay.style.display = "none"
      
        searchBtn.disabled = true
        // Don't change button text here, keep it as "Search" or your preference
        // Instead, update progressText dynamically
      
        progressContainer.style.display = "block"
        progressFill.style.width = "0%"
        
        const totalImages = ARCHIVE_ITEMS.length || 0
        let huntedImages = 0
      
        // Simulate search progress over 2 seconds (like before)
        const progressInterval = setInterval(() => {
          huntedImages += Math.ceil(totalImages / 50) // increment hunt count roughly per tick
          if (huntedImages > totalImages) huntedImages = totalImages
      
          const progressPercent = Math.min((huntedImages / totalImages) * 100, 100)
          progressFill.style.width = `${progressPercent}%`
      
          // Update text with current count
          progressText.textContent = `Hunting for ${huntedImages} out of ${totalImages} Images.`
      
          if (progressPercent >= 100) {
            clearInterval(progressInterval)
            this.completeSearch()
          }
        }, 40)
      }
      
      completeSearch() {
        const searchBtn = document.getElementById("searchBtn")
        const progressContainer = document.getElementById("progressContainer")
        const progressText = document.getElementById("progressText")
        const errorDisplay = document.getElementById("errorDisplay")
      
        this.filterItems()
        this.currentPage = 1
        this.showGallery()
        this.renderGallery()
        this.renderPagination()
        this.hasSearched = true
      
        this.validateSearch()
      
        // Show errors if any
        if (this.errors.length > 0) {
          errorDisplay.innerHTML = this.errors.join("<br>")
          errorDisplay.style.display = "block"
      
          // Change progress text on error
          progressText.textContent = "Failed to hunt."
        } else {
          // If no errors, reset progress text or keep success message
          progressText.textContent = "Hunt complete."
        }
      
        // Reset UI after short delay
        setTimeout(() => {
          progressContainer.style.display = "none"
          searchBtn.disabled = false
          searchBtn.textContent = "Search"
          this.isSearching = false
      
          // Reset progress bar and text
          document.getElementById("progressFill").style.width = "0%"
          progressText.textContent = ""
        }, 1500)
      }
      
  
    validateSearch() {
      // Check for missing src in filtered items
      const itemsWithoutSrc = this.filteredItems.filter((item) => !item.image || item.image.trim() === "")
      if (itemsWithoutSrc.length === this.filteredItems.length && this.filteredItems.length > 0) {
        this.errors.push("I could not find what you were looking for. Missing src for all images filtered.")
      }
  
      // Check for profile display error
      const characterFilters = Array.from(this.activeFilters.values()).filter((f) => f.type === "character")
      if (characterFilters.length === 1) {
        const characterName = characterFilters[0].name
        const characterInfo = characterData && characterData[characterName]
        if (!characterInfo) {
          this.errors.push("Error. Could not display profile.")
        }
      }
  
      // Additional edge cases
      if (this.filteredItems.length === 0 && this.activeFilters.size > 0) {
        this.errors.push("No results found for the selected filters.")
      }
  
      if (this.archiveItems.length === 0) {
        this.errors.push("Archive database is empty or failed to load.")
      }
  
      if (this.activeFilters.size === 0) {
        this.errors.push("No filters selected. Please select at least one filter to search.")
      }
  
      const brokenImages = this.filteredItems.filter((item) => {
        if (!item.image) return true
      
        const validPrefixes = ["./img/", "./svg/", "https://"]
        return !validPrefixes.some(prefix => item.image.startsWith(prefix))
      })      
      if (brokenImages.length > 0) {
        this.errors.push(`${brokenImages.length} items have invalid image paths.`)
      }
  
      if (this.currentPage > Math.ceil(this.filteredItems.length / this.itemsPerPage)) {
        this.errors.push("Current page exceeds available results.")
      }
  
      const duplicateFilters =
        this.activeFilters.size !== new Set(Array.from(this.activeFilters.values()).map((f) => f.name)).size
      if (duplicateFilters) {
        this.errors.push("Duplicate filters detected in selection.")
      }
  
      if (typeof characterData === "undefined") {
        this.errors.push("Character database failed to load.")
      }
  
      const invalidDates = this.filteredItems.filter((item) => isNaN(new Date(item.createdDate).getTime()))
      if (invalidDates.length > 0) {
        this.errors.push(`${invalidDates.length} items have invalid creation dates.`)
      }
  
      if (this.filteredItems.some((item) => !item.tags || !Array.isArray(item.tags))) {
        this.errors.push("Some items are missing required tag data.")
      }
    }
  }
  
  // Initialize app when DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    archiveApp = new ArchiveApp()
  })
  