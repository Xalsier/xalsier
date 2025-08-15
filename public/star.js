let activeFilter = "All"
const STAR_SVG = (filled) => `
  <svg class="star ${filled ? "filled" : "empty"}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <polygon points="10,1 12.5,7 19,7.5 14,12 15.5,18 10,14.5 4.5,18 6,12 1,7.5 7.5,7" />
  </svg>
`