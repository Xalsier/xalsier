const modal = document.getElementById('navModal');
function toggleModal(show) {
  modal.style.display = show ? 'flex' : 'none';
}

function navigate(select) {
  window.location.href = select.value;
}