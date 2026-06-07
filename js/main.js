/* =================================================================
   PORTAL CYBERSECURITY — INTERAKTION
   ================================================================= */

/* --- Mobilmeny --- */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }
})();

/* --- Mjuk reveal vid scroll --- */
(function () {
  const items = document.querySelectorAll('.reveal');
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

/* --- Datum --- */
function formateraDatum(iso) {
  return new Date(iso).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* --- En artikelrad (minimal) --- */
function artikelRadHTML(a) {
  return `
    <a class="article-row reveal" href="${a.url}">
      <div class="row-meta">
        <span class="cat">${a.kategori}</span>
        <span>${formateraDatum(a.datum)}</span>
        <span>·</span>
        <span>${a.lasetid}</span>
      </div>
      <h3>${a.titel}</h3>
      <p>${a.utdrag}</p>
    </a>`;
}

/* --- Senaste artiklar på startsidan --- */
(function () {
  const wrap = document.querySelector('[data-latest-articles]');
  if (!wrap || typeof ARTIKLAR === 'undefined') return;
  const limit = parseInt(wrap.dataset.latestArticles || '3', 10);
  wrap.innerHTML = ARTIKLAR.slice(0, limit).map(artikelRadHTML).join('');
})();

/* --- Alla artiklar + filter på artikelsidan --- */
(function () {
  const wrap = document.querySelector('[data-all-articles]');
  if (!wrap || typeof ARTIKLAR === 'undefined') return;

  function render(list) {
    wrap.innerHTML = list.length
      ? list.map(artikelRadHTML).join('')
      : '<p style="color:var(--muted);padding:1.8rem 0">Inga artiklar i den här kategorin ännu.</p>';
    wrap.querySelectorAll('.reveal').forEach(i => i.classList.add('in'));
  }
  render(ARTIKLAR);

  const filterWrap = document.querySelector('[data-filters]');
  if (filterWrap) {
    const kategorier = ['Alla', ...new Set(ARTIKLAR.map(a => a.kategori))];
    filterWrap.innerHTML = kategorier.map((k, i) =>
      `<button class="filter-btn${i === 0 ? ' active' : ''}" data-kat="${k}">${k}</button>`
    ).join('');
    filterWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterWrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const kat = btn.dataset.kat;
      render(kat === 'Alla' ? ARTIKLAR : ARTIKLAR.filter(a => a.kategori === kat));
    });
  }
})();

/* --- Årtal i footer --- */
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
