
  
  // Create and inject the character profile modal HTML
  function createCharacterModal() {
    const modalHTML = `
      <div id="characterModal" class="character-modal">
        <div class="character-modal-content">
          <span class="close-character-modal">&times;</span>
          <div class="character-profile">
            <div class="character-header">
              <img id="characterImage" src="/placeholder.svg" alt="Character Image">
              <div class="character-title">
                <h2 id="characterName"></h2>
                <p id="characterProject"></p>
              </div>
            </div>
            <div class="character-details">
              <p id="characterDescription"></p>
              <div class="character-traits">
                <h3>Traits</h3>
                <ul id="characterTraits"></ul>
              </div>
              <div class="character-background">
                <h3>Background</h3>
                <p id="characterBackground"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  
    document.body.insertAdjacentHTML("beforeend", modalHTML)
  
    // Add event listener to close button
    document.querySelector(".close-character-modal").addEventListener("click", closeCharacterModal)
  
    // Close modal when clicking outside the content
    document.getElementById("characterModal").addEventListener("click", function (event) {
      if (event.target === this) {
        closeCharacterModal()
      }
    })
  }
  
  // Display character profile modal with data
  function showCharacterProfile(characterName) {
    const character = characterData[characterName]
  
    if (!character) {
      console.error(`No data found for character: ${characterName}`)
      return
    }
  
    // Populate modal with character data
    document.getElementById("characterImage").src = character.image
    document.getElementById("characterImage").alt = character.name
    document.getElementById("characterName").textContent = character.name
    document.getElementById("characterProject").textContent = character.project
    document.getElementById("characterDescription").textContent = character.description
  
    // Clear and populate traits
    const traitsList = document.getElementById("characterTraits")
    traitsList.innerHTML = ""
    character.traits.forEach((trait) => {
      const li = document.createElement("li")
      li.textContent = trait
      traitsList.appendChild(li)
    })
  
    document.getElementById("characterBackground").textContent = character.background
  
    // Show the modal
    document.getElementById("characterModal").style.display = "flex"
  }
  
  // Close the character profile modal
  function closeCharacterModal() {
    document.getElementById("characterModal").style.display = "none"
  }
  
  // Initialize character profile system
  function initCharacterProfiles() {
    // Create the modal if it doesn't exist
    if (!document.getElementById("characterModal")) {
      createCharacterModal()
    }
  
    // Add click event listeners to all character items
    document.querySelectorAll(".art-item").forEach((item) => {
      item.addEventListener("click", function () {
        const characterName = this.querySelector(".art-title").textContent
        showCharacterProfile(characterName)
      })
    })
  }
  
  // Initialize when the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", initCharacterProfiles)
  