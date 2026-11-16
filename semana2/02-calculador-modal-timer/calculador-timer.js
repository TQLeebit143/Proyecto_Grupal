function abrirZoomHelado(src, nombre, desc, precio) {
  $('#zoom-helado-img').attr('src', src);
  $('#zoom-helado-nombre').text(nombre);
  $('#zoom-helado-desc').text(desc);
  $('#zoom-helado-precio').text(precio + ' BOB');
  $('#modal-zoom-helado').fadeIn(200).css('display', 'flex');

  if (typeof registrarBitacoraEvento === 'function') {
    registrarBitacoraEvento('ZOOM', `Helado ampliado: "${nombre}"`);
  }
}
function cerrarZoomHelado() {
  $('#modal-zoom-helado').fadeOut(150);
}
