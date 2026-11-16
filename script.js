(function () {
  'use strict';

  const App = window.App;
  if (!App) return;

  const ITEMS = Array.isArray(window.HELADOS) ? window.HELADOS : [];
  const CATS = Array.isArray(window.HELADOS_CATEGORIAS) ? window.HELADOS_CATEGORIAS : [];

  const KEYS = {
    cart: 'heladeria_cart_v2',
    alias: 'heladeria_alias',
    eventos: 'heladeria_logs_eventos_v2',
    ventas: 'heladeria_logs_ventas_v2',
    admin: 'heladeria_admin_auth'
  };

  const ADMINS = { admin: 'helado123', cajero: 'fresa2026' };
  const WHATSAPP = '59167301341';
  const MAX_QTY = 20;
  const MAX_EVENTS = 250;
  const MAX_SALES = 150;

  const money = (n) => App.money(n) + ' BOB';
  const esc = (v) => App.escape(v);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const el = {
    nav: $('#iceLinks'),
    mobileNav: $('#iceMobileNav'),
    aliasDisplay: $('#iceAliasDisplay'),
    aliasForm: $('#iceAliasForm'),
    aliasInput: $('#iceAliasInput'),
    clientForm: $('#iceClientForm'),
    clientAlias: $('#iceClientAlias'),
    cartBtn: $('#iceCartBtn'),
    navCount: $('#iceNavCount'),
    cartOverlay: $('#iceCartOverlay'),
    cartDrawer: $('#iceCartDrawer'),
    cartClose: $('#iceCartClose'),
    cartList: $('#iceCartList'),
    cartTotal: $('#iceCartTotal'),
    cartSubtitle: $('#iceCartSubtitle'),
    cartClear: $('#iceCartClear'),
    checkoutBtn: $('#iceCheckoutBtn'),
    search: $('#iceSearch'),
    filtros: $('#iceFiltros'),
    grid: $('#iceGrid'),
    panel: $('#icePanel'),
    resultInfo: $('#iceResultInfo'),
    menuBadge: $('#iceMenuBadge'),
    detailModal: $('#iceDetailModal'),
    detailImg: $('#iceDetailImg'),
    detailCat: $('#iceDetailCat'),
    detailTitle: $('#iceDetailTitle'),
    detailDesc: $('#iceDetailDesc'),
    detailNota: $('#iceDetailNota'),
    detailPrice: $('#iceDetailPrice'),
    detailAdd: $('#iceDetailAdd'),
    checkoutModal: $('#iceCheckoutModal'),
    checkoutResumen: $('#iceCheckoutResumen'),
    checkoutTotal: $('#iceCheckoutTotal'),
    checkoutNombre: $('#iceCheckoutNombre'),
    checkoutPhone: $('#iceCheckoutPhone'),
    checkoutEntrega: $('#iceCheckoutEntrega'),
    checkoutNotas: $('#iceCheckoutNotas'),
    checkoutError: $('#iceCheckoutError'),
    checkoutConfirm: $('#iceCheckoutConfirm'),
    successModal: $('#iceSuccessModal'),
    successBody: $('#iceSuccessBody'),
    successWa: $('#iceSuccessWa'),
    contactForm: $('#iceContactForm'),
    contactName: $('#iceContactName'),
    contactEmail: $('#iceContactEmail'),
    contactMsg: $('#iceContactMsg'),
    contactError: $('#iceContactError'),
    adminForm: $('#iceAdminForm'),
    adminUser: $('#iceAdminUser'),
    adminPass: $('#iceAdminPass'),
    adminError: $('#iceAdminError'),
    adminLogout: $('#iceAdminLogout'),
    adminLogoutBottom: $('#iceAdminLogoutBottom'),
    logsEventos: $('#iceLogEventos'),
    logsVentas: $('#iceLogVentas'),
    kpiVentas: $('#iceKpiVentas'),
    kpiPedidos: $('#iceKpiPedidos'),
    kpiEventos: $('#iceKpiEventos'),
    kpiTicket: $('#iceKpiTicket'),
    refreshLogs: $('#iceRefreshLogs'),
    clearLogs: $('#iceClearLogs'),
    year: $('#iceYear')
  };

  const state = {
    category: 'todos',
    search: '',
    cart: [],
    selectedId: null,
    detailId: null,
    lastOrder: null,
    alias: '',
    admin: false
  };

  function byId(id) {
    const num = Number(id);
    return ITEMS.find((item) => Number(item.id) === num) || null;
  }

  function normalizeCart(raw) {
    let list = [];
    if (Array.isArray(raw)) list = raw;
    else if (raw && typeof raw === 'object') {
      list = Object.keys(raw).map((id) => ({ id: id, qty: raw[id] }));
    }
    const merged = new Map();
    list.forEach((entry) => {
      if (!entry || typeof entry !== 'object') return;
      const id = Number(entry.id != null ? entry.id : entry.productoId);
      const qty = Math.floor(Number(entry.qty != null ? entry.qty : entry.cantidad));
      if (!byId(id) || !Number.isFinite(qty) || qty <= 0) return;
      merged.set(id, Math.min(MAX_QTY, (merged.get(id) || 0) + qty));
    });
    return Array.from(merged, ([id, qty]) => ({ id: id, qty: qty }));
  }

  function readAlias() {
    try {
      const raw = localStorage.getItem(KEYS.alias);
      if (!raw) return '';
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'string') return parsed;
        if (parsed && typeof parsed.nombre === 'string') return parsed.nombre;
      } catch (error) { /* texto plano antiguo */ }
      return raw.slice(0, 32);
    } catch (error) {
      return '';
    }
  }

  function saveAlias(value) {
    try { localStorage.setItem(KEYS.alias, JSON.stringify(value)); } catch (error) { /* noop */ }
  }

  function readAdmin() {
    try { return sessionStorage.getItem(KEYS.admin) === '1'; } catch (error) { return false; }
  }

  function saveAdmin(active) {
    try {
      if (active) sessionStorage.setItem(KEYS.admin, '1');
      else sessionStorage.removeItem(KEYS.admin);
    } catch (error) { /* noop */ }
  }

  function readLogs(key, cap) {
    const raw = App.store.get(key, []);
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((entry) => entry && typeof entry === 'object' && entry.ts)
      .slice(0, cap);
  }

  function logEvent(type, message) {
    const logs = readLogs(KEYS.eventos, MAX_EVENTS);
    logs.unshift({ ts: new Date().toISOString(), type: type || 'info', msg: String(message || '') });
    App.store.set(KEYS.eventos, logs.slice(0, MAX_EVENTS));
    if (state.admin) renderLogs();
  }

  function logSale(order) {
    const sales = readLogs(KEYS.ventas, MAX_SALES);
    sales.unshift(order);
    App.store.set(KEYS.ventas, sales.slice(0, MAX_SALES));
    if (state.admin) renderLogs();
  }

  function detailedCart() {
    return state.cart
      .map((entry) => {
        const item = byId(entry.id);
        return item ? Object.assign({}, item, { qty: entry.qty }) : null;
      })
      .filter(Boolean);
  }

  function cartCount() {
    return state.cart.reduce((sum, entry) => sum + entry.qty, 0);
  }

  function cartTotal() {
    return detailedCart().reduce((sum, item) => sum + item.precio * item.qty, 0);
  }

  function saveCart() {
    App.store.set(KEYS.cart, state.cart);
  }

  function imageTag(item, cls, lazy) {
    return '<img class="' + cls + '" src="' + esc(item.img) + '" alt="' + esc(item.nombre) +
      '" data-fallback-emoji="' + esc(item.emoji || '🍦') + '"' +
      (lazy ? ' loading="lazy" decoding="async"' : '') + '>';
  }

  function wireImages(root) {
    $$('img[data-fallback-emoji]', root).forEach((img) => {
      const emoji = img.getAttribute('data-fallback-emoji') || '🍦';
      img.onerror = () => App.imgFallback(img, emoji, 'light');
      if (img.complete && img.naturalWidth === 0) {
        img.onerror = null;
        App.imgFallback(img, emoji, 'light');
      }
    });
  }

  function normalized(text) {
    return String(text == null ? '' : text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function matchesSearch(item) {
    if (!state.search) return true;
    const haystack = normalized([
      item.nombre,
      item.descripcion,
      item.nota,
      item.subtitulo,
      item.catLabel,
      item.catNombre,
      item.categoria
    ].join(' '));
    return haystack.includes(normalized(state.search));
  }

  function searchMatches() {
    return ITEMS.filter(matchesSearch);
  }

  function visibleItems() {
    return searchMatches().filter((item) => state.category === 'todos' || item.categoria === state.category);
  }

  function renderFilters() {
    const matches = searchMatches();
    const counts = { todos: matches.length };
    CATS.forEach((cat) => {
      counts[cat.id] = matches.filter((item) => item.categoria === cat.id).length;
    });

    if (state.category !== 'todos' && !counts[state.category]) {
      state.category = 'todos';
    }

    const chips = [
      '<button type="button" class="chip' + (state.category === 'todos' ? ' active' : '') +
        '" data-cat="todos" aria-pressed="' + (state.category === 'todos') + '">✨ Todos <span class="count">' + counts.todos + '</span></button>'
    ];

    CATS.forEach((cat) => {
      if (!counts[cat.id]) return;
      const active = state.category === cat.id;
      chips.push(
        '<button type="button" class="chip' + (active ? ' active' : '') + '" data-cat="' + esc(cat.id) +
        '" aria-pressed="' + active + '">' + esc(cat.emoji) + ' ' + esc(cat.label) +
        ' <span class="count">' + counts[cat.id] + '</span></button>'
      );
    });

    el.filtros.innerHTML = chips.join('');
  }

  function renderResultInfo() {
    const shown = visibleItems().length;
    let text = 'Mostrando ' + shown + ' de ' + ITEMS.length + ' sabores';
    if (state.category !== 'todos') {
      const cat = CATS.find((entry) => entry.id === state.category);
      if (cat) text += ' · ' + cat.label;
    }
    if (state.search) text += ' · búsqueda “' + state.search + '”';
    el.resultInfo.textContent = text;
  }

  function renderGrid() {
    const items = visibleItems();
    el.menuBadge.textContent = ITEMS.length + ' sabores';

    if (!items.length) {
      el.grid.innerHTML =
        '<div class="empty" style="grid-column:1/-1">' +
          '<span class="empty-icon">🔍</span>' +
          '<strong>No encontramos ese sabor</strong>' +
          '<span>Prueba con otra palabra o vuelve a “Todos”.</span>' +
        '</div>';
      return;
    }

    el.grid.innerHTML = items.map((item, index) => {
      const active = Number(item.id) === Number(state.selectedId);
      return '<article class="ice-card' + (active ? ' is-active' : '') + '" data-pick="' + Number(item.id) +
        '" tabindex="0" role="button" aria-label="Ver ' + esc(item.nombre) + '" style="animation-delay:' + (index * 28) + 'ms">' +
          '<div class="ice-card-media">' +
            imageTag(item, '', true) +
            '<span class="ice-card-cat">' + esc(item.catEmoji) + ' ' + esc(item.catLabel || item.catNombre) + '</span>' +
            '<span class="ice-card-emoji" aria-hidden="true">' + esc(item.emoji) + '</span>' +
          '</div>' +
          '<div class="ice-card-body">' +
            '<h3>' + esc(item.nombre) + '</h3>' +
            '<p class="ice-card-sub">' + esc(item.subtitulo) + '</p>' +
            '<p class="ice-card-note">📝 ' + esc(item.nota) + '</p>' +
            '<div class="ice-card-foot">' +
              '<span class="ice-price">' + App.money(item.precio) + ' <small>BOB</small></span>' +
              '<div class="row">' +
                '<button type="button" class="btn btn-ghost btn-xs" data-detail="' + Number(item.id) + '">Ver</button>' +
                '<button type="button" class="btn btn-primary btn-xs" data-add="' + Number(item.id) + '">+ Añadir</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');

    wireImages(el.grid);
  }

  function renderPanelDefault() {
    el.panel.innerHTML =
      '<div class="ice-panel-empty">' +
        '<span>🍨</span>' +
        '<h3>Elige tu sabor favorito</h3>' +
        '<p>Haz clic en cualquier helado para ver sus ingredientes, notas y precio. Luego añádelo a tu orden.</p>' +
      '</div>';
  }

  function renderPanel(item) {
    if (!item) {
      renderPanelDefault();
      return;
    }
    el.panel.innerHTML =
      '<div class="ice-panel-media">' +
        imageTag(item, '', false) +
        '<span class="ice-card-cat">' + esc(item.catEmoji) + ' ' + esc(item.catLabel || item.catNombre) + '</span>' +
      '</div>' +
      '<div class="ice-panel-body">' +
        '<span class="ice-panel-sub">' + esc(item.subtitulo) + '</span>' +
        '<h3>' + esc(item.nombre) + '</h3>' +
        '<p>' + esc(item.descripcion) + '</p>' +
        '<p class="ice-panel-note">📝 ' + esc(item.nota) + '</p>' +
        '<div class="ice-panel-price"><span>PRECIO</span><strong>' + money(item.precio) + '</strong></div>' +
        '<div class="ice-panel-actions">' +
          '<button type="button" class="btn btn-primary btn-block" data-add="' + Number(item.id) + '">🛒 Añadir a la orden</button>' +
          '<button type="button" class="btn btn-ghost btn-block" data-detail="' + Number(item.id) + '">🔎 Ver detalle completo</button>' +
        '</div>' +
      '</div>' +
      '<div class="ice-panel-meta">' +
        '<div><span>Categoría</span><strong>' + esc(item.catNombre) + '</strong></div>' +
        '<div><span>Entrega</span><strong>10 – 15 min</strong></div>' +
        '<div><span>Disponibilidad</span><strong>Lote del día ✅</strong></div>' +
      '</div>';
    wireImages(el.panel);
  }

  function selectItem(id) {
    const item = byId(id);
    if (!item) return;
    state.selectedId = Number(id);
    $$('.ice-card', el.grid).forEach((card) => {
      card.classList.toggle('is-active', Number(card.dataset.pick) === Number(id));
    });
    renderPanel(item);
    if (window.matchMedia('(max-width: 980px)').matches) {
      window.setTimeout(() => el.panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }

  function renderCatalog() {
    renderFilters();
    renderGrid();
    renderResultInfo();
  }

  function renderCart() {
    const count = cartCount();
    const total = cartTotal();
    el.navCount.textContent = String(count);
    el.cartSubtitle.textContent = count === 1 ? '1 producto seleccionado' : count + ' productos seleccionados';
    el.cartTotal.textContent = money(total);
    el.checkoutBtn.disabled = count === 0;

    if (!count) {
      el.cartList.innerHTML =
        '<li class="empty">' +
          '<span class="empty-icon">🍦</span>' +
          '<strong>Tu orden está vacía</strong>' +
          '<span>Explora el menú y añade tus sabores favoritos.</span>' +
        '</li>';
      return;
    }

    el.cartList.innerHTML = detailedCart().map((item) =>
      '<li class="ice-cart-item" data-id="' + Number(item.id) + '">' +
        imageTag(item, '', true) +
        '<div class="ice-cart-item-info">' +
          '<strong>' + esc(item.nombre) + '</strong>' +
          '<small>' + money(item.precio) + ' c/u</small>' +
          '<div class="ice-qty" role="group" aria-label="Cantidad de ' + esc(item.nombre) + '">' +
            '<button type="button" data-cart-dec="' + Number(item.id) + '" aria-label="Quitar una unidad">−</button>' +
            '<span>' + item.qty + '</span>' +
            '<button type="button" data-cart-inc="' + Number(item.id) + '" aria-label="Añadir una unidad">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="ice-cart-item-right">' +
          '<strong>' + money(item.precio * item.qty) + '</strong>' +
          '<button type="button" data-cart-del="' + Number(item.id) + '" aria-label="Eliminar ' + esc(item.nombre) + '" title="Eliminar">🗑️</button>' +
        '</div>' +
      '</li>'
    ).join('');

    wireImages(el.cartList);
  }

  function bumpCartButton() {
    el.cartBtn.classList.remove('bump');
   
    void el.cartBtn.offsetWidth;
    el.cartBtn.classList.add('bump');
    window.setTimeout(() => el.cartBtn.classList.remove('bump'), 460);
  }

  function addToCart(id, qty) {
    const item = byId(id);
    if (!item) return;
    const amount = Math.max(1, Math.floor(Number(qty) || 1));
    const entry = state.cart.find((row) => Number(row.id) === Number(id));
    if (entry) {
      if (entry.qty >= MAX_QTY) {
        App.toast('Máximo ' + MAX_QTY + ' unidades por sabor.', 'warn', 'Límite alcanzado');
        return;
      }
      entry.qty = Math.min(MAX_QTY, entry.qty + amount);
    } else {
      state.cart.push({ id: Number(id), qty: Math.min(MAX_QTY, amount) });
    }
    saveCart();
    renderCart();
    bumpCartButton();
    App.toast(item.nombre + ' se añadió a tu orden.', 'ok', 'Añadido');
    logEvent('info', 'Añadió ' + amount + ' × ' + item.nombre + ' (' + money(item.precio) + ')');
  }

  function changeQty(id, delta) {
    const entry = state.cart.find((row) => Number(row.id) === Number(id));
    if (!entry) return;
    entry.qty = Math.floor(entry.qty + delta);
    if (entry.qty <= 0) {
      const item = byId(id);
      state.cart = state.cart.filter((row) => Number(row.id) !== Number(id));
      if (item) App.toast(item.nombre + ' se quitó de tu orden.', 'info', 'Producto eliminado');
    } else if (entry.qty > MAX_QTY) {
      entry.qty = MAX_QTY;
      App.toast('Máximo ' + MAX_QTY + ' unidades por sabor.', 'warn', 'Límite alcanzado');
    }
    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    const item = byId(id);
    state.cart = state.cart.filter((row) => Number(row.id) !== Number(id));
    saveCart();
    renderCart();
    if (item) App.toast(item.nombre + ' se quitó de tu orden.', 'info', 'Producto eliminado');
  }

  function clearCart(confirmFirst) {
    if (!state.cart.length) {
      App.toast('Tu orden ya está vacía.', 'info', 'Orden');
      return;
    }
    if (confirmFirst && !window.confirm('¿Vaciar todos los productos de tu orden?')) return;
    state.cart = [];
    saveCart();
    renderCart();
    App.toast('Tu orden quedó vacía.', 'info', 'Orden');
    logEvent('warn', 'Vació su orden de compra');
  }

  function openCart() {
    el.cartDrawer.classList.add('open');
    el.cartOverlay.classList.add('show');
    el.cartDrawer.setAttribute('aria-hidden', 'false');
    el.cartOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ice-cart-open');
    window.setTimeout(() => el.cartClose.focus(), 120);
  }

  function closeCart() {
    el.cartDrawer.classList.remove('open');
    el.cartOverlay.classList.remove('show');
    el.cartDrawer.setAttribute('aria-hidden', 'true');
    el.cartOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('ice-cart-open');
  }

  function openDetail(id) {
    const item = byId(id);
    if (!item) return;
    state.detailId = Number(id);
    el.detailCat.textContent = item.catEmoji + ' ' + (item.catLabel || item.catNombre);
    el.detailTitle.textContent = item.nombre;
    el.detailDesc.textContent = item.descripcion;
    el.detailNota.textContent = '📝 ' + item.nota;
    el.detailPrice.textContent = money(item.precio);
    el.detailImg.src = item.img;
    el.detailImg.alt = item.nombre;
    el.detailImg.onerror = () => App.imgFallback(el.detailImg, item.emoji || '🍦', 'light');
    if (el.detailImg.complete && el.detailImg.naturalWidth === 0) {
      el.detailImg.onerror = null;
      App.imgFallback(el.detailImg, item.emoji || '🍦', 'light');
    }
    App.openModal('iceDetailModal');
  }

  function openCheckout() {
    if (!state.cart.length) {
      App.toast('Añade al menos un helado antes de confirmar.', 'warn', 'Orden vacía');
      return;
    }
    const items = detailedCart();
    el.checkoutResumen.innerHTML = items.map((item) =>
      '<div class="cr-row">' +
        '<span>' + esc(item.nombre) + ' × ' + item.qty + '</span>' +
        '<b>' + money(item.precio * item.qty) + '</b>' +
      '</div>'
    ).join('');
    el.checkoutTotal.textContent = money(cartTotal());
    if (state.alias && !el.checkoutNombre.value.trim()) el.checkoutNombre.value = state.alias;
    el.checkoutError.textContent = '';
    el.checkoutNombre.classList.remove('invalid');
    el.checkoutPhone.classList.remove('invalid');
    closeCart();
    App.openModal('iceCheckoutModal');
  }

  function confirmCheckout() {
    const name = el.checkoutNombre.value.trim().replace(/\s+/g, ' ');
    const phone = el.checkoutPhone.value.trim();
    const entrega = el.checkoutEntrega.value;
    const notas = el.checkoutNotas.value.trim();

    el.checkoutError.textContent = '';
    el.checkoutNombre.classList.remove('invalid');
    el.checkoutPhone.classList.remove('invalid');

    if (name.length < 2) {
      el.checkoutError.textContent = 'Escribe el nombre del cliente (mínimo 2 caracteres).';
      el.checkoutNombre.classList.add('invalid');
      el.checkoutNombre.focus();
      return;
    }

    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 12) {
        el.checkoutError.textContent = 'El celular debe tener entre 7 y 12 dígitos.';
        el.checkoutPhone.classList.add('invalid');
        el.checkoutPhone.focus();
        return;
      }
    }

    const items = detailedCart().map((item) => ({
      id: item.id,
      nombre: item.nombre,
      precio: item.precio,
      qty: item.qty
    }));

    if (!items.length) {
      el.checkoutError.textContent = 'Tu orden está vacía. Vuelve al menú para añadir productos.';
      return;
    }

    const order = {
      id: 'ICE-' + Date.now().toString().slice(-6),
      ts: new Date().toISOString(),
      cliente: name,
      telefono: phone,
      entrega: entrega,
      notas: notas,
      items: items,
      total: items.reduce((sum, item) => sum + item.precio * item.qty, 0),
      alias: state.alias || ''
    };

    logSale(order);
    logEvent('ok', 'Pedido ' + order.id + ' confirmado por ' + money(order.total) + ' · ' + name);
    state.cart = [];
    saveCart();
    renderCart();
    el.checkoutNombre.value = '';
    el.checkoutPhone.value = '';
    el.checkoutNotas.value = '';
    App.closeModal('iceCheckoutModal');
    showSuccess(order);
  }

  function renderSuccessBody(order) {
    const lines = order.items.map((item) =>
      '<div><span>' + esc(item.nombre) + ' × ' + item.qty + '</span><strong>' + money(item.precio * item.qty) + '</strong></div>'
    ).join('');

    const note = order.entrega === 'Delivery zona central'
      ? '🛵 Delivery dentro de la zona central · 25 a 40 minutos.'
      : '🏪 Retiro en tienda · listo en 10 a 15 minutos.';

    el.successBody.innerHTML =
      '<div class="ice-success-box">' +
        '<div class="row-between"><span>Pedido</span><strong>' + esc(order.id) + '</strong></div>' +
        '<div class="row-between"><span>Cliente</span><strong>' + esc(order.cliente) + '</strong></div>' +
        '<div class="row-between"><span>Entrega</span><strong>' + esc(order.entrega) + '</strong></div>' +
        (order.telefono ? '<div class="row-between"><span>Celular</span><strong>' + esc(order.telefono) + '</strong></div>' : '') +
        '<div class="ice-success-lines">' + lines + '</div>' +
        '<div class="row-between" style="margin-top:6px"><span>TOTAL</span><strong>' + money(order.total) + '</strong></div>' +
      '</div>' +
      '<p class="note">' + note + (order.notas ? ' Nota: ' + esc(order.notas) : '') + '</p>';
  }

  function showSuccess(order) {
    state.lastOrder = order;
    renderSuccessBody(order);
    App.openModal('iceSuccessModal');
  }

  function whatsappLink(order) {
    if (!order) return '';
    const lines = order.items.map((item) => '• ' + item.qty + ' × ' + item.nombre + ' — ' + money(item.precio * item.qty)).join('\n');
    const text = [
      '¡Hola ICE CREAM! 🍦',
      'Quiero confirmar mi pedido ' + order.id + '.',
      'Cliente: ' + order.cliente,
      order.telefono ? 'Celular: ' + order.telefono : '',
      'Entrega: ' + order.entrega,
      '',
      lines,
      '',
      'TOTAL: ' + money(order.total),
      order.notas ? 'Notas: ' + order.notas : ''
    ].filter((line) => line !== '').join('\n');
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
  }

  function paintAlias() {
    const name = state.alias || 'Invitado';
    el.aliasDisplay.textContent = name;
    if (el.aliasInput && document.activeElement !== el.aliasInput) el.aliasInput.value = state.alias;
    if (el.clientAlias && document.activeElement !== el.clientAlias) el.clientAlias.value = state.alias;
    if (state.alias && !el.checkoutNombre.value.trim()) el.checkoutNombre.value = state.alias;
  }

  function setAlias(raw) {
    const name = String(raw == null ? '' : raw).trim().replace(/\s+/g, ' ').slice(0, 32);
    if (!name) {
      App.toast('Escribe un nombre o alias para guardarlo.', 'warn', 'Alias vacío');
      return;
    }
    const previous = state.alias;
    state.alias = name;
    saveAlias(name);
    paintAlias();
    App.toast('Te saludaremos como “' + name + '”.', 'ok', 'Alias guardado');
    if (previous !== name) logEvent('info', 'Cliente actualizó su alias a “' + name + '”');
  }

  function submitContact(event) {
    event.preventDefault();
    const name = el.contactName.value.trim();
    const email = el.contactEmail.value.trim();
    const message = el.contactMsg.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    el.contactError.textContent = '';
    [el.contactName, el.contactEmail, el.contactMsg].forEach((field) => field.classList.remove('invalid'));

    if (name.length < 3) {
      el.contactError.textContent = 'Escribe tu nombre completo (mínimo 3 caracteres).';
      el.contactName.classList.add('invalid');
      el.contactName.focus();
      return;
    }
    if (!emailOk) {
      el.contactError.textContent = 'Escribe un correo electrónico válido.';
      el.contactEmail.classList.add('invalid');
      el.contactEmail.focus();
      return;
    }
    if (message.length < 10) {
      el.contactError.textContent = 'Cuéntanos un poco más (mínimo 10 caracteres).';
      el.contactMsg.classList.add('invalid');
      el.contactMsg.focus();
      return;
    }

    logEvent('info', 'Mensaje de contacto de ' + name + ' <' + email + '>');
    App.toast('Mensaje registrado. Te responderemos muy pronto, ' + name.split(' ')[0] + '.', 'ok', 'Mensaje enviado');
    el.contactForm.reset();
  }

  function applyAdminUI() {
    document.body.classList.toggle('is-admin', state.admin);
    el.adminForm.classList.toggle('hidden', state.admin);
    el.adminLogout.classList.toggle('hidden', !state.admin);
    if (el.adminLogoutBottom) el.adminLogoutBottom.classList.toggle('hidden', !state.admin);
  }

  function loginAdmin(event) {
    event.preventDefault();
    const user = el.adminUser.value.trim().toLowerCase();
    const pass = el.adminPass.value;
    el.adminError.textContent = '';
    el.adminUser.classList.remove('invalid');
    el.adminPass.classList.remove('invalid');

    if (!user || !pass) {
      el.adminError.textContent = 'Ingresa usuario y contraseña.';
      if (!user) el.adminUser.classList.add('invalid');
      if (!pass) el.adminPass.classList.add('invalid');
      return;
    }

    if (ADMINS[user] && ADMINS[user] === pass) {
      state.admin = true;
      saveAdmin(true);
      applyAdminUI();
      renderLogs();
      el.adminForm.reset();
      logEvent('ok', 'Administrador “' + user + '” inició sesión');
      App.closeModal('iceCuentaModal');
      App.toast('Bienvenido, ' + user + '. Panel de bitácoras desbloqueado.', 'ok', 'Sesión admin');
      window.setTimeout(() => {
        const section = document.getElementById('bitacora');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 260);
      return;
    }

    el.adminError.textContent = 'Usuario o contraseña incorrectos. Intenta de nuevo.';
    el.adminUser.classList.add('invalid');
    el.adminPass.classList.add('invalid');
    el.adminPass.focus();
    App.toast('Credenciales inválidas.', 'error', 'Acceso denegado');
    logEvent('warn', 'Intento fallido de acceso admin con usuario “' + (user || '(vacío)') + '”');
  }

  function logoutAdmin() {
    if (!state.admin) return;
    logEvent('warn', 'La sesión de administrador se cerró');
    state.admin = false;
    saveAdmin(false);
    applyAdminUI();
    el.adminForm.reset();
    el.adminPass.value = '';
    App.toast('Sesión de administrador cerrada.', 'info', 'Sesión finalizada');
    window.setTimeout(() => {
      if (location.hash === '#bitacora') history.replaceState(null, '', '#inicio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 120);
  }

  function renderLogs() {
    if (!state.admin) return;
    const events = readLogs(KEYS.eventos, MAX_EVENTS);
    const sales = readLogs(KEYS.ventas, MAX_SALES);

    el.logsEventos.innerHTML = events.length
      ? events.map((entry) => {
          const type = ['ok', 'warn', 'error', 'info'].indexOf(entry.type) >= 0 ? entry.type : 'info';
          return '<div class="log-entry ' + type + '">' +
            '<span class="log-time">' + esc(App.dateTime(entry.ts)) + '</span>' +
            '<span class="log-type">' + type.toUpperCase() + '</span>' +
            esc(entry.msg) +
          '</div>';
        }).join('')
      : '<div class="log-empty">Sin eventos registrados todavía.</div>';

    el.logsVentas.innerHTML = sales.length
      ? sales.map((sale) => {
          const count = Array.isArray(sale.items)
            ? sale.items.reduce((sum, item) => sum + Number(item.qty || 0), 0)
            : 0;
          const summary = Array.isArray(sale.items)
            ? sale.items.map((item) => item.qty + '× ' + item.nombre).join(', ')
            : '';
          return '<div class="log-entry ok" title="' + esc(summary) + '">' +
            '<span class="log-time">' + esc(App.dateTime(sale.ts)) + '</span>' +
            '<span class="log-type">VENTA</span>' +
            esc(sale.id || 'S/N') + ' · ' + esc(sale.cliente || 'Cliente') +
            ' · ' + count + ' art. · ' + money(sale.total || 0) +
            (sale.entrega ? ' · ' + esc(sale.entrega) : '') +
          '</div>';
        }).join('')
      : '<div class="log-empty">Aún no hay ventas confirmadas.</div>';

    const total = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    el.kpiVentas.textContent = money(total);
    el.kpiPedidos.textContent = String(sales.length);
    el.kpiEventos.textContent = String(events.length);
    el.kpiTicket.textContent = sales.length ? money(Math.round(total / sales.length)) : money(0);
  }

  function clearLogs() {
    if (!state.admin) return;
    if (!window.confirm('¿Borrar todas las bitácoras de eventos y ventas? Esta acción no se puede deshacer.')) return;
    App.store.set(KEYS.eventos, []);
    App.store.set(KEYS.ventas, []);
    renderLogs();
    App.toast('Bitácoras limpiadas correctamente.', 'ok', 'Mantenimiento');
  }

  function initActiveNav() {
    const links = $$('.ice-links a[href^="#"]');
    if (!links.length || typeof IntersectionObserver !== 'function') return;
    const sections = links
      .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          const active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });

    sections.forEach((section) => observer.observe(section));
  }

  function bindEvents() {
    el.search.addEventListener('input', () => {
      state.search = el.search.value.trim();
      renderCatalog();
    });

    el.filtros.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-cat]');
      if (!chip) return;
      state.category = chip.dataset.cat;
      renderCatalog();
    });

    el.grid.addEventListener('click', (event) => {
      const add = event.target.closest('[data-add]');
      if (add) {
        event.stopPropagation();
        addToCart(Number(add.dataset.add));
        return;
      }
      const detail = event.target.closest('[data-detail]');
      if (detail) {
        event.stopPropagation();
        openDetail(Number(detail.dataset.detail));
        return;
      }
      const card = event.target.closest('[data-pick]');
      if (card) selectItem(Number(card.dataset.pick));
    });

    el.grid.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('[data-pick]');
      if (!card || event.target.closest('button')) return;
      event.preventDefault();
      selectItem(Number(card.dataset.pick));
    });

    el.panel.addEventListener('click', (event) => {
      const add = event.target.closest('[data-add]');
      if (add) {
        addToCart(Number(add.dataset.add));
        return;
      }
      const detail = event.target.closest('[data-detail]');
      if (detail) openDetail(Number(detail.dataset.detail));
    });

    el.cartBtn.addEventListener('click', openCart);
    el.cartClose.addEventListener('click', closeCart);
    el.cartOverlay.addEventListener('click', closeCart);

    el.cartList.addEventListener('click', (event) => {
      const inc = event.target.closest('[data-cart-inc]');
      if (inc) {
        changeQty(Number(inc.dataset.cartInc), 1);
        return;
      }
      const dec = event.target.closest('[data-cart-dec]');
      if (dec) {
        changeQty(Number(dec.dataset.cartDec), -1);
        return;
      }
      const del = event.target.closest('[data-cart-del]');
      if (del) removeFromCart(Number(del.dataset.cartDel));
    });

    el.cartClear.addEventListener('click', () => clearCart(true));
    el.checkoutBtn.addEventListener('click', openCheckout);
    el.checkoutConfirm.addEventListener('click', confirmCheckout);

    el.detailAdd.addEventListener('click', () => {
      const id = state.detailId;
      App.closeModal('iceDetailModal');
      if (id) {
        addToCart(id);
        openCart();
      }
    });

    el.successWa.addEventListener('click', () => {
      const link = whatsappLink(state.lastOrder);
      if (link) window.open(link, '_blank', 'noopener');
    });

    el.aliasForm.addEventListener('submit', (event) => {
      event.preventDefault();
      setAlias(el.aliasInput.value);
    });

    el.clientForm.addEventListener('submit', (event) => {
      event.preventDefault();
      setAlias(el.clientAlias.value);
    });

    el.contactForm.addEventListener('submit', submitContact);
    el.adminForm.addEventListener('submit', loginAdmin);
    el.adminLogout.addEventListener('click', logoutAdmin);
    if (el.adminLogoutBottom) el.adminLogoutBottom.addEventListener('click', logoutAdmin);

    el.refreshLogs.addEventListener('click', () => {
      renderLogs();
      App.toast('Bitácoras actualizadas.', 'info', 'Auditoría');
    });
    el.clearLogs.addEventListener('click', clearLogs);

    const accountBtn = $('#iceAccountBtn');
    if (accountBtn) {
      accountBtn.addEventListener('click', () => {
        el.clientAlias.value = state.alias;
        if (state.admin) {
          el.adminError.textContent = 'Sesión de administrador activa.';
        } else {
          el.adminError.textContent = '';
        }
      });
    }

    document.addEventListener('input', (event) => {
      if (event.target && event.target.classList && event.target.classList.contains('invalid')) {
        event.target.classList.remove('invalid');
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeCart();
    });
  }

  function init() {
    state.cart = normalizeCart(App.store.get(KEYS.cart, []));
    saveCart();
    state.alias = readAlias().slice(0, 32);
    state.admin = readAdmin();

    applyAdminUI();
    paintAlias();
    renderCatalog();
    renderCart();
    renderPanelDefault();
    if (state.admin) renderLogs();

    if (el.year) el.year.textContent = String(new Date().getFullYear());

    bindEvents();
    initActiveNav();

    if (typeof App.registerSW === 'function') App.registerSW('sw.js');
  }

  App.ready(init);
})();
