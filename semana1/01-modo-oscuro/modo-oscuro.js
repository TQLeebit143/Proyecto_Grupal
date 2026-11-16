function initModoOscuroHeladeria() {
  const t = localStorage.getItem('helado_tema') || 'light';
  if (t === 'dark') $('body').addClass('dark-theme');
  $('#btn-tema').on('click', function() {
    $('body').toggleClass('dark-theme');
    const isDark = $('body').hasClass('dark-theme');
    localStorage.setItem('helado_tema', isDark ? 'dark' : 'light');
    $(this).html(isDark ? '☀️ Modo Claro' : '🌙 Modo Noche');
    if (typeof registrarBitacoraEvento === 'function') {
      registrarBitacoraEvento('TEMA', `Tema cambiado a: ${isDark ? 'OSCURO' : 'CLARO'}`);
    }
  });
}
