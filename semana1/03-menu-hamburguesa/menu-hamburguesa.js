function initHamburguesaHeladeria() {
  $('#btn-hamb-helado').on('click', function(e) {
    e.stopPropagation();
    $('#nav-mob-helado').toggleClass('abierto');
  });
  $(document).on('click', function(e) {
    if (!$(e.target).closest('#nav-mob-helado, #btn-hamb-helado').length) {
      $('#nav-mob-helado').removeClass('abierto');
    }
  });
}
