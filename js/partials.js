/* =================================================================
   PORTAL CYBERSECURITY — GEMENSAMMA DELAR (sidhuvud, sidfot, CTA)
   =================================================================
   Definieras EN gång här och injiceras på alla sidor:
     <div data-include="header"></div>
     <div data-include="footer"></div>                        (full sidfot)
     <div data-include="footer" data-variant="article"></div> (enkel sidfot)
     <div data-include="cta" data-titel="..." data-text="..."></div>
   Sidor i /artiklar/ sätter <body data-base="../"> så länkar pekar rätt.
   Körs FÖRE main.js (se script-ordningen i varje sida).
   ================================================================= */
(function () {
  const policy = window.trustedTypes
    ? trustedTypes.createPolicy('portal-html', { createHTML: (s) => s })
    : null;
  const tt = (s) => (policy ? policy.createHTML(s) : s);
  window.PortalTT = tt; // delas med main.js

  const base = document.body.dataset.base === '../' ? '../' : '';

  // Meny — en enda källa för både topp- och sidfotsnavigering.
  const NAV = [
    ['Tjänster',   'index.html#tjanster'],
    ['Arbetssätt', 'index.html#arbetssatt'],
    ['Artiklar',   'artiklar.html'],
    ['Kontakt',    'index.html#kontakt'],
  ];
  const navLinks = (tag) =>
    NAV.map(([t, h]) => tag === 'li'
      ? `<li><a href="${base}${h}">${t}</a></li>`
      : `<a href="${base}${h}">${t}</a>`).join('\n          ');

  const ICON_MENU =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

  const header = `
  <header class="site-header">
    <div class="container nav">
      <a class="logo" href="${base}index.html" aria-label="Portal Cybersecurity — startsida">
        <img class="logo-img" src="${base}bilder/logo.svg" alt="Portal Cybersecurity">
      </a>
      <nav>
        <ul class="nav-links">
          ${navLinks('li')}
        </ul>
      </nav>
      <div class="nav-actions">
        <a class="btn btn-primary" href="${base}index.html#kontakt">Boka ett samtal</a>
        <button class="nav-toggle" aria-label="Öppna meny" aria-expanded="false">${ICON_MENU}</button>
      </div>
    </div>
  </header>`;

  /* Sidfot: ett gemensamt skal, två innehållsvarianter. */
  const footer = (inner) => `
  <footer class="site-footer">
    <div class="container">${inner}
    </div>
  </footer>`;

  const footerFull = footer(`
      <div class="footer-top">
        <a class="logo" href="${base}index.html">
          <img class="logo-img" src="${base}bilder/logo.svg" alt="Portal Cybersecurity">
        </a>
        <nav class="footer-nav">
          ${navLinks('a')}
          <a href="${base}integritetspolicy.html">Integritetspolicy</a>
        </nav>
      </div>
      <div class="footer-bottom">
        <span>© <span data-year></span> Portal Cybersecurity · Enskild firma, Sverige</span>
        <span><a href="mailto:amosps@proton.me">amosps@proton.me</a></span>
      </div>`);

  const footerArticle = footer(`
      <div class="footer-bottom footer-bottom--bare">
        <span>© <span data-year></span> Portal Cybersecurity</span>
        <span><a href="${base}artiklar.html">← Tillbaka till artiklar</a></span>
      </div>`);

  document.querySelectorAll('[data-include="header"]').forEach(el => { el.outerHTML = tt(header); });
  document.querySelectorAll('[data-include="footer"]').forEach(el => {
    el.outerHTML = tt(el.dataset.variant === 'article' ? footerArticle : footerFull);
  });

  /* CTA-band (artikelsidor). Texten kommer från data-attribut och sätts
     via textContent — kan aldrig tolkas som HTML. */
  document.querySelectorAll('[data-include="cta"]').forEach(el => {
    const h2 = document.createElement('h2');
    h2.textContent = el.dataset.titel || 'Behöver du hjälp?';
    const p = document.createElement('p');
    p.textContent = el.dataset.text || 'Hör av dig för ett kostnadsfritt samtal.';
    const a = document.createElement('a');
    a.className = 'btn btn-primary';
    a.href = base + 'index.html#kontakt';
    a.textContent = 'Kontakta mig';

    const box = document.createElement('div'); box.className = 'cta-box'; box.append(h2, p, a);
    const cont = document.createElement('div'); cont.className = 'container'; cont.append(box);
    const sec = document.createElement('section'); sec.className = 'cta-band'; sec.append(cont);
    el.replaceWith(sec);
  });
})();
