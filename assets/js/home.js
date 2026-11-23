// =========================================================
// VELLUTO — home (v3, boutique editorial)
// Lê o catálogo de catalog.js e usa as mesmas chaves de
// carrinho/favoritos do app.js, então carrinho.html e
// checkout.html continuam funcionando sem mudança.
// =========================================================
import { products, getProductById } from './catalog.js';

/* ---------------- configuração editável ---------------- */
// Troque os slugs abaixo para mudar o que aparece na home.
// Quando o ERP gerar o catálogo, estas listas podem vir de lá
// (ex.: campos "destaque_home" e "mais_vendido").
const CONFIG = {
  // Hero: um slide por perfume, cada um com a sua fotografia de campanha (frasco já na cena).
  // Só aparecem os slides com foto.src; os outros ficam prontos para quando a foto chegar.
  // "foco" é onde está o frasco na foto (origem da aproximação lenta e do enquadramento);
  // "origem" é o ponto de onde parte a aproximação (perto da base quando a tampa está rente ao topo,
  // e vice-versa); "respiro" (px) afasta a foto do topo, com degradê, para dar ar acima da tampa.
  // "focoCelular" enquadra o frasco no celular. "tom: 'claro'" é para fotos claras: o véu
  // verde da esquerda fica mais forte e o texto continua igual em todos os slides. Ver docs/ASSETS-HOME.md.
  hero: [
    {
      slug: 'asad', marca: 'Lattafa',
      foto: {
        src: 'assets/home/cenas/hero-asad.webp', src1200: 'assets/home/cenas/hero-asad-1200.webp', largura: 1942, altura: 809,
        foco: '73% 50%', focoCelular: '91% 50%', origem: '73% 15%', respiro: 32, alt: 'Frasco do perfume Asad, da Lattafa, sobre uma pedra com madeira e âmbar',
      },
    },
    {
      slug: 'light-blue', marca: 'Dolce & Gabbana', tom: 'claro',
      foto: {
        src: 'assets/home/cenas/banner-light-blue.webp', src1200: 'assets/home/cenas/banner-light-blue-1200.webp', largura: 2000, altura: 667,
        foco: '72% 55%', focoCelular: '85% 50%', origem: '72% 45%', alt: 'Frasco do perfume Light Blue, da Dolce & Gabbana, sobre uma mureta à beira do Mediterrâneo, com maçã verde e limões',
      },
    },
    {
      slug: 'hawas-ice', marca: 'Rasasi', tom: 'claro',
      foto: {
        src: 'assets/home/cenas/hero-hawas-ice.webp', src1200: 'assets/home/cenas/hero-hawas-ice-1200.webp', largura: 1942, altura: 809,
        foco: '72% 50%', focoCelular: '91% 50%', origem: '72% 20%', alt: 'Frasco do perfume Hawas Ice, da Rasasi, sobre uma pedra à beira do mar com limão e bergamota',
      },
    },
    {
      slug: 'atheeri', marca: 'Lattafa', tom: 'claro',
      foto: {
        src: 'assets/home/cenas/hero-atheeri.webp', src1200: 'assets/home/cenas/hero-atheeri-1200.webp', largura: 1942, altura: 809,
        foco: '68% 52%', focoCelular: '84% 50%', origem: '68% 75%', alt: 'Frasco do perfume Atheeri, da Lattafa, entre flores brancas, flor de maracujá e baunilha num jardim ensolarado',
      },
    },
    { slug: 'yara', marca: 'Lattafa', foto: null },
  ],
  // Fotografias das seções (ver docs/ASSETS-HOME.md). Enquanto um valor for null,
  // a área fica pronta, com uma superfície neutra, à espera da foto aprovada.
  cenas: {
    // dois decants reais da Velluto (rótulo à frente; o de trás sem tampa): { src, src1200, largura, altura, alt }
    decants: null,
    clube: null,
  },
  // Vitrine: 6 perfumes (3 × 2 no computador). Atualize conforme as vendas reais.
  maisVendidos: ['asad', 'club-de-nuit', 'hawas-ice', 'yara', 'libre', '1-million-elixir'],
  // Perfis de "Como você quer ser lembrado?": um banner fotográfico por perfil.
  // "familias" e "link" levam ao catálogo filtrado; "tom: 'claro'" concentra a sombra atrás do texto em fotos claras.
  climas: [
    {
      nome: 'Marcante', familias: ['oriental', 'amadeirado'], link: 'produtos.html?familia=oriental',
      micro: 'Presença que permanece', titulo: 'Deixe sua marca.',
      desc: 'Fragrâncias intensas, de oud, âmbar e madeiras escuras, para quem gosta de ser lembrado.',
      botao: 'Explorar perfumes marcantes',
      foto: { src: 'assets/home/cenas/perfil-marcante.webp', src1200: 'assets/home/cenas/perfil-marcante-1200.webp', largura: 2000, altura: 741, foco: '79% 50%', focoCelular: '100% 50%', alt: 'Frasco do Asad Elixir sobre uma rocha escura, com luz dourada ao fundo' },
    },
    {
      nome: 'Elegante', familias: ['floral'], link: 'produtos.html?familia=floral', tom: 'claro',
      micro: 'Sofisticação em cada detalhe', titulo: 'Elegância que fala baixo.',
      desc: 'Fragrâncias refinadas, com presença equilibrada e personalidade.',
      botao: 'Explorar perfumes elegantes',
      foto: { src: 'assets/home/cenas/hero-atheeri.webp', src1200: 'assets/home/cenas/hero-atheeri-1200.webp', largura: 1942, altura: 809, foco: '68% 62%', focoCelular: '89% 50%', alt: 'Frasco do Atheeri entre flores brancas num jardim ensolarado' },
    },
    {
      nome: 'Sedutor', familias: ['doce'], link: 'produtos.html?familia=doce',
      micro: 'Atrai sem esforço', titulo: 'Doce na medida certa.',
      desc: 'Baunilha, caramelo e notas gourmand para a noite e os encontros.',
      botao: 'Explorar perfumes sedutores',
      foto: { src: 'assets/home/cenas/perfil-sedutor.webp', src1200: 'assets/home/cenas/perfil-sedutor-1200.webp', largura: 2000, altura: 741, foco: '73% 50%', focoCelular: '94% 50%', alt: 'Frasco do Asad Elixir sobre madeira, com baunilha, âmbar e folhas secas' },
    },
    {
      nome: 'Refrescante', familias: ['aquatico', 'citrico'], link: 'produtos.html?familia=aquatico', tom: 'claro',
      micro: 'Leveza que acompanha o seu ritmo', titulo: 'Frescor de banho tomado.',
      desc: 'Bergamota, limão e brisa marinha para o calor e o dia a dia.',
      botao: 'Explorar perfumes refrescantes',
      foto: { src: 'assets/home/cenas/banner-light-blue.webp', src1200: 'assets/home/cenas/banner-light-blue-1200.webp', largura: 2000, altura: 667, foco: '72% 55%', focoCelular: '89% 50%', alt: 'Frasco do Light Blue à beira do Mediterrâneo, com maçã verde e limões' },
    },
  ],
  familias: [
    ['amadeirado', 'Amadeirado', 'Cedro, sândalo e madeiras secas'],
    ['oriental', 'Oriental', 'Âmbar, oud e resinas quentes'],
    ['doce', 'Doce', 'Baunilha, caramelo e notas gourmand'],
    ['floral', 'Floral', 'Rosa, jasmim e flores brancas'],
    ['citrico', 'Cítrico', 'Bergamota, limão e frescor de banho'],
    ['aquatico', 'Aquático', 'Brisa marinha e frescor limpo'],
    ['especiado', 'Especiado', 'Pimenta, açafrão e canela'],
  ],
};

/* ---------------- utilidades ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FAMILIA = Object.fromEntries(CONFIG.familias.map(([id, nome]) => [id, nome]));

const ativos = products.filter((p) => p.active);
const baseSlug = (slug) => slug.replace(/-\d+ml$/, '');
const perfume = (slug) => ativos.find((p) => p.kind === 'perfume' && baseSlug(p.slug) === slug);
const decant = (slug) => ativos.find((p) => p.kind === 'decant' && baseSlug(p.slug) === slug);
const parDe = (p) => (p.kind === 'perfume' ? decant(baseSlug(p.slug)) : perfume(baseSlug(p.slug)));

const PASTA = { perfume: 'velluto-imagens/perfumes', decant: 'velluto-imagens/decant', 'body-care': 'velluto-imagens/Creme' };
const foto = (p) => (p?.image ? `${PASTA[p.kind] || 'velluto-imagens'}/${encodeURI(p.image)}` : 'assets/images/default-product.svg');
const familias = (p) => p.categories.map((c, i) => { const n = FAMILIA[c] || c; return i ? n.toLowerCase() : n; }).join(' e ');
const linkProduto = (p) => `produto.html?id=${encodeURIComponent(p.id)}`;
const usarFoto = (el, src) => { if (el && src) { el.style.backgroundImage = `url("${src}")`; el.classList.add('com-foto'); } };

/* ---------------- carrinho e favoritos (mesmo formato do app.js) ---------------- */
const CART = 'velluto_cart_v1';
const FAV = 'velluto_favorites_v1';
const ler = (k, padrao) => { try { return JSON.parse(localStorage.getItem(k)) ?? padrao; } catch { return padrao; } };
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* navegador sem armazenamento */ } };

function atualizarContadores() {
  const qtdCarrinho = ler(CART, []).reduce((s, x) => s + (x.qty || 0), 0);
  const qtdFav = ler(FAV, []).length;
  $$('[data-cart-count]').forEach((el) => { el.textContent = qtdCarrinho; el.toggleAttribute('data-zero', !qtdCarrinho); });
  $$('[data-fav-count]').forEach((el) => { el.textContent = qtdFav; el.toggleAttribute('data-zero', !qtdFav); });
}

function adicionar(ids) {
  const lista = (Array.isArray(ids) ? ids : [ids]).map(getProductById).filter(Boolean);
  if (!lista.length) return;
  const carrinho = ler(CART, []);
  for (const p of lista) {
    const linha = carrinho.find((x) => x.id === p.id);
    if (linha) linha.qty = Math.min(10, linha.qty + 1);
    else carrinho.push({ id: p.id, qty: 1 });
  }
  gravar(CART, carrinho);
  atualizarContadores();
  aviso(lista.length === 1 ? `${lista[0].name}${lista[0].kind === 'decant' ? ' (decant 5 mL)' : ''} está no carrinho.` : `Kit com ${lista.length} decants está no carrinho.`);
}

function alternarFavorito(id, botao) {
  const fav = ler(FAV, []);
  const tem = fav.includes(id);
  gravar(FAV, tem ? fav.filter((x) => x !== id) : [...fav, id]);
  botao?.setAttribute('aria-pressed', String(!tem));
  atualizarContadores();
}

let timerAviso;
function aviso(texto) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(texto)}</span><a href="carrinho.html">Ver carrinho</a>`;
  t.classList.add('ver');
  document.body.classList.add('com-aviso');
  clearTimeout(timerAviso);
  timerAviso = setTimeout(() => { t.classList.remove('ver'); document.body.classList.remove('com-aviso'); }, 4200);
}

/* ---------------- ícones ---------------- */
const ICONE = {
  sacola: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
  coracao: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z"/></svg>',
  seta: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
  fechar: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
};

/* =========================================================
   CABEÇALHO: fica mais baixo ao rolar
   ========================================================= */
function cabecalhoRolagem() {
  const cab = $('#cab');
  let pedido = 0;
  const conferir = () => { pedido = 0; cab.classList.toggle('rolou', window.scrollY > 8); };
  window.addEventListener('scroll', () => { if (!pedido) pedido = requestAnimationFrame(conferir); }, { passive: true });
  conferir();
}

/* =========================================================
   HERO — fotografia de campanha por perfume
   Cada slide é uma foto com o frasco já na cena; textos, preços
   e botões são HTML e vêm do catálogo. A foto ativa faz uma
   aproximação lenta (uma vez por ativação); a troca é um
   cruzamento de opacidade e o texto entra em cascata.
   ========================================================= */
function hero() {
  const slides = CONFIG.hero
    .map((s) => ({ ...s, p: perfume(s.slug) }))
    .filter((s) => s.p && s.foto?.src);
  const secao = $('#hero');
  const fotos = $('#hero-fotos');
  const texto = $('#hero-texto');
  if (!slides.length || !secao) return;

  // uma camada de imagem por slide; a primeira já vem no HTML (carrega antes do JS)
  const primeira = $('img', fotos);
  const camada = (s, i) => {
    const f = s.foto;
    const srcset = f.src1200 ? `${f.src1200} 1200w, ${f.src} ${f.largura}w` : '';
    return `<picture class="hero-foto" aria-hidden="true"><img src="${f.src}" ${srcset ? `srcset="${srcset}" sizes="100vw"` : ''} width="${f.largura}" height="${f.altura}" alt="${esc(f.alt || '')}" loading="lazy" decoding="async" data-i="${i}"></picture>`;
  };
  if (!primeira || primeira.getAttribute('src') !== slides[0].foto.src) {
    fotos.innerHTML = slides.map(camada).join('');
    $('.hero-foto', fotos).classList.add('ativa');
    $('.hero-foto img', fotos).loading = 'eager';
  } else {
    fotos.insertAdjacentHTML('beforeend', slides.slice(1).map((s, i) => camada(s, i + 1)).join(''));
  }
  const camadas = $$('.hero-foto', fotos);
  camadas.forEach((c, i) => {
    const f = slides[i].foto;
    c.style.setProperty('--foco', f.foco || '73% 60%');
    c.style.setProperty('--foco-celular', f.focoCelular || f.foco || '73% 60%');
    // a aproximação parte do frasco sem empurrar a tampa ou a base para fora do quadro
    c.style.setProperty('--origem', f.origem || f.foco || '73% 50%');
    if (f.respiro) c.style.setProperty('--respiro', `${f.respiro}px`);
    c.toggleAttribute('aria-hidden', i !== 0);
  });

  let atual = 0;
  let pedido = 0;

  const preencher = (s) => {
    const { p } = s;
    const d = parDe(p);
    $('#hero-marca').textContent = s.marca || familias(p);
    $('#hero-nome').textContent = p.name;
    $('#hero-desc').textContent = p.description;
    const bf = $('#hero-frasco');
    bf.innerHTML = `<span>Comprar o frasco</span><b>${money(p.price)} ${ICONE.seta}</b>`;
    bf.dataset.id = p.id;
    bf.setAttribute('aria-label', `Comprar o frasco de ${p.name}, ${money(p.price)}`);
    const bd = $('#hero-decant');
    bd.hidden = !d;
    if (d) {
      bd.innerHTML = `<span>Experimentar 5 mL</span><b>${money(d.price)} ${ICONE.seta}</b>`;
      bd.dataset.id = d.id;
      bd.setAttribute('aria-label', `Experimentar o decant de 5 mL de ${p.name}, ${money(d.price)}`);
    }
  };

  // reinicia uma animação CSS ligada a uma classe
  const reiniciar = (el, classe) => { el.classList.remove(classe); void el.offsetWidth; el.classList.add(classe); };

  // primeira entrada: o texto espera a foto estar pronta (sem JS, ele anima sozinho pelo CSS)
  preencher(slides[0]);
  secao.dataset.tom = slides[0].tom || 'escuro';
  secao.classList.add('aguardando');
  const img0 = $('img', camadas[0]);
  const comecar = () => {
    secao.classList.remove('aguardando');
    if (!reduzMovimento) camadas[0].classList.add('zoom');
  };
  if (img0.complete && img0.naturalWidth) comecar();
  else {
    img0.addEventListener('load', comecar, { once: true });
    img0.addEventListener('error', comecar, { once: true });
  }

  // controles só existem com mais de um slide
  const controles = $('#hero-controles');
  const indices = $('#hero-indices');
  controles.hidden = slides.length < 2;
  indices.innerHTML = slides.map((s, i) => `
    <button type="button" aria-pressed="${i === 0}" aria-label="Ver ${esc(s.p.name)}" data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span><i aria-hidden="true"></i></button>`).join('');

  const ir = async (i) => {
    i = (i + slides.length) % slides.length;
    if (i === atual) return;
    const meu = ++pedido;
    $$('button', indices).forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
    const nova = camadas[i];
    const velha = camadas[atual];
    const img = $('img', nova);
    img.loading = 'eager';
    await img.decode().catch(() => {}); // só troca com a próxima foto pronta: nunca aparece fundo vazio
    if (meu !== pedido) return;          // cliques rápidos: vale só o último
    atual = i;

    camadas.forEach((c, j) => { c.toggleAttribute('aria-hidden', j !== i); if (j !== i && c !== velha) c.classList.remove('ativa', 'anterior', 'zoom'); });
    if (reduzMovimento) {
      velha.classList.remove('ativa', 'zoom');
      nova.classList.add('ativa');
      secao.dataset.tom = slides[i].tom || 'escuro';
      preencher(slides[i]);
      return;
    }
    // cruzamento de opacidade: a nova entra por cima, a anterior fica embaixo até o fim
    velha.classList.remove('ativa');
    velha.classList.add('anterior');
    nova.classList.remove('anterior');
    reiniciar(nova, 'zoom');
    nova.classList.add('ativa');
    secao.dataset.tom = slides[i].tom || 'escuro'; // véu e cor do texto acompanham a foto
    // terminado o cruzamento, só a camada ativa continua visível (vale também depois de cliques rápidos)
    setTimeout(() => camadas.forEach((c) => { if (!c.classList.contains('ativa')) c.classList.remove('anterior', 'zoom'); }), 650);

    // texto: sai rápido, entra em cascata com o novo perfume
    await texto.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 180, easing: 'ease-out', fill: 'forwards' }).finished.catch(() => {});
    if (meu !== pedido) return;
    preencher(slides[i]);
    texto.getAnimations().forEach((a) => a.cancel());
    reiniciar(texto, 'entrando');
  };

  indices.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (b) ir(Number(b.dataset.i));
  });
  $('#hero-ant').addEventListener('click', () => ir(atual - 1));
  $('#hero-prox').addEventListener('click', () => ir(atual + 1));
  controles.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(atual + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); ir(atual - 1); }
  });
  $('#hero-frasco').addEventListener('click', (e) => adicionar(e.currentTarget.dataset.id));
  $('#hero-decant').addEventListener('click', (e) => adicionar(e.currentTarget.dataset.id));

  // as outras fotos baixam depois da primeira, para a troca ser imediata
  if (slides.length > 1) {
    const preparar = () => camadas.slice(1).forEach((c) => { $('img', c).loading = 'eager'; });
    if ('requestIdleCallback' in window) requestIdleCallback(preparar, { timeout: 3000 }); else setTimeout(preparar, 1500);
  }

  // pausa a aproximação quando o hero sai da tela ou a aba fica oculta
  const pausar = (sim) => secao.classList.toggle('pausado', sim);
  let fora = false;
  if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { fora = !en.isIntersecting; pausar(fora || document.hidden); }).observe(secao);
  document.addEventListener('visibilitychange', () => pausar(fora || document.hidden));
}

/* =========================================================
   OS MAIS VENDIDOS — card com compra de frasco ou decant
   ========================================================= */
function card(p) {
  const fav = ler(FAV, []).includes(p.id);
  const d = parDe(p);
  const acao = d
    ? `<a class="bt-opcoes" href="${linkProduto(p)}" aria-label="Escolher opções de ${esc(p.name)}: frasco ou decant de 5 mL">Escolher opções</a>`
    : `<button class="bt-opcoes" type="button" data-add="${esc(p.id)}" aria-label="Adicionar o frasco de ${esc(p.name)} ao carrinho">Adicionar ao carrinho</button>`;
  return `
    <article class="card">
      <a class="card-foto" href="${linkProduto(p)}" tabindex="-1" aria-hidden="true">
        <img src="${foto(p)}" alt="" loading="lazy" width="375" height="500">
      </a>
      <button class="fav" type="button" aria-pressed="${fav}" aria-label="Salvar ${esc(p.name)} nos favoritos" data-fav="${esc(p.id)}">${ICONE.coracao}</button>
      <div class="card-info">
        <h3><a href="${linkProduto(p)}">${esc(p.name)}</a></h3>
        <span class="preco">${money(p.price)}</span>
        ${acao}
      </div>
    </article>`;
}

function maisVendidos() {
  const grade = $('#grade-mais');
  grade.innerHTML = CONFIG.maisVendidos.map(perfume).filter(Boolean).slice(0, 6).map(card).join('');
  grade.addEventListener('click', (e) => {
    const fav = e.target.closest('[data-fav]');
    if (fav) alternarFavorito(fav.dataset.fav, fav);
    const add = e.target.closest('[data-add]');
    if (add) adicionar(add.dataset.add);
  });
}

/* =========================================================
   COMO VOCÊ QUER SER LEMBRADO?
   Quatro perfis, cada um com um banner fotográfico. A troca é
   automática a cada 7 s: o temporizador é a própria linha de
   progresso do botão ativo (animação CSS), então pausar a
   animação pausa a troca. Pausa com hover, foco pelo teclado,
   fora da tela, aba oculta ou pelo botão de pausa.
   ========================================================= */
function lembrar() {
  const perfis = CONFIG.climas.filter((c) => c.foto?.src);
  const secao = $('#lembrar');
  if (!secao || !perfis.length) return;
  const abasEl = $('#lembrar-abas');
  const fotos = $('#lembrar-fotos');
  const textos = $('#lembrar-textos');
  const banner = $('#lembrar-banner');
  const pausa = $('#lembrar-pausa');
  const n = perfis.length;

  abasEl.setAttribute('role', 'tablist');
  abasEl.innerHTML = perfis.map((c, i) => `
    <button class="aba" type="button" role="tab" id="aba-${i}" aria-controls="lembrar-banner" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-i="${i}">
      <span>${esc(c.nome)}</span><i class="aba-progresso" aria-hidden="true"></i>
    </button>`).join('');
  const abas = $$('.aba', abasEl);

  // uma camada de foto por perfil (a primeira já vem no HTML)
  const camada = (c) => {
    const f = c.foto;
    const srcset = f.src1200 ? `srcset="${f.src1200} 1200w, ${f.src} ${f.largura}w" sizes="100vw"` : '';
    return `<picture class="lembrar-foto"><img src="${f.src}" ${srcset} width="${f.largura}" height="${f.altura}" alt="${esc(f.alt || '')}" loading="lazy" decoding="async"></picture>`;
  };
  const primeira = $('img', fotos);
  if (primeira && primeira.getAttribute('src') === perfis[0].foto.src) {
    primeira.alt = perfis[0].foto.alt || '';
    fotos.insertAdjacentHTML('beforeend', perfis.slice(1).map(camada).join(''));
  } else {
    fotos.innerHTML = perfis.map(camada).join('');
    $('.lembrar-foto', fotos).classList.add('ativa');
  }
  const camadas = $$('.lembrar-foto', fotos);
  camadas.forEach((p, i) => {
    p.style.setProperty('--foco', perfis[i].foto.foco || '75% 50%');
    p.style.setProperty('--foco-celular', perfis[i].foto.focoCelular || perfis[i].foto.foco || '75% 50%');
  });

  // textos empilhados no mesmo lugar: a troca é um cruzamento, sem mudar a altura
  textos.innerHTML = perfis.map((c, i) => `
    <div class="lt${i === 0 ? ' ativa' : ''}" ${i ? 'aria-hidden="true"' : ''}>
      <p class="micro">${esc(c.micro)}</p>
      <h3>${esc(c.titulo)}</h3>
      <p class="lt-desc">${esc(c.desc)}</p>
      <a class="bt-linha" href="${c.link}" ${i ? 'tabindex="-1"' : ''}>${esc(c.botao)} ${ICONE.seta}</a>
    </div>`).join('');
  const blocos = $$('.lt', textos);
  banner.setAttribute('role', 'tabpanel');

  let atual = 0;
  const mostrar = (i) => {
    i = (i + n) % n;
    atual = i;
    abas.forEach((b, j) => {
      b.setAttribute('aria-selected', String(j === i));
      b.tabIndex = j === i ? 0 : -1;
      b.classList.remove('corre');
    });
    camadas.forEach((p, j) => p.classList.toggle('ativa', j === i));
    blocos.forEach((t, j) => {
      t.classList.toggle('ativa', j === i);
      t.toggleAttribute('aria-hidden', j !== i);
      $('a', t).tabIndex = j === i ? 0 : -1;
    });
    banner.setAttribute('aria-labelledby', `aba-${i}`);
    secao.dataset.tom = perfis[i].tom || 'escuro';
    // a foto atual e a próxima já ficam baixadas: a troca nunca mostra fundo vazio
    [i, (i + 1) % n].forEach((k) => { $('img', camadas[k]).loading = 'eager'; });
    // reinicia a linha de progresso do botão ativo (é ela que marca os 7 s)
    if (!reduzMovimento) { void abas[i].offsetWidth; abas[i].classList.add('corre'); }
  };
  mostrar(0);

  abasEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (b) mostrar(Number(b.dataset.i)); // mostra na hora e reinicia o temporizador
  });
  abasEl.addEventListener('keydown', (e) => {
    const mapa = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let i = atual;
    if (e.key in mapa) i = atual + mapa[e.key];
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = n - 1;
    else return;
    e.preventDefault();
    mostrar(i);
    abas[atual].focus();
  });

  if (reduzMovimento || n < 2) return; // sem troca automática

  // fim da linha de progresso = próximo perfil
  abasEl.addEventListener('animationend', (e) => {
    if (e.target.classList.contains('aba-progresso') && e.target.closest('.aba') === abas[atual]) mostrar(atual + 1);
  });

  pausa.hidden = false;
  pausa.addEventListener('click', () => {
    const parado = !secao.classList.contains('parado');
    secao.classList.toggle('parado', parado);
    pausa.setAttribute('aria-pressed', String(parado));
    pausa.setAttribute('aria-label', parado ? 'Retomar apresentação' : 'Pausar apresentação');
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => secao.classList.toggle('fora', !en.isIntersecting), { threshold: 0.25 }).observe(banner);
  }
  document.addEventListener('visibilitychange', () => secao.classList.toggle('oculto', document.hidden));
}

/* =========================================================
   DECANTS E CLUBE: fotos das seções, quando existirem
   ========================================================= */
function fotosDasSecoes() {
  const f = CONFIG.cenas.decants;
  const area = $('#decants-foto');
  if (f?.src && area) {
    area.innerHTML = `<img src="${f.src}" ${f.src1200 ? `srcset="${f.src1200} 1200w, ${f.src} ${f.largura}w" sizes="(min-width: 821px) 55vw, 100vw"` : ''} width="${f.largura}" height="${f.altura}" alt="${esc(f.alt || 'Dois decants de 5 mL da Velluto, um com o rótulo à frente e outro sem tampa, mostrando o borrifador')}" loading="lazy" decoding="async">`;
    area.hidden = false;
    $('#decants-grade')?.classList.add('com-foto');
  }
  usarFoto($('#clube-foto'), CONFIG.cenas.clube);
}

/* ---------------- WhatsApp flutuante: sai do caminho de controles e botões de compra ---------------- */
function zapFlutuante() {
  const zap = $('#zap-flutuante');
  if (!zap || !('IntersectionObserver' in window)) return;
  // elementos que o botão nunca pode cobrir (setas e índices do hero, pausa dos perfis, compras)
  const protegidos = $$('#hero-controles, #hero-compra, .lembrar-controles, .bt-opcoes, .decants-acoes, .lt .bt-linha, .rod-legal');
  const visiveis = new Set();
  let io;
  const observar = () => {
    io?.disconnect();
    visiveis.clear();
    const faixa = 96; // altura da faixa inferior onde o botão fica
    io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => (en.isIntersecting ? visiveis.add(en.target) : visiveis.delete(en.target)));
      zap.classList.toggle('recolhido', visiveis.size > 0);
    }, { rootMargin: `-${Math.max(0, innerHeight - faixa)}px 0px 0px 0px` });
    protegidos.forEach((el) => io.observe(el));
  };
  observar();
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(observar, 200); });
}

/* ---------------- entrada das seções ao rolar ---------------- */
function entradas() {
  const alvos = $$('.secao-cab, .lembrar-cab, .decants-grade, .clube-grade, .sobre-grade');
  if (reduzMovimento || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('com-entrada');
  const io = new IntersectionObserver((entradasVistas) => {
    entradasVistas.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('visivel');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -40px 0px' });
  // o que já está na primeira tela (ex.: título da vitrine) não espera a rolagem
  alvos.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) return; el.classList.add('entra'); io.observe(el); });
}

/* =========================================================
   CABEÇALHO: busca e menu
   ========================================================= */
function cabecalho() {
  const input = $('#busca');
  const res = $('#busca-res');
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = input.value.trim().toLocaleLowerCase('pt-BR');
      if (q.length < 2) { res.classList.remove('aberto'); return; }
      const achados = ativos
        .filter((p) => `${p.name} ${p.categories.join(' ')} ${p.categories.map((c) => FAMILIA[c] || '').join(' ')}`.toLocaleLowerCase('pt-BR').includes(q))
        .slice(0, 6);
      res.innerHTML = achados.length
        ? achados.map((p) => `<a href="${linkProduto(p)}"><img src="${foto(p)}" alt=""><span>${esc(p.name)}<small>${p.kind === 'decant' ? 'Decant 5 mL' : p.kind === 'perfume' ? 'Frasco' : 'Corpo'}</small></span><span>${money(p.price)}</span></a>`).join('')
        : '<p>Nenhum produto com esse nome. Tente uma nota, como “oud” ou “floral”.</p>';
      res.classList.add('aberto');
    }, 120);
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.busca')) res.classList.remove('aberto'); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape') res.classList.remove('aberto'); });

  const painel = $('#painel');
  const btn = $('[data-menu]');
  const abrir = (sim) => {
    painel.classList.toggle('aberto', sim);
    btn.setAttribute('aria-expanded', String(sim));
    document.body.classList.toggle('sem-rolagem', sim);
    if (sim) $('[data-menu-fechar]').focus(); else btn.focus();
  };
  btn.addEventListener('click', () => abrir(true));
  $('[data-menu-fechar]').addEventListener('click', () => abrir(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && painel.classList.contains('aberto')) abrir(false); });
}

/* ---------------- início ---------------- */
cabecalho();
cabecalhoRolagem();
hero();
maisVendidos();
lembrar();
fotosDasSecoes();
zapFlutuante();
entradas();
atualizarContadores();
window.addEventListener('storage', atualizarContadores);
