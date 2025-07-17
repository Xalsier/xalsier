const modal = document.getElementById('navModal');
function toggleModal(show) {
  modal.style.display = show ? 'flex' : 'none';
}

function navigate(select) {
  window.location.href = select.value;
}

const socialLinks = [
  { href: 'https://x.com/Xalsier', src: './svg/soc/x.svg', alt: 'X' },
  { href: 'https://instagram.com/xalsier', src: './svg/soc/insta.svg', alt: 'Instagram' },
  { href: 'https://bsky.app/profile/xalsier.bsky.social', src: './svg/soc/blue.svg', alt: 'Blue' }
];

const container = document.getElementById('socialBar');

socialLinks.forEach(link => {
  fetch(link.src)
    .then(res => res.text())
    .then(svg => {
      const wrapper = document.createElement('a');
      wrapper.href = link.href;
      wrapper.classList.add('social-icon');
      wrapper.innerHTML = svg;
      container.appendChild(wrapper);
    })
    .catch(err => console.error(`Failed to load ${link.src}`, err));
});