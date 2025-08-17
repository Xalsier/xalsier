let currentData = []
let animationProgress = 0
let animationId = null
let currentColors = []
let currentThreshold = 0 // slider filter value

function getDataFromCategory(categoryPath) {
  if (typeof LIBRARY_CONFIG === "undefined") return []

  const [section, subsection] = categoryPath.split(".")
  let categoryData = []

  if (section === "attributes" && LIBRARY_CONFIG.attributes && LIBRARY_CONFIG.attributes[subsection]) {
    categoryData = LIBRARY_CONFIG.attributes[subsection]
  } else if (section === "meta" && LIBRARY_CONFIG.meta && LIBRARY_CONFIG.meta[subsection]) {
    categoryData = LIBRARY_CONFIG.meta[subsection]
  } else if (section === "characters" && LIBRARY_CONFIG.characters) {
    categoryData = []
    Object.values(LIBRARY_CONFIG.characters).forEach(projectChars => {
      if (Array.isArray(projectChars)) categoryData = categoryData.concat(projectChars)
    })
  }

  const processedData = categoryData
    .map(item => ({ label: item.label, value: item.count }))
    .filter(item => item.value > 0)

  return processedData
}

function getCategoryTitle(categoryPath) {
  const [section, subsection] = categoryPath.split(".")
  const configMap = {
    meta: LIBRARY_CONFIG.meta,
    characters: LIBRARY_CONFIG.characters,
    attributes: LIBRARY_CONFIG.attributes,
  }

  const sectionTitle = section.charAt(0).toUpperCase() + section.slice(1)

  if (subsection && configMap[section] && configMap[section][subsection]) {
    const subsectionTitle = subsection.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())
    return `Distribution of ${subsectionTitle}`
  } else {
    return `Distribution of ${sectionTitle}`
  }
}

function processData(data) {
  return data.filter(item => item.value !== null && item.value > 0).sort((a, b) => b.value - a.value)
}

function generateColorPalette(count) {
  const colors = []
  const baseColors = [
    [86, 222, 147],
    [255, 107, 107],
    [74, 144, 226],
    [255, 193, 7],
    [156, 39, 176],
    [255, 152, 0],
    [0, 188, 212],
    [139, 195, 74],
    [233, 30, 99],
    [121, 85, 72],
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

  let currentAngle = -Math.PI / 2
  const total = data.reduce((sum, item) => sum + item.value, 0)

  data.forEach((item, index) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI * progress

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = colors[index]
    ctx.fill()

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    ctx.stroke()

    currentAngle += sliceAngle
  })
}

function animatePieChart() {
  const canvas = document.getElementById("pieChart")
  const filteredData = processData(currentData).filter(item => item.value > currentThreshold)

  currentColors = generateColorPalette(filteredData.length)
  createLegend(filteredData, currentColors)

  animationProgress = 0

  function animate() {
    animationProgress += 0.035
    if (animationProgress > 1) animationProgress = 1

    drawPieChart(canvas, filteredData, currentColors, animationProgress)

    if (animationProgress < 1) animationId = requestAnimationFrame(animate)
  }

  animate()
}

function updateChart(categoryPath) {
  if (animationId) cancelAnimationFrame(animationId)

  currentData = getDataFromCategory(categoryPath)
  document.getElementById("chartTitle").textContent = getCategoryTitle(categoryPath)

  setTimeout(() => {
    animatePieChart()
  }, 100)
}

function addSlider() {
  const container = document.getElementById("sliderContainer")
  container.innerHTML = `
    <label for="thresholdSlider">Min Count: <span id="sliderValue" style="color: var(--green);">0</span></label>
    <input type="range" id="thresholdSlider" min="0" max="10" step="1" value="0" />
  `

  const slider = document.getElementById("thresholdSlider")
  const sliderValue = document.getElementById("sliderValue")

  slider.addEventListener("input", e => {
    currentThreshold = Number(e.target.value)
    sliderValue.textContent = currentThreshold
    animatePieChart()
  })
}

function showMainContent() {
  const loadingContainer = document.getElementById("loadingContainer")
  const mainContent = document.getElementById("mainContent")

  loadingContainer.classList.add("hidden")
  mainContent.classList.add("visible")

  document.getElementById("chartTitle").textContent = "Distribution of Gender"
  currentData = getDataFromCategory("attributes.gender")

  setTimeout(() => {
    animatePieChart()
  }, 100)

  addSlider()
}

function init() {
  const categorySelect = document.getElementById("categorySelect")
  categorySelect.addEventListener("change", e => updateChart(e.target.value))

  showMainContent()
}

document.addEventListener("DOMContentLoaded", init)
