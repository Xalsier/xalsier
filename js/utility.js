

const socialLinks = [
  { href: 'https://x.com/Xalsier', src: './svg/soc/x.svg', alt: 'X / Twitter' },
  { href: 'https://instagram.com/xalsier', src: './svg/soc/insta.svg', alt: 'Instagram' },
  { href: 'https://bsky.app/profile/xalsier.bsky.social', src: './svg/soc/blue.svg', alt: 'Bluesky' },
  { href: 'https://www.youtube.com/c/Xalsier', src: './svg/soc/red.svg', alt: 'Youtube' }

];

const container = document.getElementById('socialBar');

socialLinks.forEach(link => {
  fetch(link.src)
    .then(res => res.text())
    .then(svg => {
      const wrapper = document.createElement('a');
      wrapper.href = link.href;
      wrapper.classList.add('social-icon');
      wrapper.innerHTML = svg;
      container.appendChild(wrapper);
    })
    .catch(err => console.error(`Failed to load ${link.src}`, err));
});
function toggleModal(show) {
  const modal = document.getElementById("navModal")
  modal.style.display = show ? "flex" : "none"
}

function navigate(select) {
  const value = select.value
  if (value) {
    window.location.href = value
  }
}

// Smooth scroll to sections
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    section.scrollIntoView({ behavior: "smooth" })
  }
}

// Add keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    // Assuming closeReviewModal is a function that needs to be defined elsewhere
    // Placeholder for closeReviewModal function call
    console.log("closeReviewModal function needs to be defined")
    toggleModal(false)
  }
})

// Add loading states
function showLoading(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    element.classList.add("loading")
  }
}

function hideLoading(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    element.classList.remove("loading")
  }
}

function getArchiveLength() {
  if (!Array.isArray(ARCHIVE_ITEMS)) {
    console.warn("ARCHIVE_ITEMS is not an array.");
    return 0;
  }
  return ARCHIVE_ITEMS.length;
}

function updateArchiveHeader() {
  const header = document.getElementById("archive-count");
  const count = getArchiveLength();
  header.textContent = `${count} Item${count !== 1 ? 's' : ''}`;
}

updateArchiveHeader();


class SelectUtility {
  constructor() {
    this.totalTagCount = 0
    this.calculateTotalTags()
  }

  // Calculate total number of tags across all categories
  calculateTotalTags() {
    let count = 0

    // Count meta tags
    Object.values(LIBRARY_CONFIG.meta).forEach((category) => {
      count += category.length
    })

    // Count character tags
    Object.values(LIBRARY_CONFIG.characters).forEach((category) => {
      count += category.length
    })

    // Count attribute tags
    Object.values(LIBRARY_CONFIG.attributes).forEach((category) => {
      count += category.length
    })

    this.totalTagCount = count
  }

  // Create option element
  createOption(item) {
    const option = document.createElement("option")
    option.value = item.value
    option.textContent = item.label
    if (item.selected) option.selected = true
    return option
  }

  // Create optgroup element
  createOptGroup(label, items) {
    const optgroup = document.createElement("optgroup")
    optgroup.label = label
    items.forEach((item) => {
      optgroup.appendChild(this.createOption(item))
    })
    return optgroup
  }

  // Build navigation select
  buildNavigationSelect(selectId) {
    const select = document.getElementById(selectId)
    if (!select) return

    // Clear existing options
    select.innerHTML = ""

    // Add main options
    NAVIGATION_CONFIG.main.forEach((item) => {
      select.appendChild(this.createOption(item))
    })

    // Add explore optgroup
    if (NAVIGATION_CONFIG.explore.length > 0) {
      select.appendChild(this.createOptGroup("Explore", NAVIGATION_CONFIG.explore))
    }

    // Add socials optgroup
    if (NAVIGATION_CONFIG.socials.length > 0) {
      select.appendChild(this.createOptGroup("Socials", NAVIGATION_CONFIG.socials))
    }
  }

  // Build meta filter select
  buildMetaFilter(selectId) {
    const select = document.getElementById(selectId)
    if (!select) return

    // Clear existing options
    select.innerHTML = ""

    // Add default option
    select.appendChild(this.createOption({ value: "", label: "Select Meta Filter" }))

    // Add all meta categories
    select.appendChild(this.createOptGroup("Projects", LIBRARY_CONFIG.meta.projects))
    select.appendChild(this.createOptGroup("Medium", LIBRARY_CONFIG.meta.medium))
    select.appendChild(this.createOptGroup("Art Program", LIBRARY_CONFIG.meta.artProgram))
    select.appendChild(this.createOptGroup("History", LIBRARY_CONFIG.meta.history))
    select.appendChild(this.createOptGroup("Filters", LIBRARY_CONFIG.meta.filters))
  }

  // Build character filter select
  buildCharacterFilter(selectId) {
    const select = document.getElementById(selectId)
    if (!select) return

    // Clear existing options
    select.innerHTML = ""

    // Add default option
    select.appendChild(this.createOption({ value: "", label: "Select Character" }))

    // Add all character categories
    Object.entries(LIBRARY_CONFIG.characters).forEach(([groupName, characters]) => {
      select.appendChild(this.createOptGroup(groupName, characters))
    })
  }

  // Build attribute filter select
  buildAttributeFilter(selectId) {
    const select = document.getElementById(selectId)
    if (!select) return

    // Clear existing options
    select.innerHTML = ""

    // Add default option
    select.appendChild(this.createOption({ value: "", label: "Select Attribute" }))

    // Add all attribute categories with proper labels
    const categoryLabels = {
      species: "Species",
      gender: "Gender",
      environments: "Environments",
      staticPoses: "Static Poses",
      dynamicPoses: "Dynamic Poses",
      facialExpression: "Facial Expression",
      bodyType: "Body Type",
      furColor: "Fur Color",
      eyeColor: "Eye Color",
      clothing: "Clothing",
      backgrounds: "Backgrounds",
      violentImagery: "Violent Imagery",
    }

    Object.entries(LIBRARY_CONFIG.attributes).forEach(([categoryKey, attributes]) => {
      const label = categoryLabels[categoryKey] || categoryKey
      select.appendChild(this.createOptGroup(label, attributes))
    })
  }

  // Update archive count display
  updateArchiveCount(count) {
    const archiveCountElement = document.getElementById("archive-count")
    if (archiveCountElement) {
      const plural = count === 1 ? "" : "s"
      archiveCountElement.textContent = `${count} Artwork${plural}`
    }
  }

  // Update tag count display
  updateTagCount() {
    let tagCountElement = document.getElementById("tag-count")

    // Create tag count element if it doesn't exist
    if (!tagCountElement) {
      tagCountElement = document.createElement("h2")
      tagCountElement.id = "tag-count"
      tagCountElement.className = "archive-header"

      // Insert after archive-count
      const archiveCount = document.getElementById("archive-count")
      if (archiveCount && archiveCount.parentNode) {
        archiveCount.parentNode.insertBefore(tagCountElement, archiveCount.nextSibling)
      }
    }

    const plural = this.totalTagCount === 1 ? "" : "s"
    tagCountElement.textContent = `${this.totalTagCount} Tag${plural}`
  }

  // Get all tags as a flat array (useful for search functionality)
  getAllTags() {
    const allTags = []

    // Add meta tags
    Object.values(LIBRARY_CONFIG.meta).forEach((category) => {
      allTags.push(...category)
    })

    // Add character tags
    Object.values(LIBRARY_CONFIG.characters).forEach((category) => {
      allTags.push(...category)
    })

    // Add attribute tags
    Object.values(LIBRARY_CONFIG.attributes).forEach((category) => {
      allTags.push(...category)
    })

    return allTags
  }

  // Search tags by label or value
  searchTags(query) {
    const allTags = this.getAllTags()
    const lowercaseQuery = query.toLowerCase()

    return allTags.filter(
      (tag) => tag.label.toLowerCase().includes(lowercaseQuery) || tag.value.toLowerCase().includes(lowercaseQuery),
    )
  }

  // Initialize all select boxes
  initializeAllSelects() {
    this.buildMetaFilter("metaFilter")
    this.buildCharacterFilter("characterFilter")
    this.buildAttributeFilter("attributeFilter")
    this.updateTagCount()

    // Also build navigation if it exists
    const navSelect = document.querySelector(".modal-content select")
    if (navSelect) {
      this.buildNavigationSelect(navSelect.id || "navigationSelect")
    }
  }

  // Add new tag to library (for dynamic additions)
  addTag(category, subcategory, tag) {
    if (category === "meta" && LIBRARY_CONFIG.meta[subcategory]) {
      LIBRARY_CONFIG.meta[subcategory].push(tag)
    } else if (category === "characters" && LIBRARY_CONFIG.characters[subcategory]) {
      LIBRARY_CONFIG.characters[subcategory].push(tag)
    } else if (category === "attributes" && LIBRARY_CONFIG.attributes[subcategory]) {
      LIBRARY_CONFIG.attributes[subcategory].push(tag)
    }

    this.calculateTotalTags()
    this.updateTagCount()
  }

  // Remove tag from library
  removeTag(category, subcategory, tagValue) {
    if (category === "meta" && LIBRARY_CONFIG.meta[subcategory]) {
      LIBRARY_CONFIG.meta[subcategory] = LIBRARY_CONFIG.meta[subcategory].filter((tag) => tag.value !== tagValue)
    } else if (category === "characters" && LIBRARY_CONFIG.characters[subcategory]) {
      LIBRARY_CONFIG.characters[subcategory] = LIBRARY_CONFIG.characters[subcategory].filter(
        (tag) => tag.value !== tagValue,
      )
    } else if (category === "attributes" && LIBRARY_CONFIG.attributes[subcategory]) {
      LIBRARY_CONFIG.attributes[subcategory] = LIBRARY_CONFIG.attributes[subcategory].filter(
        (tag) => tag.value !== tagValue,
      )
    }

    this.calculateTotalTags()
    this.updateTagCount()
  }
}

// Create global instance
const selectUtility = new SelectUtility()

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  selectUtility.initializeAllSelects()
})

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = { SelectUtility, LIBRARY_CONFIG, NAVIGATION_CONFIG }
}
