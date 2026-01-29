document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('.nav-tab');
  const analyticsContent = document.getElementById('analytics-content');
  const socialMediaContent = document.getElementById('social-media-content');
  const websiteContent = document.getElementById('website-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      this.classList.add('active');

      // Hide all content sections initially
      analyticsContent.style.display = 'none';
      socialMediaContent.style.display = 'none';
      websiteContent.style.display = 'none';

      // Show content based on the selected tab
      if (this.dataset.channel === 'rawr-folder') {
        analyticsContent.style.display = 'block';
      } else if (this.dataset.channel === 'social-media') {
        socialMediaContent.style.display = 'block';
        renderInfographic(); // Renders infographic for social media section
      } else if (this.dataset.channel === 'website') {
        websiteContent.style.display = 'block';
      }
    });
  });
});
console.log("Toggles Set Up")