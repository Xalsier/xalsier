document.addEventListener('DOMContentLoaded', () => {


    function getCanonicalName(platform) {
        const lowerCasePlatform = platform.toLowerCase();
        switch (lowerCasePlatform) {
            case 'furaffinity': return 'Furaffinity';
            case 'reddit': return 'Reddit';
            case 'instagram': return 'Instagram';
            case 'twitter': return 'Twitter';
            case 'deviantart': return 'DeviantArt';
            case 'bluesky': return 'Bluesky';
            case 'tumblr': return 'Tumblr';
            case 'e621': return 'e621';
            case 'steam': return 'Steam';
            case 'newgrounds': return 'Newgrounds';
            case 'youtube': return 'Youtube';
            case 'wikifur': return 'Wikifur';
            case 'github': return 'Github';
            default: return platform;
        }
    }

    function processDataForChart(archiveItems) {
        const platformCounts = new Map();

        archiveItems.forEach(item => {
            if (item.mirrors && Array.isArray(item.mirrors)) {
                item.mirrors.forEach(mirror => {
                    if (mirror.platform) {
                        const canonicalPlatform = getCanonicalName(mirror.platform);
                        const count = platformCounts.get(canonicalPlatform) || 0;
                        platformCounts.set(canonicalPlatform, count + 1);
                    }
                });
            }
        });

        const sortedData = Array.from(platformCounts.entries())
            .map(([hoverLabel, value]) => ({ hoverLabel, value }))
            .sort((a, b) => b.value - a.value);

        return sortedData;
    }

    const allData = processDataForChart(ARCHIVE_ITEMS);

    const svg = document.querySelector('.bar-chart-svg');
    const titleEl = document.querySelector('.bar-chart-title');
    const minusBtn = document.getElementById('minus-btn');
    const plusBtn = document.getElementById('plus-btn');

    let currentBarCount = Math.min(9, allData.length);

    function renderChart(dataToDisplay) {
        // Clear existing chart content
        svg.innerHTML = '';
        const tooltipDivs = document.querySelectorAll('.tooltip');
        tooltipDivs.forEach(div => div.remove());

        const svgWidth = svg.clientWidth;
        const svgHeight = svg.clientHeight;
        const padding = { top: 20, right: 20, bottom: 40, left: 40 };

        const chartWidth = svgWidth - padding.left - padding.right;
        const chartHeight = svgHeight - padding.top - padding.bottom;

        // Create a group element to contain the chart
        const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup.setAttribute('transform', `translate(${padding.left}, ${padding.top})`);
        svg.appendChild(chartGroup);

        // Find the max value of the current subset of data
        const maxValue = Math.max(...dataToDisplay.map(d => d.value));
        const barWidth = chartWidth / dataToDisplay.length;
        const barSpacing = 10;
        const actualBarWidth = barWidth - barSpacing;

        // Create grid lines
        const numGridLines = 5;
        for (let i = 0; i <= numGridLines; i++) {
            const y = chartHeight - (i / numGridLines) * chartHeight;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', chartWidth);
            line.setAttribute('y2', y);
            line.setAttribute('class', 'grid-line');
            chartGroup.appendChild(line);
        }

        // Create bars and labels
        dataToDisplay.forEach((d, i) => {
            const barHeight = (d.value / maxValue) * chartHeight;
            const xPos = i * barWidth + barSpacing / 2;
            const yPos = chartHeight - barHeight;

            // Bar
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', xPos);
            rect.setAttribute('y', yPos);
            rect.setAttribute('width', actualBarWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('class', 'bar');
            rect.setAttribute('rx', 4); // Rounded corners
            chartGroup.appendChild(rect);

            // Label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', xPos + actualBarWidth / 2);
            text.setAttribute('y', chartHeight + 25); // Increased spacing
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('class', 'label-text');
            text.textContent = `#${i + 1}`;
            chartGroup.appendChild(text);

            // Tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = `${d.hoverLabel}: ${d.value}`;
            document.body.appendChild(tooltip);

            // Add mouse events for tooltip
            rect.addEventListener('mouseenter', () => {
                const rectBBox = rect.getBoundingClientRect();
                const x = rectBBox.left + rectBBox.width / 2;
                const y = rectBBox.top + window.scrollY - 10;
                
                tooltip.style.left = `${x}px`;
                tooltip.style.top = `${y}px`;
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translate(-50%, -10px)';
            });

            rect.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translate(-50%, 0px)';
            });
        });
    }

    function updateChart() {
        // Update the title
        titleEl.textContent = `Top ${currentBarCount} Mirror Dependencies`;

        const dataToDisplay = allData.slice(0, currentBarCount);
        renderChart(dataToDisplay);

        // Update button states
        minusBtn.disabled = currentBarCount <= 1;
        plusBtn.disabled = currentBarCount >= allData.length;
    }

    // Event listeners for control buttons
    minusBtn.addEventListener('click', () => {
        if (currentBarCount > 1) {
            currentBarCount--;
            updateChart();
        }
    });

    plusBtn.addEventListener('click', () => {
        if (currentBarCount < allData.length) {
            currentBarCount++;
            updateChart();
        }
    });

    // Initial chart render
    updateChart();
    
    // Re-render chart on window resize
    window.addEventListener('resize', updateChart);
});