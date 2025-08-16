
let currentData = []
let animationProgress = 0
let animationId = null
let currentColors = []
const ARCHIVE_DATA = [] // Declare ARCHIVE_DATA variable

function getDataFromCategory(categoryPath) {
  console.log("[v0] Getting data for category:", categoryPath)

  if (typeof LIBRARY_CONFIG === "undefined") {
    console.error("[v0] LIBRARY_CONFIG not found - make sure library.js is loaded first")
    return []
  }

  const [section, subsection] = categoryPath.split(".")

  let categoryData = []

  if (section === "attributes" && LIBRARY_CONFIG.attributes && LIBRARY_CONFIG.attributes[subsection]) {
    categoryData = LIBRARY_CONFIG.attributes[subsection]
  } else if (section === "meta" && LIBRARY_CONFIG.meta && LIBRARY_CONFIG.meta[subsection]) {
    categoryData = LIBRARY_CONFIG.meta[subsection]
  } else if (section === "characters" && LIBRARY_CONFIG.characters) {
    // Characters has nested structure, flatten all character arrays
    categoryData = []
    Object.values(LIBRARY_CONFIG.characters).forEach((projectChars) => {
      if (Array.isArray(projectChars)) {
        categoryData = categoryData.concat(projectChars)
      }
    })
  }

  console.log("[v0] Raw category data:", categoryData)

  const processedData = categoryData
    .map((item) => ({
      label: item.label,
      value: item.count,
    }))
    .filter((item) => item.value > 0)

  console.log("[v0] Processed data:", processedData)
  return processedData
}

function getCategoryTitle(categoryPath) {
  const [section, subsection] = categoryPath.split(".")

  const sectionTitles = {
    meta: "Meta",
    characters: "Characters",
    attributes: "Attributes",
  }

  const subsectionTitles = {
    projects: "Projects",
    medium: "Medium",
    artProgram: "Art Program",
    canon: "Canon",
    nonCanon: "Non-Canon",
    time: "Time",
    filters: "Filters",
    species: "Species",
    gender: "Gender",
    environments: "Environments",
    staticPoses: "Static Poses",
    dynamicPoses: "Dynamic Poses",
    facialExpression: "Facial Expression",
    bodyType: "Body Type",
    furColor: "Fur Color",
    eyeColor: "Eye Color",
    hairColor: "Hair Color",
    clothing: "Clothing",
    backgrounds: "Backgrounds",
    violentImagery: "Violent Imagery",
  }

  if (subsection) {
    return `Distribution of ${subsectionTitles[subsection] || subsection}`
  } else {
    return `Distribution of ${sectionTitles[section] || section}`
  }
}

// Process data
function processData(data) {
  return data.filter((item) => item.value !== null && item.value > 0)
}

function generateColorPalette(count) {
  const colors = []
  const baseColors = [
    [86, 222, 147], // Green
    [255, 107, 107], // Red
    [74, 144, 226], // Blue
    [255, 193, 7], // Yellow
    [156, 39, 176], // Purple
    [255, 152, 0], // Orange
    [0, 188, 212], // Cyan
    [139, 195, 74], // Light Green
    [233, 30, 99], // Pink
    [121, 85, 72], // Brown
  ]

  for (let i = 0; i < count; i++) {
    const baseColor = baseColors[i % baseColors.length]
    const factor = 1 - Math.floor(i / baseColors.length) * 0.2
    const r = Math.max(20, Math.floor(baseColor[0] * factor))
    const g = Math.max(20, Math.floor(baseColor[1] * factor))
    const b = Math.max(20, Math.floor(baseColor[2] * factor))
    colors.push(`rgb(${r}, ${g}, ${b})`)
  }

  return colors
}

function createLegend(data, colors) {
  const legend = document.getElementById("chartLegend")
  legend.innerHTML = ""

  data.forEach((item, index) => {
    const legendItem = document.createElement("div")
    legendItem.className = "legend-item"

    legendItem.innerHTML = `
      <div class="legend-color" style="background-color: ${colors[index]}"></div>
      <span class="legend-label">${item.label} (${item.value})</span>
    `

    legend.appendChild(legendItem)
  })
}

function drawPieChart(canvas, data, colors, progress = 1) {
  const ctx = canvas.getContext("2d")
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(centerX, centerY) - 40

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  let currentAngle = -Math.PI / 2 // Start from top
  const total = data.reduce((sum, item) => sum + item.value, 0)

  data.forEach((item, index) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI * progress

    // Draw slice
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = colors[index]
    ctx.fill()

    // Add subtle border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    ctx.stroke()

    currentAngle += sliceAngle
  })
}

function animatePieChart() {
  const canvas = document.getElementById("pieChart")
  const processedData = processData(currentData)

  currentColors = generateColorPalette(processedData.length)

  // Create legend with same colors
  createLegend(processedData, currentColors)

  // Reset animation progress
  animationProgress = 0

  function animate() {
    animationProgress += 0.035
    if (animationProgress > 1) animationProgress = 1

    drawPieChart(canvas, processedData, currentColors, animationProgress)

    if (animationProgress < 1) {
      animationId = requestAnimationFrame(animate)
    }
  }

  animate()
}

function updateChart(categoryPath) {
  // Cancel any ongoing animation
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  // Get new data
  currentData = getDataFromCategory(categoryPath)
  console.log("[v0] Current data:", currentData)

  // Update title
  const title = getCategoryTitle(categoryPath)
  document.getElementById("chartTitle").textContent = title

  // Start new animation
  setTimeout(() => {
    animatePieChart()
  }, 100)
}

// Show loading progress
function showLoadingProgress() {
  const progressFill = document.getElementById("progressFill")
  let progress = 0

  const interval = setInterval(() => {
    progress += 100 / 30 // 3 seconds = 30 intervals of 100ms
    progressFill.style.width = Math.min(progress, 100) + "%"

    if (progress >= 100) {
      clearInterval(interval)
      setTimeout(showMainContent, 200)
    }
  }, 100)
}

// Show main content
function showMainContent() {
  const loadingContainer = document.getElementById("loadingContainer")
  const mainContent = document.getElementById("mainContent")

  loadingContainer.classList.add("hidden")
  mainContent.classList.add("visible")

  document.getElementById("chartTitle").textContent = "Distribution of Gender"

  currentData = getDataFromCategory("attributes.gender")

  // Start pie chart animation
  setTimeout(() => {
    animatePieChart()
  }, 100)
}

// Initialize app
function init() {
  const categorySelect = document.getElementById("categorySelect")

  categorySelect.addEventListener("change", (e) => {
    updateChart(e.target.value)
  })

  // Start loading sequence
  showLoadingProgress()
}

// Start the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init)
