$(document).ready(function() {
  if (typeof renderizarHelados === 'function' && typeof catalogoHelados !== 'undefined') {
    renderizarHelados(catalogoHelados);
  }
  if (typeof initModoOscuroHeladeria === 'function') initModoOscuroHeladeria();
  if (typeof initFiltrosHelados === 'function') initFiltrosHelados();
  if (typeof initHamburguesaHeladeria === 'function') initHamburguesaHeladeria();
  if (typeof initValidacionHelados === 'function') initValidacionHelados();
  if (typeof initAcordeonHelados === 'function') initAcordeonHelados();
  if (typeof initPWAHelados === 'function') initPWAHelados();
});
