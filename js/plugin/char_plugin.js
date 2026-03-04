document.addEventListener("DOMContentLoaded", () => {
    const select = document.querySelector(".character-list");
    const display = document.getElementById("characterDisplay");
  
    let characters = [];
    let traitGroups = [];
  
    async function loadCharacters() {
      try {
        const [charRes, traitRes] = await Promise.all([
          fetch("../json/char.json"),
          fetch("../json/traits.json")
        ]);
  
        const charData = await charRes.json();
        const traitData = await traitRes.json();
  
        characters = charData.characters || [];
        traitGroups = traitData.traits || [];
  
        addTraitCounts();
      } catch (error) {
        console.error("Failed to load JSON files:", error);
      }
    }
  
    function addTraitCounts() {
      const traitCountMap = {};
      characters.forEach(c => {
        (c.physicalTraits || []).forEach(t => {
          traitCountMap[t.label] = (traitCountMap[t.label] || 0) + 1;
        });
      });
  
      traitGroups.forEach(group => {
        group.items.forEach(trait => {
          trait.count = traitCountMap[trait.label] || 0;
        });
      });
    }
  
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
  
    function htmlToElement(html) {
      const div = document.createElement("div");
      div.innerHTML = html.trim();
      return div.firstChild;
    }
  
    function renderCharacter(char) {
      const imageHTML = char.src
        ? `<img src="${char.src}" alt="${char.name}">`
        : `<div class="image-fallback"></div>`;
  
      const traitsHTML = (char.physicalTraits || []).map(createTrait).join("");
  
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
  
    function renderCreateCharacter() {
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
  
      attachCreateHandlers();
    }
  
    function attachCreateHandlers() {
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
  
      const titleInput = document.querySelector(".create-title-input");
      titleInput.addEventListener("keydown", e => {
        if (e.key === "Enter" && titleInput.value.trim()) {
          const h2 = document.createElement("h2");
          h2.textContent = titleInput.value.trim();
          titleInput.replaceWith(h2);
        }
      });
  
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
            wrapper.replaceWith(htmlToElement(createInfoRow(label, input.value.trim())));
          }
        });
      });
  
      document.getElementById("addTraitBtn").addEventListener("click", () => {
        const wrapper = document.createElement("div");
        wrapper.className = "create-input-row";
  
        // Create pseudo-group for infoFields so Add Trait can select them too
        const infoFieldGroup = {
          group: "Info Fields",
          items: infoFields.map(f => ({ label: f, count: 0 }))
        };
  
        const allGroups = [...traitGroups, infoFieldGroup];
  
        wrapper.innerHTML = `
          ${createCustomSelectGrouped(allGroups)}
          <input type="text" class="custom-input" placeholder="Or enter new trait">
        `;
  
        traitsContainer.appendChild(wrapper);
  
        const input = wrapper.querySelector(".custom-input");
        const select = wrapper.querySelector(".custom-select");
  
        function finalizeTrait(label) {
          let found;
          for (const group of allGroups) {
            found = group.items.find(t => t.label === label);
            if (found) break;
          }
          wrapper.replaceWith(htmlToElement(createTrait(found || { label })));
        }
  
        input.addEventListener("keydown", e => {
          if (e.key === "Enter" && input.value.trim()) finalizeTrait(input.value.trim());
        });
  
        select.addEventListener("customSelect", e => finalizeTrait(e.detail));
      });
    }
  
    function createCustomSelect(fields) {
      const first = fields[0] || "";
      return `
        <div class="custom-select" data-value="${first}">
          <div class="custom-select-display">${first}</div>
          <div class="custom-select-dropdown">
            ${fields.map(f => `<div class="custom-option">${f}</div>`).join("")}
          </div>
        </div>
      `;
    }
  
    function createCustomSelectGrouped(groups) {
      const firstLabel = groups[0]?.items?.[0]?.label || "";
      return `
        <div class="custom-select" data-value="${firstLabel}">
          <div class="custom-select-display">${firstLabel}</div>
          <div class="custom-select-dropdown">
            ${groups
              .map(g => {
                return `
                  <div class="custom-option-group-label">${g.group}</div>
                  ${g.items
                    .map(i => `<div class="custom-option">${i.label}${i.count ? ` (${i.count})` : ""}</div>`)
                    .join("")}
                `;
              })
              .join("")}
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
  
        parent.dispatchEvent(new CustomEvent("customSelect", { detail: option.textContent }));
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
  
      document.querySelectorAll(".custom-select").forEach(s => s.classList.remove("open"));
    });
  
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