/* ============================================================
   MINIIK — script.js
   Mobile menu · Smooth scroll · Scroll animations · Form
   ============================================================ */

'use strict';

/* ============================================================
   NAVBAR — scroll state
   ============================================================ */
const navbar = document.getElementById('navbar');

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveNavLink();
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ============================================================
   ACTIVE NAV LINK — highlights current section
   ============================================================ */
const sections  = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('.nav-link');

function updateActiveNavLink() {
  let current = '';

  sections.forEach(section => {
    const offset = navbar.offsetHeight + 60;
    if (window.scrollY >= section.offsetTop - offset) {
      current = section.id;
    }
  });

  navAnchors.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

/* Create overlay backdrop */
const overlay = document.createElement('div');
overlay.className = 'menu-overlay';
overlay.style.cssText = `
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.50);
  z-index: 95;
  opacity: 0; pointer-events: none;
  transition: opacity 0.32s cubic-bezier(0.4,0,0.2,1);
`;
document.body.appendChild(overlay);

function openMenu() {
  navLinks.classList.add('open');
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'auto';
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  navLinks.classList.contains('open') ? closeMenu() : openMenu();
});

overlay.addEventListener('click', closeMenu);

/* Close menu when a nav link is tapped */
navAnchors.forEach(link => link.addEventListener('click', closeMenu));

/* Close when resizing to desktop */
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeMenu();
});

/* ============================================================
   SMOOTH SCROLL — anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const offset = navbar.offsetHeight;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   SCROLL ANIMATIONS — Intersection Observer
   ============================================================ */
const fadeElements = document.querySelectorAll('.fade-in');

const appearObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        appearObserver.unobserve(entry.target); /* animate once */
      }
    });
  },
  { threshold: 0.10, rootMargin: '0px 0px -40px 0px' }
);

fadeElements.forEach(el => appearObserver.observe(el));

/* ============================================================
   CONTACT FORM — validation
   ============================================================ */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');

/* Field definitions with validators */
const fields = {
  name: {
    el:    document.getElementById('name'),
    error: document.getElementById('nameError'),
    validate(val) {
      if (!val.trim())        return 'Name is required.';
      if (val.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
  },
  email: {
    el:    document.getElementById('email'),
    error: document.getElementById('emailError'),
    validate(val) {
      if (!val.trim()) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email address.';
      return '';
    },
  },
  message: {
    el:    document.getElementById('message'),
    error: document.getElementById('messageError'),
    validate(val) {
      if (!val.trim())           return 'Message is required.';
      if (val.trim().length < 10) return 'Message must be at least 10 characters.';
      return '';
    },
  },
};

function showFieldError(field, message) {
  field.el.classList.toggle('error', !!message);
  field.error.textContent = message;
  field.error.classList.toggle('visible', !!message);
}

function validateField(key) {
  const field = fields[key];
  const msg   = field.validate(field.el.value);
  showFieldError(field, msg);
  return !msg;
}

/* Real-time feedback: validate on blur, clear error as user types */
Object.keys(fields).forEach(key => {
  fields[key].el.addEventListener('blur', ()  => validateField(key));
  fields[key].el.addEventListener('input', () => {
    if (fields[key].el.classList.contains('error')) validateField(key);
  });
});

/* Form submit */
contactForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const allValid = Object.keys(fields).every(key => validateField(key));
  if (!allValid) return;

  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  submitBtn.style.opacity = '0.75';

  fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
  name: fields.name.el.value,
  email: fields.email.el.value,
  message: fields.message.el.value
})
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error sending message');
    }

    return data;
  })
  .then(() => {
    this.reset();
    formSuccess.classList.add('visible');
  })
  .catch(err => {
    console.error(err);
    alert('Error sending message ❌');
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
    submitBtn.style.opacity = '1';
  });
});
