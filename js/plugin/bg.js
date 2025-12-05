const switchButton = document.getElementById("switch-bg");
const placeholder = document.getElementById("rasterMapPlaceholder");

function toggleColors(elements, isAlternate) {
    elements.forEach((element) => {
        const currentColor = element.getAttribute("fill");
        const newColor = isAlternate
            ? element.getAttribute("data-default-color")
            : element.getAttribute("data-alternate-color");
        element.setAttribute("fill", newColor);
        element.setAttribute("data-default-color", currentColor);
    });
}

switchButton.addEventListener("click", () => {
    const isAlternate = placeholder.classList.toggle("alternate-theme");
    toggleColors(placeholder.querySelectorAll("circle"), isAlternate);
    toggleColors(placeholder.querySelectorAll("path"), isAlternate);
});

window.addEventListener("DOMContentLoaded", () => {
    if (Math.random() < 0.5) {
        switchButton.click();
    } else {
        placeholder.classList.add("alternate-theme");
        toggleColors(placeholder.querySelectorAll("circle"), false);
        toggleColors(placeholder.querySelectorAll("path"), false);
    }
});