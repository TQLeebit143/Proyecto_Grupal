let totalVentasHeladosBOB = 0;
function registrarBitacoraVenta(resumen, total, cliente) {
  const h = new Date().toLocaleTimeString();
  totalVentasHeladosBOB += total;
  $('#logHeladosVentas').prepend(`<div style="border-bottom:1px solid rgba(0,0,0,0.06); padding:4px 0;">[${h}] <strong>${cliente}</strong>: ${resumen} | <strong style="color:#10b981;">${total} BOB</strong></div>`);
  $('#totalCajaHelados').text(totalVentasHeladosBOB + ' BOB');
}
