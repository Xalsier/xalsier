// utility.js

const announcementData = {
    avatarSrc: './thumb/fuwa.jpg',
    avatarTitle: '(Fuwa) Xalsier\'s profile on Social Media.',
    avatarAlt: 'A drawing of the character Fuwa, an anthropomorphic rabbit. Xalsier\'s main profile image on social media.',
    name: 'Xalsier',
  };
  
  function updateAnnouncementCard() {
    const avatarElement = document.getElementById('announcement-avatar');
    const nameElement = document.getElementById('announcement-name');
  
    if (avatarElement) {
      avatarElement.src = announcementData.avatarSrc;
      avatarElement.title = announcementData.avatarTitle;
      avatarElement.alt = announcementData.avatarAlt;
    }
    
    if (nameElement) {
      nameElement.textContent = announcementData.name;
    }
  }
  
  // Call the function when the page loads
  document.addEventListener('DOMContentLoaded', updateAnnouncementCard);


  // update-announcement.js

document.addEventListener('DOMContentLoaded', () => {
    const mdFilePath = './md/not/0.md';
  
    fetch(mdFilePath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(markdown => {
        const dateRegex = /^{{([^}]+)}}/;
        const match = markdown.match(dateRegex);
        const dateString = match ? match[1].trim() : 'Date not found';
        const messageContent = markdown.replace(dateRegex, '').trim();
  
        const announcementDateElement = document.getElementById('announcement-date');
        const announcementMessageElement = document.getElementById('announcement-message');
  
        if (announcementDateElement) {
          announcementDateElement.textContent = dateString;
        }
  
        if (announcementMessageElement) {
          // Simple markdown to HTML conversion for <br><br>
          const formattedMessage = messageContent.replace(/<br><br>/g, '<p>');
          announcementMessageElement.innerHTML = formattedMessage;
        }
      })
      .catch(error => {
        console.error('Error fetching or processing markdown file:', error);
      });
  });