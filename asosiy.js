// RIZO: sovgʻa tanlagich, buket, messenjerga xabar, javon tugmalari, 3D sovgʻa qutisi.
// Kutubxonasiz; faqat 3D uchun Google model-viewer — ekranga yaqinlashganda yuklanadi.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const harakat = matchMedia('(prefers-reduced-motion: no-preference)');
const M = JSON.parse($('#malumot').textContent);

// ---------- yuklanish holati: rasm/3D kelguncha nur + qizil chiziq (foiz maʼlum boʻlsa — ulush) ----------
function yukl(idish) {
  if (idish._yukl) return idish._yukl;
  const q = document.createElement('span');
  q.className = 'yukl-qatlam';
  q.setAttribute('aria-hidden', 'true');
  q.append(document.createElement('i'));
  idish.classList.add('yukl');
  idish.append(q);
  const h = {
    foiz(p) {
      if (!(p >= 0)) return;
      idish.classList.add('yukl-foizli');
      idish.style.setProperty('--p', Math.min(1, p).toFixed(3));
    },
    tayyor() {
      if (h.bitdi) return;
      h.bitdi = true;
      q.classList.add('bitdi');
      setTimeout(() => { q.remove(); idish.classList.remove('yukl', 'yukl-foizli'); idish._yukl = null; }, 450);
    },
  };
  idish._yukl = h;
  return h;
}

// kech yuklanadigan suratlar: ekranga yaqinlashganda hali kelmagan boʻlsa — holat koʻrsatiladi
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const img = e.target;
    if (img.complete && img.naturalWidth) return;
    const idish = img.closest('.vitrina-h, .yorliq-rasm, .gul-surat, .quron-surat, .paket-s');
    if (!idish) return;
    const h = yukl(idish);
    const bitdi = () => h.tayyor();
    img.addEventListener('load', bitdi, { once: true });
    img.addEventListener('error', bitdi, { once: true });
  }), { rootMargin: '200px 0px' });
  $$('main img[loading="lazy"]').forEach((i) => { if (!i.closest('.m3d')) io.observe(i); });
}

// ---------- xabar oynasi ----------
const oyna = $('#xabar-oyna');
let oynaVaqt;
function xabar(matn) {
  clearTimeout(oynaVaqt);
  oyna.textContent = '';
  oyna.classList.add('bor');
  requestAnimationFrame(() => { oyna.textContent = matn; });
  oynaVaqt = setTimeout(() => { oyna.classList.remove('bor'); oyna.textContent = ''; }, 3200);
}

// ---------- messenjer: xabar matni nusxalanadi, Telegram ochiladi (manzil yoʻq boʻlsa — aloqa boʻlimi) ----------
const telegramBor = M.telegram.startsWith('https://');
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-xabar]');
  if (!a) return;
  const matn = a.dataset.xabar;
  if (!matn) return;
  const yoz = navigator.clipboard?.writeText(matn);
  if (a.href.startsWith('https://t.me/')) {
    a.target = '_blank';
    a.rel = 'noopener';
  }
  Promise.resolve(yoz).then(
    () => xabar(telegramBor ? 'Xabar nusxalandi — Telegram chatiga qoʻying' : 'Xabar nusxalandi. Telegram manzili hali qoʻshilmagan'),
    () => xabar(telegramBor ? 'Telegram ochilmoqda' : 'Telegram manzili hali qoʻshilmagan'),
  );
});

// ---------- kimga sovgʻa: tanlov → qizil paket ----------
const tanlagich = $('#tanlagich');
const paket = $('#paket-sovgalar');
const paketHolat = $('#paket-holat');
const paketSora = $('#paket-sora');

function rasmEl(r, alt = '') {
  const p = document.createElement('picture');
  const s = document.createElement('source');
  s.type = 'image/avif';
  s.srcset = r.avif;
  s.sizes = '(max-width: 700px) 30vw, 180px';
  const i = document.createElement('img');
  i.className = 'r';
  i.src = r.src;
  i.srcset = r.webp;
  i.sizes = s.sizes;
  i.width = r.w;
  i.height = r.h;
  i.alt = alt;
  i.decoding = 'async';
  i.style.backgroundImage = `url(${r.lqip})`;
  p.append(s, i);
  return p;
}

function paketYangila(animatsiya) {
  const f = new FormData(tanlagich);
  const k = f.get('kimga');
  const v = f.get('voqea');
  const ids = M.tanlov[k][v];
  const sovgalar = ids.map((id) => M.sovgalar[id]);
  // Qurʼon bor toʻplam — sokin koʻrinish, «tushish» harakatisiz
  const sokin = sovgalar.some((s) => s.tur === 'quron');
  const kalit = ids.join(',');
  if (paket.dataset.ids !== kalit) paket.replaceChildren(...sovgalar.map((s, n) => {
    const li = document.createElement('li');
    li.className = 'paket-s';
    if (animatsiya) li.classList.add(sokin ? 'sokin' : 'tushish');
    li.style.setProperty('--i', n);
    const nom = document.createElement('span');
    nom.textContent = s.nom;
    li.append(rasmEl(s.rasm), nom);
    return li;
  }));
  paket.dataset.ids = kalit;
  const nomlar = sovgalar.map((s) => s.nom).join(', ');
  paketHolat.textContent = `${M.kimga[k]}, ${M.voqea[v]}: ${nomlar}.`;
  paketSora.dataset.xabar = `Assalomu alaykum. ${M.kimga[k]} ${M.voqea[v]} sovgʻa kerak. Shular bormi: ${nomlar}? Narxlarini aytib bera olasizmi?`;
}
tanlagich.addEventListener('change', () => paketYangila(true));
tanlagich.addEventListener('submit', (e) => e.preventDefault());
paketYangila(false);

// ---------- gul: buket kattaligi va rangi ----------
const gulForma = $('#gul-tanlagich');
const buket = $('#buket');
const gulSora = $('#gul-sora');
function buketYangila() {
  const f = new FormData(gulForma);
  const k = f.get('kattalik');
  const r = f.get('rang');
  buket.dataset.kattalik = k;
  buket.dataset.rang = r;
  const [kNom, soni] = M.gul.kattalik[k];
  const rNom = M.gul.rang[r].toLowerCase();
  buket.setAttribute('aria-label', `Buket: ${kNom.toLowerCase()}, ${soni} ta gul, ${rNom}`);
  gulSora.dataset.xabar = `Assalomu alaykum. Buket kerak: ${kNom.toLowerCase()} (${soni} ta), ${rNom}. Narxi qancha boʻladi?`;
}
gulForma.addEventListener('change', buketYangila);
gulForma.addEventListener('submit', (e) => e.preventDefault());
buketYangila();

// ---------- javon: oldingi / keyingi (telefonda gorizontal) ----------
const javon = $('#javon');
const javonTug = $$('[data-javon]');
function javonHolat() {
  const max = javon.scrollWidth - javon.clientWidth - 4;
  javonTug[0].disabled = javon.scrollLeft <= 4;
  javonTug[1].disabled = javon.scrollLeft >= max;
}
javonTug.forEach((b) => b.addEventListener('click', () => {
  const karta = javon.firstElementChild;
  const qadam = karta.getBoundingClientRect().width + parseFloat(getComputedStyle(javon).columnGap || 12);
  javon.scrollBy({ left: qadam * Number(b.dataset.javon), behavior: harakat.matches ? 'smooth' : 'auto' });
}));
javon.addEventListener('scroll', () => requestAnimationFrame(javonHolat), { passive: true });
javonHolat();

// ---------- 3D sovgʻa qutisi: poster darhol, model ekranga yaqinlashganda ----------
const m3d = $('#m3d');
const tejash = navigator.connection?.saveData === true;
if (m3d && !tejash && 'IntersectionObserver' in window) {
  const sahna = $('.m3d-sahna', m3d);
  const ochir = async () => {
    const h = yukl(sahna);
    try {
      await import(new URL(m3d.dataset.mv, document.baseURI).href);
      const mv = document.createElement('model-viewer');
      mv.setAttribute('src', m3d.dataset.glb);
      mv.setAttribute('alt', 'Qizil lentali oq sovgʻa qutisi, 3D model — barmoq bilan aylantiring');
      mv.setAttribute('camera-controls', '');
      mv.setAttribute('disable-zoom', '');
      mv.setAttribute('disable-pan', '');
      mv.setAttribute('touch-action', 'pan-y');
      mv.setAttribute('interaction-prompt', 'none');
      mv.setAttribute('camera-orbit', '30deg 70deg 105%');
      mv.setAttribute('shadow-intensity', '0');
      mv.setAttribute('exposure', '1.05');
      mv.setAttribute('environment-image', 'neutral');
      mv.setAttribute('loading', 'eager');
      if (harakat.matches) {
        mv.setAttribute('auto-rotate', '');
        mv.setAttribute('rotation-per-second', '18deg');
        mv.setAttribute('auto-rotate-delay', '0');
      }
      mv.addEventListener('progress', (e) => h.foiz(e.detail.totalProgress));
      mv.addEventListener('load', () => { m3d.classList.add('tayyor'); h.tayyor(); }, { once: true });
      mv.addEventListener('error', () => h.tayyor(), { once: true });
      sahna.append(mv);
    } catch {
      h.tayyor();
    }
  };
  const kuzat = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { kuzat.disconnect(); ochir(); }
  }, { rootMargin: '400px 0px' });
  kuzat.observe(m3d);
}
