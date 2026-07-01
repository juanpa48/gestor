// ============================================================
// UTILIDADES (escapeHtml, toast, búsqueda)
// ============================================================

window.escapeHtml = function(str) {
  if (typeof str !== 'string') str = String(str || '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
window.showToast = function(message, type) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast ' + type;
  toast.classList.remove('hidden');
  setTimeout(function () {
    toast.classList.add('hidden');
  }, 4000);
};

// ============================================================
// BÚSQUEDA
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  let searchTimeout = null;
  const searchInput = document.getElementById('searchInput');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const value = e.target.value;
      
      // Emitir evento para filtrar vistas en tiempo real
      document.dispatchEvent(new CustomEvent('searchTriggered', { detail: { query: value } }));

      clearTimeout(searchTimeout);
      removeSearchResults();
      if (value.trim().length < 2) return;

      searchTimeout = setTimeout(() => {
        if (window.DbService) {
          window.DbService.buscarActividades(value)
            .then(data => {
              if (data.success && data.resultados && data.resultados.length > 0) {
                showSearchResults(data.resultados);
              }
            })
            .catch(console.error);
        }
      }, 400);
    });
  }

  function showSearchResults(resultados) {
    removeSearchResults();
    const wrapper = document.querySelector('.search-wrapper');
    if (!wrapper) return;
    const div = document.createElement('div');
    div.className = 'search-results';
    div.id = 'searchResults';

    div.innerHTML = resultados.slice(0, 6).map(r => {
      return `
        <div class="search-result-item" data-id="${escapeHtml(r.id)}">
          <div class="sr-title">${escapeHtml(r.nombre || r.id)}</div>
          <div class="sr-meta">${escapeHtml(r.estado || '')} · ${escapeHtml(r.area || '')}</div>
        </div>
      `;
    }).join('');

    // Event delegation para resultados
    div.addEventListener('click', (e) => {
      const item = e.target.closest('.search-result-item');
      if (item) {
        const id = item.dataset.id;
        selectSearchResult(id);
      }
    });

    wrapper.appendChild(div);
  }

  function removeSearchResults() {
    const existing = document.getElementById('searchResults');
    if (existing) existing.remove();
  }

  function selectSearchResult(id) {
    removeSearchResults();
    if (searchInput) searchInput.value = '';
    showToast('Ticket ' + id + ' seleccionado', 'success');
    // Emitir evento personalizado para que tickets.js pueda abrir el modal
    document.dispatchEvent(new CustomEvent('ticketSeleccionado', { detail: { id } }));
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search-wrapper')) removeSearchResults();
  });
});
