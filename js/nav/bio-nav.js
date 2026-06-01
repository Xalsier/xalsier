
    const overview = document.getElementById('overview-content');
    const education = document.getElementById('education-content');
    const btnOverview = document.getElementById('btn-overview');
    const btnEducation = document.getElementById('btn-activism');

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

