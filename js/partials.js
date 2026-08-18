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

  // Tillåten bas: '' (rot), '../' (artiklar) eller '/' (felsidor som
  // kan serveras på valfritt djup, t.ex. 404). Annat faller tillbaka till ''.
  const base = ['../','/'].includes(document.body.dataset.base)
    ? document.body.dataset.base : '';

  // Toppmeny. Sidfoten upprepar den inte, den har egna länkar (se FOOTER_LINKS).
  const NAV = [
    ['Tjänster',   'index.html#tjanster'],
    ['Arbetssätt', 'index.html#arbetssatt'],
    ['Artiklar',   'artiklar.html'],
    ['Kontakt',    'index.html#kontakt'],
  ];
  const navLinks = () =>
    NAV.map(([t, h]) => `<li><a href="${base}${h}">${t}</a></li>`).join('\n          ');

  // Sidfotens egna länkar.
  const FOOTER_LINKS = [
    ['Integritetspolicy',      'integritetspolicy.html'],
    ['Sårbarhetsrapportering', 'sarbarhetsrapportering.html'],
    ['Leverantörsinformation', 'leverantorsinfo.html'],
  ];

  // Sociala kanaler. Ikonerna ligger som inbäddad SVG, inga externa anrop.
  const SOCIAL = [
    ['LinkedIn', 'https://www.linkedin.com/company/portalcybersecurity/',
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.94 5.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.4 8.9h3.1V21H3.4zm5.6 0h2.97v1.65h.04c.41-.78 1.42-1.6 2.93-1.6 3.13 0 3.71 2.06 3.71 4.74V21h-3.1v-5.66c0-1.35-.02-3.09-1.88-3.09-1.88 0-2.17 1.47-2.17 2.99V21H9z"/></svg>'],
    ['Facebook', 'https://www.facebook.com/portalcybersecurity',
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.9 21v-8.2h2.75l.41-3.19H13.9V7.57c0-.92.26-1.55 1.58-1.55h1.69V3.17c-.29-.04-1.3-.13-2.47-.13-2.44 0-4.11 1.49-4.11 4.23v2.36H7.83v3.19h2.76V21z"/></svg>'],
    ['Instagram', 'https://www.instagram.com/portalcybersecurity',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.9"/><circle cx="17.1" cy="6.9" r="1.1" fill="currentColor" stroke="none"/></svg>'],
  ];

  const OM_TEXT =
    'Portal Cybersecurity är en oberoende konsultverksamhet inom informations- och '
  + 'cybersäkerhet med bas i Stockholm. Vi arbetar med styrning, regelefterlevnad och '
  + 'beredskap.';

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
          ${navLinks()}
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
      <a class="logo footer-logo" href="${base}index.html" aria-label="Portal Cybersecurity — startsida">
        <img class="logo-img" src="${base}bilder/logo.svg" alt="Portal Cybersecurity">
      </a>
      <div class="footer-grid">
        <p class="footer-about">${OM_TEXT}</p>
        <nav class="footer-col" aria-labelledby="footer-info">
          <h2 class="footer-head" id="footer-info">Information</h2>
          <ul class="footer-list">
            ${FOOTER_LINKS.map(([t, h]) =>
              `<li><a href="${base}${h}">${t}</a></li>`).join('\n            ')}
          </ul>
        </nav>
        <div class="footer-col">
          <h2 class="footer-head" id="footer-social">Följ oss</h2>
          <ul class="footer-list footer-social" aria-labelledby="footer-social">
            ${SOCIAL.map(([namn, url, ikon]) =>
              `<li><a href="${url}" target="_blank" rel="me noopener noreferrer"><span class="social-icon">${ikon}</span>${namn}</a></li>`).join('\n            ')}
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span data-year></span> Portal Cybersecurity · Enskild firma, Sverige</span>
        <span><a href="mailto:info@portalcs.se">info@portalcs.se</a></span>
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
    a.textContent = 'Kontakta oss';

    const box = document.createElement('div'); box.className = 'cta-box'; box.append(h2, p, a);
    const cont = document.createElement('div'); cont.className = 'container'; cont.append(box);
    const sec = document.createElement('section'); sec.className = 'cta-band'; sec.append(cont);
    el.replaceWith(sec);
  });
})();