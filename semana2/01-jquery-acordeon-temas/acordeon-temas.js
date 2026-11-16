function initAcordeonHelados() {
  $('.acc-helado-btn').on('click', function() {
    $(this).next('.acc-helado-panel').slideToggle(200);
  });
}
