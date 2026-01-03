function updateServerLimitUI() {
    const SERVER_LIMIT_MB = 25;
    let unknownPool = 15; // Starting unknown baseline
    
    const stats = {
        svg: 0, avif: 0, gif: 0, webp: 0, webm: 0, jpg: 0, png: 0, other: 0 
    };
    
    let measuredCount = 0;
    const nonNullItems = ARCHIVE_ITEMS.filter(item => item.image && item.image.trim() !== "");

    nonNullItems.forEach(item => {
        if (item.size) {
            measuredCount++;
            const sizeStr = item.size.toLowerCase();
            const value = parseFloat(sizeStr);
            let sizeInMB = 0;

            if (sizeStr.includes('kb')) {
                sizeInMB = value / 1024;
            } else if (sizeStr.includes('mb')) {
                sizeInMB = value;
            }

            const ext = item.image.split('.').pop().toLowerCase();
            if (stats.hasOwnProperty(ext)) {
                stats[ext] += sizeInMB;
            }
            
            unknownPool -= sizeInMB;
        }
    });

    stats.other = Math.max(0, unknownPool);

    // 1. Sort categories: Largest to Smallest (Physical Order)
    const sortedCategories = Object.keys(stats)
        .map(key => ({ key, size: stats[key] }))
        .sort((a, b) => b.size - a.size);

    // Expanded palette for more categories
    const brightnessPalette = [
        "#a3f0c4", // Brightest
        "#8ff1ba",
        "#7be3ad",
        "#69e1a3",
        "#56de93", // Base Green
        "#3eb977",
        "#2d8a59",
        "#1b5235"  // Darkest
    ];

    const legendContainer = document.getElementById("size-legend");
    if (legendContainer) legendContainer.innerHTML = "";

    let totalUsed = 0;

    // 2. Update Bars and Colors (Smallest/Brightest to Largest/Darkest)
    sortedCategories.forEach((item, index) => {
        const bar = document.getElementById(`bar-${item.key}`);
        const mbValue = item.size;
        const percentage = (mbValue / SERVER_LIMIT_MB) * 100;
        totalUsed += mbValue;

        if (bar) {
            // Physical position: Largest (index 0) stays on the left
            bar.style.order = index + 1; 
            bar.style.width = `${percentage}%`;
            
            // Color logic: Largest (index 0) gets Darkest color
            const colorIndex = (brightnessPalette.length - 1) - index;
            const assignedColor = brightnessPalette[colorIndex];
            
            bar.style.backgroundColor = assignedColor;
            bar.title = `${item.key.toUpperCase()}: ${percentage.toFixed(1)}% (${mbValue.toFixed(2)} MB)`;

            // 3. Update Legend in same sorted order
            if (legendContainer && mbValue > 0) {
                const legendItem = document.createElement("div");
                legendItem.style.display = "flex";
                legendItem.style.alignItems = "center";
                legendItem.style.gap = "5px";
                
                const label = item.key === 'other' ? 'OTHER' : item.key.toUpperCase();
                legendItem.innerHTML = `
                    <div style="width:12px; height:12px; background:${assignedColor}; border-radius:2px;"></div>
                    <span>${label}: <strong>${percentage.toFixed(1)}%</strong> (${mbValue.toFixed(2)} MB)</span>
                `;
                legendContainer.appendChild(legendItem);
            }
        }
    });

    // Update Totals and Counters
    const countDisplay = document.getElementById("measurement-count");
    if (countDisplay) {
        countDisplay.textContent = `${measuredCount} out of ${nonNullItems.length} images measured`;
    }
    
    const totalDisplay = document.getElementById("total-size-display");
    if (totalDisplay) {
        const totalPercent = (totalUsed / SERVER_LIMIT_MB) * 100;
        totalDisplay.textContent = `${totalUsed.toFixed(2)} MB (${totalPercent.toFixed(1)}%)`;
    }
}

updateServerLimitUI();