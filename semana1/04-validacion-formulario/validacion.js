function initValidacionHelados() {
  $('#form-pedido-helado').on('submit', function(e) {
    e.preventDefault();
    const cliente = $('#ped-cliente').val().trim();
    const cel = $('#ped-celular').val().trim();
    const sabor = $('#ped-sabor').val();

    if (!cliente || cliente.length < 2) {
      alert("Ingresa tu nombre para el pedido.");
      return;
    }
    if (!cel || !/^[67][0-9]{7}$/.test(cel)) {
      alert("Ingresa un celular válido de 8 dígitos de Bolivia.");
      return;
    }

    if (typeof registrarBitacoraEvento === 'function') {
      registrarBitacoraEvento('PEDIDO_EXPRESS', `Cliente: ${cliente} | Sabor: ${sabor}`);
    }
    const msg = `🍦 *Pedido Express Heladería Artesanal*\nCliente: *${cliente}*\nCelular: *${cel}*\nSabor preferido: *${sabor}*`;
    window.open(`https://wa.me/59167301341?text=${encodeURIComponent(msg)}`, '_blank');
    this.reset();
  });
}
