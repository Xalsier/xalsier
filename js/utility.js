const socialLinks = [
  { href: "https://www.artstation.com/xalsier", src: "./svg/soc/ArtStation.svg", alt: "ArtStation" },
  { href: "https://x.com/Xalsier", src: "./svg/soc/Twitter.svg", alt: "X / Twitter" },
  { href: "https://bsky.app/profile/xalsier.com", src: "./svg/soc/Bluesky.svg", alt: "Bluesky" },
  { href: "https://www.youtube.com/c/Xalsier", src: "./svg/soc/YouTube.svg", alt: "Youtube" },
 { href: "https://www.tiktok.com/@xalsier", src: "./svg/soc/TikTok.svg", alt: "TikTok" },
 { href: "https://www.furaffinity.net/user/xalsier", src: "./svg/soc/FurAffinity.svg", alt: "FurAffinity" },
];
const socialContainer = document.getElementById("socialBar");
const visitsContainer = document.getElementById("visitsContainer");
socialLinks.forEach((link) => {
  fetch(link.src)
    .then((res) => res.text())
    .then((svg) => {
      const wrapper = document.createElement("a");
      wrapper.href = link.href;
      wrapper.classList.add("social-icon");
      wrapper.innerHTML = svg;
      socialContainer.appendChild(wrapper);
    })
    .catch((err) => console.error(`Failed to load ${link.src}`, err));
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
function getArchiveStats() {
  if (!Array.isArray(ARCHIVE_ITEMS)) {
    console.warn("ARCHIVE_ITEMS is not an array.");
    return { valid: 0, nullItems: 0 };
  }
  const validItems = ARCHIVE_ITEMS.filter(item => 
    item.image && typeof item.image === 'string' && item.image.trim() !== ""
  ).length;
  const nullItems = ARCHIVE_ITEMS.length - validItems;
  return {
    valid: validItems,
    nullItems: nullItems
  };
}
function updateArchiveHeader() {
  const header = document.getElementById("archive-count");
  if (!header) return;
  const stats = getArchiveStats();
  const validText = `${stats.valid} Item${stats.valid !== 1 ? "s" : ""}`;
  const nullText = `${stats.nullItems} Null Item${stats.nullItems !== 1 ? "s" : ""}`;
  header.textContent = `${validText} (${nullText})`;
}
function addValidSrcTag() {
  if (typeof ARCHIVE_ITEMS === 'undefined' || !Array.isArray(ARCHIVE_ITEMS)) {
    console.error("ARCHIVE_ITEMS global variable is not defined or is not an array.");
    return;
  }
  ARCHIVE_ITEMS.forEach(item => {
    if (!item.tags) {
      item.tags = [];
    }
    if (item.image && typeof item.image === 'string' && item.image.trim() !== "") {
      const lowerCaseSrc = item.image.toLowerCase();
      if (lowerCaseSrc.endsWith(".png")) {
        if (!item.tags.includes("PNG")) {
          item.tags.push("PNG");
        }
      } else if (lowerCaseSrc.endsWith(".jpg") || lowerCaseSrc.endsWith(".jpeg")) {
        if (!item.tags.includes("JPG")) {
          item.tags.push("JPG");
        }
      } else if (lowerCaseSrc.endsWith(".svg")) {
        if (!item.tags.includes("SVG")) {
          item.tags.push("SVG");
        }
      }
    }
    if (!item.alt || typeof item.alt !== "string" || item.alt.trim() === "") {
      if (!item.tags.includes("Alt Text Missing")) {
        item.tags.push("Alt Text Missing");
      }
    }
    if (!item.desc || typeof item.desc !== "string" || item.desc.trim() === "") {
      if (!item.tags.includes("Description Missing")) {
        item.tags.push("Description Missing");
      }
    }
  });
}
addValidSrcTag();