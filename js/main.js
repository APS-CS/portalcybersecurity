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
  if (u.startsWith('//') || u.includes('\\')) return '#';
  if (/^(https:|mailto:)/i.test(u)) return u;
  if (u.includes(':') || u.includes('\\') || u.startsWith('//')) return '#';
  return u;
};

const tt = (typeof window.PortalTT === 'function') ? window.PortalTT : ((s) => s);

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

/* ============================================================
   Tjänsterail — automatisk loop åt vänster, drag och paus
   ============================================================ */
(function () {
  'use strict';

  var MAX_SPEED = 200;   // px/s, hård övre gräns
  var MAX_NODES = 120;   // tak för totalt antal kort i banan
  var MAX_GLIDE = 1200;  // px, tak för ackumulerad knapprörelse
  var MAX_FLING = 600;   // px, tak för kaströrelse efter drag
  var DRAG_SLOP = 5;     // px innan rörelse räknas som drag

  var FOCUSABLE = 'a[href],area[href],button,input,select,textarea,summary,' +
                  'iframe,audio[controls],video[controls],[contenteditable],[tabindex]';

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqHover  = window.matchMedia('(hover: hover) and (pointer: fine)');

  function num(value, fallback) {
    var n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function clamp(n, lo, hi) {
    if (!Number.isFinite(n)) { n = 0; }
    return n < lo ? lo : (n > hi ? hi : n);
  }

  function focusVisible(el) {
    if (!el || typeof el.matches !== 'function') { return false; }
    try { return el.matches(':focus-visible'); }
    catch (err) { return true; }   // saknas stöd: pausa hellre än inte
  }

  function initRail(root) {
    if (root.hasAttribute('data-rail-ready')) { return; }

    var viewport = root.querySelector('[data-rail-viewport]');
    var track    = root.querySelector('[data-rail-track]');
    if (!viewport || !track || !track.children.length) { return; }

    root.setAttribute('data-rail-ready', '');

    var playBtn = root.querySelector('[data-rail-toggle]');
    var prevBtn = root.querySelector('[data-rail-prev]');
    var nextBtn = root.querySelector('[data-rail-next]');

    var originals = Array.prototype.slice.call(track.children);
    var speed = clamp(num(root.getAttribute('data-rail-speed'), 35), 0, MAX_SPEED);

    var offset = 0, loopWidth = 0, glide = 0, frame = 0, last = 0;
    var suppressClick = false;

    var stop = { manual:false, hover:false, focus:false, tabHidden:false, offscreen:false };
    var drag = { on:false, moved:false, id:null, x0:0, xLast:0, tLast:0, v:0 };

    /* ---------- bygga banan ---------- */

    function sanitizeClone(node) {
      node.classList.remove('reveal');
      node.setAttribute('data-rail-clone', '');
      node.setAttribute('aria-hidden', 'true');

      var i;

      /* Inga id/name i kloner: undviker dubbletter i DOM,
         trasiga aria-referenser och DOM clobbering. */
      if (node.hasAttribute('id')) { node.removeAttribute('id'); }
      var named = node.querySelectorAll('[id],[name]');
      for (i = 0; i < named.length; i++) {
        named[i].removeAttribute('id');
        named[i].removeAttribute('name');
      }

      /* Strippa on*-attribut och skripthookar så kloner varken kan
         bära händelsehanterare eller trigga partials.js/articles.js. */
      var all = [node].concat(Array.prototype.slice.call(node.querySelectorAll('*')));
      for (i = 0; i < all.length; i++) {
        var attrs = all[i].attributes;
        for (var a = attrs.length - 1; a >= 0; a--) {
          var an = attrs[a].name.toLowerCase();
          if (an.indexOf('on') === 0 || an === 'data-include' || an === 'data-latest-articles') {
            all[i].removeAttribute(attrs[a].name);
          }
        }
      }

      /* Ur tabbordningen — men INTE inert: inert gör klonerna
         träffosynliga för pekare och skulle bryta klick-för-paus. */
      var focusable = node.querySelectorAll(FOCUSABLE);
      for (i = 0; i < focusable.length; i++) {
        focusable[i].setAttribute('tabindex', '-1');
      }
      return node;
    }

    function setWidth() {
      var gap = num(window.getComputedStyle(track).columnGap, 0);
      var w = 0;
      for (var i = 0; i < originals.length; i++) {
        w += originals[i].getBoundingClientRect().width + gap;
      }
      loopWidth = (Number.isFinite(w) && w > 0) ? w : 0;
    }

    function build() {
      var old = track.querySelectorAll('[data-rail-clone]');   // statisk NodeList
      for (var i = 0; i < old.length; i++) { track.removeChild(old[i]); }

      setWidth();
      if (loopWidth <= 0) { return; }

      var needed  = Math.ceil(viewport.clientWidth / loopWidth) + 1;
      var maxSets = Math.max(1, Math.floor(MAX_NODES / originals.length) - 1);
      var sets    = clamp(needed, 1, maxSets);

      var frag = document.createDocumentFragment();
      for (var s = 0; s < sets; s++) {
        for (var j = 0; j < originals.length; j++) {
          frag.appendChild(sanitizeClone(originals[j].cloneNode(true)));
        }
      }
      track.appendChild(frag);
    }

    /* ---------- rörelse ---------- */

    function wrap() {
      if (!Number.isFinite(offset)) { offset = 0; glide = 0; return; }
      if (loopWidth > 0) { offset = ((offset % loopWidth) + loopWidth) % loopWidth; }
    }

    function apply() {
      track.style.transform = 'translate3d(' + (-offset) + 'px,0,0)';
    }

    function auto() {
      return loopWidth > 0 && speed > 0 && !mqReduce.matches &&
             !stop.manual && !stop.hover && !stop.focus &&
             !stop.tabHidden && !stop.offscreen && !drag.on;
    }

    function tick(now) {
      if (!last) { last = now; }
      var dt = clamp((now - last) / 1000, 0, 0.1);
      last = now;

      if (glide) {
        var s = (mqReduce.matches || Math.abs(glide) < 0.5)
          ? glide
          : glide * Math.min(1, dt * 9);
        if (!Number.isFinite(s)) { s = 0; glide = 0; }
        offset += s;
        glide  -= s;
      }

      /* Positivt offset = innehållet glider åt vänster */
      if (auto()) { offset += speed * dt; }

      wrap();
      apply();

      if (!auto() && Math.abs(glide) < 0.5 && !drag.on) {
        glide = 0; frame = 0; last = 0;
        return;
      }
      frame = window.requestAnimationFrame(tick);
    }

    function run() {
      if (loopWidth <= 0) { return; }
      if (!frame) { last = 0; frame = window.requestAnimationFrame(tick); }
    }

    function sync() {
      root.setAttribute('data-rail-state', stop.manual ? 'paused' : 'playing');
      if (playBtn) { playBtn.setAttribute('aria-pressed', stop.manual ? 'true' : 'false'); }
      run();
    }

    function nudge(dir) {
      if (loopWidth <= 0) { return; }
      var gap = num(window.getComputedStyle(track).columnGap, 0);
      var w = track.children[0] ? track.children[0].getBoundingClientRect().width : 0;
      glide = clamp(glide + dir * (w + gap), -MAX_GLIDE, MAX_GLIDE);
      run();
    }

    /* ---------- drag ---------- */

    viewport.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || loopWidth <= 0) { return; }

      /* Pekskärm: rensa eventuell kvarhängande hover-paus */
      if (e.pointerType !== 'mouse') { stop.hover = false; }

      drag.on = true; drag.moved = false; drag.id = e.pointerId;
      drag.x0 = drag.xLast = e.clientX;
      drag.tLast = e.timeStamp; drag.v = 0;
      glide = 0;
      suppressClick = false;

      root.setAttribute('data-rail-drag', '');
      try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* pekaren borta */ }
      if (e.pointerType === 'mouse') { e.preventDefault(); }
      run();
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!drag.on || e.pointerId !== drag.id) { return; }
      var dx = e.clientX - drag.xLast;
      if (!Number.isFinite(dx)) { return; }
      var dt = Math.max(1, e.timeStamp - drag.tLast);

      if (Math.abs(e.clientX - drag.x0) > DRAG_SLOP) { drag.moved = true; }
      drag.v = (dx / dt) * 16;
      drag.xLast = e.clientX;
      drag.tLast = e.timeStamp;

      offset -= dx;
      wrap();
      apply();
    });

    function endDrag(e) {
      if (!drag.on || (e && e.pointerId !== drag.id)) { return; }
      drag.on = false;
      root.removeAttribute('data-rail-drag');

      try {
        if (drag.id !== null && viewport.hasPointerCapture(drag.id)) {
          viewport.releasePointerCapture(drag.id);
        }
      } catch (err) { /* redan släppt */ }

      if (drag.moved) {
        suppressClick = true;
        glide = clamp(-drag.v * 9, -MAX_FLING, MAX_FLING);
      }
      drag.id = null;
      run();
    }

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('lostpointercapture', endDrag);

    /* ---------- klick på ett kort växlar paus ---------- */

    track.addEventListener('click', function (e) {
      if (suppressClick) {                 // klick direkt efter drag
        suppressClick = false;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (!(e.target instanceof Element)) { return; }
      if (!e.target.closest('.service')) { return; }
      stop.manual = !stop.manual;
      sync();
    }, true);                              // fångstfas

    /* ---------- knappar och tangentbord ---------- */

    if (playBtn) { playBtn.addEventListener('click', function () { stop.manual = !stop.manual; sync(); }); }
    if (prevBtn) { prevBtn.addEventListener('click', function () { nudge(-1); }); }
    if (nextBtn) { nextBtn.addEventListener('click', function () { nudge(1); }); }

    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')       { nudge(-1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { nudge(1);  e.preventDefault(); }
      else if (e.key === ' ' || e.key === 'Spacebar') {
        stop.manual = !stop.manual; sync(); e.preventDefault();
      }
    });

    /* ---------- pausvillkor ---------- */

    /* Hover pausar bara på riktiga pekdon — annars fastnar den
       på pekskärm där mouseleave aldrig kommer. */
    viewport.addEventListener('mouseenter', function () {
      if (mqHover.matches) { stop.hover = true; }
    });
    viewport.addEventListener('mouseleave', function () {
      stop.hover = false; run();
    });

    /* Bara tangentbordsfokus pausar — annars stannar banan
       permanent efter ett musklick på pilknapparna. */
    root.addEventListener('focusin', function (e) {
      stop.focus = focusVisible(e.target);
    });
    root.addEventListener('focusout', function () {
      stop.focus = false; run();
    });

    document.addEventListener('visibilitychange', function () {
      stop.tabHidden = document.hidden;
      run();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        stop.offscreen = !entries[0].isIntersecting;
        run();
      }, { threshold: 0 }).observe(root);
    }

    /* ---------- omritning ---------- */

    function relayout() {
      var ratio = loopWidth > 0 ? offset / loopWidth : 0;
      if (!Number.isFinite(ratio)) { ratio = 0; }
      build();
      offset = loopWidth > 0 ? ratio * loopWidth : 0;
      wrap(); apply(); run();
    }

    if ('ResizeObserver' in window) {
      var pending = false;
      new ResizeObserver(function () {
        if (pending) { return; }
        pending = true;
        window.requestAnimationFrame(function () { pending = false; relayout(); });
      }).observe(viewport);
    } else {
      var timer = 0;
      window.addEventListener('resize', function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(relayout, 150);
      });
    }

    if (mqReduce.addEventListener) { mqReduce.addEventListener('change', run); }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(relayout).catch(function () { /* ignoreras */ });
    }

    build(); apply(); sync();
  }

  function boot() {
    var rails = document.querySelectorAll('[data-rail]');
    for (var i = 0; i < rails.length; i++) {
      try { initRail(rails[i]); }
      catch (err) { /* isolerat: banan står still, sidan påverkas inte */ }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();