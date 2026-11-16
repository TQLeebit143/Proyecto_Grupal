function registrarBitacoraEvento(tipo, msg) {
  const h = new Date().toLocaleTimeString();
  $('#logHeladosEventos').prepend(`<div>[${h}] <strong style="color:var(--accent,#ff6b81);">${tipo}:</strong> ${msg}</div>`);
}
