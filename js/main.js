/* =================================================================
   PORTAL CYBERSECURITY — INTERAKTION
   Ordning: meny → artiklar renderas → reveal initieras SIST, så att
   även JS-injicerade rader observeras och blir synliga.
   ================================================================= */

if (window.top !== window.self) {
  try { window.top.location = window.self.location; }
  catch (e) { document.documentElement.style.display = 'none'; }
}


const esc = (s) => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const safeUrl = (raw) => {
  const u = String(raw).trim();
  if (/^(https?:|mailto:)/i.test(u)) return u;
  if (u.includes(':') || u.includes('\\') || u.startsWith('//')) return '#';
  return u;
};

const tt = window.PortalTT || ((s) => s);

const ARTIKELLISTA = (typeof ARTIKLAR !== 'undefined' && Array.isArray(ARTIKLAR)) ? ARTIKLAR : null;

/* --- Mobilmeny --- */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
})();

/* --- Artiklar --- */
const formateraDatum = (iso) =>
  new Date(iso).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });

function artikelRadHTML(a) {
  return `
    <a class="article-row reveal" href="${esc(safeUrl(a.url))}">
      <div class="row-meta">
        <span class="cat">${esc(a.kategori)}</span>
        <span>${esc(formateraDatum(a.datum))}</span>
        <span>·</span>
        <span>${esc(a.lasetid)}</span>
      </div>
      <h3>${esc(a.titel)}</h3>
      <p>${esc(a.utdrag)}</p>
    </a>`;
}

/* Senaste artiklar (startsidan) — revealas av observern som initieras sist. */
(function () {
  const wrap = document.querySelector('[data-latest-articles]');
  if (!wrap || !ARTIKELLISTA) return;
  const limit = parseInt(wrap.dataset.latestArticles || '3', 10) || 3;
  wrap.innerHTML = tt(ARTIKELLISTA.slice(0, limit).map(artikelRadHTML).join(''));
})();

/* Alla artiklar + kategorifilter (artikelsidan). Vid filtrering efter
   sidladdning visas raderna direkt (.in), eftersom observern redan körts. */
(function () {
  const wrap = document.querySelector('[data-all-articles]');
  if (!wrap || !ARTIKELLISTA) return;

  function render(list) {
    wrap.innerHTML = tt(list.length
      ? list.map(artikelRadHTML).join('')
      : '<p class="articles-empty">Inga artiklar i den här kategorin ännu.</p>');
    wrap.querySelectorAll('.reveal').forEach(i => i.classList.add('in'));
  }
  render(ARTIKELLISTA);

  const filterWrap = document.querySelector('[data-filters]');
  if (!filterWrap) return;
  const kategorier = ['Alla', ...new Set(ARTIKELLISTA.map(a => a.kategori))];
  filterWrap.innerHTML = tt(kategorier.map((k, i) =>
    `<button class="filter-btn${i === 0 ? ' active' : ''}" data-kat="${esc(k)}">${esc(k)}</button>`
  ).join(''));
  filterWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterWrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const kat = btn.dataset.kat;
    render(kat === 'Alla' ? ARTIKELLISTA : ARTIKELLISTA.filter(a => a.kategori === kat));
  });
})();

/* --- Mjuk reveal vid scroll — initieras SIST så allt injicerat täcks --- */
(function () {
  const items = document.querySelectorAll('.reveal:not(.in)');
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach(i => i.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  items.forEach(i => io.observe(i));
})();

/* --- Årtal i sidfoten --- */
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
