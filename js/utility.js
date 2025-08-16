
const socialLinks = [
  { href: "https://x.com/Xalsier", src: "./svg/soc/x.svg", alt: "X / Twitter" },
  { href: "https://instagram.com/xalsier", src: "./svg/soc/insta.svg", alt: "Instagram" },
  { href: "https://bsky.app/profile/xalsier.bsky.social", src: "./svg/soc/blue.svg", alt: "Bluesky" },
  { href: "https://www.youtube.com/c/Xalsier", src: "./svg/soc/red.svg", alt: "Youtube" },
]

const container = document.getElementById("socialBar")

socialLinks.forEach((link) => {
  fetch(link.src)
    .then((res) => res.text())
    .then((svg) => {
      const wrapper = document.createElement("a")
      wrapper.href = link.href
      wrapper.classList.add("social-icon")
      wrapper.innerHTML = svg
      container.appendChild(wrapper)
    })
    .catch((err) => console.error(`Failed to load ${link.src}`, err))
})

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

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    section.scrollIntoView({ behavior: "smooth" })
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    console.log("closeReviewModal function needs to be defined")
    toggleModal(false)
  }
})

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
    console.warn("ARCHIVE_ITEMS is not an array.")
    return 0
  }
  return ARCHIVE_ITEMS.length
}

function updateArchiveHeader() {
  const header = document.getElementById("archive-count")
  const count = getArchiveLength()
  header.textContent = `${count} Item${count !== 1 ? "s" : ""}`
}