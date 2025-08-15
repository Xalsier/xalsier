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
  const modal = document.getElementById("navModal");
  modal.style.display = show ? "flex" : "none";
}

function navigate(select) {
  const value = select.value;
  if (value) {
    window.location.href = value;
  }
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    console.log("closeReviewModal function needs to be defined");
    toggleModal(false);
  }
});

function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add("loading");
  }
}

function hideLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove("loading");
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
    this.totalTagCount = 0;
    this.calculateTotalTags();
  }

  calculateTotalTags() {
    let count = 0;
    Object.values(LIBRARY_CONFIG.meta).forEach((category) => {
      count += category.length;
    });
    Object.values(LIBRARY_CONFIG.characters).forEach((category) => {
      count += category.length;
    });
    Object.values(LIBRARY_CONFIG.attributes).forEach((category) => {
      count += category.length;
    });
    this.totalTagCount = count;
  }

  createOption(item) {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.label;
    if (item.selected) option.selected = true;
    return option;
  }

  createOptGroup(label, items) {
    const optgroup = document.createElement("optgroup");
    optgroup.label = label;
    items.forEach((item) => {
      optgroup.appendChild(this.createOption(item));
    });
    return optgroup;
  }

  formatLabel(key) {
    // Convert camelCase or lowerCamelCase to "Title Case"
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  buildMetaFilter(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = "";
    select.appendChild(this.createOption({ value: "", label: "Select Meta Filter" }));

    Object.entries(LIBRARY_CONFIG.meta).forEach(([categoryKey, items]) => {
      select.appendChild(this.createOptGroup(this.formatLabel(categoryKey), items));
    });
  }

  buildCharacterFilter(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = "";
    select.appendChild(this.createOption({ value: "", label: "Select Character" }));

    Object.entries(LIBRARY_CONFIG.characters).forEach(([groupName, characters]) => {
      select.appendChild(this.createOptGroup(this.formatLabel(groupName), characters));
    });
  }

  buildAttributeFilter(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = "";
    select.appendChild(this.createOption({ value: "", label: "Select Attribute" }));

    Object.entries(LIBRARY_CONFIG.attributes).forEach(([categoryKey, attributes]) => {
      select.appendChild(this.createOptGroup(this.formatLabel(categoryKey), attributes));
    });
  }

  updateArchiveCount(count) {
    const archiveCountElement = document.getElementById("archive-count");
    if (archiveCountElement) {
      const plural = count === 1 ? "" : "s";
      archiveCountElement.textContent = `${count} Artwork${plural}`;
    }
  }

  updateTagCount() {
    let tagCountElement = document.getElementById("tag-count");
    if (!tagCountElement) {
      tagCountElement = document.createElement("h2");
      tagCountElement.id = "tag-count";
      tagCountElement.className = "archive-header";
      const archiveCount = document.getElementById("archive-count");
      if (archiveCount && archiveCount.parentNode) {
        archiveCount.parentNode.insertBefore(tagCountElement, archiveCount.nextSibling);
      }
    }
    const plural = this.totalTagCount === 1 ? "" : "s";
    tagCountElement.textContent = `${this.totalTagCount} Tag${plural}`;
  }

  getAllTags() {
    const allTags = [];
    Object.values(LIBRARY_CONFIG.meta).forEach((category) => { allTags.push(...category); });
    Object.values(LIBRARY_CONFIG.characters).forEach((category) => { allTags.push(...category); });
    Object.values(LIBRARY_CONFIG.attributes).forEach((category) => { allTags.push(...category); });
    return allTags;
  }

  searchTags(query) {
    const allTags = this.getAllTags();
    const lowercaseQuery = query.toLowerCase();
    return allTags.filter(
      (tag) => tag.label.toLowerCase().includes(lowercaseQuery) || tag.value.toLowerCase().includes(lowercaseQuery),
    );
  }

  initializeAllSelects() {
    this.buildMetaFilter("metaFilter");
    this.buildCharacterFilter("characterFilter");
    this.buildAttributeFilter("attributeFilter");
    this.updateTagCount();
    const navSelect = document.querySelector(".modal-content select");
    if (navSelect) {
      this.buildNavigationSelect(navSelect.id || "navigationSelect");
    }
  }

  addTag(category, subcategory, tag) {
    if (category === "meta" && LIBRARY_CONFIG.meta[subcategory]) {
      LIBRARY_CONFIG.meta[subcategory].push(tag);
    } else if (category === "characters" && LIBRARY_CONFIG.characters[subcategory]) {
      LIBRARY_CONFIG.characters[subcategory].push(tag);
    } else if (category === "attributes" && LIBRARY_CONFIG.attributes[subcategory]) {
      LIBRARY_CONFIG.attributes[subcategory].push(tag);
    }
    this.calculateTotalTags();
    this.updateTagCount();
  }

  removeTag(category, subcategory, tagValue) {
    if (category === "meta" && LIBRARY_CONFIG.meta[subcategory]) {
      LIBRARY_CONFIG.meta[subcategory] = LIBRARY_CONFIG.meta[subcategory].filter((tag) => tag.value !== tagValue);
    } else if (category === "characters" && LIBRARY_CONFIG.characters[subcategory]) {
      LIBRARY_CONFIG.characters[subcategory] = LIBRARY_CONFIG.characters[subcategory].filter(
        (tag) => tag.value !== tagValue,
      );
    } else if (category === "attributes" && LIBRARY_CONFIG.attributes[subcategory]) {
      LIBRARY_CONFIG.attributes[subcategory] = LIBRARY_CONFIG.attributes[subcategory].filter(
        (tag) => tag.value !== tagValue,
      );
    }
    this.calculateTotalTags();
    this.updateTagCount();
  }
}

const selectUtility = new SelectUtility();

document.addEventListener("DOMContentLoaded", () => {
  selectUtility.initializeAllSelects();
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SelectUtility, LIBRARY_CONFIG, NAVIGATION_CONFIG };
}
