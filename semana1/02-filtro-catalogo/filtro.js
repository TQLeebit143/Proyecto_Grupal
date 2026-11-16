let catHeladoActiva = 'todos';
function initFiltrosHelados() {
  $('.chip-helado').on('click', function() {
    $('.chip-helado').removeClass('active');
    $(this).addClass('active');
    catHeladoActiva = $(this).data('cat') || 'todos';
    aplicarFiltrosHelados();
    if (typeof registrarBitacoraEvento === 'function') {
      registrarBitacoraEvento('FILTRO', `Categoría: ${catHeladoActiva.toUpperCase()}`);
    }
  });

  $('#inputHelados').on('keyup input', function() {
    aplicarFiltrosHelados();
  });
}
function aplicarFiltrosHelados() {
  const q = ($('#inputHelados').val() || '').toLowerCase().trim();
  const res = catalogoHelados.filter(h => {
    const okCat = (catHeladoActiva === 'todos') || (h.categoria === catHeladoActiva);
    const okQ = !q || h.nombre.toLowerCase().includes(q) || h.descripcion.toLowerCase().includes(q);
    return okCat && okQ;
  });
  if (typeof renderizarHelados === 'function') renderizarHelados(res);
}
