function renderizarHelados(lista) {
  const c = $('#grid-helados-container').empty();
  if (!lista.length) {
    c.html('<p style="grid-column:1/-1; text-align:center; color:var(--text-sub);">🍦 No se encontraron helados con este filtro.</p>');
    return;
  }
  lista.forEach(item => {
    c.append(`
      <article class="tarjeta-helado" onclick="abrirZoomHelado('${item.img}', '${item.nombre}', '${item.descripcion}', ${item.precio})">
        <div class="tarjeta-helado-img-wrap">
          <img src="${item.img}" alt="${item.nombre}" loading="lazy">
          <button class="btn-zoom-h" onclick="event.stopPropagation(); abrirZoomHelado('${item.img}', '${item.nombre}', '${item.descripcion}', ${item.precio})">🔍 Zoom</button>
        </div>
        <div class="tarjeta-helado-body">
          <span style="font-size:0.7rem; color:var(--accent); font-weight:bold;">${item.catLabel}</span>
          <h4>${item.nombre}</h4>
          <p>${item.descripcion}</p>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="precio-h">${item.precio} BOB</span>
            <button class="btn-add-h" onclick="event.stopPropagation(); agregarCarritoHelado(${item.id})">+ Añadir</button>
          </div>
        </div>
      </article>
    `);
  });
}
