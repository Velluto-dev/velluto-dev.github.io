// =========================================================
// VELLUTO — palco 3D do hero
// Carregado sob demanda pelo home.js (import dinâmico), então
// a página abre e o texto aparece sem esperar o Three.js.
// A foto do frasco continua no palco como reserva: se o
// WebGL falhar ou o modelo não carregar, nada quebra.
//
// Uso:
//   const palco3d = await criarPalco3D(elementoPalco, { naPedra: true });
//   await palco3d.mostrar('assets/models/asad.glb');
//   palco3d.pontoBase(); // onde a base do frasco aparece no palco (px)
// =========================================================
import * as THREE from '../vendor/three/three.module.min.js';
import { GLTFLoader } from '../vendor/three/GLTFLoader.js';
import { RoomEnvironment } from '../vendor/three/RoomEnvironment.js';

const AJUSTES = {
  alturaFrasco: 1.7,   // altura do frasco na cena (unidades)
  entrada: 2.8,        // duração da entrada (s)
  giroLento: 0.22,     // rotação contínua (rad/s)
  giroNaPedra: 0.38,   // rotação quando o frasco está sobre a pedra da foto (rad/s)
  luzQuente: '#ffd9a0',
};

export function suportaWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

export async function criarPalco3D(palco, { naPedra = false } = {}) {
  const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fraco = (navigator.hardwareConcurrency || 4) <= 4 || matchMedia('(max-width: 820px)').matches;

  /* ---------- renderizador (fundo transparente: o gradiente do hero aparece) ---------- */
  const canvas = document.createElement('canvas');
  canvas.className = 'palco-3d';
  canvas.setAttribute('aria-hidden', 'true');
  palco.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, fraco ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !fraco;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environmentIntensity = 0.75;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

  /* ---------- luzes ---------- */
  cena.add(new THREE.HemisphereLight('#3a7a64', '#020806', 0.6));
  const chave = new THREE.SpotLight(AJUSTES.luzQuente, 60, 20, Math.PI / 7, 0.6, 1.5);
  chave.position.set(2.6, 5.5, 3.2);
  chave.target.position.set(0, 0.8, 0);
  chave.castShadow = !fraco;
  chave.shadow.mapSize.set(1024, 1024);
  chave.shadow.bias = -0.0004;
  chave.shadow.normalBias = 0.02;
  cena.add(chave, chave.target);
  const preenchimento = new THREE.DirectionalLight('#fff4e6', 0.6);
  preenchimento.position.set(-2, 3, 5);
  cena.add(preenchimento);
  const contorno = new THREE.PointLight('#3fd1a6', 16, 10, 2);
  contorno.position.set(-2, 2.4, -2.5);
  cena.add(contorno);
  const varredura = new THREE.PointLight('#ffe6b8', 0, 6, 2); // luz que cruza o frasco na entrada
  cena.add(varredura);

  /* ---------- chão: só recebe sombra + anel dourado ---------- */
  const chao = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.ShadowMaterial({ opacity: 0.45 }));
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  cena.add(chao);
  const anel = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.007, 12, 160),
    new THREE.MeshStandardMaterial({ color: '#c9a45c', metalness: 1, roughness: 0.25, transparent: true, opacity: 0 }),
  );
  anel.rotation.x = Math.PI / 2;
  anel.position.y = 0.004;
  if (!naPedra) cena.add(anel); // sobre a pedra da foto, o anel sai

  // sombra de contato: escurece a pedra logo abaixo do frasco (funciona também sem shadowMap)
  const contato = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 1.6),
    new THREE.MeshBasicMaterial({ map: (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(0.45, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })(), transparent: true, opacity: 0, depthWrite: false }),
  );
  contato.rotation.x = -Math.PI / 2;
  contato.position.y = 0.002;
  if (naPedra) cena.add(contato);

  // pivôs: frasco = sobe/flutua · giro = rotação (entrada + arrastar)
  const frasco = new THREE.Group();
  const giro = new THREE.Group();
  frasco.add(giro);
  cena.add(frasco);

  /* ---------- partículas douradas ---------- */
  const N = fraco ? 260 : 600;
  const pos = new Float32Array(N * 3);
  const vel = new Float32Array(N);
  const fase = new Float32Array(N);
  for (let i = 0; i < N; i += 1) {
    const r = 0.5 + Math.random() * 2.2;
    const a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.random() * 3;
    pos[i * 3 + 2] = Math.sin(a) * r - 0.6;
    vel[i] = 0.04 + Math.random() * 0.1;
    fase[i] = Math.random() * Math.PI * 2;
  }
  const geoP = new THREE.BufferGeometry();
  geoP.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const ponto = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.35, 'rgba(230,190,110,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const particulas = new THREE.Points(geoP, new THREE.PointsMaterial({
    size: 0.035, map: ponto, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  cena.add(particulas);

  /* ---------- enquadramento ---------- */
  const alvo = new THREE.Vector3(0, AJUSTES.alturaFrasco * 0.46, 0);
  const camFim = new THREE.Vector3();
  const camIni = new THREE.Vector3();
  function enquadrar() {
    const w = palco.clientWidth || 1;
    const h = palco.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // distância para o frasco ocupar ~66% da altura do palco
    const d = (AJUSTES.alturaFrasco / 0.66) / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camFim.set(0, alvo.y + 0.35, d);
    camIni.set(-1.6, alvo.y + 2.6, d + 3.2);
  }
  enquadrar();
  new ResizeObserver(enquadrar).observe(palco);

  /* ---------- interação: inclinar com o cursor + arrastar para girar ---------- */
  const cursor = { x: 0, y: 0, sx: 0, sy: 0 };
  palco.addEventListener('pointermove', (e) => {
    const r = palco.getBoundingClientRect();
    cursor.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    cursor.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  palco.addEventListener('pointerleave', () => { cursor.x = 0; cursor.y = 0; });
  let arrastando = false;
  let ultimoX = 0;
  let impulso = 0;
  let giroUsuario = 0;
  canvas.addEventListener('pointerdown', (e) => {
    arrastando = true; ultimoX = e.clientX;
    canvas.classList.add('arrastando');
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!arrastando) return;
    impulso = (e.clientX - ultimoX) * 0.01;
    ultimoX = e.clientX;
    giroUsuario += impulso;
  });
  const soltar = () => { arrastando = false; canvas.classList.remove('arrastando'); };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);

  /* ---------- modelos (com cache: trocar de perfume não baixa de novo) ---------- */
  const loader = new GLTFLoader();
  const cache = new Map();
  function carregar(url) {
    if (!cache.has(url)) {
      cache.set(url, loader.loadAsync(url).then((gltf) => {
        const m = gltf.scene;
        const caixa = new THREE.Box3().setFromObject(m);
        m.scale.setScalar(AJUSTES.alturaFrasco / caixa.getSize(new THREE.Vector3()).y);
        caixa.setFromObject(m);
        const c = caixa.getCenter(new THREE.Vector3());
        m.position.set(-c.x, -caixa.min.y, -c.z);
        m.traverse((o) => {
          if (!o.isMesh) return;
          o.castShadow = !fraco;
          if (o.material.map) o.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
          o.material.envMapIntensity = 1.3;
        });
        return m;
      }).catch((err) => { cache.delete(url); throw err; }));
    }
    return cache.get(url);
  }

  /* ---------- animação ---------- */
  const suave = (x) => 1 - Math.pow(1 - x, 3);
  const suaveIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const relogio = new THREE.Clock();
  const camPos = new THREE.Vector3();
  let t0 = 0;
  let primeira = true;   // a primeira entrada tem o voo de câmera; as trocas só o giro
  let giroLento = 0;
  let rodando = false;
  let visivel = true;

  function quadro() {
    const dt = Math.min(relogio.getDelta(), 0.05);
    const el = relogio.elapsedTime;
    const p = Math.min((performance.now() - t0) / 1000 / AJUSTES.entrada, 1);
    const e = suave(p);

    cursor.sx += (cursor.x - cursor.sx) * 0.05;
    cursor.sy += (cursor.y - cursor.sy) * 0.05;
    if (primeira) camPos.lerpVectors(camIni, camFim, suaveIO(p)); else camPos.copy(camFim);
    // na pedra o movimento do cursor é menor, para o frasco não "escorregar" sobre a foto
    camPos.x += cursor.sx * (naPedra ? 0.12 : 0.45) * e;
    camPos.y += -cursor.sy * (naPedra ? 0.06 : 0.25) * e;
    camera.position.copy(camPos);
    camera.lookAt(alvo);

    // sobre a pedra o frasco fica apoiado; sem a foto, flutua de leve
    frasco.position.y = -(1 - e) * 0.5 + (naPedra ? 0 : Math.sin(el * 1.1) * 0.02 * e);
    if (!arrastando) { impulso *= 0.94; giroUsuario += impulso; }
    if (!arrastando && !reduzMovimento) giroLento += (naPedra ? AJUSTES.giroNaPedra : AJUSTES.giroLento) * dt * e;
    giro.rotation.y = (1 - e) * Math.PI * 1.4 + giroLento + giroUsuario;

    const s = THREE.MathUtils.clamp((p - 0.15) / 0.6, 0, 1);
    varredura.intensity = Math.sin(s * Math.PI) * 26;
    varredura.position.set(-2.6 + s * 5.2, 1.2, 1.6);

    anel.material.opacity = e;
    contato.material.opacity = e;
    particulas.material.opacity = 0.75 * e;
    const a = geoP.attributes.position.array;
    for (let i = 0; i < N; i += 1) {
      a[i * 3 + 1] += vel[i] * dt;
      a[i * 3] += Math.sin(el * 0.6 + fase[i]) * 0.001;
      if (a[i * 3 + 1] > 3) a[i * 3 + 1] = 0;
    }
    geoP.attributes.position.needsUpdate = true;

    renderer.render(cena, camera);
  }

  // só desenha quando o hero está na tela e a aba está ativa (poupa bateria)
  function atualizarLaco() {
    const deve = visivel && !document.hidden && giro.children.length > 0;
    if (deve && !rodando) { relogio.start(); renderer.setAnimationLoop(quadro); rodando = true; }
    if (!deve && rodando) { renderer.setAnimationLoop(null); relogio.stop(); rodando = false; }
  }
  new IntersectionObserver(([en]) => { visivel = en.isIntersecting; atualizarLaco(); }).observe(palco);
  document.addEventListener('visibilitychange', atualizarLaco);

  return {
    /** Mostra o modelo do URL. Resolve quando ele já está na tela. */
    async mostrar(url) {
      const modelo = await carregar(url);
      giro.clear();
      giro.add(modelo);
      giroUsuario = 0; impulso = 0;
      renderer.compile(cena, camera);
      t0 = performance.now() - (reduzMovimento ? AJUSTES.entrada * 1000 : 0);
      atualizarLaco();
      if (primeira) setTimeout(() => { primeira = false; }, AJUSTES.entrada * 1000);
    },
    /** Pré-carrega sem mostrar (ex.: quando o cursor passa na miniatura). */
    preparar(url) { carregar(url).catch(() => {}); },
    /** Ponto da base do frasco no palco, em px a partir do canto superior esquerdo (câmera em repouso). */
    pontoBase() {
      const w = palco.clientWidth || 1;
      const h = palco.clientHeight || 1;
      const cam = camera.clone();
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      cam.position.copy(camFim);
      cam.lookAt(alvo);
      cam.updateMatrixWorld();
      const v = new THREE.Vector3(0, 0, 0).project(cam);
      return { x: (v.x + 1) / 2 * w, y: (1 - v.y) / 2 * h };
    },
    /** Esconde o 3D (produto sem modelo): o palco volta à foto. */
    esconder() { giro.clear(); atualizarLaco(); },
  };
}
