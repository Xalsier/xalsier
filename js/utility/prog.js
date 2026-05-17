document.addEventListener("DOMContentLoaded", () => {
    const selects = document.querySelector(".filter-section");
    const gallery = document.querySelector(".gallery-section");
    const footer = document.querySelector("footer");

    // Step 1: show announcement
    setTimeout(() => {

      // Step 2: show selects
      setTimeout(() => {
        selects.classList.add("pop-in");

        // Step 3: show gallery
        setTimeout(() => {
          gallery.classList.add("pop-in");

          // Step 4: show footer
          setTimeout(() => {
            footer.classList.add("pop-in");
          }, 500);
        }, 500);
      }, 200);
    }, 200); // slight delay so body isn’t empty-flash
  });