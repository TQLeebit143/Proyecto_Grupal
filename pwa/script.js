(function () {
  'use strict';

  const App = window.App;
  if (!App) return;

  const ITEMS = Array.isArray(window.HELADOS) ? window.HELADOS : [];
  const CATS = Array.isArray(window.HELADOS_CATEGORIAS) ? window.HELADOS_CATEGORIAS : [];
  const VIEWS = ['inicio', 'menu', 'orden', 'cuenta', 'bitacora'];

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
    offline: $('#pwaOfflineBadge'),
    hello: $('#pwaHello'),
    aliasForm: $('#pwaAliasForm'),
    aliasInput: $('#pwaAliasInput'),
    clientForm: $('#pwaClientForm'),
    clientAlias: $('#pwaClientAlias'),
    profileName: $('#pwaProfileName'),
    profileStatus: $('#pwaProfileStatus'),
    adminBadge: $('#pwaAdminBadge'),
    featured: $('#pwaFeatured'),
    search: $('#pwaSearch'),
    filtros: $('#pwaFiltros'),
    resultInfo: $('#pwaResultInfo'),
    grid: $('#pwaGrid'),
    orderSub: $('#pwaOrderSub'),
    orderEmpty: $('#pwaOrderEmpty'),
    orderContent: $('#pwaOrderContent'),
    orderList: $('#pwaOrderList'),
    itemsCount: $('#pwaItemsCount'),
    subtotal: $('#pwaSubtotal'),
    orderTotal: $('#pwaOrderTotal'),
    checkoutBtn: $('#pwaCheckoutBtn'),
    clearCart: $('#pwaClearCart'),
    dockCount: $('#pwaDockCount'),
    detailModal: $('#pwaDetailModal'),
    detailImg: $('#pwaDetailImg'),
    detailCat: $('#pwaDetailCat'),
    detailTitle: $('#pwaDetailTitle'),
    detailSub: $('#pwaDetailSub'),
    detailDesc: $('#pwaDetailDesc'),
    detailNota: $('#pwaDetailNota'),
    detailPrice: $('#pwaDetailPrice'),
    detailAdd: $('#pwaDetailAdd'),
    checkoutModal: $('#pwaCheckoutModal'),
    checkoutResumen: $('#pwaCheckoutResumen'),
    checkoutTotal: $('#pwaCheckoutTotal'),
    checkoutNombre: $('#pwaCheckoutNombre'),
    checkoutPhone: $('#pwaCheckoutPhone'),
    checkoutEntrega: $('#pwaCheckoutEntrega'),
    checkoutNotas: $('#pwaCheckoutNotas'),
    checkoutError: $('#pwaCheckoutError'),
    checkoutConfirm: $('#pwaCheckoutConfirm'),
    successModal: $('#pwaSuccessModal'),
    successBody: $('#pwaSuccessBody'),
    successWa: $('#pwaSuccessWa'),
    adminForm: $('#pwaAdminForm'),
    adminUser: $('#pwaAdminUser'),
    adminPass: $('#pwaAdminPass'),
    adminError: $('#pwaAdminError'),
    adminLogout: $('#pwaAdminLogout'),
    adminLogoutBottom: $('#pwaLogoutBottom'),
    logsEventos: $('#pwaLogEventos'),
    logsVentas: $('#pwaLogVentas'),
    kpiVentas: $('#pwaKpiVentas'),
    kpiPedidos: $('#pwaKpiPedidos'),
    kpiEventos: $('#pwaKpiEventos'),
    kpiTicket: $('#pwaKpiTicket'),
    refreshLogs: $('#pwaRefreshLogs'),
    clearLogs: $('#pwaClearLogs'),
    installCard: $('#pwaInstallCard'),
    installBtn: $('#pwaInstallBtn'),
    resetData: $('#pwaResetData')
  };

  const state = {
    view: 'inicio',
    category: 'todos',
    search: '',
    cart: [],
    detailId: null,
    lastOrder: null,
    alias: '',
    admin: false
  };

  let deferredPrompt = null;

  /* ── ALMACENAMIENTO ────────────────────────────────────── */
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
    return raw.filter((entry) => entry && typeof entry === 'object' && entry.ts).slice(0, cap);
  }

  function logEvent(type, message) {
    const logs = readLogs(KEYS.eventos, MAX_EVENTS);
    logs.unshift({ ts: new Date().toISOString(), type: type || 'info', msg: String(message || '') });
    App.store.set(KEYS.eventos, logs.slice(0, MAX_EVENTS));
    if (state.admin && state.view === 'bitacora') renderLogs();
  }

  function logSale(order) {
    const sales = readLogs(KEYS.ventas, MAX_SALES);
    sales.unshift(order);
    App.store.set(KEYS.ventas, sales.slice(0, MAX_SALES));
    if (state.admin && state.view === 'bitacora') renderLogs();
  }

  /* ── CARRITO ───────────────────────────────────────────── */
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

  /* ── IMÁGENES ──────────────────────────────────────────── */
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

  /* ── NAVEGACIÓN ────────────────────────────────────────── */
  function showView(name, options) {
    let target = VIEWS.indexOf(name) >= 0 ? name : 'inicio';
    if (target === 'bitacora' && !state.admin) {
      target = 'cuenta';
      App.toast('Inicia sesión como administrador para ver las bitácoras.', 'warn', 'Acceso restringido');
    }
    state.view = target;
    document.body.dataset.view = target;

    $$('.pwa-view').forEach((view) => {
      view.classList.toggle('active', view.dataset.viewPanel === target);
    });
    $$('.pwa-dock-btn').forEach((btn) => {
      const active = btn.dataset.view === target;
      btn.classList.toggle('active', active);
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    try { history.replaceState(null, '', '#' + target); } catch (error) { /* noop */ }
    if (target === 'bitacora') renderLogs();
    if (!options || options.scroll !== false) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function bindViewButtons() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-view]');
      if (!button) return;
      event.preventDefault();
      showView(button.dataset.view);
    });
  }

  /* ── FILTROS / CATÁLOGO ────────────────────────────────── */
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

    if (state.category !== 'todos' && !counts[state.category]) state.category = 'todos';

    const chips = [
      '<button type="button" class="chip' + (state.category === 'todos' ? ' active' : '') +
        '" data-cat="todos" aria-pressed="' + (state.category === 'todos') + '">✨ Todos <span class="count">' + counts.todos + '</span></button>'
    ];
    CATS.forEach((cat) => {
      if (!counts[cat.id]) return; // categorías vacías nunca se muestran
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
    let text = shown + ' de ' + ITEMS.length + ' sabores';
    if (state.category !== 'todos') {
      const cat = CATS.find((entry) => entry.id === state.category);
      if (cat) text += ' · ' + cat.label;
    }
    if (state.search) text += ' · “' + state.search + '”';
    el.resultInfo.textContent = text;
  }

  function renderGrid() {
    const items = visibleItems();
    if (!items.length) {
      el.grid.innerHTML =
        '<div class="pwa-empty" style="grid-column:1/-1">' +
          '<span class="pwa-empty-icon">🔍</span>' +
          '<strong>No encontramos ese sabor</strong>' +
          '<p>Prueba con otra palabra o vuelve a “Todos”.</p>' +
        '</div>';
      return;
    }

    el.grid.innerHTML = items.map((item, index) =>
      '<article class="pwa-item" data-detail="' + Number(item.id) + '" tabindex="0" role="button" aria-label="Ver ' + esc(item.nombre) + '" style="animation-delay:' + (index * 26) + 'ms">' +
        '<div class="pwa-item-media">' +
          imageTag(item, '', true) +
          '<span class="pwa-item-cat">' + esc(item.catEmoji) + ' ' + esc(item.catLabel || item.catNombre) + '</span>' +
          '<span class="pwa-item-emoji" aria-hidden="true">' + esc(item.emoji) + '</span>' +
        '</div>' +
        '<div class="pwa-item-body">' +
          '<h3>' + esc(item.nombre) + '</h3>' +
          '<p class="pwa-item-note">' + esc(item.nota) + '</p>' +
          '<div class="pwa-item-foot">' +
            '<span class="pwa-item-price">' + App.money(item.precio) + ' <small>BOB</small></span>' +
            '<button type="button" class="pwa-add-btn" data-add="' + Number(item.id) + '" aria-label="Añadir ' + esc(item.nombre) + '">+</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    ).join('');

    wireImages(el.grid);
  }

  function renderCatalog() {
    renderFilters();
    renderGrid();
    renderResultInfo();
  }

  function renderFeatured() {
    const picks = [0, 2, 4, 7].map((index) => ITEMS[index]).filter(Boolean);
    el.featured.innerHTML = picks.map((item) =>
      '<button type="button" class="pwa-mini-card" data-detail="' + Number(item.id) + '">' +
        '<span class="pwa-mini-media">' +
          imageTag(item, '', true) +
          '<span class="pwa-mini-emoji" aria-hidden="true">' + esc(item.emoji) + '</span>' +
        '</span>' +
        '<span class="pwa-mini-body">' +
          '<strong>' + esc(item.nombre) + '</strong>' +
          '<span>' + money(item.precio) + '</span>' +
        '</span>' +
      '</button>'
    ).join('');
    wireImages(el.featured);
  }

  /* ── ORDEN ─────────────────────────────────────────────── */
  function renderOrder() {
    const items = detailedCart();
    const count = cartCount();
    const total = cartTotal();

    el.dockCount.textContent = String(count);
    el.orderSub.textContent = count
      ? (count === 1 ? '1 producto listo para confirmar.' : count + ' productos listos para confirmar.')
      : 'Aún no agregaste productos.';

    el.orderEmpty.classList.toggle('hidden', count > 0);
    el.orderContent.classList.toggle('hidden', count === 0);

    el.itemsCount.textContent = String(count);
    el.subtotal.textContent = money(total);
    el.orderTotal.textContent = money(total);

    if (!count) {
      el.orderList.innerHTML = '';
      return;
    }

    el.orderList.innerHTML = items.map((item) =>
      '<li class="pwa-order-item" data-id="' + Number(item.id) + '">' +
        imageTag(item, '', true) +
        '<div class="pwa-order-info">' +
          '<strong>' + esc(item.nombre) + '</strong>' +
          '<small>' + money(item.precio) + ' c/u</small>' +
          '<div class="pwa-qty" role="group" aria-label="Cantidad de ' + esc(item.nombre) + '">' +
            '<button type="button" data-cart-dec="' + Number(item.id) + '" aria-label="Restar una unidad">−</button>' +
            '<span>' + item.qty + '</span>' +
            '<button type="button" data-cart-inc="' + Number(item.id) + '" aria-label="Sumar una unidad">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="pwa-order-right">' +
          '<strong>' + money(item.precio * item.qty) + '</strong>' +
          '<button type="button" data-cart-del="' + Number(item.id) + '" aria-label="Eliminar ' + esc(item.nombre) + '" title="Eliminar">🗑️</button>' +
        '</div>' +
      '</li>'
    ).join('');
    wireImages(el.orderList);
  }

  function bumpDock() {
    const btn = $('.pwa-dock-btn[data-view="orden"]');
    if (!btn) return;
    btn.classList.remove('bump');
    void btn.offsetWidth;
    btn.classList.add('bump');
    window.setTimeout(() => btn.classList.remove('bump'), 450);
  }

  function addToCart(id) {
    const item = byId(id);
    if (!item) return;
    const entry = state.cart.find((row) => Number(row.id) === Number(id));
    if (entry) {
      if (entry.qty >= MAX_QTY) {
        App.toast('Máximo ' + MAX_QTY + ' unidades por sabor.', 'warn', 'Límite alcanzado');
        return;
      }
      entry.qty += 1;
    } else {
      state.cart.push({ id: Number(id), qty: 1 });
    }
    saveCart();
    renderOrder();
    bumpDock();
    App.toast(item.nombre + ' se añadió a tu orden.', 'ok', 'Añadido');
    logEvent('info', 'Añadió 1 × ' + item.nombre + ' (' + money(item.precio) + ')');
  }

  function changeQty(id, delta) {
    const entry = state.cart.find((row) => Number(row.id) === Number(id));
    if (!entry) return;
    entry.qty += delta;
    if (entry.qty <= 0) {
      state.cart = state.cart.filter((row) => Number(row.id) !== Number(id));
    } else if (entry.qty > MAX_QTY) {
      entry.qty = MAX_QTY;
      App.toast('Máximo ' + MAX_QTY + ' unidades por sabor.', 'warn', 'Límite alcanzado');
    }
    saveCart();
    renderOrder();
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter((row) => Number(row.id) !== Number(id));
    saveCart();
    renderOrder();
    App.toast('Producto eliminado de tu orden.', 'info', 'Orden actualizada');
  }

  function clearCart(confirmFirst) {
    if (!state.cart.length) {
      App.toast('Tu orden ya está vacía.', 'info', 'Orden');
      return;
    }
    if (confirmFirst && !window.confirm('¿Vaciar todos los productos de tu orden?')) return;
    state.cart = [];
    saveCart();
    renderOrder();
    App.toast('Tu orden quedó vacía.', 'info', 'Orden');
    logEvent('warn', 'Vació su orden de compra (app)');
  }

  /* ── DETALLE ───────────────────────────────────────────── */
  function openDetail(id) {
    const item = byId(id);
    if (!item) return;
    state.detailId = Number(id);
    el.detailCat.textContent = item.catEmoji + ' ' + (item.catLabel || item.catNombre);
    el.detailTitle.textContent = item.nombre;
    el.detailSub.textContent = item.subtitulo;
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
    App.openModal('pwaDetailModal');
  }

  /* ── CHECKOUT ──────────────────────────────────────────── */
  function openCheckout() {
    if (!state.cart.length) {
      App.toast('Añade al menos un helado antes de confirmar.', 'warn', 'Orden vacía');
      return;
    }
    el.checkoutResumen.innerHTML = detailedCart().map((item) =>
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
    App.openModal('pwaCheckoutModal');
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
      alias: state.alias || '',
      origen: 'pwa'
    };

    logSale(order);
    logEvent('ok', 'Pedido ' + order.id + ' confirmado por ' + money(order.total) + ' · ' + name);
    state.cart = [];
    saveCart();
    renderOrder();
    el.checkoutNombre.value = '';
    el.checkoutPhone.value = '';
    el.checkoutNotas.value = '';
    App.closeModal('pwaCheckoutModal');
    showSuccess(order);
  }

  function showSuccess(order) {
    state.lastOrder = order;
    const lines = order.items.map((item) =>
      '<div><span>' + esc(item.nombre) + ' × ' + item.qty + '</span><strong>' + money(item.precio * item.qty) + '</strong></div>'
    ).join('');
    const note = order.entrega === 'Delivery zona central'
      ? '🛵 Delivery zona central · 25 a 40 minutos.'
      : '🏪 Retiro en tienda · listo en 10 a 15 minutos.';

    el.successBody.innerHTML =
      '<div class="pwa-success-box">' +
        '<div class="row-between"><span>Pedido</span><strong>' + esc(order.id) + '</strong></div>' +
        '<div class="row-between"><span>Cliente</span><strong>' + esc(order.cliente) + '</strong></div>' +
        '<div class="row-between"><span>Entrega</span><strong>' + esc(order.entrega) + '</strong></div>' +
        (order.telefono ? '<div class="row-between"><span>Celular</span><strong>' + esc(order.telefono) + '</strong></div>' : '') +
        '<div class="pwa-success-lines">' + lines + '</div>' +
        '<div class="row-between" style="margin-top:4px"><span>TOTAL</span><strong>' + money(order.total) + '</strong></div>' +
      '</div>' +
      '<p class="pwa-success-note">' + note + (order.notas ? ' Nota: ' + esc(order.notas) : '') + '</p>';
    App.openModal('pwaSuccessModal');
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

  /* ── ALIAS ─────────────────────────────────────────────── */
  function paintAlias() {
    const name = state.alias || 'Invitado';
    el.hello.textContent = '¡Hola, ' + name + '!';
    el.profileName.textContent = name;
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
    if (previous !== name) logEvent('info', 'Cliente actualizó su alias a “' + name + '” (app)');
  }

  /* ── ADMINISTRACIÓN ────────────────────────────────────── */
  function applyAdminUI() {
    document.body.classList.toggle('is-admin', state.admin);
    el.adminForm.classList.toggle('hidden', state.admin);
    el.adminLogout.classList.toggle('hidden', !state.admin);
    if (el.adminLogoutBottom) el.adminLogoutBottom.classList.toggle('hidden', !state.admin);
    el.adminBadge.classList.toggle('hidden', !state.admin);
    el.profileStatus.textContent = state.admin ? 'Modo administrador' : 'Modo cliente';
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
      el.adminForm.reset();
      logEvent('ok', 'Administrador “' + user + '” inició sesión (app)');
      App.toast('Bienvenido, ' + user + '. Bitácoras desbloqueadas.', 'ok', 'Sesión admin');
      showView('bitacora');
      return;
    }

    el.adminError.textContent = 'Usuario o contraseña incorrectos.';
    el.adminUser.classList.add('invalid');
    el.adminPass.classList.add('invalid');
    el.adminPass.focus();
    App.toast('Credenciales inválidas.', 'error', 'Acceso denegado');
    logEvent('warn', 'Intento fallido de acceso admin con usuario “' + (user || '(vacío)') + '” (app)');
  }

  function logoutAdmin() {
    if (!state.admin) return;
    logEvent('warn', 'La sesión de administrador se cerró (app)');
    state.admin = false;
    saveAdmin(false);
    applyAdminUI();
    el.adminForm.reset();
    el.adminPass.value = '';
    App.toast('Sesión de administrador cerrada.', 'info', 'Sesión finalizada');
    showView('cuenta');
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
          return '<div class="log-entry ok">' +
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

  /* ── CONECTIVIDAD / INSTALACIÓN ────────────────────────── */
  function paintConnection() {
    el.offline.classList.toggle('hidden', navigator.onLine);
  }

  function setupInstall() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredPrompt = event;
      el.installCard.classList.remove('hidden');
    });

    el.installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        App.toast('Usa el menú del navegador → “Agregar a pantalla de inicio”.', 'info', 'Instalar app');
        return;
      }
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (error) { /* noop */ }
      deferredPrompt = null;
      el.installCard.classList.add('hidden');
    });

    window.addEventListener('appinstalled', () => {
      el.installCard.classList.add('hidden');
      App.toast('ICE CREAM quedó instalada en tu dispositivo.', 'ok', 'App instalada');
    });
  }

  function resetLocalData() {
    if (!window.confirm('¿Borrar tu alias y los productos guardados en este dispositivo? Las bitácoras no se borran.')) return;
    state.cart = [];
    state.alias = '';
    saveCart();
    try { localStorage.removeItem(KEYS.alias); } catch (error) { /* noop */ }
    paintAlias();
    renderOrder();
    App.toast('Tus datos locales fueron borrados.', 'info', 'Limpieza');
  }

  /* ── EVENTOS ───────────────────────────────────────────── */
  function bindEvents() {
    bindViewButtons();

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
      const card = event.target.closest('[data-detail]');
      if (card) openDetail(Number(card.dataset.detail));
    });

    el.grid.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('[data-detail]');
      if (!card || event.target.closest('button')) return;
      event.preventDefault();
      openDetail(Number(card.dataset.detail));
    });

    el.featured.addEventListener('click', (event) => {
      const card = event.target.closest('[data-detail]');
      if (card) openDetail(Number(card.dataset.detail));
    });

    el.orderList.addEventListener('click', (event) => {
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

    el.checkoutBtn.addEventListener('click', openCheckout);
    el.checkoutConfirm.addEventListener('click', confirmCheckout);
    el.clearCart.addEventListener('click', () => clearCart(true));

    el.detailAdd.addEventListener('click', () => {
      const id = state.detailId;
      App.closeModal('pwaDetailModal');
      if (id) {
        addToCart(id);
        showView('orden');
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

    el.adminForm.addEventListener('submit', loginAdmin);
    el.adminLogout.addEventListener('click', logoutAdmin);
    if (el.adminLogoutBottom) el.adminLogoutBottom.addEventListener('click', logoutAdmin);

    el.refreshLogs.addEventListener('click', () => {
      renderLogs();
      App.toast('Bitácoras actualizadas.', 'info', 'Auditoría');
    });
    el.clearLogs.addEventListener('click', clearLogs);
    el.resetData.addEventListener('click', resetLocalData);

    window.addEventListener('online', paintConnection);
    window.addEventListener('offline', paintConnection);

    document.addEventListener('input', (event) => {
      if (event.target && event.target.classList && event.target.classList.contains('invalid')) {
        event.target.classList.remove('invalid');
      }
    });
  }

  /* ── ARRANQUE ──────────────────────────────────────────── */
  function initialView() {
    const hash = (location.hash || '').replace('#', '');
    return VIEWS.indexOf(hash) >= 0 ? hash : 'inicio';
  }

  function init() {
    state.cart = normalizeCart(App.store.get(KEYS.cart, []));
    saveCart();
    state.alias = readAlias().slice(0, 32);
    state.admin = readAdmin();

    applyAdminUI();
    paintAlias();
    renderFeatured();
    renderCatalog();
    renderOrder();
    paintConnection();
    if (state.admin) renderLogs();

    bindEvents();
    setupInstall();

    showView(initialView(), { scroll: false });

    if (typeof App.registerSW === 'function') App.registerSW('sw.js');
  }

  App.ready(init);
})();
