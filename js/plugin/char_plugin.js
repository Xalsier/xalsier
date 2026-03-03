document.addEventListener("DOMContentLoaded", () => {
    const select = document.querySelector(".character-list");
    const display = document.getElementById("characterDisplay");
  
    let characters = [];
  
    async function loadCharacters() {
      try {
        const res = await fetch("../json/char.json");
        const data = await res.json();
        characters = data.characters || [];
      } catch (error) {
        console.error("Failed to load char.json:", error);
      }
    }
  
    function createTrait(trait) {
      if (!trait) return "";
      if (trait.link) {
        return `<a class="trait-tag trait-link" href="${trait.link}" target="_blank" rel="noopener">${trait.label}</a>`;
      }
      return `<span class="trait-tag">${trait.label}</span>`;
    }
  
    function renderCharacter(char) {
        const imageHTML = char.src
          ? `<img src="${char.src}" alt="${char.name}">`
          : `<div class="image-placeholder"></div>`;
      
        const traitsHTML = (char.physicalTraits || [])
          .map(createTrait)
          .join("");
      
        function createInfoRow(label, value) {
          if (value === undefined || value === null || value === "") {
            return "";
          }
          return `
            <div class="info-row">
              <span class="info-label">${label}</span>
              <span class="info-value" style="color: var(--green);">${value}</span>
            </div>
          `;
        }
      
        const infoRows = `
          ${createInfoRow("Gender", char.gender)}
          ${createInfoRow("Sexuality", char.sexuality)}
          ${createInfoRow("Age", char.age)} 
          ${createInfoRow("Species", char.species)}
          ${createInfoRow("Eye Color", char.eyeColor)}
          ${createInfoRow("Last Status Update", char.lastStatusUpdate)}
          ${createInfoRow("World Rating", char.worldRating ?? "Unrated")}
        `;
      
        display.innerHTML = `
          <div class="character-card">
            <div class="character-layout">
              <div class="character-text">
                <h2>${char.name}</h2>
                <p class="blurb">${char.blurb}</p>
      
                ${infoRows.trim() ? `
                  <div class="info-grid">
                    ${infoRows}
                  </div>
                ` : ""}
      
              </div>
      
              <div class="character-image">
                ${imageHTML}
              </div>
            </div>
      
            <hr>
      
            <div class="traits">
              <h3>Physical Dossier</h3>
              <div class="traits-container">
                ${traitsHTML || "<span>No special traits listed.</span>"}
              </div>
            </div>
          </div>
        `;
      }
  
    select.addEventListener("change", () => {
      const selectedId = Number(select.value);
      if (!selectedId) return;
  
      const character = characters.find(c => c.id === selectedId);
      if (!character) return;
  
      renderCharacter(character);
    });
  
    loadCharacters();
  });