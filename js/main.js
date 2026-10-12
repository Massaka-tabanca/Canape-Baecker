/* Canapé Bäcker – Interaktion */

document.documentElement.classList.remove('no-js');

// ---------- Öffnungszeiten (nur hier ändern) ----------
// Quelle: Google-Unternehmensprofil, Stand 12.10.2026.
// Wochentag 0 = Sonntag … 6 = Samstag; null = geschlossen.
const HOURS = {
  1: null,
  2: ['09:00', '14:00'],
  3: ['09:00', '14:00'],
  4: ['09:00', '14:00'],
  5: ['09:00', '13:00'],
  6: ['09:00', '13:00'],
  0: ['09:00', '13:00'],
};
const DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const ORDER = [1, 2, 3, 4, 5, 6, 0];

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const pretty = (t) => t.replace(/^0/, '').replace(':00', '');   // "09:00" → "9"

(function renderHours() {
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();

  // Tabelle
  document.getElementById('hours').innerHTML = ORDER.map((d) => {
    const h = HOURS[d];
    const cls = [d === day ? 'today' : '', h ? '' : 'closed'].join(' ').trim();
    return `<tr${cls ? ` class="${cls}"` : ''}><th>${DAY_NAMES[d]}</th><td>${h ? `${h[0]} – ${h[1]} Uhr` : 'Ruhetag'}</td></tr>`;
  }).join('');

  // Status heute
  const today = HOURS[day];
  const isOpen = today && mins >= toMin(today[0]) && mins < toMin(today[1]);
  let chip, status;

  if (isOpen) {
    chip = `Jetzt geöffnet · bis ${pretty(today[1])} Uhr`;
    status = `<strong>Jetzt geöffnet</strong> – bis ${pretty(today[1])} Uhr.`;
  } else if (today && mins < toMin(today[0])) {
    chip = `Heute ab ${pretty(today[0])} Uhr geöffnet`;
    status = `Heute <strong>ab ${pretty(today[0])} Uhr</strong> für dich da.`;
  } else {
    let d = (day + 1) % 7;
    while (!HOURS[d]) d = (d + 1) % 7;
    const when = d === (day + 1) % 7 ? 'morgen' : `am ${DAY_NAMES[d]}`;
    chip = `Geschlossen · ${when} ab ${pretty(HOURS[d][0])} Uhr`;
    status = `Gerade geschlossen – wieder <strong>${when} ab ${pretty(HOURS[d][0])} Uhr</strong>.`;
  }

  document.getElementById('statusText').textContent = chip;
  document.getElementById('statusChip').classList.toggle('open', Boolean(isOpen));
  document.getElementById('openStatus').innerHTML = status;
  document.getElementById('todayHours').textContent = today
    ? `${pretty(today[0])} – ${pretty(today[1])} Uhr`
    : 'Ruhetag';
})();

// ---------- Hero-Diashow ----------
(function slideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let i = 0;
  setInterval(() => {
    slides[i].classList.remove('is-active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('is-active');
  }, 6000);
})();

// ---------- Mobiles Menü ----------
const toggle = document.getElementById('navToggle');
toggle.addEventListener('click', () => {
  const open = document.body.classList.toggle('nav-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
});
document.querySelectorAll('#navLinks a').forEach((a) => a.addEventListener('click', () => {
  document.body.classList.remove('nav-open');
  toggle.setAttribute('aria-expanded', 'false');
}));

// ---------- Aktiver Menüpunkt beim Scrollen ----------
const links = [...document.querySelectorAll('#navLinks a')];
const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${en.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => s && spy.observe(s));
}

// ---------- Scroll-Animation ----------
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}

// ---------- Galerie-Lightbox ----------
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
document.querySelectorAll('.m-item').forEach((btn) => btn.addEventListener('click', () => {
  lbImg.src = btn.dataset.full;
  lbImg.alt = btn.querySelector('img').alt;
  lb.hidden = false;
}));
const closeLb = () => { lb.hidden = true; lbImg.src = ''; };
document.getElementById('lbClose').addEventListener('click', closeLb);
lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Anruf-Balken (Handy) erst nach dem Hero zeigen ----------
(function callBar() {
  const hero = document.querySelector('.hero');
  if (!hero || !('IntersectionObserver' in window)) { document.body.classList.add('show-call'); return; }
  new IntersectionObserver(([en]) => {
    document.body.classList.toggle('show-call', !en.isIntersecting);
  }, { threshold: 0.15 }).observe(hero);
})();
