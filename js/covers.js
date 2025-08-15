// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  initializeChannelTabs();
  loadChannelVideos('xalsier'); // Default to Xalsier channel
  initializeFadeInAnimations();
});

// Initialize channel tab functionality
function initializeChannelTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Load videos for selected channel
      const channel = this.getAttribute('data-channel');
      loadChannelVideos(channel);
    });
  });
}

// Helper function to extract YouTube embed ID from URL
function getYouTubeEmbedId(urlOrId) {
  // If it already looks like an embedId (alphanumeric, 11 chars typical), return as-is
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }

  let embedId = null;

  try {
    // Attempt to parse as a "shorts" URL first
    const shortsMatch = urlOrId.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch && shortsMatch[1]) {
      embedId = shortsMatch[1];
      return embedId;
    }

    // If that fails, try normal YouTube URL
    const normalMatch = urlOrId.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (normalMatch && normalMatch[1]) {
      embedId = normalMatch[1];
      return embedId;
    }
  } catch (err) {
    console.error('Error parsing YouTube URL:', urlOrId, err);
  }

  // If both fail, return null
  return null;
}

// Load videos for selected channel
function loadChannelVideos(channel) {
  const videosGrid = document.getElementById('videos-grid');
  const videos = channelData[channel] || [];
  
  if (videos.length === 0) {
    videosGrid.innerHTML = '<div class="no-videos">No videos available for this channel yet.</div>';
    return;
  }
  
  let html = '';
  videos.forEach((video, index) => {
    // Support old embedId or new URL
    const embedId = getYouTubeEmbedId(video.embedId || video.url);
    if (!embedId) {
      console.error('Failed to parse YouTube URL or embed ID for video:', video);
      return;
    }

    html += `
      <div class="cover-card fade-in" style="animation-delay: ${index * 0.1}s">
        <div class="cover-header">
          <h2 class="cover-title">${video.title}</h2>
          <div class="cover-date">${video.date}</div>
        </div>
        <div class="video-container">
          <iframe src="https://www.youtube.com/embed/${embedId}?rel=0&modestbranding=1"
                  title="${video.title}"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen>
          </iframe>
        </div>
      </div>
    `;
  });
  
  videosGrid.innerHTML = html;
  
  // Re-initialize fade-in animations for new content
  setTimeout(() => {
    initializeFadeInAnimations();
  }, 100);
}

// Initialize fade-in animations
function initializeFadeInAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
}

// Modal functionality
function toggleModal(show) {
  const modal = document.getElementById('navModal');
  if (show) {
    modal.style.display = 'flex';
  } else {
    modal.style.display = 'none';
  }
}

function navigate(select) {
  const value = select.value;
  if (value) {
    window.location.href = value;
  }
}

// Add CSS for no-videos message
const style = document.createElement('style');
style.textContent = `
  .no-videos {
    text-align: center;
    color: #aaa;
    font-size: 1.2rem;
    padding: 3rem;
    grid-column: 1 / -1;
  }
`;
document.head.appendChild(style);
