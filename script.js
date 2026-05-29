// ══════════════════════════════
// HAMBURGER MENU
// ══════════════════════════════
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
function closeMenu() {
  mobileMenu.classList.remove('open');
}

// ══════════════════════════════
// NAVBAR — chowa się po scrollu w dół, wraca w górę
// ══════════════════════════════
const mainNav = document.getElementById('mainNav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const current = window.scrollY;

  if (current <= 10) {
    mainNav.classList.remove('nav-hidden');
  } else if (current > lastScroll) {
    mainNav.classList.add('nav-hidden');
    mobileMenu.classList.remove('open');
  } else {
    mainNav.classList.remove('nav-hidden');
  }

  mainNav.classList.toggle('scrolled', current > 40);
  lastScroll = current;
});

// ══════════════════════════════
// FILTROWANIE KATEGORII
// ══════════════════════════════
function filterCat(el, cat) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');

  document.querySelectorAll('#kolekcjaGrid .product-card').forEach(card => {
    if (cat === 'wszystkie') {
      card.style.display = '';
    } else {
      const cats = card.dataset.cat.split(' ');
      card.style.display = cats.includes(cat) ? '' : 'none';
    }
  });
}

// ══════════════════════════════
// LICZNIK KLIENTEK
// ══════════════════════════════
const counterEl = document.querySelector('.sp-text');
if (counterEl) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let count = 0;
        const interval = setInterval(() => {
          count += 4;
          if (count >= 200) {
            count = 200;
            clearInterval(interval);
          }
          counterEl.textContent = `Ponad ${count} zadowolonych klientek z Lublina i okolic`;
        }, 20);
        counterObserver.unobserve(entry.target);
      }
    });
  });
  counterObserver.observe(counterEl);
}

// ══════════════════════════════
// WARIANTY KOLORÓW
// Klik na dot → zmień zdjęcie + zaznacz dot
// NIE triggeruje lightboxa ani overlaya
// ══════════════════════════════
document.querySelectorAll('.color-picker').forEach(picker => {
  picker.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation(); // blokuj propagację do product-img
      const card = dot.closest('.product-card');
      const variant = dot.dataset.variant;

      picker.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');

      card.querySelectorAll('.variant-img').forEach(img => {
        img.classList.toggle('active', img.dataset.variant === variant);
      });
    });
  });
});

// ══════════════════════════════
// LIGHTBOX — powiększanie zdjęć
// ══════════════════════════════
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxName = document.getElementById('lightboxName');

function openLightbox(imgWrap) {
  const activeImg = imgWrap.querySelector('.variant-img.active') || imgWrap.querySelector('img');
  if (!activeImg) return;

  const card = imgWrap.closest('.product-card');
  const name = card.querySelector('.product-name')?.textContent || '';

  lightboxImg.src = activeImg.src;
  lightboxImg.alt = activeImg.alt;
  lightboxName.textContent = name;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════════════════════════
// MOBILE OVERLAY — panel zamówienia
// Pojawia się tylko po long press (500ms)
// ══════════════════════════════
function showMobileOverlay(imgWrap) {
  const overlay = imgWrap.querySelector('.product-overlay');
  if (!overlay) return;

  // Jeśli już widoczny — schowaj (toggle)
  if (overlay.classList.contains('mobile-visible')) {
    overlay.classList.remove('mobile-visible');
    return;
  }

  // Schowaj wszystkie inne overlay
  document.querySelectorAll('.product-overlay.mobile-visible').forEach(o => {
    o.classList.remove('mobile-visible');
  });

  overlay.classList.add('mobile-visible');

  // Auto-schowaj po 4 sekundach
  setTimeout(() => {
    overlay.classList.remove('mobile-visible');
  }, 4000);
}

// ══════════════════════════════
// WYKRYWANIE MOBILE
// ══════════════════════════════
function isMobile() {
  return window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
}

// ══════════════════════════════
// OBSŁUGA DOTYKU I KLIKU NA ZDJĘCIA
// Desktop: hover pokazuje overlay, klik → lightbox
// Mobile:  krótki tap → lightbox, long press → overlay
// ══════════════════════════════
document.querySelectorAll('.product-img').forEach(imgWrap => {

  if (!isMobile()) {
    // ── DESKTOP ──────────────────
    // Hover w CSS już pokazuje overlay
    // Klik → lightbox
    imgWrap.addEventListener('click', (e) => {
      if (e.target.closest('.ov-btn') || e.target.closest('.color-dot')) return;
      openLightbox(imgWrap);
    });

  } else {
    // ── MOBILE ───────────────────
    let longPressTimer = null;
    let longPressFired = false;
    let touchStartX = 0;
    let touchStartY = 0;

    imgWrap.addEventListener('touchstart', (e) => {
      // Ignoruj kliknięcia w przyciski overlay i color-dot
      if (e.target.closest('.ov-btn') || e.target.closest('.color-dot')) return;

      longPressFired = false;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;

      longPressTimer = setTimeout(() => {
        longPressFired = true;
        // Wibracja (jeśli dostępna)
        if (navigator.vibrate) navigator.vibrate(40);
        showMobileOverlay(imgWrap);
      }, 500);
    }, { passive: true });

    imgWrap.addEventListener('touchmove', (e) => {
      // Jeśli użytkownik przesuwa palec — anuluj long press
      const dx = Math.abs(e.touches[0].clientX - touchStartX);
      const dy = Math.abs(e.touches[0].clientY - touchStartY);
      if (dx > 8 || dy > 8) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }, { passive: true });

    imgWrap.addEventListener('touchend', (e) => {
      clearTimeout(longPressTimer);

      // Jeśli to był long press — nie rób nic więcej
      if (longPressFired) {
        longPressFired = false;
        return;
      }

      // Ignoruj kliknięcia w przyciski overlay i color-dot
      if (e.target.closest('.ov-btn') || e.target.closest('.color-dot')) return;

      // Krótki tap → lightbox
      openLightbox(imgWrap);
    });

    // Zablokuj context menu (long press na obrazku w przeglądarce)
    imgWrap.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
});

// Zamknij overlay gdy kliknie się poza nim (mobile)
document.addEventListener('touchstart', (e) => {
  if (!e.target.closest('.product-img')) {
    document.querySelectorAll('.product-overlay.mobile-visible').forEach(o => {
      o.classList.remove('mobile-visible');
    });
  }
}, { passive: true });

// ── LIGHTBOX — zamykanie ──────
lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ══════════════════════════════
// FADE-IN PRZY SCROLLU
// ══════════════════════════════
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => fadeObserver.observe(el));