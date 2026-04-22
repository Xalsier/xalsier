
    const overview = document.getElementById('overview-content');
    const education = document.getElementById('education-content');
    const btnOverview = document.getElementById('btn-overview');
    const btnEducation = document.getElementById('btn-education');

    // Section Toggle Logic
    const switchSection = (show, hide) => {
        // Safety Check: If either element is missing, stop the function
        if (!show || !hide) {
            console.error("Missing DOM elements:", { show, hide });
            return;
        }

        hide.style.transition = "opacity 0.3s ease";
        hide.style.opacity = "0";
        
        setTimeout(() => {
            hide.style.display = 'none';
            show.style.display = 'block';
            // Trigger a reflow to ensure the fade-in happens
            show.offsetHeight; 
            show.style.opacity = "1";
        }, 300);
    };

    if (btnEducation && btnOverview) {
        btnEducation.addEventListener('click', () => switchSection(education, overview));
        btnOverview.addEventListener('click', () => switchSection(overview, education));
    }

// Load Education Data
const langContainer = document.getElementById('language-list');

// Updated rendering function: Only the title is linked
function renderList(items) {
    if (!items || items.length === 0) return '<li>None</li>';
    return items.map(item => {
        const titlePart = item.url 
            ? `<a href="${item.url}" target="_blank">${item.title}</a>` 
            : item.title;
        return `<li><strong>${item.label}:</strong> ${titlePart}</li>`;
    }).join('');
}

// Updated fetch logic
fetch('../json/education.json')
    .then(response => response.json())
    .then(data => {
        data.languages.forEach(lang => {
            const langDiv = document.createElement('div');
            langDiv.className = 'lang-item';

            // Building the HTML with the new Certificates section
            let html = `
                <div class="lang-header">
                    <div style="color: var(--bg-color);">
                        <strong>${lang.name}</strong> 
                        <span style="color: var(--bg-color); opacity: 0.8; margin-left: 10px;">— ${lang.level}</span>
                    </div>
            `;
            
            if (lang.hasDetails) {
                html += `<button class="fold-btn">Show Details</button>`;
                html += `</div> <div class="details" style="display:none;">
                            ${lang.certificates && lang.certificates.length > 0 ? `<h4>Certificates</h4><ul>${renderList(lang.certificates)}</ul>` : ''}
                            ${lang.courses && lang.courses.length > 0 ? `<h4>Courses taken</h4><ul>${renderList(lang.courses)}</ul>` : ''}
                            ${lang.books && lang.books.length > 0 ? `<h4>Books read</h4><ul>${renderList(lang.books)}</ul>` : ''}
                        </div>`;
            } else {
                html += `</div>`; // Close lang-header for Native/No details
            }
            
            langDiv.innerHTML = html;
            langContainer.appendChild(langDiv);

            const btn = langDiv.querySelector('.fold-btn');
            if (btn) {
                btn.onclick = () => {
                    const details = langDiv.querySelector('.details');
                    const isHidden = details.style.display === 'none';
                    details.style.display = isHidden ? 'block' : 'none';
                    btn.textContent = isHidden ? 'Hide Details' : 'Show Details';
                };
            }
        });
    });