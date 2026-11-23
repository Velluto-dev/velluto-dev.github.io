import { products, getProductById, getProductBySlug } from './catalog.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const qs = (k) => new URLSearchParams(location.search).get(k);
const money = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const safeQty = (n) => Math.max(1, Math.min(10, Number.parseInt(n, 10) || 1));
const title = (v = '') => v.charAt(0).toUpperCase() + v.slice(1);

const storage = {
  read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

const CART = 'velluto_cart_v1';
const FAV = 'velluto_favorites_v1';
const getCart = () => storage.read(CART, []);
const setCart = (value) => {
  storage.write(CART, value);
  updateCounts();
};
const getFav = () => storage.read(FAV, []);
const setFav = (value) => {
  storage.write(FAV, value);
  updateCounts();
};

function icon(name) {
  const common = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';
  const map = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-5 4-7 8-7s6.5 2 8 7"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    cart: '<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    shield: '<path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/><path d="m9 12 2 2 4-4"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    spark: '<path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"/>',
    gift: '<path d="M4 10h16v11H4zM2 7h20v3H2zM12 7v14M8.5 7C6 7 5 3 7.5 3 10 3 12 7 12 7M15.5 7C18 7 19 3 16.5 3 14 3 12 7 12 7"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    whatsapp: '<path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"/><path d="M8.5 8.5c.5 3 2 4.5 5 5l1-1.5 2 1c-.5 2-1.5 3-3.5 2.5-4-.8-6.7-3.5-7.5-7.5C5 6 6 5 8 4.5l1 2-1.5 1Z"/>',
  };
  return `<svg ${common}>${map[name] || ''}</svg>`;
}

function normalizeAssetName(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function imageFileVariants(p) {
  const raw = (p.image || '').trim();
  if (!raw) return [];
  const dot = raw.lastIndexOf('.');
  const ext = dot >= 0 ? raw.slice(dot) : '.png';
  const base = dot >= 0 ? raw.slice(0, dot) : raw;
  const names = [
    raw,
    `${base.replace(/[-_\s]+/g, '')}${ext}`,
    `${normalizeAssetName(p.slug || '')}.png`,
    `${normalizeAssetName((p.name || '').replace(/\s+150 ?ml$/i, ''))}.png`,
  ];
  const out = [];
  for (const name of names) {
    if (!name || name === 'undefined.png') continue;
    out.push(name);
    if (/\.png$/i.test(name)) out.push(name.replace(/\.png$/i, '.PNG'));
  }
  return [...new Set(out)].map(encodeURI);
}

function imageCandidates(p) {
  const files = imageFileVariants(p);
  if (!files.length) return ['assets/images/default-product.svg'];
  const dirs = p.kind === 'decant'
    ? ['velluto-imagens/decant', 'velluto-imagens/decants', 'velluto-imagens']
    : p.kind === 'body-care'
      ? ['velluto-imagens/cremes', 'velluto-imagens/body-care', 'velluto-imagens']
      : [
          'velluto-imagens',
          'velluto-imagens/perfumes',
          'velluto-imagens/perfume',
          'velluto-imagens/fechados',
          'velluto-imagens/frascos',
          p.gender === 'masculino' ? 'velluto-imagens/masculinos' : 'velluto-imagens/femininos',
          p.gender === 'masculino' ? 'velluto-imagens/masculino' : 'velluto-imagens/feminino',
        ];
  const list = [];
  for (const file of files) {
    for (const dir of dirs) list.push(`${dir}/${file}`);
  }
  for (const file of files) list.push(`assets/images/products/${file}`);
  list.push('assets/images/default-product.svg');
  return [...new Set(list)];
}

function productImage(p) {
  return imageCandidates(p)[0];
}

function fallbackProductImage(img) {
  const product = getProductById(img.dataset.productId || '');
  if (!product) {
    img.src = 'assets/images/default-product.svg';
    return;
  }
  const candidates = imageCandidates(product);
  const current = Number(img.dataset.imageIndex || 0);
  const next = current + 1;
  if (next < candidates.length) {
    img.dataset.imageIndex = String(next);
    img.src = candidates[next];
  } else {
    img.src = 'assets/images/default-product.svg';
  }
}

const LOGO_CANDIDATES = [
  'velluto-imagens/logo/logo-velluto.png',
  'velluto-imagens/logo/logo-velluto.PNG',
  'velluto-imagens/logo/logovelluto.png',
  'velluto-imagens/logo/logo-velluto.webp',
  'velluto-imagens/logo/logo-velluto.svg',
  'assets/images/brand/logo-velluto.png',
];

function fallbackLogo(img) {
  const current = Number(img.dataset.logoIndex || 0);
  const next = current + 1;
  if (next < LOGO_CANDIDATES.length) {
    img.dataset.logoIndex = String(next);
    img.src = LOGO_CANDIDATES[next];
  } else {
    const brand = img.closest('.brand');
    brand?.classList.add('logo-failed');
    img.remove();
  }
}

window.addEventListener('error', (e) => {
  if (!(e.target instanceof HTMLImageElement)) return;
  if (e.target.matches('[data-product-image]')) fallbackProductImage(e.target);
  if (e.target.matches('.brand-logo-img')) fallbackLogo(e.target);
}, true);

function setupBranding() {
  $$('.brand').forEach((brand) => {
    if (brand.dataset.brandReady) return;
    brand.dataset.brandReady = '1';
    const small = brand.closest('.site-footer') ? ' brand--footer' : '';
    brand.innerHTML = `
      <span class="brand-fallback${small}">
        <span class="brand-mark">V</span>
        <span class="brand-copy">
          <span class="brand-name">VELLUTO</span>
          <span class="brand-sub">Fragrance</span>
        </span>
      </span>
      <img class="brand-logo-img" data-logo-index="0" src="${LOGO_CANDIDATES[0]}" alt="Velluto Fragrance">
    `;
    const img = $('.brand-logo-img', brand);
    img?.addEventListener('load', () => brand.classList.add('has-logo'));
  });
}

function addCart(id, qty = 1) {
  const product = getProductById(id);
  if (!product) return;
  const cart = getCart();
  const row = cart.find((x) => x.id === id);
  if (row) row.qty = safeQty(row.qty + qty);
  else cart.push({ id, qty: safeQty(qty) });
  setCart(cart);
  toast(`${product.name} adicionado ao carrinho.`);
}

function removeCart(id) {
  setCart(getCart().filter((x) => x.id !== id));
}

function setCartQty(id, qty) {
  const cart = getCart();
  const row = cart.find((x) => x.id === id);
  if (!row) return;
  row.qty = safeQty(qty);
  setCart(cart);
}

function toggleFav(id) {
  const fav = getFav();
  const has = fav.includes(id);
  setFav(has ? fav.filter((x) => x !== id) : [...fav, id]);
  refreshFavoriteButtons();
  toast(has ? 'Removido dos favoritos.' : 'Salvo nos favoritos.');
}

function cartDetails() {
  return getCart().map((row) => ({ row, p: getProductById(row.id) })).filter((x) => x.p);
}

function cartTotal() {
  return cartDetails().reduce((sum, { row, p }) => sum + (p.price * row.qty), 0);
}

function updateCounts() {
  const cartCount = getCart().reduce((sum, x) => sum + x.qty, 0);
  const favCount = getFav().length;
  $$('[data-cart-count]').forEach((el) => { el.textContent = cartCount; });
  $$('[data-fav-count]').forEach((el) => { el.textContent = favCount; });
}

function refreshFavoriteButtons() {
  const fav = new Set(getFav());
  $$('[data-favorite]').forEach((btn) => btn.classList.toggle('active', fav.has(btn.dataset.favorite)));
}

function toast(message, type = 'ok') {
  let stack = $('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.append(stack);
  }
  const item = document.createElement('div');
  item.className = `toast ${type === 'error' ? 'error' : ''}`;
  item.textContent = message;
  stack.append(item);
  setTimeout(() => item.remove(), 2600);
}

const NOTE_LIBRARY = {
  bergamota: { label: 'Bergamota', perception: 'cítrica, luminosa e energizante', best: 'ótima para calor, dia e sensação de limpeza' },
  limao: { label: 'Limão', perception: 'fresco, verde e revigorante', best: 'ajuda muito em dias quentes e uso casual' },
  grapefruit: { label: 'Grapefruit', perception: 'cítrica e vibrante com leve amargor', best: 'traz modernidade para o dia e clima ameno' },
  mandarina: { label: 'Mandarina', perception: 'suculenta, alegre e leve', best: 'boa para manhãs, primavera e rotinas leves' },
  pera: { label: 'Pêra', perception: 'frutada, macia e delicadamente doce', best: 'combina com perfumes versáteis e femininos' },
  maca: { label: 'Maçã', perception: 'crocrante, frutada e jovial', best: 'dá frescor e casualidade ao uso diário' },
  pimentapreta: { label: 'Pimenta preta', perception: 'seca, picante e marcante', best: 'funciona melhor em noites e clima mais fresco' },
  pimentarosa: { label: 'Pimenta rosa', perception: 'especiada, rosada e vibrante', best: 'traz brilho para encontros e ocasiões noturnas' },
  cardamomo: { label: 'Cardamomo', perception: 'especiado, elegante e aromático', best: 'deixa a abertura sofisticada e versátil' },
  canela: { label: 'Canela', perception: 'quente, adocicada e envolvente', best: 'fica melhor no frio e em perfumes noturnos' },
  nozmoscada: { label: 'Noz-moscada', perception: 'especiada, quente e cremosa', best: 'boa para perfumes intensos e aconchegantes' },
  lavanda: { label: 'Lavanda', perception: 'limpa, aromática e elegante', best: 'funciona em trabalho, dia e perfis versáteis' },
  notasmarinhas: { label: 'Notas marinhas', perception: 'aquáticas, leves e refrescantes', best: 'perfeitas para verão e sensação de banho tomado' },
  floraisbrancos: { label: 'Florais brancos', perception: 'luminosos, sofisticados e femininos', best: 'funcionam bem em clima ameno e momentos elegantes' },
  jasmim: { label: 'Jasmim', perception: 'floral cremoso e sofisticado', best: 'eleva perfumes elegantes e sensuais' },
  rosa: { label: 'Rosa', perception: 'floral clássica, elegante e romântica', best: 'boa para encontros, primavera e ocasiões refinadas' },
  iris: { label: 'Íris', perception: 'atalcada, refinada e macia', best: 'traz elegância, limpeza e um toque de luxo' },
  patchouli: { label: 'Patchouli', perception: 'terroso, encorpado e marcante', best: 'sustenta perfumes intensos para noite e frio' },
  vetiver: { label: 'Vetiver', perception: 'seca, verde e levemente amadeirada', best: 'equilibra perfumes masculinos e sofisticados' },
  cedro: { label: 'Cedro', perception: 'amadeirado limpo, seco e elegante', best: 'deixa o perfume versátil e refinado' },
  sandalwood: { label: 'Sândalo', perception: 'cremoso, amadeirado e macio', best: 'dá conforto para pele e clima ameno a frio' },
  ambar: { label: 'Âmbar', perception: 'quente, resinoso e envolvente', best: 'brilha em noites, frio e perfumes de presença' },
  baunilha: { label: 'Baunilha', perception: 'doce, cremosa e aconchegante', best: 'ideal para encontro, frio e clima mais íntimo' },
  almiscar: { label: 'Almíscar', perception: 'limpo, macio e confortável', best: 'ótimo para sensação de pele limpa e versatilidade' },
  tonka: { label: 'Fava tonka', perception: 'amendoada, doce e envolvente', best: 'fortalece o lado sensual do perfume' },
  praline: { label: 'Praliné', perception: 'gourmand, açucarado e envolvente', best: 'faz sucesso em noites, frio e encontros' },
  oud: { label: 'Oud', perception: 'denso, resinoso e imponente', best: 'fica melhor em perfis intensos, frios e marcantes' },
  couro: { label: 'Couro', perception: 'intenso, seco e sofisticado', best: 'bom para noites e ocasiões com presença' },
  tabaco: { label: 'Tabaco', perception: 'quente, seco e encorpado', best: 'combina com clima frio e sensação luxuosa' },
  cafe: { label: 'Café', perception: 'tostado, escuro e confortável', best: 'traz profundidade para noites e tempo mais frio' },
  frutasvermelhas: { label: 'Frutas vermelhas', perception: 'suculentas, doces e vibrantes', best: 'ótimas para perfume sensual e jovial' },
  tropical: { label: 'Notas tropicais', perception: 'frutadas, solares e cremosas', best: 'boa escolha para quem quer doçura alegre' },
  orquidea: { label: 'Orquídea', perception: 'floral cremosa e elegante', best: 'equilibra perfumes femininos modernos' },
  heliotropio: { label: 'Heliotrópio', perception: 'atalcado, levemente amendoado e confortável', best: 'traz sensação de aconchego e assinatura suave' },
};

const CATEGORY_MODELS = {
  citrico: {
    top: ['bergamota', 'limao', 'grapefruit'],
    heart: ['lavanda', 'floraisbrancos'],
    base: ['almiscar', 'cedro'],
    seasons: { verao: 5, primavera: 4, outono: 2, inverno: 1 },
    moments: { dia: 5, fimDeTarde: 3, noite: 2 },
    occasions: { trabalho: 4, diaADia: 5, encontro: 2, festa: 2 },
    attributes: { fresh: 5, sweet: 1, intensity: 2, elegance: 3, sensuality: 2 },
    label: 'fresco',
  },
  aquatico: {
    top: ['notasmarinhas', 'bergamota', 'mandarina'],
    heart: ['lavanda', 'iris'],
    base: ['almiscar', 'cedro'],
    seasons: { verao: 5, primavera: 4, outono: 2, inverno: 1 },
    moments: { dia: 5, fimDeTarde: 4, noite: 2 },
    occasions: { trabalho: 4, diaADia: 5, encontro: 3, festa: 2 },
    attributes: { fresh: 5, sweet: 1, intensity: 2, elegance: 3, sensuality: 2 },
    label: 'refrescante',
  },
  amadeirado: {
    top: ['bergamota', 'pimentapreta', 'cardamomo'],
    heart: ['lavanda', 'vetiver', 'iris'],
    base: ['cedro', 'sandalwood', 'ambar'],
    seasons: { verao: 2, primavera: 3, outono: 4, inverno: 4 },
    moments: { dia: 3, fimDeTarde: 4, noite: 4 },
    occasions: { trabalho: 3, diaADia: 3, encontro: 4, festa: 4 },
    attributes: { fresh: 2, sweet: 2, intensity: 4, elegance: 4, sensuality: 4 },
    label: 'amadeirado',
  },
  oriental: {
    top: ['cardamomo', 'pimentarosa', 'canela'],
    heart: ['rosa', 'patchouli', 'floraisbrancos'],
    base: ['ambar', 'baunilha', 'oud'],
    seasons: { verao: 1, primavera: 2, outono: 5, inverno: 5 },
    moments: { dia: 2, fimDeTarde: 4, noite: 5 },
    occasions: { trabalho: 2, diaADia: 2, encontro: 5, festa: 5 },
    attributes: { fresh: 1, sweet: 4, intensity: 5, elegance: 4, sensuality: 5 },
    label: 'quente',
  },
  especiado: {
    top: ['pimentapreta', 'cardamomo', 'canela'],
    heart: ['lavanda', 'patchouli', 'nozmoscada'],
    base: ['ambar', 'vetiver', 'cedro'],
    seasons: { verao: 1, primavera: 2, outono: 5, inverno: 5 },
    moments: { dia: 2, fimDeTarde: 4, noite: 5 },
    occasions: { trabalho: 2, diaADia: 2, encontro: 4, festa: 5 },
    attributes: { fresh: 1, sweet: 2, intensity: 5, elegance: 4, sensuality: 4 },
    label: 'especiado',
  },
  floral: {
    top: ['pera', 'bergamota', 'mandarina'],
    heart: ['rosa', 'jasmim', 'orquidea'],
    base: ['almiscar', 'baunilha', 'sandalwood'],
    seasons: { verao: 3, primavera: 5, outono: 3, inverno: 2 },
    moments: { dia: 4, fimDeTarde: 4, noite: 3 },
    occasions: { trabalho: 3, diaADia: 3, encontro: 4, festa: 3 },
    attributes: { fresh: 3, sweet: 3, intensity: 3, elegance: 5, sensuality: 4 },
    label: 'elegante',
  },
  doce: {
    top: ['frutasvermelhas', 'pera', 'mandarina'],
    heart: ['praline', 'floraisbrancos', 'orquidea'],
    base: ['baunilha', 'tonka', 'ambar'],
    seasons: { verao: 1, primavera: 2, outono: 4, inverno: 5 },
    moments: { dia: 2, fimDeTarde: 3, noite: 5 },
    occasions: { trabalho: 1, diaADia: 2, encontro: 5, festa: 4 },
    attributes: { fresh: 1, sweet: 5, intensity: 4, elegance: 3, sensuality: 5 },
    label: 'envolvente',
  },
};

const PROFILE_OVERRIDES = {
  'asad': {
    top: ['pimentapreta', 'tabaco', 'abacaxi'],
    heart: ['cafe', 'patchouli', 'iris'],
    base: ['baunilha', 'ambar', 'sandalwood'],
    summary: 'Perfil quente, escuro e marcante. Normalmente agrada quem quer presença amadeirada com especiarias e um toque levemente adocicado.',
    plain: 'Lembra um perfume de presença: mais noturno, encorpado e muito confortável em clima ameno a frio.',
  },
  'hawas-ice': {
    top: ['bergamota', 'grapefruit', 'notasmarinhas'],
    heart: ['lavanda', 'cardamomo', 'iris'],
    base: ['almiscar', 'cedro', 'ambar'],
    summary: 'Cheiro limpo, gelado e refrescante. Excelente para calor, rotina e para quem busca frescor com um toque moderno.',
    plain: 'A sensação geral é de banho tomado e energia, com melhor rendimento no calor e durante o dia.',
  },
  'yara': {
    top: ['heliotropio', 'mandarina', 'orquidea'],
    heart: ['tropical', 'floraisbrancos', 'rosa'],
    base: ['baunilha', 'almiscar', 'sandalwood'],
    summary: 'Doce, macio e feminino. Costuma funcionar muito bem quando a ideia é ter conforto, delicadeza e feminilidade moderna.',
    plain: 'A sensação é cremosa, confortável e levemente tropical, sem ficar difícil de usar.',
  },
  'yara-moi': {
    top: ['pera', 'jasmim', 'mandarina'],
    heart: ['floraisbrancos', 'praline', 'orquidea'],
    base: ['baunilha', 'almiscar', 'sandalwood'],
  },
  'yara-elixir': {
    top: ['frutasvermelhas', 'mandarina', 'pera'],
    heart: ['orquidea', 'praline', 'rosa'],
    base: ['baunilha', 'ambar', 'almiscar'],
  },
  'good-girl': {
    top: ['bergamota', 'amendoa', 'cafe'],
    heart: ['jasmim', 'orquidea', 'floraisbrancos'],
    base: ['tonka', 'cacau', 'baunilha'],
    summary: 'Doce e sedutor, com contraste entre abertura chamativa e fundo cremoso. Costuma performar melhor à noite e em ocasiões especiais.',
    plain: 'Entrega sensualidade, assinatura forte e sensação de perfume para sair.',
  },
  'libre': {
    top: ['bergamota', 'mandarina', 'lavanda'],
    heart: ['floraisbrancos', 'jasmim', 'rosa'],
    base: ['baunilha', 'almiscar', 'ambar'],
    summary: 'Equilíbrio entre frescor aromático e fundo doce elegante. Vai bem para quem quer um perfume sofisticado sem ser pesado.',
  },
  'la-vie-est-belle': {
    top: ['pera', 'frutasvermelhas', 'bergamota'],
    heart: ['iris', 'jasmim', 'floraisbrancos'],
    base: ['praline', 'baunilha', 'patchouli'],
  },
  'dylan-blue': {
    top: ['bergamota', 'grapefruit', 'notasmarinhas'],
    heart: ['pimentapreta', 'papiro', 'lavanda'],
    base: ['almiscar', 'tonka', 'incenso'],
  },
  'oud-for-glory': {
    top: ['pimentapreta', 'lavanda', 'acafrao'],
    heart: ['patchouli', 'oud', 'rosa'],
    base: ['ambar', 'oud', 'almiscar'],
    summary: 'Oud potente, resinoso e envolvente. Funciona melhor como assinatura intensa para frio e noite.',
  },
  'liquid-brun': {
    top: ['canela', 'bergamota', 'cardamomo'],
    heart: ['baunilha', 'lavanda', 'praline'],
    base: ['ambar', 'sandalwood', 'tonka'],
  },
  'sabah': {
    top: ['bergamota', 'mandarina', 'pera'],
    heart: ['floraisbrancos', 'rosa', 'jasmim'],
    base: ['almiscar', 'baunilha', 'ambar'],
  },
};

function cleanNoteId(value = '') {
  return normalizeAssetName(value);
}

function fallbackNote(id) {
  const label = id.split('-').map(title).join(' ');
  return { label, perception: 'nota com presença dentro da composição', best: 'ajuda a construir a assinatura do perfume' };
}

function averageScore(current, next, count) {
  return current + (next / count);
}

function buildProfile(product) {
  const categories = product.categories || [];
  const modelCount = Math.max(1, categories.length);
  const profile = {
    top: [],
    heart: [],
    base: [],
    seasons: { inverno: 0, primavera: 0, verao: 0, outono: 0 },
    moments: { dia: 0, fimDeTarde: 0, noite: 0 },
    occasions: { trabalho: 0, diaADia: 0, encontro: 0, festa: 0 },
    attributes: { fresh: 0, sweet: 0, intensity: 0, elegance: 0, sensuality: 0 },
    summary: '',
    plain: '',
  };

  categories.forEach((cat) => {
    const model = CATEGORY_MODELS[cat];
    if (!model) return;
    profile.top.push(...model.top);
    profile.heart.push(...model.heart);
    profile.base.push(...model.base);
    Object.keys(profile.seasons).forEach((key) => { profile.seasons[key] = averageScore(profile.seasons[key], model.seasons[key] || 0, modelCount); });
    Object.keys(profile.moments).forEach((key) => { profile.moments[key] = averageScore(profile.moments[key], model.moments[key] || 0, modelCount); });
    Object.keys(profile.occasions).forEach((key) => { profile.occasions[key] = averageScore(profile.occasions[key], model.occasions[key] || 0, modelCount); });
    Object.keys(profile.attributes).forEach((key) => { profile.attributes[key] = averageScore(profile.attributes[key], model.attributes[key] || 0, modelCount); });
  });

  const override = PROFILE_OVERRIDES[product.slug] || {};
  if (override.top) profile.top = override.top;
  if (override.heart) profile.heart = override.heart;
  if (override.base) profile.base = override.base;
  profile.summary = override.summary || '';
  profile.plain = override.plain || '';

  profile.top = [...new Set(profile.top)].slice(0, 3);
  profile.heart = [...new Set(profile.heart)].slice(0, 3);
  profile.base = [...new Set(profile.base)].slice(0, 3);

  if (!profile.summary) {
    const moodLabels = [...new Set(categories.map((cat) => CATEGORY_MODELS[cat]?.label).filter(Boolean))].slice(0, 3).join(', ');
    profile.summary = `Leitura olfativa pensada para facilitar a escolha: um perfume ${moodLabels || 'marcante'} com boa aderência ao perfil da categoria.`;
  }
  if (!profile.plain) {
    const [season] = topTwo(profile.seasons, SEASON_LABELS);
    const [moment] = topTwo(profile.moments, MOMENT_LABELS);
    profile.plain = `Em linguagem simples: tende a funcionar melhor em ${season.label.toLowerCase()} e ${moment.label.toLowerCase()}, com comportamento alinhado ao estilo ${categories.join(' · ') || 'da fragrância'}.`;
  }

  profile.noteCards = [
    ...profile.top.map((id) => ({ stage: 'Saída', id, ...noteFromId(id) })),
    ...profile.heart.map((id) => ({ stage: 'Coração', id, ...noteFromId(id) })),
    ...profile.base.map((id) => ({ stage: 'Fundo', id, ...noteFromId(id) })),
  ];

  profile.tags = topTwo(profile.seasons, SEASON_LABELS).concat(topTwo(profile.moments, MOMENT_LABELS)).map((x) => x.label);
  return profile;
}

function noteFromId(id) {
  return NOTE_LIBRARY[cleanNoteId(id)] || fallbackNote(id);
}

const profileCache = new Map();
function getProfile(product) {
  if (!product) return null;
  if (!profileCache.has(product.id)) profileCache.set(product.id, buildProfile(product));
  return profileCache.get(product.id);
}

const SEASON_LABELS = { inverno: 'Inverno', primavera: 'Primavera', verao: 'Verão', outono: 'Outono' };
const MOMENT_LABELS = { dia: 'Dia', fimDeTarde: 'Fim de tarde', noite: 'Noite' };
const OCCASION_LABELS = { trabalho: 'Trabalho', diaADia: 'Dia a dia', encontro: 'Encontro', festa: 'Festa' };

function topTwo(map, labels) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key, value]) => ({ key, label: labels[key], value: Math.round((value / 5) * 100) || 0 }));
}

function meter(label, value) {
  return `
    <div class="attribute-line">
      <span>${label}</span>
      <div class="meter"><span style="width:${Math.max(12, (value / 5) * 100)}%"></span></div>
      <strong>${value.toFixed(0)}/5</strong>
    </div>
  `;
}

function usageTags(items) {
  return items.map((item) => `<span class="usage-tag">${item.label}</span>`).join('');
}

// Formato e volume de cada apresentação, para frasco e decant nunca se confundirem no pedido
function productFormatLabel(product) {
  if (product.kind === 'decant') return 'Decant 5 mL';
  if (product.kind === 'body-care') return product.volume ? `Body care ${product.volume}` : 'Body care';
  return product.volume ? `Frasco de ${product.volume}` : 'Frasco';
}

function productTypeLabel(product) {
  if (product.kind === 'decant') return 'Decant 5 mL';
  if (product.kind === 'body-care') return 'Body care';
  if (product.gender === 'masculino') return 'Masculino';
  if (product.gender === 'feminino') return 'Feminino';
  return 'Perfume';
}

function productCard(product, badge = '') {
  const profile = getProfile(product);
  const article = document.createElement('article');
  article.className = 'product-card';
  article.dataset.productId = product.id;
  article.innerHTML = `
    <a class="product-media" href="produto.html?id=${encodeURIComponent(product.id)}">
      ${badge ? `<span class="badge ${badge === 'Mais vendido' ? 'gold' : ''}">${badge}</span>` : ''}
      <img data-product-image data-product-id="${product.id}" loading="lazy" decoding="async" src="${productImage(product)}" alt="${product.name}">
    </a>
    <button class="favorite-btn" type="button" aria-label="Favoritar ${product.name}" data-favorite="${product.id}">${icon('heart')}</button>
    <div class="product-body">
      <div class="product-kicker">${productTypeLabel(product)}</div>
      <a href="produto.html?id=${encodeURIComponent(product.id)}"><h3 class="product-name">${product.name}</h3></a>
      <div class="product-signature">${product.description}</div>
      <div class="product-meta">${product.categories.join(' · ')}</div>
      <div class="product-quick-tags">${usageTags(topTwo(profile.seasons, SEASON_LABELS).concat(topTwo(profile.moments, MOMENT_LABELS).slice(0, 1)))}</div>
      <div class="product-price"><strong>${money(product.price)}</strong>${product.kind === 'decant' ? '<small>5 mL</small>' : ''}</div>
      <div class="product-actions">
        <button class="btn btn-dark" type="button" data-add-cart="${product.id}">Adicionar</button>
        <a class="icon-btn" href="produto.html?id=${encodeURIComponent(product.id)}" aria-label="Ver produto">${icon('arrow')}</a>
      </div>
    </div>
  `;
  return article;
}

function renderProducts(container, list, { limit = Infinity, badges = {} } = {}) {
  if (!container) return;
  container.textContent = '';
  list.slice(0, limit).forEach((p) => container.append(productCard(p, badges[p.id] || '')));
  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'product-empty';
    empty.textContent = 'Nenhum produto encontrado com esses filtros.';
    container.append(empty);
  }
  refreshFavoriteButtons();
}

function setupHeader() {
  const menuBtn = $('[data-menu-toggle]');
  const panel = $('[data-mobile-panel]');
  const close = $('[data-menu-close]');
  const toggle = (on) => {
    panel?.classList.toggle('open', on);
    document.body.classList.toggle('menu-open', on);
    menuBtn?.setAttribute('aria-expanded', String(on));
  };
  menuBtn?.addEventListener('click', () => toggle(!panel.classList.contains('open')));
  close?.addEventListener('click', () => toggle(false));

  const input = $('#globalSearch');
  const results = $('#globalSearchResults');
  if (!input || !results) return;
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = input.value.trim().toLocaleLowerCase('pt-BR');
      results.textContent = '';
      if (q.length < 2) {
        results.classList.remove('open');
        return;
      }
      const found = products
        .filter((p) => p.active && (`${p.name} ${p.description} ${p.categories.join(' ')}`).toLocaleLowerCase('pt-BR').includes(q))
        .slice(0, 8);
      found.forEach((p) => {
        const a = document.createElement('a');
        a.className = 'search-result';
        a.href = `produto.html?id=${encodeURIComponent(p.id)}`;
        a.innerHTML = `
          <img class="search-thumb" data-product-image data-product-id="${p.id}" src="${productImage(p)}" alt="${p.name}">
          <span><strong>${p.name}</strong><small>${productTypeLabel(p)}</small></span>
          <span class="search-result-price">${money(p.price)}</span>
        `;
        results.append(a);
      });
      if (!found.length) {
        const div = document.createElement('div');
        div.className = 'search-result';
        div.textContent = 'Nenhum produto encontrado.';
        results.append(div);
      }
      results.classList.add('open');
    }, 100);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) location.href = `produtos.html?q=${encodeURIComponent(input.value.trim())}`;
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.global-search')) results.classList.remove('open');
  });
}

function setupDelegation() {
  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add-cart]');
    const fav = e.target.closest('[data-favorite]');
    if (add) addCart(add.dataset.addCart);
    if (fav) toggleFav(fav.dataset.favorite);
  });
}

const HERO_STORIES = [
  {
    id: 'perfume-masculino-asad',
    eyebrow: 'Universo Olfativo Velluto',
    title: 'Perfume não é visto.<br>É lembrado.',
    text: 'Uma home pensada para vender e também traduzir a perfumaria. Descubra o cheiro, o momento e o clima ideal sem precisar dominar termos técnicos.',
    cta: 'Explorar coleção',
    secondary: 'Como funciona',
  },
  {
    id: 'perfume-feminino-yara',
    eyebrow: 'Escolha pela sensação',
    title: 'Doçura, elegância e conforto.<br>Sem complicação.',
    text: 'A Velluto traduz notas, famílias e estilos em sensações reais: mais doce, mais fresco, mais marcante ou mais confortável.',
    cta: 'Ver femininos',
    secondary: 'Entender as notas',
  },
  {
    id: 'perfume-masculino-hawas-ice',
    eyebrow: 'Escolha pela ocasião',
    title: 'Saiba quando usar.<br>Antes de comprar.',
    text: 'Cada perfume pode trazer uma leitura simples de estação, momento do dia e situação de uso. Você entende rápido se ele combina com você.',
    cta: 'Ver masculinos',
    secondary: 'Explorar universo',
  },
  {
    id: 'perfume-feminino-good-girl',
    eyebrow: 'Experimente com segurança',
    title: 'Frasco ou decant?<br>Você escolhe o caminho.',
    text: 'Conheça a fragrância no frasco completo ou experimente em 5 mL. A vitrine é premium, mas o processo continua claro e funcional.',
    cta: 'Ver decants',
    secondary: 'Ver mais vendidos',
  },
];

function renderHeroStory(index) {
  const story = HERO_STORIES[index];
  const product = getProductById(story.id);
  if (!product) return;
  const profile = getProfile(product);
  const titleEl = $('#heroTitle');
  const eyebrowEl = $('#heroEyebrow');
  const textEl = $('#heroText');
  const image = $('#heroImage');
  const notes = $('#heroNotes');
  const card = $('#heroCard');
  const cta = $('#heroPrimaryCta');
  const secondary = $('#heroSecondaryCta');
  const meta = $('#heroBestWhen');
  if (eyebrowEl) eyebrowEl.textContent = story.eyebrow;
  if (titleEl) titleEl.innerHTML = story.title;
  if (textEl) textEl.textContent = story.text;
  if (cta) {
    cta.textContent = story.cta;
    cta.href = story.cta.includes('decant') ? 'decants.html' : story.cta.includes('femininos') ? 'produtos.html?genero=feminino' : story.cta.includes('masculinos') ? 'produtos.html?genero=masculino' : 'perfumes.html';
  }
  if (secondary) {
    secondary.textContent = story.secondary;
    secondary.href = story.secondary.includes('notas') || story.secondary.includes('universo') ? '#universo-olfativo' : story.secondary.includes('vendidos') ? '#mais-procurados' : '#como-funciona';
  }
  if (image) {
    image.dataset.productId = product.id;
    image.dataset.imageIndex = '0';
    image.src = productImage(product);
    image.alt = product.name;
  }
  if (notes) {
    notes.innerHTML = profile.noteCards.slice(0, 4).map((note, idx) => `<span class="hero-orbit-node node-${idx + 1}"><strong>${note.label}</strong><small>${note.perception}</small></span>`).join('');
  }
  if (card) {
    const [s1, s2] = topTwo(profile.seasons, SEASON_LABELS);
    const [m1, m2] = topTwo(profile.moments, MOMENT_LABELS);
    card.innerHTML = `
      <div class="hero-floating-kicker">Destaque atual</div>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="hero-card-price">${money(product.price)}</div>
      <div class="hero-card-tags">${usageTags([s1, s2, m1, m2].filter(Boolean))}</div>
    `;
  }
  if (meta) {
    meta.innerHTML = `
      <div class="hero-kpi"><strong>${products.filter((p) => p.active).length}+</strong><span>itens no catálogo</span></div>
      <div class="hero-kpi"><strong>${topTwo(profile.occasions, OCCASION_LABELS).map((x) => x.label).join(' · ')}</strong><span>indicação principal</span></div>
      <div class="hero-kpi"><strong>Leitura simples</strong><span>notas, clima e ocasião</span></div>
    `;
  }
  $$('#heroPager button').forEach((btn, i) => btn.classList.toggle('active', i === index));
}

function setupHeroRotation() {
  const pager = $('#heroPager');
  if (!pager) return;
  pager.innerHTML = HERO_STORIES.map((story, idx) => `<button type="button" aria-label="Mostrar destaque ${idx + 1}"><span>${(idx + 1).toString().padStart(2, '0')}</span></button>`).join('');
  let current = 0;
  renderHeroStory(current);
  $$('#heroPager button').forEach((btn, idx) => btn.addEventListener('click', () => {
    current = idx;
    renderHeroStory(current);
  }));
  setInterval(() => {
    if (document.hidden) return;
    current = (current + 1) % HERO_STORIES.length;
    renderHeroStory(current);
  }, 6500);
}

function home() {
  const bestIds = ['perfume-masculino-asad', 'perfume-feminino-yara', 'perfume-masculino-hawas-ice', 'perfume-feminino-good-girl'];
  const best = bestIds.map(getProductById).filter(Boolean);
  const bestDec = ['decant-masculino-asad', 'decant-feminino-yara', 'decant-feminino-libre', 'decant-masculino-club-de-nuit'].map(getProductById).filter(Boolean);
  renderProducts($('#homeBest'), best, { badges: Object.fromEntries(best.map((p) => [p.id, 'Mais vendido'])) });
  renderProducts($('#homeDecants'), bestDec);
  const count = $('[data-product-total]');
  if (count) count.textContent = String(products.filter((p) => p.active).length);

  const spotlightProduct = getProductById('perfume-masculino-oud-for-glory') || best[0];
  if (spotlightProduct) {
    const spotlightProfile = getProfile(spotlightProduct);
    const art = $('#spotlightImage');
    if (art) {
      art.dataset.productId = spotlightProduct.id;
      art.src = productImage(spotlightProduct);
      art.alt = spotlightProduct.name;
    }
    const box = $('#spotlightCopy');
    if (box) {
      box.innerHTML = `
        <div class="eyebrow">Destaque editorial</div>
        <h2 class="section-title">${spotlightProduct.name}</h2>
        <p class="section-copy">${spotlightProfile.summary}</p>
        <div class="spotlight-tags">${usageTags(topTwo(spotlightProfile.seasons, SEASON_LABELS).concat(topTwo(spotlightProfile.moments, MOMENT_LABELS)))}</div>
        <div class="spotlight-price">${money(spotlightProduct.price)}</div>
        <div class="button-row mt-24">
          <a class="btn btn-dark" href="produto.html?id=${encodeURIComponent(spotlightProduct.id)}">Ver produto</a>
          <a class="btn btn-outline" href="produtos.html?familia=oriental">Explorar perfil</a>
        </div>
      `;
    }
  }

  const noteShowcase = $('#olfactoryEducation');
  if (noteShowcase) {
    const examples = ['bergamota', 'baunilha', 'oud', 'lavanda'];
    noteShowcase.innerHTML = examples.map((id) => {
      const note = noteFromId(id);
      return `
        <article class="education-card">
          <div class="education-label">${note.label}</div>
          <h3>${note.perception}</h3>
          <p>${note.best}</p>
        </article>
      `;
    }).join('');
  }

  setupHeroRotation();
}

function catalog() {
  const grid = $('#catalogGrid');
  const count = $('#resultCount');
  const qInput = $('#catalogSearch');
  const sort = $('#catalogSort');
  const filter = $('#filterCard');
  if (!grid) return;
  const pageKind = document.body.dataset.catalogKind || '';
  const query = qs('q') || '';
  if (qInput) qInput.value = query;
  const presetGender = qs('genero');
  if (presetGender && filter) {
    const box = filter.querySelector(`input[name="gender"][value="${CSS.escape(presetGender)}"]`);
    if (box) box.checked = true;
  }
  const presetCat = qs('familia');
  if (presetCat && filter) {
    const box = filter.querySelector(`input[name="cat"][value="${CSS.escape(presetCat)}"]`);
    if (box) box.checked = true;
  }
  const active = () => ({
    kind: $$('input[name="kind"]:checked', filter).map((x) => x.value),
    gender: $$('input[name="gender"]:checked', filter).map((x) => x.value),
    cat: $$('input[name="cat"]:checked', filter).map((x) => x.value),
  });
  const apply = () => {
    const f = active();
    const term = (qInput?.value || '').trim().toLocaleLowerCase('pt-BR');
    let list = products.filter((p) => p.active);
    if (pageKind) list = list.filter((p) => p.kind === pageKind);
    if (f.kind.length) list = list.filter((p) => f.kind.includes(p.kind));
    if (f.gender.length) list = list.filter((p) => f.gender.includes(p.gender));
    if (f.cat.length) list = list.filter((p) => f.cat.some((c) => p.categories.includes(c)));
    if (term) list = list.filter((p) => `${p.name} ${p.description} ${p.categories.join(' ')}`.toLocaleLowerCase('pt-BR').includes(term));
    switch (sort?.value) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')); break;
      default: break;
    }
    renderProducts(grid, list);
    if (count) count.textContent = `${list.length} ${list.length === 1 ? 'produto' : 'produtos'}`;
  };
  filter?.addEventListener('change', apply);
  qInput?.addEventListener('input', apply);
  sort?.addEventListener('change', apply);
  $('[data-filter-toggle]')?.addEventListener('click', () => filter?.classList.toggle('open'));
  apply();
}

function productPage() {
  const root = $('#productDetail');
  if (!root) return;
  const product = getProductById(qs('id')) || getProductBySlug(qs('slug'));
  if (!product) {
    root.innerHTML = '<div class="empty-state"><h2>Produto não encontrado</h2><p>O item pode ter sido removido ou o endereço está incorreto.</p><a class="btn btn-dark" href="produtos.html">Voltar ao catálogo</a></div>';
    return;
  }
  const profile = getProfile(product);
  const related = products.find((x) => x.active && x.id !== product.id && x.name.replace(/\s+150 ?ml$/i, '') === product.name.replace(/\s+150 ?ml$/i, '') && x.kind !== product.kind);
  const seasonTop = topTwo(profile.seasons, SEASON_LABELS);
  const momentTop = topTwo(profile.moments, MOMENT_LABELS);
  const occasionTop = topTwo(profile.occasions, OCCASION_LABELS);
  document.title = `${product.name} | Velluto Fragrance`;

  root.innerHTML = `
    <div class="breadcrumb"><a href="index.html">Início</a><span>/</span><a href="${product.kind === 'decant' ? 'decants.html' : 'perfumes.html'}">${product.kind === 'decant' ? 'Decants' : 'Perfumes'}</a><span>/</span><strong>${product.name}</strong></div>
    <div class="product-layout-v2">
      <section class="product-main-card">
        <div class="product-gallery-v2">
          <div class="gallery-main v2"><img data-product-image data-product-id="${product.id}" src="${productImage(product)}" alt="${product.name}"></div>
        </div>
        <div class="product-copy-v2">
          <div class="eyebrow">${productTypeLabel(product)}</div>
          <h1>${product.name}</h1>
          <p class="product-description">${product.description}</p>
          <div class="product-summary-box">
            <strong>Leitura olfativa Velluto</strong>
            <p>${profile.plain}</p>
          </div>
          <div class="profile-pills">${usageTags([...seasonTop, ...momentTop, ...occasionTop.slice(0, 1)])}</div>
          <div class="detail-price">${money(product.price)}</div>
          <div class="product-meta-line">${product.categories.map(title).join(' · ')} ${product.kind === 'decant' ? '· 5 mL' : ''}</div>
          ${related ? `<a class="pair-card" href="produto.html?id=${encodeURIComponent(related.id)}"><strong>${product.kind === 'decant' ? 'Gostou? Veja o frasco completo.' : 'Quer experimentar antes?'}</strong><span>${related.name} · ${related.kind === 'decant' ? 'Decant 5 mL' : 'Frasco completo'} · ${money(related.price)}</span></a>` : ''}
        </div>
      </section>
      <aside class="product-buy-card">
        <div class="buy-kicker">Adicionar ao pedido</div>
        <div class="buy-price">${money(product.price)}</div>
        <div class="installment">Condições finais e frete aparecem no checkout.</div>
        <div class="qty-row">
          <div class="quantity"><button type="button" data-qty-minus>${icon('minus')}</button><span data-qty-value>1</span><button type="button" data-qty-plus>${icon('plus')}</button></div>
        </div>
        <div class="buy-row stacked">
          <button class="btn btn-dark btn-block" type="button" data-add-detail>Adicionar ao carrinho</button>
          <button class="btn btn-outline btn-block" type="button" data-favorite="${product.id}">Salvar nos favoritos</button>
        </div>
        <div class="detail-trust">
          <div class="trust-mini">${icon('shield')} Compra segura</div>
          <div class="trust-mini">${icon('truck')} Envio para todo o Brasil</div>
          <div class="trust-mini">${icon('spark')} Escolha por notas, clima e ocasião</div>
        </div>
      </aside>
    </div>

    <section class="insight-grid">
      <article class="insight-card">
        <div class="insight-kicker">Melhor quando</div>
        <h3>Clima e momento</h3>
        <div class="use-tags use-tags--stacked">
          ${seasonTop.map((x) => `<span class="usage-tag prominent">${x.label} <strong>${x.value}%</strong></span>`).join('')}
          ${momentTop.map((x) => `<span class="usage-tag prominent">${x.label} <strong>${x.value}%</strong></span>`).join('')}
        </div>
        <p>${profile.plain}</p>
      </article>
      <article class="insight-card">
        <div class="insight-kicker">Como ele se comporta</div>
        <h3>Leitura rápida</h3>
        <div class="attribute-bars">
          ${meter('Frescor', profile.attributes.fresh)}
          ${meter('Doçura', profile.attributes.sweet)}
          ${meter('Intensidade', profile.attributes.intensity)}
          ${meter('Elegância', profile.attributes.elegance)}
          ${meter('Sensualidade', profile.attributes.sensuality)}
        </div>
      </article>
      <article class="insight-card">
        <div class="insight-kicker">Comunidade traduzida</div>
        <h3>Para quem ele faz sentido</h3>
        <p>${profile.summary}</p>
        <div class="community-box">
          <strong>Mais indicado para</strong>
          <div class="use-tags">${occasionTop.map((x) => `<span class="usage-tag">${x.label}</span>`).join('')}</div>
        </div>
      </article>
    </section>

    <section class="note-columns-wrap">
      <div class="section-head compact">
        <div>
          <div class="eyebrow">Entenda o perfume</div>
          <h2 class="section-title">Percepção de cada nota</h2>
          <p class="section-copy">Uma forma simples de explicar o que normalmente cada nota transmite. Depois você pode ajustar produto por produto com sua curadoria.</p>
        </div>
      </div>
      <div class="note-columns">
        <div class="note-column">
          <div class="note-stage-title">Saída <span>o que aparece primeiro</span></div>
          ${profile.noteCards.filter((note) => note.stage === 'Saída').map((note) => `<article class="note-card"><strong>${note.label}</strong><p>${note.perception}</p><small>${note.best}</small></article>`).join('')}
        </div>
        <div class="note-column">
          <div class="note-stage-title">Coração <span>o cheiro que desenvolve</span></div>
          ${profile.noteCards.filter((note) => note.stage === 'Coração').map((note) => `<article class="note-card"><strong>${note.label}</strong><p>${note.perception}</p><small>${note.best}</small></article>`).join('')}
        </div>
        <div class="note-column">
          <div class="note-stage-title">Fundo <span>o que permanece na pele</span></div>
          ${profile.noteCards.filter((note) => note.stage === 'Fundo').map((note) => `<article class="note-card"><strong>${note.label}</strong><p>${note.perception}</p><small>${note.best}</small></article>`).join('')}
        </div>
      </div>
    </section>

    <section class="section relation-section">
      <div class="section-head"><div><div class="eyebrow">Você também pode gostar</div><h2 class="section-title">Relacionados</h2></div></div>
      <div id="relatedGrid" class="product-grid"></div>
    </section>
  `;

  let qty = 1;
  const showQty = () => { $('[data-qty-value]', root).textContent = qty; };
  $('[data-qty-minus]', root)?.addEventListener('click', () => { qty = Math.max(1, qty - 1); showQty(); });
  $('[data-qty-plus]', root)?.addEventListener('click', () => { qty = Math.min(10, qty + 1); showQty(); });
  $('[data-add-detail]', root)?.addEventListener('click', () => addCart(product.id, qty));
  renderProducts($('#relatedGrid'), products.filter((x) => x.active && x.id !== product.id && x.kind === product.kind && x.categories.some((c) => product.categories.includes(c))).slice(0, 4));
  refreshFavoriteButtons();
}

function cartPage() {
  const list = $('#cartList');
  const summary = $('#cartSummary');
  if (!list || !summary) return;
  const render = () => {
    const rows = cartDetails();
    list.textContent = '';
    if (!rows.length) {
      list.innerHTML = '<div class="empty-state"><h2>Sua sacola está vazia</h2><p>Explore perfumes e decants selecionados pela Velluto.</p><a class="btn btn-dark" href="produtos.html">Explorar catálogo</a></div>';
      summary.hidden = true;
      return;
    }
    summary.hidden = false;
    rows.forEach(({ row, p }) => {
      const el = document.createElement('article');
      el.className = 'cart-item';
      el.innerHTML = `
        <img class="cart-image" data-product-image data-product-id="${p.id}" src="${productImage(p)}" alt="${p.name}">
        <div>
          <h3>${p.name}</h3>
          <p class="cart-format"><strong>${productFormatLabel(p)}</strong> · ${money(p.price)} cada</p>
          <div class="cart-controls">
            <div class="quantity"><button type="button" data-cart-minus="${p.id}" aria-label="Diminuir quantidade de ${p.name} (${productFormatLabel(p)})">${icon('minus')}</button><span>${row.qty}</span><button type="button" data-cart-plus="${p.id}" aria-label="Aumentar quantidade de ${p.name} (${productFormatLabel(p)})">${icon('plus')}</button></div>
            <button class="remove-btn" type="button" data-cart-remove="${p.id}" aria-label="Remover ${p.name} (${productFormatLabel(p)}) da sacola">Remover</button>
          </div>
        </div>
        <div class="cart-line-total">${money(p.price * row.qty)}</div>
      `;
      list.append(el);
    });
    $('#cartSubtotal').textContent = money(cartTotal());
    $('#cartTotal').textContent = money(cartTotal());
  };
  list.addEventListener('click', (e) => {
    const minus = e.target.closest('[data-cart-minus]');
    const plus = e.target.closest('[data-cart-plus]');
    const rem = e.target.closest('[data-cart-remove]');
    if (minus) {
      const row = getCart().find((x) => x.id === minus.dataset.cartMinus);
      if (row) row.qty <= 1 ? removeCart(row.id) : setCartQty(row.id, row.qty - 1);
      render();
    }
    if (plus) {
      const row = getCart().find((x) => x.id === plus.dataset.cartPlus);
      if (row) setCartQty(row.id, row.qty + 1);
      render();
    }
    if (rem) {
      removeCart(rem.dataset.cartRemove);
      render();
    }
  });
  render();
}

function checkout() {
  const form = $('#checkoutForm');
  const summary = $('#checkoutItems');
  if (!form || !summary) return;
  const rows = cartDetails();
  if (!rows.length) {
    location.href = 'carrinho.html';
    return;
  }
  summary.textContent = '';
  rows.forEach(({ row, p }) => {
    const d = document.createElement('div');
    d.className = 'summary-row';
    d.innerHTML = `<span>${row.qty}× ${p.name}<small class="summary-format">${productFormatLabel(p)} · ${money(p.price)} cada</small></span><strong>${money(row.qty * p.price)}</strong>`;
    summary.append(d);
  });
  $('#checkoutTotal').textContent = money(cartTotal());
  const getData = () => Object.fromEntries(new FormData(form).entries());
  const validate = () => {
    let ok = true;
    $$('[required]', form).forEach((input) => {
      const err = input.closest('.field')?.querySelector('.field-error');
      let valid = String(input.value).trim().length > 0;
      if (input.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
      if (input.name === 'cep') valid = /^\d{5}-?\d{3}$/.test(input.value);
      if (!valid) ok = false;
      if (err) err.textContent = valid ? '' : 'Confira este campo.';
    });
    return ok;
  };
  $('#whatsappCheckout')?.addEventListener('click', () => {
    if (!validate()) return;
    const d = getData();
    // uma linha por apresentação: nome, formato/volume, quantidade, preço unitário e subtotal
    const lines = rows.map(({ row, p }) => `• ${p.name} — ${productFormatLabel(p)}\n  ${row.qty} × ${money(p.price)} = ${money(row.qty * p.price)}`);
    const text = [
      'Olá! Quero finalizar meu pedido Velluto.', '',
      '*Itens*', ...lines, '',
      `Total dos produtos: ${money(cartTotal())}`, 'Frete: a confirmar', '',
      '*Entrega*', `Nome: ${d.nome}`, `Telefone: ${d.telefone}`, `E-mail: ${d.email}`, `CEP: ${d.cep}`, `Cidade/UF: ${d.cidade}/${d.uf}`,
      `Endereço: ${d.endereco}, ${d.numero}${d.complemento ? ` - ${d.complemento}` : ''}`, '',
      'Aguardo a confirmação da disponibilidade e do frete para fazer o pagamento.',
    ].join('\n');
    window.open(`https://wa.me/5511989358089?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
  $('#onlineCheckout')?.addEventListener('click', async () => {
    if (!validate()) return;
    const box = $('#checkoutStatus');
    box.className = 'status-box loading';
    box.textContent = 'Criando pagamento seguro…';
    try {
      const customer = getData();
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items: getCart(), customer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Pagamento online indisponível.');
      if (!data.init_point) throw new Error('Resposta de pagamento inválida.');
      location.href = data.init_point;
    } catch (err) {
      box.className = 'status-box error';
      box.textContent = `${err.message} Você ainda pode finalizar pelo WhatsApp.`;
    }
  });
}

function favorites() {
  const grid = $('#favoritesGrid');
  if (!grid) return;
  const render = () => renderProducts(grid, getFav().map(getProductById).filter(Boolean));
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-favorite]')) setTimeout(render, 0);
  });
  render();
}

function quiz() {
  const root = $('#quizRoot');
  if (!root) return;
  const questions = [
    { title: 'Que sensação você procura?', opts: [['Fresco e leve', 'citrico'], ['Marcante e elegante', 'amadeirado'], ['Envolvente e quente', 'oriental'], ['Doce e confortável', 'doce']] },
    { title: 'Em qual momento você mais pretende usar?', opts: [['Dia a dia', 'citrico'], ['Noite e eventos', 'oriental'], ['Versátil', 'amadeirado'], ['Encontros', 'doce']] },
    { title: 'Qual caminho olfativo chama mais sua atenção?', opts: [['Flores', 'floral'], ['Madeiras', 'amadeirado'], ['Especiarias', 'especiado'], ['Acordes aquáticos', 'aquatico']] },
    { title: 'Você quer começar por…', opts: [['Um decant de 5 mL', 'decant'], ['Um frasco completo', 'perfume']] },
  ];
  let step = 0;
  let answers = [];
  const render = () => {
    if (step >= questions.length) {
      const cats = answers.filter((x) => x !== 'decant' && x !== 'perfume');
      const kind = answers.find((x) => x === 'decant' || x === 'perfume') || 'decant';
      const scored = products
        .filter((p) => p.active && p.kind === kind)
        .map((p) => ({ p, score: p.categories.filter((c) => cats.includes(c)).length }))
        .sort((a, b) => b.score - a.score || a.p.price - b.p.price)
        .slice(0, 3)
        .map((x) => x.p);
      root.innerHTML = '<div class="quiz-result visible"><div class="eyebrow">Resultado Velluto</div><h2 class="section-title">Uma seleção para o seu perfil</h2><p class="section-copy">Use este resultado como ponto de partida. Perfume é pessoal — experimentar um decant continua sendo a forma mais segura de descobrir uma fragrância.</p><div id="quizProducts" class="product-grid"></div><div class="button-row mt-24"><button class="btn btn-outline" id="quizRestart" type="button">Refazer quiz</button></div></div>';
      renderProducts($('#quizProducts'), scored);
      $('#quizRestart').addEventListener('click', () => { step = 0; answers = []; render(); });
      return;
    }
    const q = questions[step];
    root.innerHTML = `<div class="quiz-progress"><span class="progress-${((step + 1) / questions.length) * 100}"></span></div><div class="quiz-question"><div class="eyebrow">Pergunta ${step + 1} de ${questions.length}</div><h2>${q.title}</h2><div class="quiz-options"></div></div>`;
    const opts = $('.quiz-options', root);
    q.opts.forEach(([label, value]) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.type = 'button';
      btn.textContent = label;
      btn.addEventListener('click', () => { answers.push(value); step += 1; render(); });
      opts.append(btn);
    });
  };
  render();
}

function account() {
  const orderForm = $('#orderLookup');
  orderForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = $('input', orderForm).value.trim();
    if (!code) return;
    window.open(`https://wa.me/5511989358089?text=${encodeURIComponent(`Olá! Gostaria de consultar o pedido ${code}`)}`, '_blank', 'noopener');
  });
}

setupBranding();
setupHeader();
setupDelegation();
updateCounts();
refreshFavoriteButtons();
({ home, catalog, product: productPage, cart: cartPage, checkout, favorites, quiz, account }[document.body.dataset.page] || (() => {}))();

export { products, money, addCart, toggleFav, getProfile };
