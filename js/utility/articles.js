function updateCharacterProfile() {
    const profileSection = document.getElementById("characterProfileSection");
    const activeFilters = Array.from(archiveState.activeFilters.values());

    profileSection.style.display = "none";
  
    const activeProfileFilters = activeFilters.filter(filter => 
      characterData.hasOwnProperty(filter.name)
    );
  
    if (activeProfileFilters.length === 1) {
      const profileInfo = characterData[activeProfileFilters[0].name];
      
      try {
        if (profileInfo) {
          showCharacterProfile(profileInfo);
          profileSection.style.display = "block";
        }
      } catch (error) {
        console.error("Failed to display character profile:", error);
        profileSection.style.display = "none";
      }
    }
}

function showCharacterProfile(character) {
  const profileImage = document.getElementById("profileImage");
  const profileBackground = document.getElementById("profileBackground");
  const profileMarkdown = document.getElementById("profileMarkdown");

  // image
  if (character.image) {
    profileImage.src = character.image;
    profileImage.classList.remove('no-image');
  } else {
    profileImage.src = '';
    profileImage.classList.add('no-image');
  }

  // basic info
  document.getElementById("profileName").textContent = character.name || "Unnamed";
  document.getElementById("profileProject").textContent = character.project || "N/A";

  // markdown / story
  profileMarkdown.innerHTML = ""; // clear
  if (character.markdown) {
    profileMarkdown.innerHTML = "Loading...";
    loadMarkdownContent(`./md/${character.markdown}`).then(html => {
      profileMarkdown.innerHTML = html;
    });
  }

  // traits
  const traitsContainer = document.getElementById("profileTraits");
  traitsContainer.innerHTML = "";
  if (character.traits) {
    character.traits.forEach((trait) => {
      const traitTag = document.createElement("span");
      traitTag.className = "trait-tag";
      traitTag.textContent = trait;
      traitsContainer.appendChild(traitTag);
    });
  }
}


// A simple, native JavaScript markdown handler
async function loadMarkdownContent(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load markdown file: ${filePath}`);
      }
      const markdownText = await response.text();
      
      // Basic Markdown to HTML conversion
      let htmlContent = markdownText
        // Convert **text** to <strong>text</strong>
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Convert *text* to <em>text</em>
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Convert # Heading to <h1>Heading</h1>
        .replace(/^#\s(.*?)$/gm, '<h1>$1</h1>')
        // Convert ## Heading to <h2>Heading</h2>
        .replace(/^##\s(.*?)$/gm, '<h2>$1</h2>')
        // Convert ### Heading to <h3>Heading</h3>
        .replace(/^###\s(.*?)$/gm, '<h3>$1</h3>')
        // Convert newlines to breaks, excluding lines that are already part of an HTML tag
        .replace(/(?<!^>)(?<!<\/.*?>)\n/g, '<br>');
        
      // Handle paragraphs for cleaner output
      htmlContent = htmlContent.split('<br><br>').map(p => `<p>${p}</p>`).join('');
  
      return htmlContent;
    } catch (error) {
      console.error(error);
      return `<p>Error loading content: ${filePath}</p>`;
    }
  }