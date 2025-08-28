document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.nav-tab');
    const analyticsContent = document.getElementById('analytics-content');
    const socialMediaContent = document.getElementById('social-media-content');
  
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        this.classList.add('active');
  
        // Show/hide content based on selected tab
        if (this.dataset.channel === 'rawr-folder') {
          analyticsContent.style.display = 'block';
          socialMediaContent.style.display = 'none';
        } else if (this.dataset.channel === 'social-media') {
          analyticsContent.style.display = 'none';
          socialMediaContent.style.display = 'block';
          renderInfographic();
        }
      });
    });
  });