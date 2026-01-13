const MaxRating = 10;
let archiveState = {
  currentPage: 1,
  itemsPerPage: 9,
  activeFilters: new Map(),
  filteredItems: [],
  archiveItems: [],
  isSearching: false,
  errors: [],
  hasSearched: false,
  showWarning: false,
};
function initApp() {
  setupEventListeners();
  loadItems();
  DEFAULT_FILTERS.forEach((filterName) => {
    // --- FIX APPLIED HERE ---
    // The filter type is "history" if the name is "Recent", "Rating", or "Oldest". Otherwise, it defaults to "tag".
    const isHistoryFilter = ["Recent", "Rating", "Oldest"].includes(filterName);
    const filterType = isHistoryFilter ? "history" : "tag";
    // ------------------------
    
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
  updateCharacterProfile();
}

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
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  });
}

// Function to handle filter changes and update the state
function handleFilterChange(filterValue, selectElement) {
  if (!filterValue) return;
  const [filterType, filterName] = filterValue.split(":");
  const specialTypes = ["project", "background", "filter", "species", "gender", "bodyType", "furColor"];
  const newFilterType = specialTypes.includes(filterType) ? "tag" : filterType;

  // Check for the Explicit tag and show warning if needed
  if (filterName === "Explicit" && !archiveState.showWarning) {
    const warningModal = document.getElementById("warningModal");
    warningModal.classList.remove("hidden");
    // Add event listener to "Okay" button inside the modal to handle the explicit filter
    document.getElementById("warningOkayBtn").addEventListener("click", () => {
      archiveState.showWarning = true;
      warningModal.classList.add("hidden");
      // Re-run the filter change to apply the "Explicit" filter
      handleFilterChange(filterValue, selectElement);
      performSearch();
    }, { once: true });
    // Add event listener for "Leave" button to refresh the page
    document.getElementById("warningLeaveBtn").addEventListener("click", () => {
      window.location.reload();
    }, { once: true });
    selectElement.value = ""; // Clear the selection
    return; // Stop further execution of this function
  }

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

  archiveState.archiveItems.forEach((item, index) => { // Added 'index' for testing
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

    // --- START: NEW RATING LOGIC & TEST RATING ---
    
    // TEMPORARY TEST: Set a high rating on the first item for easy sorting test
    if (index === 0) {
      item.rating = 3; // Set the first item to rating 3 for testing
    }
    
    if (!item.image || item.image.trim() === "") {
      // All items that have a null image have a rating of 0.
      item.rating = 0;
      if (!item.tags.includes("Display Error")) {
        item.tags.push("Display Error");
      }
    } else {
      // If an image exists but does not have a rating, it will have a rating of 1.
      if (typeof item.rating === 'undefined' || item.rating === null) {
        item.rating = 1;
      } else {
        // Ensure explicit rating is a number and clamped between 0 and 5.
        // The test rating of 3 will be used here.
        item.rating = Math.max(0, Math.min(MaxRating, Number(item.rating)));
      }
    }
    // --- END: NEW RATING LOGIC & TEST RATING ---
  });

  archiveState.filteredItems = [...archiveState.archiveItems];
}

// Function to filter items based on active filters
function filterItems() {
  // Grab the set of blacklist filters that are actually active
  const activeBlacklistFilters = BLACKLIST_FILTERS.filter(blacklistTag =>
    archiveState.activeFilters.has(`tag-${blacklistTag}`) || archiveState.activeFilters.has(`history-${blacklistTag}`)
  );

  archiveState.filteredItems = archiveState.archiveItems.filter((item) => {
    // Check which blacklist tags this item has
    const itemBlacklistTags = BLACKLIST_FILTERS.filter(tag => item.tags?.includes(tag));

    if (itemBlacklistTags.length > 0) {
      // If the item has blacklist tags, only let it through if ALL its blacklist tags are currently active
      const allowed = itemBlacklistTags.every(tag =>
        activeBlacklistFilters.includes(tag)
      );
      if (!allowed) return false;
    }

    // Apply all other active filters
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

  // Sort if a history filter is active
  const historyFilter = Array.from(archiveState.activeFilters.values()).find((f) => f.type === "history");
  if (historyFilter) {
    if (historyFilter.name === "Recent") {
      archiveState.filteredItems.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    } else if (historyFilter.name === "Rating") {
      // --- START: COMBINED RATING AND RECENT SORT LOGIC ---
      archiveState.filteredItems.sort((a, b) => {
        // 1. Sort by Rating (High to Low)
        const ratingDifference = b.rating - a.rating;

        if (ratingDifference !== 0) {
          return ratingDifference;
        }

        // 2. Tie-breaker: If ratings are the same, sort by date (Recent/Newest first)
        return new Date(b.createdDate) - new Date(a.createdDate);
      });
      // --- END: COMBINED RATING AND RECENT SORT LOGIC ---
    } else if (historyFilter.name === "Oldest") {
      archiveState.filteredItems.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    }
  }
}

// Function to show the gallery section
function showGallery() {
  const gallerySection = document.getElementById("gallerySection");
  gallerySection.classList.add("visible");
}

// Function to handle lazy loading of images
function handleLazyLoading() {
  const lazyImages = document.querySelectorAll(".lazy-load");

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src; // Set the image source
        observer.unobserve(img); // Stop observing the image
      }
    });
  }, {
    rootMargin: "0px 0px 100px 0px", // Load images 100px before they enter the viewport
    threshold: 1.00
  });

  lazyImages.forEach((img) => {
    observer.observe(img);
  });
}

// Update renderGallery to call the new lazy loading function
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

  // Call the lazy loading handler after the gallery is rendered
  handleLazyLoading();
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

// Add this new helper function at the top of your script or near the `createGalleryItem` function.
// Function to fetch an SVG, remove animation tags, and return a static img element with a data URL.
async function createStaticSvgElement(url, altText) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const svgText = await response.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    const svgElement = svgDoc.querySelector('svg');

    if (svgElement) {
      // Find all animation elements and remove them
      const animateElements = svgElement.querySelectorAll('animate, animateMotion, animateTransform, animateColor, animateTransform, mpath');
      animateElements.forEach(el => el.parentNode.removeChild(el));

      // Re-serialize the SVG without animations
      const modifiedSvgText = new XMLSerializer().serializeToString(svgDoc);
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(modifiedSvgText)}`;

      const img = document.createElement("img");
      img.src = dataUrl;
      img.alt = altText || "SVG thumbnail";
      return img;
    } else {
      throw new Error('No SVG element found in the fetched content.');
    }
  } catch (error) {
    console.error('Failed to create static SVG element:', error);
    // Fallback to a placeholder in case of a failure
    return null;
  }
}

// Function to create a single gallery item with SVG error handling
function createGalleryItem(item) {
  const itemElement = document.createElement("div");
  itemElement.className = "gallery-item";
  itemElement.addEventListener("click", () => openModal(item));
  const imageContainer = document.createElement("div");
  imageContainer.className = "gallery-item-image";
  const isVideo = item.image && item.image.endsWith(".mp4");
  const isYouTube = item.image && /(?:youtube\.com|youtu\.be)/.test(item.image);
  const isSvg = item.image && item.image.toLowerCase().endsWith(".svg");
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

  if (isYouTube) {
    const youtubeId = getYouTubeId(item.image);
    if (youtubeId) {
      // Use maxresdefault for best quality, fall back to hqdefault
      thumbSrc = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }
    const img = document.createElement("img");
    img.dataset.src = thumbSrc; // Use data-src for lazy loading
    img.alt = item.title;
    img.classList.add("lazy-load"); // Add lazy-load class
    img.onerror = () => {
      console.warn("Thumbnail failed to load, falling back to placeholder.");
      missingImageError = true;
      imageContainer.innerHTML = "";
      imageContainer.appendChild(createPastelBlock());
    };
    img.onload = () => {
      img.classList.add("loaded"); // Add loaded class on load
    };
    if (shouldBlur) img.classList.add("blurred-thumbnail");
    imageContainer.appendChild(img);
  } else if (isVideo) {
    thumbSrc = item.thumb || "./img/video-thumb.png";
    const img = document.createElement("img");
    img.dataset.src = thumbSrc; // Use data-src for lazy loading
    img.alt = item.title;
    img.classList.add("lazy-load"); // Add lazy-load class
    img.onerror = () => {
      console.warn("Thumbnail failed to load, falling back to placeholder.");
      missingImageError = true;
      imageContainer.innerHTML = "";
      imageContainer.appendChild(createPastelBlock());
    };
    img.onload = () => {
      img.classList.add("loaded"); // Add loaded class on load
    };
    if (shouldBlur) img.classList.add("blurred-thumbnail");
    imageContainer.appendChild(img);
  } else if (isSvg) {
    // Placeholder while trying to fetch SVG
    const placeholder = createPastelBlock();
    imageContainer.appendChild(placeholder);

    createStaticSvgElement(item.image, item.title)
      .then(staticImg => {
        if (staticImg) {
          imageContainer.innerHTML = "";
          if (shouldBlur) staticImg.classList.add("blurred-thumbnail");
          // Add lazy-load class for the fade-in effect
          staticImg.classList.add("lazy-load");
          // The onload event for a data URL fires immediately after appending
          staticImg.onload = () => {
            staticImg.classList.add("loaded"); // Add loaded class on load
          };
          // **CRITICAL FIX:** Do NOT remove the src attribute.
          // The data URL is already the image source.
          imageContainer.appendChild(staticImg);
        } else {
          // SVG parsed but was empty/bad
          missingImageError = true;
          const msg = `SVG thumbnail returned empty for: ${item.title} (${item.image})`;
          console.error(msg);
          archiveState.errors.push(msg);
          imageContainer.innerHTML = "";
          imageContainer.appendChild(createPastelBlock("SVG failed"));
        }
      })
      .catch(async error => {
        missingImageError = true;
        console.error(`Error creating static SVG thumbnail for ${item.title}:`, error);

        try {
          // Try to re-fetch the raw file so we can log what actually came back
          const debugResponse = await fetch(item.image);
          const debugText = await debugResponse.text();
          console.group(`SVG Debug Info: ${item.title}`);
          console.error("Original error:", error);
          console.log("URL:", debugResponse.url);
          console.log("Status:", debugResponse.status);
          console.log("Content-Type:", debugResponse.headers.get("content-type"));
          console.log("First 200 chars of response:", debugText.slice(0, 200));
          console.groupEnd();
        } catch (debugError) {
          console.warn("Failed to fetch SVG for debugging:", debugError);
        }

        archiveState.errors.push(
          `SVG failed: ${item.title} (${item.image}) → ${error.message}`
        );

        // Retry once in case of transient fetch/parsing error
        try {
          console.warn(`Retrying SVG load for ${item.title}...`);
          const staticImgRetry = await createStaticSvgElement(item.image, item.title);
          if (staticImgRetry) {
            imageContainer.innerHTML = "";
            if (shouldBlur) staticImgRetry.classList.add("blurred-thumbnail");
            staticImgRetry.classList.add("lazy-load"); // Add lazy-load class
            staticImgRetry.onload = () => {
              staticImgRetry.classList.add("loaded");
            };
            imageContainer.appendChild(staticImgRetry);
            return; // Success on retry
          }
        } catch (retryError) {
          console.error(`Retry also failed for ${item.title}:`, retryError);
          archiveState.errors.push(`Retry failed for SVG: ${item.title}`);
        }

        // If retry failed, fall back to pastel block
        imageContainer.innerHTML = "";
        imageContainer.appendChild(createPastelBlock("SVG error"));
      });

  } else {
    thumbSrc = item.thumb || item.image;
    if (thumbSrc) {
      const img = document.createElement("img");
      img.dataset.src = thumbSrc; // Use data-src for lazy loading
      img.alt = item.title;
      img.classList.add("lazy-load"); // Add lazy-load class
      img.onerror = () => {
        console.warn("Thumbnail failed to load, falling back to placeholder.");
        missingImageError = true;
        imageContainer.innerHTML = "";
        imageContainer.appendChild(createPastelBlock());
      };
      img.onload = () => {
        img.classList.add("loaded"); // Add loaded class on load
      };
      if (shouldBlur) img.classList.add("blurred-thumbnail");
      imageContainer.appendChild(img);
    } else {
      missingImageError = true;
      imageContainer.appendChild(createPastelBlock());
    }
  }

  const infoContainer = document.createElement("div");
  infoContainer.className = "gallery-item-info";
  const metaFilters = ["Explicit", "Scrap", "Violent"];
  const itemMetaFilter = item.filters && item.filters.find((f) => metaFilters.includes(f) && f !== "Safe");
  const primaryDisplayTag = itemMetaFilter || "";
  const secondaryDisplayTag = (item.species && item.species.length > 0) ? item.species[0] : "";

  // Updated logic for the third display tag
  let animationTag = "";
  let animationClass = "";
  if (item.tags?.includes("SMIL")) {
    animationTag = "SMIL";
    animationClass = "filter-svg";
  } else if (item.tags?.includes("GIF")) {
    animationTag = "GIF";
    animationClass = "filter-svg";
  } else if (item.tags?.includes("SVG")) {
    animationTag = "SVG";
    animationClass = "filter-svg";
  }

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

  // Use the new animationTag variable here
  if (animationTag) {
    const tagEl = document.createElement("div");
    tagEl.className = `gallery-item-filter ${animationClass}`;
    tagEl.textContent = animationTag;
    infoContainer.appendChild(tagEl);
  }

  if (fourthDisplayTag) {
    const tagEl = document.createElement("div");
    tagEl.className = `gallery-item-filter filter-explicit`;
    tagEl.textContent = fourthDisplayTag;
  }

  itemElement.appendChild(imageContainer);
  itemElement.appendChild(infoContainer);
  return itemElement;
}
// Function to render the pagination controls
function renderPagination() {
  const pagination = document.getElementById("pagination");
  const totalItems = archiveState.filteredItems.length;
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / archiveState.itemsPerPage);
  
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }
  
  let paginationHTML = "";
  
  // Left Arrow (Previous Page)
  paginationHTML += `<button class="page-btn" ${archiveState.currentPage === 1 ? "disabled" : ""} onclick="changePage(${archiveState.currentPage - 1})">←</button>`;
  
  // Current Page Indicator (e.g., "Page 5 of 10")
  paginationHTML += `<span class="page-indicator">Page ${archiveState.currentPage} of ${totalPages}</span>`;
  
  // Right Arrow (Next Page)
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
  // Note: I've corrected a typo here from 'scroll-into-view' to 'scrollIntoView'
  document.getElementById("galleryGrid").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Function to close the modal
function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
  modal.classList.remove("modal-pop-in"); // Remove the animation class
  document.body.style.overflow = "";
  document.getElementById("modalTags").style.display = "none";
  document.getElementById("viewTagsBtn").textContent = "View Tags";
}

// Function to open the modal with a brief pop-in animation
function openModal(item) {
  // Check if the warning needs to be displayed
  const isExplicit = item.tags?.includes("Explicit") || item.filters?.includes("Explicit");
  if (isExplicit && !archiveState.showWarning) {
    const warningModal = document.getElementById("warningModal");
    warningModal.classList.remove("hidden");
    // Add an event listener to the "Okay" button
    document.getElementById("warningOkayBtn").addEventListener("click", () => {
      archiveState.showWarning = true;
      warningModal.classList.add("hidden");
      openModal(item); // Re-run openModal to show the item
    }, { once: true });
    // Add an event listener to the "Leave" button
    document.getElementById("warningLeaveBtn").addEventListener("click", () => {
      window.location.reload();
    }, { once: true });
    return; // Exit the function to prevent the image modal from opening
  }

  const modal = document.getElementById("imageModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDate = document.getElementById("modalDate");
  const modalMirrors = document.getElementById("modalMirrors");
  const modalTags = document.getElementById("modalTags");
  const modalImageContainer = document.querySelector(".modal-image-container");
  const modalVersionsContainer = document.getElementById("modalVersions");

  // Clear previous content to avoid stacking issues
  modalImageContainer.innerHTML = "";
  modalImageContainer.style.background = "var(--bg-color)";

  // Clear previous versions
  if (modalVersionsContainer) {
    modalVersionsContainer.innerHTML = "";
  }

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

  // Set modal container background based on image type
  if (item.image && item.image.startsWith("./svg/")) {
    modalImageContainer.style.background = "var(--green)";
  } else if (item.image && item.image.startsWith("./img/")) {
    modalImageContainer.style.background = "none";
  } else {
    modalImageContainer.style.background = "";
  }

  const ytID = item.image ? extractYouTubeID(item.image) : null;

  // Logic to handle different media types
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
      // This part handles the case where the image fails to load
      modalImageContainer.innerHTML = "";
      modalImageContainer.appendChild(createPastelBlock(item.title));
    };
    modalImageContainer.appendChild(img);
  } else {
    // This handles the case where there is no image source
    modalImageContainer.appendChild(createPastelBlock(item.title));
  }

  modalTitle.textContent = item.title;
  modalDate.textContent = new Date(item.createdDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Handle versions
  if (item.ver && item.ver.length === 2) {
    const [collectionId, currentIndex] = item.ver;
    const versionCollection = ARCHIVE_ITEMS.filter(i => i.ver && i.ver[0] === collectionId);

    // Sort versions by their index
    versionCollection.sort((a, b) => a.ver[1] - b.ver[1]);

    if (modalVersionsContainer) {
      modalVersionsContainer.style.display = "flex";
      modalVersionsContainer.innerHTML = "";
      
      const currentVersionId = `${collectionId}-${currentIndex}`;

      versionCollection.forEach((version, index) => {
        const versionButton = document.createElement("button");
        versionButton.className = "version-btn";
        versionButton.textContent = `v${index + 1}`;

        // Create a unique ID for the version and compare it to the current version's ID
        const isCurrentActive = `${version.ver[0]}-${version.ver[1]}` === currentVersionId;
        const isExplicit = version.tags && version.tags.includes("Explicit");

        versionButton.classList.add(isCurrentActive ? "active" : "inactive");
        if (isExplicit) {
          versionButton.classList.add(isCurrentActive ? "explicit-active" : "explicit-inactive");
        } else {
          versionButton.classList.add(isCurrentActive ? "safe-active" : "safe-inactive");
        }

        versionButton.addEventListener("click", () => {
          openModal(version);
        });
        modalVersionsContainer.appendChild(versionButton);
      });
    }
  } else if (modalVersionsContainer) {
    modalVersionsContainer.style.display = "none";
  }

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

  // Display tags regardless
  modalTags.style.display = "flex";

  const modalAltDesc = document.getElementById("modalAltDesc");

// Clear alt/desc each time
modalAltDesc.innerHTML = "";

// Add alt text if it exists
if (item.alt) {
  const altPara = document.createElement("p");
  altPara.innerHTML = `<strong>Alt:</strong><br> <div id="item-alt">${item.alt}</div>`;
  modalAltDesc.appendChild(altPara);
}

// Add description if it exists
if (item.desc) {
  const descPara = document.createElement("p");
  descPara.innerHTML = `<strong>Description:</strong><br> <div id="item-desc">${item.desc}</div>`;
  modalAltDesc.appendChild(descPara);
}


  // Display the modal and add the animation class
  modal.style.display = "block";
  modal.classList.add("modal-pop-in");
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

    // Make sure the SVG fits the viewport
    svgElement.id = 'modalSVG';
    svgElement.style.maxWidth = '100%';
    svgElement.style.width = '100%';
    svgElement.style.height = 'auto';
    svgElement.style.maxHeight = '90vh';
    svgElement.style.display = 'block';
    svgElement.style.margin = '0 auto';

    // Fallback if the SVG doesn't have a viewBox
    if (svgElement.hasAttribute('viewBox')) {
      // SVG has viewBox, no need to add one.
    } else if (svgElement.hasAttribute('width') && svgElement.hasAttribute('height')) {
      const width = svgElement.getAttribute('width');
      const height = svgElement.getAttribute('height');
      svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
      console.warn('SVG missing viewBox; added viewBox from width and height attributes.');
    } else {
      console.warn('SVG missing viewBox and no width/height attributes to infer from.');
    }

    try {
      const styleElements = svgElement.querySelectorAll('style');
      if (styleElements.length > 0) {
        for (const styleEl of styleElements) {
          const cssText = styleEl.textContent;
          const frameErrorMatch = cssText.match(/@keyframes.*\{[^}]*\}/);
          if (frameErrorMatch) {
            console.warn('SVG style/frame error detected:', frameErrorMatch[0]);
            break; // Only log the first frame error
          }
        }
      }
    } catch (styleError) {
      console.warn('Error parsing <style> inside SVG:', styleError);
    }

    if (item.layer) {
      const layers = Array.isArray(item.layer) ? item.layer : [item.layer];
    
      layers.forEach(layerId => {
        const layerElement = svgElement.querySelector(`#${layerId}`);
        if (layerElement) {
          console.log(`Interactive layer found: #${layerId}`);
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
          console.warn(`Layer #${layerId} not found inside SVG`);
        }
      });
    } else {
      console.log('No layer attribute detected. Rendering SVG in normal mode.');
    }
    

    console.log('Interactive SVG loaded and ready.');
  } catch (error) {
    console.error('Failed to load interactive SVG:', error);

    // Fallback: render as <img> and ensure it fills the viewport
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.title || 'SVG image';
    img.id = 'modalImage';
    img.style.maxWidth = '100%';
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.maxHeight = '90vh';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    container.innerHTML = '';
    container.appendChild(img);
  }
}

// Function to animate a layer within an SVG
function animateLayer(layerElement) {
  if (layerElement.classList.contains("animating")) return;

  layerElement.classList.add("animating");
  layerElement.style.transition = "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease-out";
  layerElement.style.transform = "translateY(-50px) scale(1.1)";
  layerElement.style.opacity = "0";
  setTimeout(() => {
    layerElement.style.display = "none";
    layerElement.style.pointerEvents = "none";
  }, 800);
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

function validateSearch() {
  archiveState.errors = [];
  const itemsWithoutSrc = archiveState.filteredItems.filter((item) => !item.image || item.image.trim() === "");
  if (itemsWithoutSrc.length === archiveState.filteredItems.length && archiveState.filteredItems.length > 0) {
    archiveState.errors.push("I could not find what you were looking for. Missing src for all images filtered.");
  }
  const characterFilters = Array.from(archiveState.activeFilters.values()).filter((f) => f.type === "character");
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
  const invalidDates = archiveState.filteredItems.filter((item) => isNaN(new Date(item.createdDate).getTime()));
  if (invalidDates.length > 0) {
    archiveState.errors.push(`${invalidDates.length} items have invalid creation dates.`);
  }
  if (archiveState.filteredItems.some((item) => !item.tags || !Array.isArray(item.tags))) {
    archiveState.errors.push("Some items are missing required tag data.");
  }
}
initApp();