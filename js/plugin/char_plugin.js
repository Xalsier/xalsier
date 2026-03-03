document.addEventListener("DOMContentLoaded", () => {
    const select = document.querySelector(".character-list");
    const display = document.getElementById("characterDisplay");
  
    let characters = [];
  
    /* ================= LOAD JSON ================= */
  
    async function loadCharacters() {
      try {
        const res = await fetch("../json/char.json");
        const data = await res.json();
        characters = data.characters || [];
      } catch (error) {
        console.error("Failed to load char.json:", error);
      }
    }
  
    /* ================= HELPERS ================= */
  
    function createTrait(trait) {
      if (!trait) return "";
  
      const color = trait.color || "var(--green)";
      const style = `style="background:${color}"`;
  
      if (trait.link) {
        return `<a class="trait-tag trait-link" ${style} href="${trait.link}" target="_blank" rel="noopener">${trait.label}</a>`;
      }
  
      return `<span class="trait-tag" ${style}>${trait.label}</span>`;
    }
  
    function createInfoRow(label, value) {
      if (!value) return "";
      return `
        <div class="info-row">
          <span class="info-label">${label}</span>
          <span class="info-value">${value}</span>
        </div>
      `;
    }
  
    /* ================= VIEW MODE ================= */
  
    function renderCharacter(char) {
      const imageHTML = char.src
        ? `<img src="${char.src}" alt="${char.name}">`
        : `<div class="image-fallback"></div>`;
  
      const traitsHTML = (char.physicalTraits || [])
        .map(createTrait)
        .join("");
  
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
              <div class="info-grid">${infoRows}</div>
            </div>
            <div class="character-image">${imageHTML}</div>
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
  
    /* ================= CREATE MODE ================= */
  
    function renderCreateCharacter() {
      const pooledTraits = characters.flatMap(c => c.physicalTraits || []);
  
      display.innerHTML = `
        <div class="character-card">
          <div class="character-layout">
            <div class="character-text">
  
              <input class="create-title-input" placeholder="Character Name">
              <textarea class="create-blurb-input" placeholder="Character description..."></textarea>
  
              <div class="info-grid" id="createInfoGrid"></div>
              <button class="custom-btn" id="addInfoBtn">+ Add Info</button>
  
            </div>
  
            <div class="character-image">
              <div class="image-fallback"></div>
            </div>
          </div>
  
          <hr>
  
          <div class="traits">
            <h3>Physical Dossier</h3>
            <div class="traits-container" id="createTraits"></div>
            <button class="custom-btn" id="addTraitBtn">+ Add Trait</button>
          </div>
        </div>
      `;
  
      attachCreateHandlers(pooledTraits);
    }
  
    function attachCreateHandlers(pooledTraits) {
      const infoGrid = document.getElementById("createInfoGrid");
      const traitsContainer = document.getElementById("createTraits");
  
      const infoFields = [
        "Gender",
        "Sexuality",
        "Age",
        "Species",
        "Eye Color",
        "World Rating",
        "Last Status Update"
      ];
  
      /* ==== TITLE CONVERT ==== */
  
      const titleInput = document.querySelector(".create-title-input");
      titleInput.addEventListener("keydown", e => {
        if (e.key === "Enter" && titleInput.value.trim()) {
          const h2 = document.createElement("h2");
          h2.textContent = titleInput.value.trim();
          titleInput.replaceWith(h2);
        }
      });
  
      /* ==== BLURB CONVERT ==== */
  
      const blurbInput = document.querySelector(".create-blurb-input");
      blurbInput.addEventListener("keydown", e => {
        if (e.key === "Enter" && blurbInput.value.trim()) {
          e.preventDefault();
          const p = document.createElement("p");
          p.className = "blurb";
          p.textContent = blurbInput.value.trim();
          blurbInput.replaceWith(p);
        }
      });
  
      /* ==== ADD INFO ==== */
  
      document.getElementById("addInfoBtn").addEventListener("click", () => {
        const wrapper = document.createElement("div");
        wrapper.className = "create-input-row";
  
        wrapper.innerHTML = `
          ${createCustomSelect(infoFields)}
          <input type="text" class="custom-input" placeholder="Enter value">
        `;
  
        infoGrid.appendChild(wrapper);
  
        const input = wrapper.querySelector(".custom-input");
        const select = wrapper.querySelector(".custom-select");
  
        input.addEventListener("keydown", e => {
          if (e.key === "Enter" && input.value.trim()) {
            const label = select.dataset.value;
            wrapper.replaceWith(
              htmlToElement(createInfoRow(label, input.value.trim()))
            );
          }
        });
      });
  
      /* ==== ADD TRAIT ==== */
  
      document.getElementById("addTraitBtn").addEventListener("click", () => {
        const wrapper = document.createElement("div");
        wrapper.className = "create-input-row";
  
        wrapper.innerHTML = `
          ${createCustomSelect(pooledTraits.map(t => t.label))}
          <input type="text" class="custom-input" placeholder="Or enter new trait">
        `;
  
        traitsContainer.appendChild(wrapper);
  
        const input = wrapper.querySelector(".custom-input");
        const select = wrapper.querySelector(".custom-select");
  
        function finalizeTrait(label) {
          const found = pooledTraits.find(t => t.label === label);
          wrapper.replaceWith(
            htmlToElement(createTrait(found || { label }))
          );
        }
  
        input.addEventListener("keydown", e => {
          if (e.key === "Enter" && input.value.trim()) {
            finalizeTrait(input.value.trim());
          }
        });
  
        select.addEventListener("customSelect", e => {
          finalizeTrait(e.detail);
        });
      });
    }
  
    function htmlToElement(html) {
      const div = document.createElement("div");
      div.innerHTML = html.trim();
      return div.firstChild;
    }
  
    /* ================= CUSTOM SELECT ================= */
  
    function createCustomSelect(options) {
      return `
        <div class="custom-select" data-value="${options[0]}">
          <div class="custom-select-display">${options[0]}</div>
          <div class="custom-select-dropdown">
            ${options.map(o => `<div class="custom-option">${o}</div>`).join("")}
          </div>
        </div>
      `;
    }
  
    document.addEventListener("click", e => {
      const option = e.target.closest(".custom-option");
      if (option) {
        const parent = option.closest(".custom-select");
        parent.dataset.value = option.textContent;
        parent.querySelector(".custom-select-display").textContent = option.textContent;
        parent.classList.remove("open");
  
        parent.dispatchEvent(
          new CustomEvent("customSelect", { detail: option.textContent })
        );
        return;
      }
  
      const select = e.target.closest(".custom-select");
      if (select) {
        document.querySelectorAll(".custom-select").forEach(s => {
          if (s !== select) s.classList.remove("open");
        });
        select.classList.toggle("open");
        return;
      }
  
      document.querySelectorAll(".custom-select").forEach(s =>
        s.classList.remove("open")
      );
    });
  
    /* ================= CHARACTER SELECT ================= */
  
    select.addEventListener("change", () => {
      const selectedId = Number(select.value);
  
      if (selectedId === 0) {
        renderCreateCharacter();
        return;
      }
  
      const character = characters.find(c => c.id === selectedId);
      if (character) renderCharacter(character);
    });
  
    loadCharacters();
  });