class SelectUtility {
    constructor() {
      this.totalTagCount = 0
      this.calculateTotalTags()
      this.countsCache = null
    }
  
    calculateOptionCounts() {
      if (this.countsCache) return this.countsCache
  
      const counts = {}
  
      if (!Array.isArray(ARCHIVE_ITEMS)) {
        console.warn("ARCHIVE_ITEMS is not available or not an array")
        return counts
      }
  
      ARCHIVE_ITEMS.forEach((item) => {
        // Count project occurrences
        if (item.project) {
          const key = `project:${item.project}`
          counts[key] = (counts[key] || 0) + 1
        }
  
        // Count tags occurrences
        if (Array.isArray(item.tags)) {
          item.tags.forEach((tag) => {
            const key = `tag:${tag}`
            counts[key] = (counts[key] || 0) + 1
          })
        }
  
        // Count filters occurrences
        if (Array.isArray(item.filters)) {
          item.filters.forEach((filter) => {
            const key = `filter:${filter}`
            counts[key] = (counts[key] || 0) + 1
          })
        }
  
        // Count characters occurrences
        if (Array.isArray(item.characters)) {
          item.characters.forEach((character) => {
            const key = `character:${character}`
            counts[key] = (counts[key] || 0) + 1
          })
        }
  
        // Count species occurrences
        if (Array.isArray(item.species)) {
          item.species.forEach((species) => {
            const key = `species:${species}`
            counts[key] = (counts[key] || 0) + 1
          })
        }
  
        // Count gender occurrences
        if (Array.isArray(item.gender)) {
          item.gender.forEach((gender) => {
            const key = `gender:${gender}`
            counts[key] = (counts[key] || 0) + 1
          })
        }
  
        // Count bodyType occurrences
        if (Array.isArray(item.bodyType)) {
          item.bodyType.forEach((bodyType) => {
            const key = `bodyType:${bodyType}`
            counts[key] = (counts[key] || 0) + 1
          })
        }
  
        // Count furColor occurrences
        if (item.furColor) {
          const key = `furColor:${item.furColor}`
          counts[key] = (counts[key] || 0) + 1
        }
  
        // Count background occurrences
        if (item.background) {
          const key = `background:${item.background}`
          counts[key] = (counts[key] || 0) + 1
        }
      })
  
      this.countsCache = counts
      return counts
    }
  
    clearCountsCache() {
      this.countsCache = null
    }
  
    calculateTotalTags() {
      let count = 0
      Object.values(LIBRARY_CONFIG.meta).forEach((category) => {
        count += category.length
      })
      Object.values(LIBRARY_CONFIG.characters).forEach((category) => {
        count += category.length
      })
      Object.values(LIBRARY_CONFIG.attributes).forEach((category) => {
        count += category.length
      })
      this.totalTagCount = count
    }
  
    createOption(item) {
      const option = document.createElement("option")
      option.value = item.value
  
      // Now pull from tag.count if available
      const count = item.count || 0
      option.textContent = count > 0 ? `${item.label} (${count})` : item.label
  
      if (item.selected) option.selected = true
      return option
    }
  
    createOptGroup(label, items) {
      const optgroup = document.createElement("optgroup")
      optgroup.label = label
  
      const sortedItems = [...items].sort((a, b) => {
        const countA = a.count || 0
        const countB = b.count || 0
        return countB - countA // Descending order (highest count first)
      })
  
      sortedItems.forEach((item) => {
        optgroup.appendChild(this.createOption(item))
      })
      return optgroup
    }
  
    formatLabel(key) {
      return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    }
  
    buildMetaFilter(selectId) {
      const select = document.getElementById(selectId)
      if (!select) return
      select.innerHTML = ""
      select.appendChild(this.createOption({ value: "", label: "Select Meta Filter" }))
  
      Object.entries(LIBRARY_CONFIG.meta).forEach(([categoryKey, items]) => {
        select.appendChild(this.createOptGroup(this.formatLabel(categoryKey), items))
      })
    }
  
    buildCharacterFilter(selectId) {
      const select = document.getElementById(selectId)
      if (!select) return
      select.innerHTML = ""
      select.appendChild(this.createOption({ value: "", label: "Select Character" }))
  
      Object.entries(LIBRARY_CONFIG.characters).forEach(([groupName, characters]) => {
        select.appendChild(this.createOptGroup(this.formatLabel(groupName), characters))
      })
    }
  
    buildAttributeFilter(selectId) {
      const select = document.getElementById(selectId)
      if (!select) return
      select.innerHTML = ""
      select.appendChild(this.createOption({ value: "", label: "Select Attribute" }))
  
      Object.entries(LIBRARY_CONFIG.attributes).forEach(([categoryKey, attributes]) => {
        select.appendChild(this.createOptGroup(this.formatLabel(categoryKey), attributes))
      })
    }
  
    updateArchiveCount(count) {
      const archiveCountElement = document.getElementById("archive-count")
      if (archiveCountElement) {
        const plural = count === 1 ? "" : "s"
        archiveCountElement.textContent = `${count} Artwork${plural}`
      }
    }
  
    updateTagCount() {
      let tagCountElement = document.getElementById("tag-count")
      if (!tagCountElement) {
        tagCountElement = document.createElement("h2")
        tagCountElement.id = "tag-count"
        tagCountElement.className = "archive-header"
        const archiveCount = document.getElementById("archive-count")
        if (archiveCount && archiveCount.parentNode) {
          archiveCount.parentNode.insertBefore(tagCountElement, archiveCount.nextSibling)
        }
      }
      const plural = this.totalTagCount === 1 ? "" : "s"
      tagCountElement.textContent = `${this.totalTagCount} Tag${plural}`
    }
  
    getAllTags() {
      const allTags = []
      Object.values(LIBRARY_CONFIG.meta).forEach((category) => {
        allTags.push(...category)
      })
      Object.values(LIBRARY_CONFIG.characters).forEach((category) => {
        allTags.push(...category)
      })
      Object.values(LIBRARY_CONFIG.attributes).forEach((category) => {
        allTags.push(...category)
      })
      return allTags
    }
  
    searchTags(query) {
      const allTags = this.getAllTags()
      const lowercaseQuery = query.toLowerCase()
      return allTags.filter(
        (tag) => tag.label.toLowerCase().includes(lowercaseQuery) || tag.value.toLowerCase().includes(lowercaseQuery),
      )
    }
  
    initializeAllSelects() {
      // make sure counts are updated in LIBRARY_CONFIG before building UI
      updateLibraryConfigCounts(this)
  
      this.buildMetaFilter("metaFilter")
      this.buildCharacterFilter("characterFilter")
      this.buildAttributeFilter("attributeFilter")
      this.updateTagCount()
      const navSelect = document.querySelector(".modal-content select")
      if (navSelect) {
        this.buildNavigationSelect(navSelect.id || "navigationSelect")
      }
    }
  
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
      this.clearCountsCache()
    }
  
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
      this.clearCountsCache()
    }
  
    buildNavigationSelect(selectId) {
      const select = document.getElementById(selectId)
      if (!select) return
      select.innerHTML = ""
      select.appendChild(this.createOption({ value: "", label: "Select Navigation" }))
  
      Object.entries(NAVIGATION_CONFIG).forEach(([categoryKey, items]) => {
        select.appendChild(this.createOptGroup(this.formatLabel(categoryKey), items))
      })
    }
  }
  
  // external helper to push counts into LIBRARY_CONFIG
  function updateLibraryConfigCounts(selectUtility) {
    const counts = selectUtility.calculateOptionCounts()
  
    function attachCounts(obj) {
      Object.values(obj).forEach((arr) => {
        arr.forEach((tag) => {
          tag.count = counts[tag.value] || 0
        })
      })
    }
  
    attachCounts(LIBRARY_CONFIG.meta)
    attachCounts(LIBRARY_CONFIG.characters)
    attachCounts(LIBRARY_CONFIG.attributes)
  }
  
  const selectUtility = new SelectUtility()
  
  document.addEventListener("DOMContentLoaded", () => {
    selectUtility.initializeAllSelects()
  })
  
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { SelectUtility, LIBRARY_CONFIG, NAVIGATION_CONFIG, updateLibraryConfigCounts }
  }
  