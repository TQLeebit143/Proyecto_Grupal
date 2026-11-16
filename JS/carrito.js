let ordenHelados = [];
function agregarCarritoHelado(id) {
  const item = catalogoHelados.find(h => h.id === id);
  if (!item) return;
  const ex = ordenHelados.find(o => o.id === id);
  if (ex) ex.cant++; else ordenHelados.push({ ...item, cant: 1 });
  actualizarOrdenHelados();
  if (typeof registrarBitacoraEvento === 'function') {
    registrarBitacoraEvento('CARRITO', `+ Helado: "${item.nombre}" (${item.precio} BOB)`);
  }
}

function actualizarOrdenHelados() {
  const ul = $('#lista-orden-helados').empty();
  let total = 0; let count = 0;
  if (!ordenHelados.length) {
    ul.html('<li style="color:var(--text-sub); text-align:center; padding:15px 0;">Tu copa está vacía.</li>');
  } else {
    ordenHelados.forEach((item, idx) => {
      const sub = item.precio * item.cant;
      total += sub; count += item.cant;
      ul.append(`
        <li style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(0,0,0,0.06);">
          <div><strong>${item.nombre}</strong> <span style="font-size:0.75rem; color:var(--text-sub);">${item.cant}x ${item.precio} BOB</span></div>
          <span style="font-weight:bold; color:var(--accent);">${sub} BOB</span>
        </li>
      `);
    });
  }
  $('#totalOrdenHelados').text(total + ' BOB');
  $('#countHelados').text(count);
}

function enviarHeladosWhatsApp() {
  if (!ordenHelados.length) { alert("Añade helados a tu orden."); return; }
  const cliente = $('#nickHeladoCliente').val().trim() || 'Cliente';
  const total = ordenHelados.reduce((s, i) => s + (i.precio * i.cant), 0);
  let msg = `🍦 *Pedido Heladería Artesanal*\nCliente: *${cliente}*\n\n*Detalle:*\n`;
  ordenHelados.forEach(i => { msg += `• ${i.cant}x ${i.nombre} — ${i.precio * i.cant} BOB\n`; });
  msg += `\n💰 *Total: ${total} BOB*`;
  
  if (typeof registrarBitacoraVenta === 'function') {
    registrarBitacoraVenta(ordenHelados.map(i => `${i.cant}x ${i.nombre}`).join(', '), total, cliente);
  }
  window.open(`https://wa.me/59167301341?text=${encodeURIComponent(msg)}`, '_blank');
}
