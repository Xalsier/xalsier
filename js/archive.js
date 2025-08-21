let archiveState = {
  currentPage: 1,
  itemsPerPage: 9,
  activeFilters: new Map(),
  filteredItems: [],
  archiveItems: [],
  isSearching: false,
  errors: [],
  hasSearched: false,
};

// Function to initialize the application state and event listeners
function initApp() {
  setupEventListeners();
  loadItems();
  // This loop now assumes 'Safe' is a tag
  DEFAULT_FILTERS.forEach((filterName) => {
    const filterType = filterName === "Recent" ? "history" : "tag";
    const filterId = `${filterType}-${filterName}`;
    archiveState.activeFilters.set(filterId, {
      type: filterType,
      name: filterName,
      display: filterName,
    });
  });
  renderActiveFilters();
  filterItems();
  archiveState.currentPage = 1;
  showGallery();
  renderGallery();
  renderPagination();
}

// Function to set up all event listeners
function setupEventListeners() {
  document.getElementById("metaFilter").addEventListener("change", (e) => {
    handleFilterChange(e.target.value, e.target);
  });
  document.getElementById("characterFilter").addEventListener("change", (e) => {
    handleFilterChange(e.target.value, e.target);
  });
  document.getElementById("attributeFilter").addEventListener("change", (e) => {
    handleFilterChange(e.target.value, e.target);
  });
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("imageModal").addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      closeModal();
    }
  });
  document.getElementById("viewTagsBtn").addEventListener("click", toggleTags);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  });
  document.getElementById("searchBtn").addEventListener("click", performSearch);
}

// Function to handle filter changes and update the state
function handleFilterChange(filterValue, selectElement) {
  if (!filterValue) return;
  const [filterType, filterName] = filterValue.split(":");
  const specialTypes = ["project", "background", "filter", "species", "gender", "bodyType", "furColor"];
  const newFilterType = specialTypes.includes(filterType) ? "tag" : filterType;

  const filterId = `${newFilterType}-${filterName}`;

  if (archiveState.activeFilters.has(filterId)) {
    selectElement.value = "";
    return;
  }

  archiveState.activeFilters.set(filterId, {
    type: newFilterType,
    name: filterName,
    display: filterName,
  });
  selectElement.value = "";
  renderActiveFilters();
  updateCharacterProfile();
}

// Function to remove a filter
function removeFilter(filterId) {
  archiveState.activeFilters.delete(filterId);
  renderActiveFilters();
  updateCharacterProfile();
}

// Function to render active filter bubbles
function renderActiveFilters() {
  const container = document.getElementById("activeFilters");
  container.innerHTML = "";
  archiveState.activeFilters.forEach((filter, filterId) => {
    const bubble = document.createElement("div");
    bubble.className = `filter-bubble ${filter.type}`;
    bubble.innerHTML = `${filter.display}<button class="remove-filter" onclick="removeFilter('${filterId}')">&times;</button>`;
    container.appendChild(bubble);
  });
}

// Function to load and preprocess items
function loadItems() {
  archiveState.archiveItems = ARCHIVE_ITEMS || [];

  archiveState.archiveItems.forEach(item => {
    if (!item.tags) {
      item.tags = [];
    }
    const tagsToAdd = [
      item.project,
      item.background,
      ...(item.filters || []),
      ...(item.species || []),
      ...(item.gender || []),
      ...(item.bodyType || []),
      ...(item.furColor || []),
    ].filter(tag => tag && !item.tags.includes(tag));
    item.tags.push(...tagsToAdd);

    if (!item.image || item.image.trim() === "") {
      if (!item.tags.includes("Display Error")) {
        item.tags.push("Display Error");
      }
    }
  });

  archiveState.filteredItems = [...archiveState.archiveItems];
}

// Function to filter items based on active filters
function filterItems() {
  const blacklistFilterActive = BLACKLIST_FILTERS.some(blacklistTag =>
    archiveState.activeFilters.has(`tag-${blacklistTag}`) || archiveState.activeFilters.has(`history-${blacklistTag}`)
  );

  archiveState.filteredItems = archiveState.archiveItems.filter((item) => {
    const itemHasBlacklistTag = BLACKLIST_FILTERS.some(blacklistTag => item.tags?.includes(blacklistTag));
    if (itemHasBlacklistTag && !blacklistFilterActive) {
      return false;
    }

    return Array.from(archiveState.activeFilters.values()).every((filter) => {
      switch (filter.type) {
        case "history":
          return true;
        case "character":
          return item.characters?.includes(filter.name);
        case "tag":
          return item.tags?.includes(filter.name);
        default:
          return true;
      }
    });
  });

  const historyFilter = Array.from(archiveState.activeFilters.values()).find((f) => f.type === "history");
  if (historyFilter) {
    if (historyFilter.name === "Recent") {
      archiveState.filteredItems.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    } else if (historyFilter.name === "Oldest") {
      archiveState.filteredItems.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    }
  }
}

// Function to update character profile display
function updateCharacterProfile() {
  const characterFilters = Array.from(archiveState.activeFilters.values()).filter((f) => f.type === "character");
  const profileSection = document.getElementById("characterProfileSection");
  if (characterFilters.length === 1) {
    const characterName = characterFilters[0].name;
    const characterInfo = characterData && characterData[characterName];
    if (characterInfo) {
      showCharacterProfile(characterInfo);
      profileSection.style.display = "block";
    } else {
      profileSection.style.display = "none";
    }
  } else {
    profileSection.style.display = "none";
  }
}

// Function to display character profile information
function showCharacterProfile(character) {
  document.getElementById("profileImage").src = character.image;
  document.getElementById("profileName").textContent = character.name;
  document.getElementById("profileProject").textContent = character.project;
  document.getElementById("profileDescription").textContent = character.description;
  document.getElementById("profileBackground").textContent = character.background;
  const traitsContainer = document.getElementById("profileTraits");
  traitsContainer.innerHTML = "";
  character.traits.forEach((trait) => {
    const traitTag = document.createElement("span");
    traitTag.className = "trait-tag";
    traitTag.textContent = trait;
    traitsContainer.appendChild(traitTag);
  });
}

// Function to show the gallery section
function showGallery() {
  const gallerySection = document.getElementById("gallerySection");
  gallerySection.classList.add("visible");
}

// Function to render the gallery items for the current page
function renderGallery() {
  const grid = document.getElementById("galleryGrid");
  const startIndex = (archiveState.currentPage - 1) * archiveState.itemsPerPage;
  const endIndex = startIndex + archiveState.itemsPerPage;
  const pageItems = archiveState.filteredItems.slice(startIndex, endIndex);
  grid.innerHTML = "";
  if (pageItems.length === 0) {
    grid.innerHTML = '<div style="text-align: center; color: var(--white); padding: 2rem;">No items to display</div>';
    return;
  }
  pageItems.forEach((item) => {
    const galleryItem = createGalleryItem(item);
    grid.appendChild(galleryItem);
  });
}

// Function to get the YouTube video ID from a URL
function getYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Helper function to create a single gallery item
function createGalleryItem(item) {
  const itemElement = document.createElement("div");
  itemElement.className = "gallery-item";
  itemElement.addEventListener("click", () => openModal(item));

  const imageContainer = document.createElement("div");
  imageContainer.className = "gallery-item-image";
  const isVideo = item.image && item.image.endsWith(".mp4");
  const isYouTube = item.image && /(?:youtube\.com|youtu\.be)/.test(item.image);
  let missingImageError = false;
  const safeMode = archiveState.activeFilters.has("filter-Safe");
  const isViolent = item.filters && item.filters.includes("Violent");
  const shouldBlur = safeMode && isViolent;

  const createPastelBlock = (text = "") => {
    const block = document.createElement("div");
    block.className = "gallery-thumb-placeholder";
    const hue = Math.floor(Math.random() * 360);
    block.style.backgroundColor = `hsl(${hue}, 70%, 85%)`;
    block.textContent = text || item.title || "";
    return block;
  };

  let thumbSrc = item.thumb || "";

  // New logic for YouTube thumbnails
  if (isYouTube) {
    const youtubeId = getYouTubeId(item.image);
    if (youtubeId) {
      // Use maxresdefault for best quality, fall back to hqdefault
      thumbSrc = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }
  } else if (isVideo) {
    thumbSrc = item.thumb || "./img/video-thumb.png";
  } else {
    thumbSrc = item.thumb || item.image;
  }

  if (thumbSrc) {
    const img = document.createElement("img");
    img.src = thumbSrc;
    img.alt = item.title;
    img.onerror = () => {
      console.warn("Thumbnail failed to load, falling back to placeholder.");
      missingImageError = true;
      imageContainer.innerHTML = "";
      imageContainer.appendChild(createPastelBlock());
    };
    if (shouldBlur) img.classList.add("blurred-thumbnail");
    imageContainer.appendChild(img);
  } else {
    missingImageError = true;
    imageContainer.appendChild(createPastelBlock());
  }

  const infoContainer = document.createElement("div");
  infoContainer.className = "gallery-item-info";
  const metaFilters = ["Explicit", "Scrap", "Violent"];
  const itemMetaFilter = item.filters && item.filters.find((f) => metaFilters.includes(f) && f !== "Safe");
  const primaryDisplayTag = itemMetaFilter || "";
  const secondaryDisplayTag = (item.species && item.species.length > 0) ? item.species[0] : "";
  const thirdDisplayTag = (item.tags && item.tags.includes("SVG")) ? "SVG" : "";
  const fourthDisplayTag = missingImageError ? "Missing Image" : "";

  const filterStatusForClass = item.filters && item.filters.length > 0 ? item.filters[0] : "Unknown";
  const filterClass = `filter-${filterStatusForClass.toLowerCase()}`;
  const titleElement = document.createElement("div");
  titleElement.className = "gallery-item-title";
  titleElement.textContent = item.title;
  infoContainer.appendChild(titleElement);
  if (primaryDisplayTag) {
    const tagEl = document.createElement("div");
    tagEl.className = `gallery-item-filter ${filterClass}`;
    tagEl.textContent = primaryDisplayTag;
    infoContainer.appendChild(tagEl);
  }
  if (secondaryDisplayTag) {
    const tagEl = document.createElement("div");
    tagEl.className = `gallery-item-filter filter-species`;
    tagEl.textContent = secondaryDisplayTag;
    infoContainer.appendChild(tagEl);
  }
  if (thirdDisplayTag) {
    const tagEl = document.createElement("div");
    tagEl.className = `gallery-item-filter filter-svg`;
    tagEl.textContent = thirdDisplayTag;
    infoContainer.appendChild(tagEl);
  }
  if (fourthDisplayTag) {
    const tagEl = document.createElement("div");
    tagEl.className = `gallery-item-filter filter-explicit`;
    tagEl.textContent = fourthDisplayTag;
    infoContainer.appendChild(tagEl);
  }
  itemElement.appendChild(imageContainer);
  itemElement.appendChild(infoContainer);
  return itemElement;
}

// Function to render the pagination controls
function renderPagination() {
  const pagination = document.getElementById("pagination");
  const totalPages = Math.ceil(archiveState.filteredItems.length / archiveState.itemsPerPage);
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }
  let paginationHTML = "";
  paginationHTML += `<button class="page-btn" ${archiveState.currentPage === 1 ? "disabled" : ""} onclick="changePage(${archiveState.currentPage - 1})">←</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= archiveState.currentPage - 1 && i <= archiveState.currentPage + 1)) {
      paginationHTML += `<button class="page-btn ${i === archiveState.currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</button>`;
    } else if (i === archiveState.currentPage - 2 || i === archiveState.currentPage + 2) {
      paginationHTML += `<span class="page-btn" style="cursor: default;">...</span>`;
    }
  }
  paginationHTML += `<button class="page-btn" ${archiveState.currentPage === totalPages ? "disabled" : ""} onclick="changePage(${archiveState.currentPage + 1})">→</button>`;
  pagination.innerHTML = paginationHTML;
}

// Function to change the current page
function changePage(page) {
  const totalPages = Math.ceil(archiveState.filteredItems.length / archiveState.itemsPerPage);
  if (page < 1 || page > totalPages) return;
  archiveState.currentPage = page;
  renderGallery();
  renderPagination();
  document.getElementById("galleryGrid").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Function to open the modal and display item details
function openModal(item) {
  const modal = document.getElementById("imageModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDate = document.getElementById("modalDate");
  const modalMirrors = document.getElementById("modalMirrors");
  const modalTags = document.getElementById("modalTags");
  const modalImageContainer = document.querySelector(".modal-image-container");

  modalImageContainer.innerHTML = "";
  modalImageContainer.style.background = "var(--bg-color)";

  const createPastelBlock = (text = "") => {
    const block = document.createElement("div");
    block.className = "modal-placeholder";
    const hue = Math.floor(Math.random() * 360);
    block.style.backgroundColor = `hsl(${hue}, 70%, 85%)`;
    block.style.width = "100%";
    block.style.height = "60vh";
    block.style.display = "flex";
    block.style.alignItems = "center";
    block.style.justifyContent = "center";
    block.style.fontWeight = "bold";
    block.style.fontSize = "1.5rem";
    block.textContent = text;
    return block;
  };

  function extractYouTubeID(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  }

  if (item.image && item.image.startsWith("./svg/")) {
    modalImageContainer.style.background = "var(--green)";
  } else if (item.image && item.image.startsWith("./img/")) {
    modalImageContainer.style.background = "none";
  } else {
    modalImageContainer.style.background = "";
  }

  const ytID = item.image ? extractYouTubeID(item.image) : null;
  if (ytID) {
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.width = "100%";
    wrapper.style.aspectRatio = "16 / 9";
    wrapper.style.maxHeight = "90vh";
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${ytID}`;
    iframe.style.position = "absolute";
    iframe.style.top = 0;
    iframe.style.left = 0;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.className = "modal-video-iframe";
    wrapper.appendChild(iframe);
    modalImageContainer.appendChild(wrapper);
  } else if (item.image && item.image.endsWith(".mp4")) {
    const video = document.createElement("video");
    video.src = item.image;
    video.controls = true;
    video.autoplay = true;
    video.loop = false;
    video.playsInline = true;
    video.className = "modal-video";
    modalImageContainer.appendChild(video);
  } else if (item.image && item.image.toLowerCase().includes(".svg")) {
    loadInteractiveSVG(item, modalImageContainer);
  } else if (item.image) {
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title;
    img.id = "modalImage";
    img.onerror = () => {
      modalImageContainer.innerHTML = "";
      modalImageContainer.appendChild(createPastelBlock(item.title));
    };
    modalImageContainer.appendChild(img);
  } else {
    modalImageContainer.appendChild(createPastelBlock(item.title));
  }

  modalTitle.textContent = item.title;
  modalDate.textContent = new Date(item.createdDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const platformIconMap = {
    twitter: "./svg/soc/x.svg",
    bluesky: "./svg/soc/blue.svg",
    instagram: "./svg/soc/insta.svg",
  };
  modalMirrors.innerHTML = "";
  item.mirrors.forEach(async (mirror) => {
    const link = document.createElement("a");
    link.href = mirror.url;
    link.target = "_blank";
    link.className = "mirror-link";
    link.textContent = mirror.platform.charAt(0).toUpperCase() + mirror.platform.slice(1);
    const svgPath = platformIconMap[mirror.platform];
    if (svgPath) {
      try {
        const response = await fetch(svgPath);
        if (response.ok) {
          const svgText = await response.text();
          const iconWrapper = document.createElement('div');
          iconWrapper.className = 'mirror-icon-wrapper';
          iconWrapper.innerHTML = svgText;
          link.prepend(iconWrapper);
        }
      } catch (error) {
        console.error(`Failed to load SVG icon for ${mirror.platform}:`, error);
      }
    }
    modalMirrors.appendChild(link);
  });
  modalTags.innerHTML = "";
  item.tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.textContent = tag;
    modalTags.appendChild(tagElement);
  });
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Function to load and handle interactive SVGs
async function loadInteractiveSVG(item, container) {
  try {
    const response = await fetch(item.image);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const svgText = await response.text();
    console.log('Successfully fetched SVG content.');
    container.innerHTML = svgText;
    const svgElement = container.querySelector('svg');
    if (!svgElement) {
      console.error('No <svg> element found in the fetched content.');
      throw new Error('No SVG element found.');
    }
    svgElement.id = 'modalSVG';
    svgElement.style.maxWidth = '100%';
    svgElement.style.height = 'auto';
    svgElement.style.maxHeight = '90vh';
    if (item.layer) {
      const layerElement = svgElement.querySelector(`#${item.layer}`);
      if (layerElement) {
        console.log(`Interactive layer found: #${item.layer}`);
        layerElement.style.cursor = 'pointer';
        layerElement.classList.add('interactive-layer');
        layerElement.addEventListener('click', (e) => {
          e.stopPropagation();
          animateLayer(layerElement);
        });
        layerElement.addEventListener('mouseenter', () => {
          layerElement.style.filter = 'brightness(1.2)';
        });
        layerElement.addEventListener('mouseleave', () => {
          layerElement.style.filter = 'brightness(1)';
        });
      } else {
        console.warn(`Layer #${item.layer} not found inside SVG`);
      }
    }
    console.log('Interactive SVG loaded and ready.');
  } catch (error) {
    console.error('Failed to load interactive SVG:', error);
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.title;
    img.id = 'modalImage';
    container.innerHTML = '';
    container.appendChild(img);
  }
}

// Function to animate a layer within an SVG
function animateLayer(layerElement) {
  if (layerElement.classList.contains("animating")) {
    return;
  }
  layerElement.classList.add("animating");
  layerElement.style.transition = "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease-out";
  layerElement.style.transform = "translateY(-50px) scale(1.1)";
  layerElement.style.opacity = "0";
  setTimeout(() => {
    layerElement.style.display = "none";
    layerElement.style.pointerEvents = "none";
  }, 800);
}

// Function to close the modal
function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
  document.body.style.overflow = "";
  document.getElementById("modalTags").style.display = "none";
  document.getElementById("viewTagsBtn").textContent = "View Tags";
}

// Function to toggle the visibility of modal tags
function toggleTags() {
  const tagsContainer = document.getElementById("modalTags");
  const button = document.getElementById("viewTagsBtn");
  if (tagsContainer.style.display === "none") {
    tagsContainer.style.display = "flex";
    button.textContent = "Hide Tags";
  } else {
    tagsContainer.style.display = "none";
    button.textContent = "View Tags";
  }
}

// Function to perform a search with a loading state
async function performSearch() {
  if (archiveState.isSearching) return;
  archiveState.isSearching = true;
  archiveState.errors = [];
  const searchBtn = document.getElementById("searchBtn");
  const progressContainer = document.getElementById("progressContainer");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const errorDisplay = document.getElementById("errorDisplay");
  errorDisplay.style.display = "none";
  searchBtn.disabled = true;
  progressContainer.style.display = "block";
  progressFill.style.width = "0%";
  const totalImages = ARCHIVE_ITEMS.length || 0;
  let huntedImages = 0;
  const progressInterval = setInterval(() => {
    huntedImages += Math.ceil(totalImages / 50);
    if (huntedImages > totalImages) huntedImages = totalImages;
    const progressPercent = Math.min((huntedImages / totalImages) * 100, 100);
    progressFill.style.width = `${progressPercent}%`;
    progressText.textContent = `Hunting for ${huntedImages} out of ${totalImages} Images.`;
    if (progressPercent >= 100) {
      clearInterval(progressInterval);
      completeSearch();
    }
  }, 40);
}

// Function to complete the search and update the display
function completeSearch() {
  const searchBtn = document.getElementById("searchBtn");
  const progressContainer = document.getElementById("progressContainer");
  const progressText = document.getElementById("progressText");
  filterItems();
  archiveState.currentPage = 1;
  showGallery();
  renderGallery();
  renderPagination();
  archiveState.hasSearched = true;
  validateSearch();
  setTimeout(() => {
    progressContainer.style.display = "none";
    searchBtn.disabled = false;
    searchBtn.textContent = "Search";
    archiveState.isSearching = false;
    document.getElementById("progressFill").style.width = "0%";
    progressText.textContent = "";
  }, 1500);
}

// Function to validate the search results
function validateSearch() {
  archiveState.errors = [];
  const itemsWithoutSrc = archiveState.filteredItems.filter((item) => !item.image || item.image.trim() === "");
  if (itemsWithoutSrc.length === archiveState.filteredItems.length && archiveState.filteredItems.length > 0) {
    archiveState.errors.push("I could not find what you were looking for. Missing src for all images filtered.");
  }
  const characterFilters = Array.from(archiveState.activeFilters.values()).filter((f) => f.type === "character");
  if (characterFilters.length === 1) {
    const characterName = characterFilters[0].name;
    const characterInfo = characterData && characterData[characterName];
    if (!characterInfo) {
      archiveState.errors.push("Error. Could not display profile.");
    }
  }
  if (archiveState.filteredItems.length === 0 && archiveState.activeFilters.size > 0) {
    archiveState.errors.push("No results found for the selected filters.");
  }
  if (ARCHIVE_ITEMS.length === 0) {
    archiveState.errors.push("Archive database is empty or failed to load.");
  }
  if (archiveState.activeFilters.size === 0) {
    archiveState.errors.push("No filters selected. Please select at least one filter to search.");
  }
  const brokenImages = archiveState.filteredItems.filter((item) => {
    if (!item.image) return true;
    const validPrefixes = ["./img/", "./svg/", "https://"];
    return !validPrefixes.some((prefix) => item.image.startsWith(prefix));
  });
  if (brokenImages.length > 0) {
    archiveState.errors.push(`${brokenImages.length} items have invalid image paths.`);
  }
  if (archiveState.currentPage > Math.ceil(archiveState.filteredItems.length / archiveState.itemsPerPage)) {
    archiveState.errors.push("Current page exceeds available results.");
  }
  const duplicateFilters =
    archiveState.activeFilters.size !== new Set(Array.from(archiveState.activeFilters.values()).map((f) => f.name)).size;
  if (duplicateFilters) {
    archiveState.errors.push("Duplicate filters detected in selection.");
  }
  if (typeof characterData === "undefined") {
    archiveState.errors.push("Character database failed to load.");
  }
  const invalidDates = archiveState.filteredItems.filter((item) => isNaN(new Date(item.createdDate).getTime()));
  if (invalidDates.length > 0) {
    archiveState.errors.push(`${invalidDates.length} items have invalid creation dates.`);
  }
  if (archiveState.filteredItems.some((item) => !item.tags || !Array.isArray(item.tags))) {
    archiveState.errors.push("Some items are missing required tag data.");
  }
}

// Kick off the application when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});