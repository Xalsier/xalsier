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
      const recentFilterId = "history-Recent"
      this.activeFilters.set(recentFilterId, {
        type: "history",
        name: "Recent",
        display: "Recent",
      });
      const safeFilterId = "filter-Safe";
      this.activeFilters.set(safeFilterId, {
          type: "filter",
          name: "Safe",
          display: "Safe",
      });
      this.renderActiveFilters()
      this.filterItems()
      this.currentPage = 1
      this.showGallery()
      this.renderGallery()
      this.renderPagination()
    }
  
    setupEventListeners() {
      document.getElementById("metaFilter").addEventListener("change", (e) => {
        this.handleFilterChange(e.target.value, e.target)
      })
      document.getElementById("characterFilter").addEventListener("change", (e) => {
        this.handleFilterChange(e.target.value, e.target)
      })
      document.getElementById("attributeFilter").addEventListener("change", (e) => {
        this.handleFilterChange(e.target.value, e.target)
      })
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
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeModal()
        }
      })
      document.getElementById("searchBtn").addEventListener("click", () => {
        this.performSearch()
      })
    }
  
    handleFilterChange(filterValue, selectElement) {
      if (!filterValue) return
      const [filterType, filterName] = filterValue.split(":")
      const filterId = `${filterType}-${filterName}`
      if (this.activeFilters.has(filterId)) {
        selectElement.value = ""
        return
      }
      this.activeFilters.set(filterId, {
        type: filterType,
        name: filterName,
        display: filterName,
      })
      selectElement.value = ""
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
        bubble.innerHTML = `${filter.display}          <button class="remove-filter" onclick="archiveApp.removeFilter('${filterId}')">&times;</button>        `
        container.appendChild(bubble)
      })
    }
  
    loadItems() {
      this.archiveItems = ARCHIVE_ITEMS || []
      this.filteredItems = [...this.archiveItems]
    }
  
    filterItems() {
        const explicitFilterActive = Array.from(this.activeFilters.values())
          .some(f => f.type === "filter" && f.name === "Explicit");
      
        this.filteredItems = this.archiveItems.filter((item) => {
          // Global block for Explicit unless explicitly requested
          if (item.filters?.includes("Explicit") && !explicitFilterActive) {
            return false;
          }
      
          return Array.from(this.activeFilters.values()).every((filter) => {
            switch (filter.type) {
              case "project":
                return item.project === filter.name;
              case "background":
                return item.background === filter.name;
                case "filter":
                    // Treat all filters, including 'Safe', the same
                    return item.filters?.includes(filter.name);
              case "history":
                return true;
              case "character":
                return item.characters && item.characters.includes(filter.name);
              case "species":
                return item.species && item.species.includes(filter.name);
              case "gender":
                return item.gender && item.gender.includes(filter.name);
              case "bodyType":
                return item.bodyType && item.bodyType.includes(filter.name);
              case "furColor":
                return item.furColor && item.furColor.includes(filter.name);
              case "tag":
                return item.tags && item.tags.includes(filter.name);
              default:
                return true;
            }
          });
        });
      
        const historyFilter = Array.from(this.activeFilters.values())
          .find(f => f.type === "history");
        if (historyFilter) {
          if (historyFilter.name === "Recent") {
            this.filteredItems.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
          } else if (historyFilter.name === "Oldest") {
            this.filteredItems.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
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
        const itemElement = document.createElement("div");
        itemElement.className = "gallery-item";
        itemElement.addEventListener("click", () => this.openModal(item));
      
        const imageContainer = document.createElement("div");
        imageContainer.className = "gallery-item-image";
      
        const isVideo = item.image && item.image.endsWith(".mp4");
        const isYouTube = item.image && /(?:youtube\.com|youtu\.be)/.test(item.image);
        let missingImageError = false;
      
        const thumbSrc = item.thumb || (isVideo ? "./img/video-thumb.png" : item.image);
      
        const safeMode = this.activeFilters.has("filter-Safe");
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
      
        if (isVideo || isYouTube) {
            // If video or YouTube but no usable thumb, mark missing
            if (!item.thumb) {
                missingImageError = true;
                imageContainer.appendChild(createPastelBlock());
            } else {
                const img = document.createElement("img");
                img.src = item.thumb;
                img.alt = item.title;
                img.onerror = () => {
                    missingImageError = true;
                    imageContainer.innerHTML = "";
                    imageContainer.appendChild(createPastelBlock());
                };
                if (shouldBlur) img.classList.add("blurred-thumbnail");
                imageContainer.appendChild(img);
            }
        } else if (thumbSrc) {
            const img = document.createElement("img");
            img.src = thumbSrc;
            img.alt = item.title;
            img.onerror = () => {
                console.warn("Thumb failed to load:", thumbSrc);
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
    
      
  
    renderPagination() {
      const pagination = document.getElementById("pagination")
      const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage)
      if (totalPages <= 1) {
        pagination.innerHTML = ""
        return
      }
      let paginationHTML = ""
      paginationHTML += `        <button class="page-btn" ${this.currentPage === 1 ? "disabled" : ""}                 onclick="archiveApp.changePage(${this.currentPage - 1})">          ←        </button>      `
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
          paginationHTML += `            <button class="page-btn ${i === this.currentPage ? "active" : ""}"                     onclick="archiveApp.changePage(${i})">${i}            </button>          `
        } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
          paginationHTML += `<span class="page-btn" style="cursor: default;">...</span>`
        }
      }
      paginationHTML += `        <button class="page-btn" ${this.currentPage === totalPages ? "disabled" : ""}                 onclick="archiveApp.changePage(${this.currentPage + 1})">          →        </button>      `
      pagination.innerHTML = paginationHTML
    }
  
    changePage(page) {
      const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage)
      if (page < 1 || page > totalPages) return
      this.currentPage = page
      this.renderGallery()
      this.renderPagination()
      document.getElementById("galleryGrid").scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  
    openModal(item) {
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
            this.loadInteractiveSVG(item, modalImageContainer);
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
        item.mirrors.forEach((mirror) => {
            const link = document.createElement("a");
            link.href = mirror.url;
            link.target = "_blank";
            link.className = "mirror-link";
            const svgPath = platformIconMap[mirror.platform];
            if (svgPath) {
                const iconId = "icon";
                link.innerHTML = `<svg class="mirror-icon" viewBox="0 0 24 24" fill="currentColor"><use href="${svgPath}#${iconId}"></use></svg>${mirror.platform.charAt(0).toUpperCase() + mirror.platform.slice(1)}`;
                const testImg = new Image();
                testImg.onerror = () => {
                    console.warn(`SVG failed to load for ${mirror.platform}: ${svgPath}`);
                };
                testImg.src = svgPath;
            } else {
                link.textContent = mirror.platform.charAt(0).toUpperCase() + mirror.platform.slice(1);
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
    
  
    async loadInteractiveSVG(item, container) {
        try {
          const response = await fetch(item.image)
          const svgText = await response.text()
          console.log('Loading Interactive SVG')
      
          // Parse the SVG text directly
          const parser = new DOMParser()
          const svgDoc = parser.parseFromString(svgText, "image/svg+xml")
          const svgElement = svgDoc.querySelector("svg")
      
          if (svgElement) {
            console.log("SVG element found:", svgElement)
      
            svgElement.id = "modalSVG"
            svgElement.style.maxWidth = "100%"
            svgElement.style.maxHeight = "600px"
            svgElement.style.width = "auto"
            svgElement.style.height = "auto"
      
            // Log dimensions
            requestAnimationFrame(() => {
              const bbox = svgElement.getBBox()
              console.log(`SVG dimensions: width=${bbox.width}, height=${bbox.height}`)
              if (bbox.width === 0 || bbox.height === 0) {
                console.warn("SVG is in the DOM but has no visible size — likely CSS or missing viewBox.")
              }
            })
      
            // Handle interactive layer
            if (item.layer) {
              const layerElement = svgElement.querySelector(`#${item.layer}`)
              if (layerElement) {
                console.log(`Interactive layer found: #${item.layer}`, layerElement)
      
                layerElement.style.cursor = "pointer"
                layerElement.classList.add("interactive-layer")
      
                layerElement.addEventListener("click", (e) => {
                  e.stopPropagation()
                  this.animateLayer(layerElement)
                })
      
                layerElement.addEventListener("mouseenter", () => {
                  layerElement.style.filter = "brightness(1.2)"
                })
      
                layerElement.addEventListener("mouseleave", () => {
                  layerElement.style.filter = "brightness(1)"
                })
              } else {
                console.warn(`Layer #${item.layer} not found inside SVG`)
              }
            }
      
            // Append the SVG directly to the modal container
            container.appendChild(svgElement)
          } else {
            console.error("No <svg> element found in fetched SVG text. Raw text:", svgText.slice(0, 200) + "...")
            // fallback to image
            const img = document.createElement("img")
            img.src = item.image
            img.alt = item.title
            img.id = "modalImage"
            container.appendChild(img)
          }
        } catch (error) {
          console.error("Failed to load interactive SVG:", error)
          const img = document.createElement("img")
          img.src = item.image
          img.alt = item.title
          img.id = "modalImage"
          container.appendChild(img)
        }
      }
      
  
    animateLayer(layerElement) {
      // Prevent multiple animations on the same element
      if (layerElement.classList.contains("animating")) {
        return
      }
  
      layerElement.classList.add("animating")
  
      // Apply the animation
      layerElement.style.transition = "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease-out"
      layerElement.style.transform = "translateY(-50px) scale(1.1)"
      layerElement.style.opacity = "0"
  
      // Remove the element from interaction after animation
      setTimeout(() => {
        layerElement.style.display = "none"
        layerElement.style.pointerEvents = "none"
      }, 800)
    }
  
    closeModal() {
      const modal = document.getElementById("imageModal")
      modal.style.display = "none"
      document.body.style.overflow = ""
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
      progressContainer.style.display = "block"
      progressFill.style.width = "0%"
      const totalImages = ARCHIVE_ITEMS.length || 0
      let huntedImages = 0
      const progressInterval = setInterval(() => {
        huntedImages += Math.ceil(totalImages / 50)
        if (huntedImages > totalImages) huntedImages = totalImages
        const progressPercent = Math.min((huntedImages / totalImages) * 100, 100)
        progressFill.style.width = `${progressPercent}%`
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
      if (this.errors.length > 0) {
        errorDisplay.innerHTML = this.errors.join("<br>")
        errorDisplay.style.display = "block"
        progressText.textContent = "Failed to hunt."
      } else {
        progressText.textContent = "Hunt complete."
      }
      setTimeout(() => {
        progressContainer.style.display = "none"
        searchBtn.disabled = false
        searchBtn.textContent = "Search"
        this.isSearching = false
        document.getElementById("progressFill").style.width = "0%"
        progressText.textContent = ""
      }, 1500)
    }
  
    validateSearch() {
      const itemsWithoutSrc = this.filteredItems.filter((item) => !item.image || item.image.trim() === "")
      if (itemsWithoutSrc.length === this.filteredItems.length && this.filteredItems.length > 0) {
        this.errors.push("I could not find what you were looking for. Missing src for all images filtered.")
      }
      const characterFilters = Array.from(this.activeFilters.values()).filter((f) => f.type === "character")
      if (characterFilters.length === 1) {
        const characterName = characterFilters[0].name
        const characterInfo = characterData && characterData[characterName]
        if (!characterInfo) {
          this.errors.push("Error. Could not display profile.")
        }
      }
      if (this.filteredItems.length === 0 && this.activeFilters.size > 0) {
        this.errors.push("No results found for the selected filters.")
      }
      if (ARCHIVE_ITEMS.length === 0) {
        this.errors.push("Archive database is empty or failed to load.")
      }
      if (this.activeFilters.size === 0) {
        this.errors.push("No filters selected. Please select at least one filter to search.")
      }
      const brokenImages = this.filteredItems.filter((item) => {
        if (!item.image) return true
        const validPrefixes = ["./img/", "./svg/", "https://"]
        return !validPrefixes.some((prefix) => item.image.startsWith(prefix))
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
  
  let archiveApp
  document.addEventListener("DOMContentLoaded", () => {
    archiveApp = new ArchiveApp()
  })
  