/* sidebar.js
   Compatible with your existing toggleModal(true) calls.
   Place this file at ./js/sidebar.js and include it in notice.html BEFORE notice.js (or at end — DOMContentLoaded used).
*/

(function () {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('siteSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarCloseBtn');
  
    if (!sidebar || !overlay || !toggleBtn) {
      // if any of these are missing, nothing to bind — silently skip (keeps other pages safe)
      window.toggleSidebar = function (open) {
        console.warn('Sidebar components not present on this page.');
      };
      window.toggleModal = window.toggleSidebar;
      return;
    }
  
    function setOpenState(open) {
      sidebar.setAttribute('data-open', open ? 'true' : 'false');
      overlay.setAttribute('data-open', open ? 'true' : 'false');
      sidebar.setAttribute('aria-hidden', open ? 'false' : 'true');
      overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  
    function toggleSidebar(open) {
      const currentlyOpen = sidebar.getAttribute('data-open') === 'true';
      const shouldOpen = typeof open === 'boolean' ? open : !currentlyOpen;
      setOpenState(shouldOpen);
      if (shouldOpen) {
        // focus first link in sidebar for keyboard users
        setTimeout(() => {
          const firstLink = sidebar.querySelector('a');
          if (firstLink) firstLink.focus();
        }, 220);
      } else {
        toggleBtn.focus();
      }
    }
  
    // initial state read from attribute (already set in HTML). Ensure aria is consistent.
    const initialOpen = sidebar.getAttribute('data-open') === 'true';
    setOpenState(initialOpen);
  
    // event bindings
    toggleBtn.addEventListener('click', () => toggleSidebar(true));
    overlay.addEventListener('click', () => toggleSidebar(false));
    closeBtn.addEventListener('click', () => toggleSidebar(false));
  
    // close on ESC
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') toggleSidebar(false);
    });
  
    // collapse/expand group toggles
    document.querySelectorAll('.sidebar-group').forEach(group => {
      const toggle = group.querySelector('.group-toggle');
      const list = group.querySelector('.group-list');
  
      // Ensure initial aria-expanded matches data-open
      const isOpen = group.getAttribute('data-open') === 'true';
      if (toggle) toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  
      toggle && toggle.addEventListener('click', () => {
        const cur = group.getAttribute('data-open') === 'true';
        group.setAttribute('data-open', !cur);
        toggle.setAttribute('aria-expanded', !cur ? 'true' : 'false');
      });
  
      // close sidebar when clicking a link inside (desktop/mobile friendly)
      group.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          // small delay so navigation still happens in older browsers; also closes sidebar for SPA UX
          setOpenState(false);
        });
      });
    });
  
    // expose API for legacy calls (your header still calls toggleModal(true))
    window.toggleSidebar = toggleSidebar;
    window.toggleModal = toggleSidebar; // backwards-compatible with existing onclicks
  })();
  