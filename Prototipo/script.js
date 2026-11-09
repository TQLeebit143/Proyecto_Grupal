const catalogoHelados = [
  {
    id: 1,
    nombre: "Vainilla Bourbon de Madagascar",
    categoria: "cremosos",
    subtitulo: "Crema Real & Vaina Artesanal",
    precio: 15,
    img: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=400&auto=format&fit=crop",
    descripcion: "Elaborado con infusión natural de vainas de Madagascar, crema de leche fresca y un toque dulce irresistible."
  },
  {
    id: 2,
    nombre: "Paleta Artesanal de Fresa Natural",
    categoria: "frutales",
    subtitulo: "Línea Frutal Refresh",
    precio: 10,
    img: "https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?q=80&w=400&auto=format&fit=crop",
    descripcion: "Paleta hecha con 100% pulpa de fresas seleccionadas, libre de colorantes artificiales y super refrescante."
  },
  {
    id: 3,
    nombre: "Choco-Teja Suprema 70%",
    categoria: "chocolate",
    subtitulo: "Línea Cacao Gourmet",
    precio: 22,
    img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=400&auto=format&fit=crop",
    descripcion: "Helado cremoso de chocolate amargo 70% cacao enriquecido con trozos de choco-tejas artesanas y fudge de caramelo."
  },
  {
    id: 4,
    nombre: "Cono Waffle Doble Chocolate",
    categoria: "cremosos",
    subtitulo: "Conos Crunch",
    precio: 18,
    img: "https://images.unsplash.com/photo-1559703248-dcaaec9fab78?q=80&w=400&auto=format&fit=crop",
    descripcion: "Crujiente cono artesanal horneado al momento cargado con dos bolas de helado de brownie y chispas."
  },
  {
    id: 5,
    nombre: "Copa Velvet Red Berries",
    categoria: "gourmet",
    subtitulo: "Especiales Ice Cream",
    precio: 28,
    img: "https://images.unsplash.com/photo-1567206563064-6f60f4078b57?q=80&w=400&auto=format&fit=crop",
    descripcion: "Copa gourmet con capas de helado de mascarpone, reducción de frutos rojos, galleta crujiente y crema chantilly."
  },
  {
    id: 6,
    nombre: "Paleta Trio Cítrico & Menta",
    categoria: "frutales",
    subtitulo: "Línea Frutal Refresh",
    precio: 12,
    img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=400&auto=format&fit=crop",
    descripcion: "Combinación refrescante de limón marroquí, naranja agria y hojas de menta fresca trituradas."
  },
  {
    id: 7,
    nombre: "Dulce de Leche Colonial",
    categoria: "cremosos",
    subtitulo: "Colección Cremositos",
    precio: 16,
    img: "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?q=80&w=400&auto=format&fit=crop",
    descripcion: "Auténtico dulce de leche estilo artesanal batido a baja temperatura con vetas crujientes de choco-chips."
  },
  {
    id: 8,
    nombre: "Sandwich Cookie Cream",
    categoria: "gourmet",
    subtitulo: "Especiales Ice Cream",
    precio: 20,
    img: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=400&auto=format&fit=crop",
    descripcion: "Dos galletas de choco-chip recién horneadas abrazando una generosa porción de helado de mantecado."
  }
];

let seleccionadosCount = 0;
let bitacoraEventos = [];
let bitacoraCompras = [];

function registrarEventoUI(texto) {
  const hora = new Date().toLocaleTimeString();
  bitacoraEventos.unshift({ hora, texto });
  actualizarVistaBitacoras();
}

function registrarCompraConfirmada(texto) {
  const hora = new Date().toLocaleTimeString();
  bitacoraCompras.unshift({ hora, texto });
  actualizarVistaBitacoras();
}

function actualizarVistaBitacoras() {
  const cajaEventos = $('#listaBitacoraEventos');
  const cajaCompras = $('#listaBitacoraCompras');

  cajaEventos.html('');
  cajaCompras.html('');

  if (bitacoraEventos.length === 0) {
    cajaEventos.html('<p style="color:var(--text-sub); font-size:0.78rem;">Sin registros aún.</p>');
  } else {
    bitacoraEventos.forEach(ev => {
      cajaEventos.append(`<div class="log-item-entry"><span>[${ev.hora}]</span> ${ev.texto}</div>`);
    });
  }

  if (bitacoraCompras.length === 0) {
    cajaCompras.html('<p style="color:var(--text-sub); font-size:0.78rem;">Sin compras registradas.</p>');
  } else {
    bitacoraCompras.forEach(com => {
      cajaCompras.append(`<div class="log-item-entry"><span>[${com.hora}]</span> ${com.texto}</div>`);
    });
  }
}

function vaciarBitacoras() {
  bitacoraEventos = [];
  bitacoraCompras = [];
  actualizarVistaBitacoras();
  mostrarToast('BITÁCORA', 'Registros limpiados.');
}

function mostrarToast(titulo, mensaje) {
  const toast = $('#toast-alert');
  $('#toast-titulo').text(titulo);
  $('#toast-cuerpo').text(mensaje);
  toast.stop(true, true).removeClass('toast-hidden').fadeIn('fast').delay(2500).fadeOut('slow');
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarTarjetas(catalogoHelados);
  registrarEventoUI("Sistema iniciado en Ice Cream.");

  $('#menuHambBtn').click((e) => {
    e.stopPropagation();
    $('#mobileDropdownMenu').toggle();
    registrarEventoUI("Menú hamburguesa accionado.");
  });

  $(document).click(() => {
    $('#mobileDropdownMenu').hide();
  });

  $('#btn-tema').click(() => {
    $('body').toggleClass('dark-mode light-mode');
    const esOscuro = $('body').hasClass('dark-mode');
    $('#btn-tema').html(esOscuro ? '🌙 Modo Noche' : '☀️ Modo Día');
    registrarEventoUI(`Cambio de tema a ${esOscuro ? 'Modo Noche' : 'Modo Día'}.`);
    mostrarToast('TEMA', esOscuro ? 'Modo Noche Cacao' : 'Modo Día Frescura');
  });
});

function cambiarSeccion(idSecc, elemLink) {
  $('.content-section').hide();
  $('#' + idSecc).fadeIn(200);

  $('.nav-link').removeClass('active');
  if (elemLink && elemLink.tagName === 'A') {
    $(elemLink).addClass('active');
    registrarEventoUI(`Navegación a: ${$(elemLink).text().trim()}`);
  }
}

function toggleHamb() {
  $('#mobileDropdownMenu').hide();
}

function filtrarTab(categoria, btnElem) {
  $('.tab-cat-btn').removeClass('active');
  $(btnElem).addClass('active');

  if (categoria === 'all') {
    renderizarTarjetas(catalogoHelados);
  } else {
    const res = catalogoHelados.filter(h => h.categoria === categoria);
    renderizarTarjetas(res);
  }
  registrarEventoUI(`Filtro por pestaña: ${categoria.toUpperCase()}`);
  mostrarToast('MENÚ', `Categoría: ${categoria.toUpperCase()}`);
}

function renderizarTarjetas(productos) {
  const container = $('#gridContenedorHelados');
  container.html('');

  if (productos.length === 0) {
    container.html('<p style="color:var(--text-sub); font-size:0.8rem;">No hay productos en esta categoría.</p>');
    return;
  }

  productos.forEach(item => {
    container.append(`
      <div class="libro-card-item" onclick="mostrarFichaProducto(${item.id})">
        <img src="${item.img}" class="libro-cover-img" alt="${item.nombre}">
        <h4>${item.nombre}</h4>
        <p>${item.subtitulo}</p>
        <div class="libro-price-tag">${item.precio} BOB</div>
      </div>
    `);
  });
}

function mostrarFichaProducto(id) {
  const item = catalogoHelados.find(h => h.id === id);
  const panel = $('#panelDetalleHelado');

  panel.html(`
    <div class="ficha-activa-wrapper">
      <img src="${item.img}" class="ficha-cover" alt="${item.nombre}">
      <h3>${item.nombre}</h3>
      <div class="ficha-autor">${item.subtitulo}</div>
      <p class="ficha-desc"><strong>Receta & Sabor:</strong><br>${item.descripcion}</p>
      <div style="font-weight:bold; color:var(--accent); font-size:0.9rem; text-align:center;">Precio: ${item.precio} BOB</div>
      <button class="btn-select-book" onclick="agregarAlPedido('${item.nombre}', ${item.precio})">Añadir a mi Orden 🍦</button>
    </div>
  `);
  registrarEventoUI(`Visualización de ficha: "${item.nombre}"`);
  mostrarToast('HELADO', `Viendo ${item.nombre}`);
}

function agregarAlPedido(nombre, precio) {
  seleccionadosCount++;
  $('#navItemCount').text(seleccionadosCount);
  registrarCompraConfirmada(`Orden registrada: "${nombre}" por ${precio} BOB.`);
  registrarEventoUI(`Añadido a la orden: "${nombre}"`);
  mostrarToast('ORDEN', `"${nombre}" agregado a la orden.`);
}

function enviarContacto() {
  const nombre = $('#inputNombreContacto').val();
  registrarEventoUI(`Formulario de contacto enviado por: ${nombre}`);
  registrarCompraConfirmada(`Consulta de evento registrada de: ${nombre}`);
  mostrarToast('CONTACTO', 'Mensaje enviado con éxito.');
  $('#formContactoHelados')[0].reset();
}