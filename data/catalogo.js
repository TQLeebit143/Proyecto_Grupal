/* ============================================================
   ICE CREAM — data/catalogo.js
   Catálogo local de heladería (file:// y offline).
   ============================================================ */
window.HELADOS_CATEGORIAS = [
  { id: 'cremosos', label: 'Helados cremosos', emoji: '🍨' },
  { id: 'frutales', label: 'Paletas frutales', emoji: '🍓' },
  { id: 'chocolate', label: 'Especiales cacao', emoji: '🍫' },
  { id: 'gourmet', label: 'Copas gourmet', emoji: '👑' }
];

window.HELADOS = [
  {
    id: 1,
    nombre: 'Vainilla Bourbon de Madagascar',
    categoria: 'cremosos',
    catLabel: 'Cremositos',
    subtitulo: 'Crema real & vaina artesanal',
    precio: 15,
    emoji: '🍦',
    nota: 'Infusión natural de vainas de Madagascar',
    img: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=600&auto=format&fit=crop',
    descripcion: 'Elaborado con infusión natural de vainas de Madagascar, crema de leche fresca y un toque dulce irresistible.'
  },
  {
    id: 2,
    nombre: 'Paleta Artesanal de Fresa Natural',
    categoria: 'frutales',
    catLabel: 'Línea Frutal',
    subtitulo: 'Línea Frutal Refresh',
    precio: 10,
    emoji: '🍓',
    nota: '100% pulpa de fresa, sin colorantes',
    img: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?q=80&w=600&auto=format&fit=crop',
    descripcion: 'Paleta hecha con 100% pulpa de fresas seleccionadas, libre de colorantes artificiales y súper refrescante.'
  },
  {
    id: 3,
    nombre: 'Choco-Teja Suprema 70%',
    categoria: 'chocolate',
    catLabel: 'Chocolatería',
    subtitulo: 'Línea Cacao Gourmet',
    precio: 22,
    emoji: '🍫',
    nota: 'Cacao fino de aroma al 70%',
    img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=600&auto=format&fit=crop',
    descripcion: 'Helado cremoso de chocolate amargo 70% cacao enriquecido con trozos de choco-tejas artesanas y fudge de caramelo.'
  },
  {
    id: 4,
    nombre: 'Cono Waffle Doble Chocolate',
    categoria: 'cremosos',
    catLabel: 'Conos Crunch',
    subtitulo: 'Conos Crunch',
    precio: 18,
    emoji: '🍦',
    nota: 'Cono horneado al momento',
    img: 'https://images.unsplash.com/photo-1559703248-dcaaec9fab78?q=80&w=600&auto=format&fit=crop',
    descripcion: 'Crujiente cono artesanal horneado al momento cargado con dos bolas de helado de brownie y chispas de chocolate.'
  },
  {
    id: 5,
    nombre: 'Copa Velvet Red Berries',
    categoria: 'gourmet',
    catLabel: 'Especiales',
    subtitulo: 'Especiales Ice Cream',
    precio: 28,
    emoji: '🍨',
    nota: 'Ideal para compartir',
    img: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=600&auto=format&fit=crop',
    descripcion: 'Copa gourmet con capas de helado de mascarpone, reducción de frutos rojos, galleta crujiente y crema chantilly.'
  },
  {
    id: 6,
    nombre: 'Paleta Trio Cítrico & Menta',
    categoria: 'frutales',
    catLabel: 'Línea Frutal',
    subtitulo: 'Línea Frutal Refresh',
    precio: 12,
    emoji: '🍧',
    nota: 'Limón, naranja agria y menta fresca',
    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop',
    descripcion: 'Combinación refrescante de limón marroquí, naranja agria y hojas de menta fresca trituradas.'
  },
  {
    id: 7,
    nombre: 'Dulce de Leche Colonial',
    categoria: 'cremosos',
    catLabel: 'Cremositos',
    subtitulo: 'Colección Cremositos',
    precio: 16,
    emoji: '🍨',
    nota: 'Vetas crujientes de choco-chips',
    img: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?q=80&w=600&auto=format&fit=crop',
    descripcion: 'Auténtico dulce de leche estilo artesanal batido a baja temperatura con vetas crujientes de choco-chips.'
  },
  {
    id: 8,
    nombre: 'Sandwich Cookie Cream',
    categoria: 'gourmet',
    catLabel: 'Especiales',
    subtitulo: 'Especiales Ice Cream',
    precio: 20,
    emoji: '🍪',
    nota: 'Galletas recién horneadas',
    img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=600&auto=format&fit=crop',
    descripcion: 'Dos galletas de choco-chip recién horneadas abrazando una generosa porción de helado de mantecado.'
  }
];

window.HELADOS.forEach((item) => {
  const cat = window.HELADOS_CATEGORIAS.find((c) => c.id === item.categoria);
  item.catEmoji = cat ? cat.emoji : '🍨';
  item.catNombre = cat ? cat.label : item.categoria;
});
