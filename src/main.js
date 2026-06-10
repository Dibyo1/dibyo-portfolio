import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import Lenis from '@studio-freight/lenis';

const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initPreloader();
  initCanvasNoise();
  initNav();
  initProgressBar();
  initScrollAnimations();
});

function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  cursor.style.opacity = '1';
  document.body.style.cursor = 'none';

  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });

  window.addEventListener('mousemove', e => { xTo(e.clientX); yTo(e.clientY); });

  document.querySelectorAll('a, button, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 1.6, backgroundColor: 'rgba(200,246,90,0.15)', duration: 0.3 }));
    el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, backgroundColor: 'transparent', duration: 0.3 }));
  });
}

function initPreloader() {
  const counterEl = document.getElementById('preloader-counter');
  const counterObj = { value: 0 };

  document.body.style.overflow = 'hidden';

  // Wrap hero title words NOW before the timeline starts
  document.querySelectorAll('.hero-title').forEach(title => {
    const text = title.textContent.trim();
    title.innerHTML = text.split(' ').map(word =>
      `<span class="word-wrap" style="display:inline-block;overflow:hidden;vertical-align:bottom;"><span class="hero-word" style="display:inline-block;">${word}</span></span>`
    ).join('&nbsp;');
  });

  // Set initial states for hero words
  gsap.set('.hero-word', { y: '100%' });
  gsap.set('#hero-name', { opacity: 0 });

  const tl = gsap.timeline({
    onComplete: () => { document.body.style.overflow = ''; }
  });

  tl.to(counterObj, {
    value: 100,
    duration: 2.2,
    ease: 'power2.inOut',
    onUpdate: () => {
      counterEl.textContent = Math.round(counterObj.value).toString().padStart(2, '0');
    }
  })
  .to('.preloader-content', { opacity: 0, duration: 0.4 }, '+=0.1')
  .to('.preloader-top', { y: '-100%', duration: 0.8, ease: 'power3.inOut' }, '-=0.2')
  .to('.preloader-bottom', { y: '100%', duration: 0.8, ease: 'power3.inOut' }, '<')
  .set('#preloader', { display: 'none' })
  .to('#hero-name', { opacity: 1, duration: 0.8 }, '-=0.3')
  .to('.hero-word', { y: '0%', duration: 1, stagger: 0.1, ease: 'power4.out' }, '-=0.6')
  .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
}

function initCanvasNoise() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let animId;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function drawNoise() {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) { animId = requestAnimationFrame(drawNoise); return; }
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = data[i+1] = data[i+2] = v;
      data[i+3] = 12;
    }
    ctx.putImageData(imageData, 0, 0);
    animId = requestAnimationFrame(drawNoise);
  }
  drawNoise();
}

function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const cur = window.pageYOffset;
    nav.classList.toggle('scrolled', cur > 100);
    if (cur > lastScroll && cur > 200) nav.classList.add('hidden');
    else nav.classList.remove('hidden');
    lastScroll = cur;
  }, { passive: true });
}

function initProgressBar() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    bar.style.width = (pct * 100) + '%';
  }, { passive: true });
}

function initScrollAnimations() {
  // --- Split text reveals (.split-text headings) ---
  document.querySelectorAll('.split-text').forEach(el => {
    const words = el.textContent.trim().split(' ');
    el.innerHTML = words.map(w =>
      `<span style="display:inline-block;overflow:hidden;vertical-align:bottom;"><span class="word" style="display:inline-block;">${w}</span></span>`
    ).join(' ');

    gsap.set(el.querySelectorAll('.word'), { y: '100%' });

    gsap.to(el.querySelectorAll('.word'), {
      y: '0%', duration: 0.9, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  // --- Stat counters ---
  document.querySelectorAll('.counter-target').forEach(el => {
    const target = parseFloat(el.getAttribute('data-target'));
    const decimals = parseInt(el.getAttribute('data-decimals') || '0');
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: () => { el.textContent = obj.val.toFixed(decimals); }
    });
  });

  // --- Skill chips ---
  gsap.set('.skill-chip', { opacity: 0, y: 20 });
  gsap.to('.skill-chip', {
    opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out',
    scrollTrigger: { trigger: '.skills-wrapper', start: 'top 80%' }
  });

  // --- Section labels & headings fade in ---
  gsap.set('.section-label', { opacity: 0, y: 15 });
  gsap.to('.section-label', {
    opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
    scrollTrigger: { trigger: '.section-label', start: 'top 85%' }
  });

  // --- Project cards ---
  gsap.set('.project-card', { opacity: 0, y: 40 });
  gsap.to('.project-card', {
    opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: '.projects-grid', start: 'top 80%' }
  });

  // --- Timeline line ---
  gsap.to('#timeline-progress', {
    height: '100%', ease: 'none',
    scrollTrigger: {
      trigger: '.edu-timeline',
      start: 'top 75%', end: 'bottom 60%',
      scrub: 1
    }
  });

  // --- Timeline items ---
  gsap.set('.timeline-item', { opacity: 0, x: -30 });
  gsap.to('.timeline-item', {
    opacity: 1, x: 0, duration: 0.7, stagger: 0.25, ease: 'power2.out',
    scrollTrigger: { trigger: '.edu-timeline', start: 'top 80%' }
  });

  // --- Cert cards ---
  gsap.set('.cert-card', { opacity: 0, y: 20 });
  gsap.to('.cert-card', {
    opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out',
    scrollTrigger: { trigger: '.certs-grid', start: 'top 85%' }
  });

  // --- Achievement cards ---
  gsap.set('.achievement-card', { opacity: 0, scale: 0.92 });
  gsap.to('.achievement-card', {
    opacity: 1, scale: 1, duration: 0.8, stagger: 0.2, ease: 'back.out(1.4)',
    scrollTrigger: { trigger: '.achievements-grid', start: 'top 80%' }
  });

  // --- Contact heading char reveal (both lines) ---
  document.querySelectorAll('.split-chars').forEach((el, i) => {
    el.innerHTML = el.textContent.split('').map(c =>
      c === ' ' ? '<span style="display:inline-block;width:0.3em;"> </span>' : `<span style="display:inline-block;">${c}</span>`
    ).join('');
    gsap.set(el.querySelectorAll('span'), { opacity: 0, y: 20 });
    gsap.to(el.querySelectorAll('span'), {
      opacity: 1, y: 0, duration: 0.5, stagger: 0.025, ease: 'power2.out',
      scrollTrigger: { trigger: el.closest('.contact-heading') || el, start: 'top 85%' },
      delay: i * 0.15
    });
  });

  // --- Contact rows ---
  gsap.set('.contact-row', { opacity: 0, x: -20 });
  gsap.to('.contact-row', {
    opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
    scrollTrigger: { trigger: '.contact-links', start: 'top 85%' }
  });

  // --- About text ---
  gsap.set('.about-text', { opacity: 0, y: 20 });
  gsap.to('.about-text', {
    opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '.about-text', start: 'top 85%' }
  });

  // --- Stat items ---
  gsap.set('.stat-item', { opacity: 0, y: 30 });
  gsap.to('.stat-item', {
    opacity: 1, y: 0, duration: 0.7, stagger: 0.2, ease: 'power2.out',
    scrollTrigger: { trigger: '.about-stats', start: 'top 80%' }
  });

  // Photo reveal
  gsap.set('.about-photo-wrap', { opacity: 0, x: 40 });
  gsap.to('.about-photo-wrap', {
    opacity: 1, x: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.about-grid', start: 'top 75%' }
  });
}
