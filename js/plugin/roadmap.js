window.onload = () => {
    setTimeout(() => {
        document.getElementById('roadmapCard').classList.add('animate-slide');
    }, 800);

    const phases = [
        { name: "Brainstorming", percent: 10, desc: "(Est. 1-2 Days)" },
        { name: "Concept Sketching", percent: 33, desc: "(Est. 2-4 Days)" },
        { name: "Vectorizing & Cleanup", percent: 77, desc: "(Est. 1-2 Days)" },
        { name: "Break", percent: 5, desc: "(Est. 1-2 Days)" }
    ];

    let currentPhase = 0;
    const footer = document.getElementById('footerSection');
    const bar = document.getElementById('progressBar');
    const pName = document.getElementById('phaseName');
    const pDesc = document.getElementById('phaseDesc');
    const pPerc = document.getElementById('percentText');

    function updateProgress() {
        const phase = phases[currentPhase];
    
        footer.classList.add('fade-out');
    
        setTimeout(() => {
            // Reset only when looping from 100% back to 0%
            if (currentPhase === 0) {
                bar.style.transition = 'none';
                bar.style.width = '0%';
                bar.offsetHeight; // force reflow
            }
    
            pName.innerText = phase.name;
            pDesc.innerText = phase.desc;
            pPerc.innerText = phase.percent + "%";
    
            footer.classList.remove('fade-out');
    
            setTimeout(() => {
                bar.style.transition = 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
                bar.style.width = phase.percent + "%";
            }, 50);
    
            // Advance phase AFTER animation + dwell
            setTimeout(() => {
                currentPhase = (currentPhase + 1) % phases.length;
            }, phase.percent === 100 ? 2500 : 1200);
    
        }, 400);
    }
    

    updateProgress();
    setInterval(updateProgress, 5000);
};