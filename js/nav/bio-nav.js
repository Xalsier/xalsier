const overview = document.getElementById('overview-content');
const education = document.getElementById('education-content');

const btnOverview = document.getElementById('btn-overview');
const btnEducation = document.getElementById('btn-activism');

// Set active button
const setActiveButton = (activeBtn) => {
    [btnOverview, btnEducation].forEach(btn => {
        if (!btn) return;
        btn.style.opacity = btn === activeBtn ? "1" : "0.5";
    });
};

// Section Toggle Logic
const switchSection = (show, hide, activeBtn) => {
    if (!show || !hide) {
        console.error("Missing DOM elements:", { show, hide });
        return;
    }

    setActiveButton(activeBtn);

    hide.style.transition = "opacity 0.3s ease";
    hide.style.opacity = "0";

    setTimeout(() => {
        hide.style.display = 'none';

        show.style.display = 'block';
        show.offsetHeight; // reflow
        show.style.opacity = "1";
    }, 300);
};

if (btnEducation && btnOverview) {

    btnEducation.addEventListener('click', () => {
        switchSection(education, overview, btnEducation);
        location.hash = "Activism";
    });

    btnOverview.addEventListener('click', () => {
        switchSection(overview, education, btnOverview);
        history.replaceState(null, null, window.location.pathname);
    });

    // Hash handling on page load
    if (window.location.hash.toLowerCase() === '#activism') {
        overview.style.display = 'none';
        overview.style.opacity = '0';

        education.style.display = 'block';
        education.style.opacity = '1';

        setActiveButton(btnEducation);
    } else {
        setActiveButton(btnOverview);
    }
}