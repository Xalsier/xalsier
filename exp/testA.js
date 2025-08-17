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
    // Filter & sort
    const sorted = data
      .filter(item => item.value !== null && item.value > 0)
      .sort((a, b) => b.value - a.value)
  
    // If there are more than 9 entries, group the rest into "Other"
    if (sorted.length > 9) {
      const topNine = sorted.slice(0, 9)
      const others = sorted.slice(9)
      const otherValue = others.reduce((sum, item) => sum + item.value, 0)
  
      topNine.push({ label: "Other", value: otherValue })
      return topNine
    }
  
    return sorted
  }
  

function generateColorPalette(count) {
    const colors = []
  
    // Dice roll for whole-chart theme
    let themeHue
    if (Math.random() < 0.5) {
      themeHue = 140 // green 50% of the time
    } else {
      const altHues = [0, 200, 280, 50] // red, blue, purple, yellow
      themeHue = altHues[Math.floor(Math.random() * altHues.length)]
    }
  
    const saturation = 60
    const lightness = 55
  
    function hslToRgb(h, s, l) {
      s /= 100
      l /= 100
      const k = n => (n + h / 30) % 12
      const a = s * Math.min(l, 1 - l)
      const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
      return `rgb(${Math.round(255 * f(0))}, ${Math.round(
        255 * f(8)
      )}, ${Math.round(255 * f(4))})`
    }
  
    // Up to 10 progressively darker/lighter shades
    for (let i = 0; i < count; i++) {
      const factor = 1 - i * 0.08 // gentler slope so 10 shades look distinct
      const l = Math.max(25, Math.min(85, lightness * factor))
      colors.push(hslToRgb(themeHue, saturation, l))
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
    
    ctx.shadowColor = colors[index]
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    
    ctx.fillStyle = colors[index]
    ctx.fill()
    
    ctx.shadowBlur = 0 // reset for clean borders
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

function populateCategorySelect() {
    const categorySelect = document.getElementById("categorySelect")
    categorySelect.innerHTML = "" // clear existing options
  
    const sections = [
      { key: "meta", label: "Meta" },
      { key: "characters", label: "Characters" },
      { key: "attributes", label: "Attributes" },
    ]
  
    sections.forEach(section => {
      if (!LIBRARY_CONFIG[section.key]) return
  
      const optgroup = document.createElement("optgroup")
      optgroup.label = section.label
  
      Object.keys(LIBRARY_CONFIG[section.key]).forEach(subsectionKey => {
        const option = document.createElement("option")
        option.value = `${section.key}.${subsectionKey}`
  
        // For characters, just display project name; for others, make readable
        if (section.key === "characters") {
          option.textContent = subsectionKey
        } else {
          option.textContent = subsectionKey.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())
        }
  
        // Default selection
        if (option.value === "attributes.gender") option.selected = true
  
        optgroup.appendChild(option)
      })
  
      categorySelect.appendChild(optgroup)
    })
  }
  

  function init() {
    populateCategorySelect() // populate dynamically
  
    const categorySelect = document.getElementById("categorySelect")
    categorySelect.addEventListener("change", e => updateChart(e.target.value))
  
    showMainContent()
  }
  

document.addEventListener("DOMContentLoaded", init)
