let currentLang = document.documentElement.lang === 'es' ? 'es' : 'en';

function applyLanguage(lang) {
  currentLang = lang;
  const dict = I18N[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });
  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.setAttribute('data-active', lang);
  const nextLang = lang === 'es' ? 'en' : 'es';
  document.querySelectorAll('[data-language-link]').forEach(link => {
    link.setAttribute('href', nextLang === 'es' ? '/es/' : '/');
    link.setAttribute('lang', nextLang);
    link.setAttribute('aria-label', nextLang === 'es' ? 'Ver el sitio en español' : 'View the site in English');
    if (!link.classList.contains('lang-toggle')) link.textContent = nextLang === 'es' ? 'Español' : 'English';
  });
  const serviceAreasLink = document.getElementById('serviceAreasLink');
  if (serviceAreasLink) serviceAreasLink.setAttribute('href', lang === 'es' ? '/es/areas-de-servicio/' : '/service-areas/');
  const serviceRoutes = lang === 'es'
    ? ['/es/instalacion-drywall/', '/es/acabado-drywall/', '/es/reparacion-drywall/', '/es/framing-interior/', '/es/pintura/', '/es/instalacion-frp/']
    : ['/drywall-installation/', '/drywall-taping-finishing/', '/drywall-repair/', '/interior-framing/', '/painting/', '/frp-installation/'];
  document.querySelectorAll('a[data-i18n^="services.t"]').forEach((link, index) => {
    if (serviceRoutes[index % serviceRoutes.length]) link.setAttribute('href', serviceRoutes[index % serviceRoutes.length]);
  });
  const formLanguage = document.getElementById('formLanguage');
  if (formLanguage) formLanguage.value = lang === 'es' ? 'Spanish' : 'English';
  // the open FAQ answer just got new (possibly longer/shorter) text — resize it
  if (typeof faqItems !== 'undefined') {
    requestAnimationFrame(() => faqItems.forEach(setFaqHeight));
  }
}

// language toast (subtle, non-blocking)
const langToast = document.getElementById('langToast');
const langToastClose = document.getElementById('langToastClose');
const langToastStorageKey = 'tci_language_choice';
const langToastDismissedKey = 'tci_language_toast_dismissed';
function hideLanguageToast(persist = false) {
  if (!langToast) return;
  langToast.classList.remove('show');
  langToast.classList.add('hidden');
  if (persist) localStorage.setItem(langToastDismissedKey, '1');
}
document.querySelectorAll('.lang-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedLang = btn.dataset.lang === 'es' ? 'es' : 'en';
    localStorage.setItem(langToastStorageKey, selectedLang);
    hideLanguageToast();
    window.location.href = selectedLang === 'es' ? '/es/' : '/';
  });
});
document.querySelectorAll('[data-language-link]').forEach(link => {
  link.addEventListener('click', () => {
    const targetLang = link.getAttribute('lang') === 'es' ? 'es' : 'en';
    localStorage.setItem(langToastStorageKey, targetLang);
    hideLanguageToast();
  });
});
if (langToastClose) {
  langToastClose.addEventListener('click', () => hideLanguageToast(true));
}
if (langToast && !localStorage.getItem(langToastStorageKey) && !localStorage.getItem(langToastDismissedKey)) {
  setTimeout(() => { langToast.classList.add('show'); }, 900);
}

// scroll progress bar + header shrink
const progressFill = document.getElementById('progressFill');
const headerEl = document.querySelector('header');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressFill.style.width = scrolled + '%';
  headerEl.classList.toggle('scrolled', h.scrollTop > 40);
}, { passive: true });

// count-up stats
const counters = document.querySelectorAll('[data-count]');
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1100;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterIO.unobserve(el);
  });
}, { threshold: 0.6 });
counters.forEach(c => counterIO.observe(c));


// faq accordion — height is measured from real content, so it never clips
// (fixes the layout breaking when Spanish text runs longer than English)
function setFaqHeight(item) {
  const a = item.querySelector('.faq-a');
  a.style.maxHeight = item.classList.contains('open') ? (a.scrollHeight + 'px') : '0px';
}
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
  const q = item.querySelector('.faq-q');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    faqItems.forEach(i => { i.classList.remove('open'); i.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); setFaqHeight(i); });
    if (!isOpen) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
    setFaqHeight(item);
  });
  setFaqHeight(item); // initial state (first item starts open)
});
applyLanguage(currentLang);
// recalc if the viewport is resized (text reflows to more/fewer lines)
let faqResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(faqResizeTimer);
  faqResizeTimer = setTimeout(() => faqItems.forEach(setFaqHeight), 150);
});

// mobile nav
const menuToggle = document.getElementById('menuToggle');
const menuClose = document.getElementById('menuClose');
const mobileNav = document.getElementById('mobileNav');
menuToggle.addEventListener('click', () => { mobileNav.classList.add('open'); menuToggle.setAttribute('aria-expanded', 'true'); });
menuClose.addEventListener('click', () => { mobileNav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); });
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

// Reliable in-page navigation with an offset for the sticky header.
function scrollToPageSection(hash) {
  if (!hash || hash === '#') return;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;
  const headerOffset = (document.querySelector('header')?.offsetHeight || 0) + 8;
  target.scrollIntoView({ block: 'start' });
  window.scrollBy(0, -headerOffset);
}
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', event => {
    const hash = anchor.getAttribute('href');
    if (!hash || !document.getElementById(decodeURIComponent(hash.slice(1)))) return;
    event.preventDefault();
    history.pushState(null, '', hash);
    scrollToPageSection(hash);
  });
});
window.addEventListener('hashchange', () => scrollToPageSection(window.location.hash));
if (window.location.hash) setTimeout(() => scrollToPageSection(window.location.hash), 50);

// scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));


// Review preview rotator. Preview labels stay visible until verified reviews replace this content.
let tIndex = 0;
const tQuote = document.getElementById('tQuote');
const tWho = document.getElementById('tWho');
const tImage = document.getElementById('tImage');
const tImageButton = document.getElementById('tImageButton');
const tAvatar = document.getElementById('tAvatar');
const tName = document.getElementById('tName');
const tJob = document.getElementById('tJob');
const dots = document.querySelectorAll('#tDots button');
function showTestimonial(i) {
  const list = TESTIMONIALS_I18N[currentLang] || TESTIMONIALS_I18N.en;
  tIndex = i;
  tQuote.textContent = list[i].q;
  tWho.textContent = list[i].w;
  tImage.setAttribute('src', list[i].img);
  tImage.setAttribute('alt', list[i].alt);
  tAvatar.textContent = list[i].avatar;
  tName.innerHTML = list[i].name;
  tJob.textContent = list[i].job;
  dots.forEach(d => d.classList.toggle('active', Number(d.dataset.i) === i));
}
dots.forEach(d => d.addEventListener('click', () => showTestimonial(Number(d.dataset.i))));
showTestimonial(0);
setInterval(() => showTestimonial((tIndex + 1) % (TESTIMONIALS_I18N[currentLang] || TESTIMONIALS_I18N.en).length), 6500);

const imageLightbox = document.getElementById('imageLightbox');
const imageLightboxImg = document.getElementById('ilImage');
const imageLightboxCaption = document.getElementById('ilCaption');
const imageLightboxClose = document.getElementById('ilClose');
function openImageLightbox() {
  const item = (TESTIMONIALS_I18N[currentLang] || TESTIMONIALS_I18N.en)[tIndex];
  imageLightboxImg.setAttribute('src', item.img);
  imageLightboxImg.setAttribute('alt', item.alt);
  imageLightboxCaption.textContent = item.job;
  imageLightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeImageLightbox() {
  imageLightbox.classList.remove('open');
  imageLightboxImg.setAttribute('src', '');
  document.body.style.overflow = '';
}
tImageButton.addEventListener('click', openImageLightbox);
imageLightboxClose.addEventListener('click', closeImageLightbox);
imageLightbox.addEventListener('click', e => { if (e.target === imageLightbox) closeImageLightbox(); });

// Quote form submission through the Cloudflare Pages Function.
const form = document.getElementById('quoteForm');
const note = document.getElementById('formNote');
const projectPhotos = document.getElementById('projectPhotos');
const photoStatus = document.getElementById('photoStatus');
const photoUpload = projectPhotos?.closest('.photo-upload');
const photoUploadIcon = photoUpload?.querySelector('.photo-upload-icon');
const photoUploadTitle = photoUpload?.querySelector('.photo-upload-copy strong');
const photoUploadHint = photoUpload?.querySelector('.photo-upload-copy small');
const photoList = document.createElement('div');
const maxPhotoBytes = 8 * 1024 * 1024;
const allowedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp'];
let selectedPhotoFiles = [];

photoList.className = 'photo-list';
photoList.setAttribute('aria-live', 'polite');
photoStatus?.insertAdjacentElement('afterend', photoList);

function formText(key, fallback) {
  return (window.I18N && I18N[currentLang] && I18N[currentLang][key]) || fallback;
}

function photoKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function mergePhotoFiles(existingFiles, newFiles) {
  const seen = new Set(existingFiles.map(photoKey));
  const merged = [...existingFiles];
  newFiles.forEach(file => {
    const key = photoKey(file);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(file);
    }
  });
  return merged;
}

function syncPhotoInputFiles() {
  const transfer = new DataTransfer();
  selectedPhotoFiles.forEach(file => transfer.items.add(file));
  projectPhotos.files = transfer.files;
}

function renderPhotoList(files) {
  photoList.replaceChildren();
  if (!files.length) return;

  files.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'photo-list-item';

    const name = document.createElement('span');
    name.className = 'photo-list-name';
    name.textContent = file.name || formText('form.photoFallbackName', 'Project photo');

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'photo-list-remove';
    remove.setAttribute('aria-label', formText('form.photoRemove', 'Remove photo'));
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      selectedPhotoFiles.splice(index, 1);
      syncPhotoInputFiles();
      validatePhotos();
    });

    item.append(name, remove);
    photoList.append(item);
  });
}

function resetPhotoUploadCopy() {
  if (photoUploadIcon) photoUploadIcon.textContent = '+';
  if (photoUploadTitle) photoUploadTitle.textContent = formText('form.photoButton', 'Upload photos');
  if (photoUploadHint) photoUploadHint.textContent = formText('form.photoHint', 'Select clear project images');
}

function updatePhotoUploadUI(files, message) {
  if (!photoUpload) return;
  photoUpload.classList.toggle('has-files', files.length > 0 && !message);
  photoUpload.classList.toggle('has-error', Boolean(message));

  if (message) {
    if (photoUploadIcon) photoUploadIcon.textContent = '!';
    if (photoUploadTitle) photoUploadTitle.textContent = formText('form.photoProblemTitle', 'Check your photos');
    if (photoUploadHint) photoUploadHint.textContent = message;
    return;
  }

  if (!files.length) {
    resetPhotoUploadCopy();
    return;
  }

  const firstName = files[0].name || formText('form.photoFallbackName', 'Project photo');
  const extraCount = files.length - 1;
  if (photoUploadIcon) photoUploadIcon.textContent = '✓';
  if (photoUploadTitle) {
    photoUploadTitle.textContent = files.length === 1
      ? formText('form.photoSelectedSingular', '1 photo selected')
      : formText('form.photoSelectedPlural', '{count} photos selected').replace('{count}', files.length);
  }
  if (photoUploadHint) {
    photoUploadHint.textContent = extraCount > 0
      ? `${firstName} + ${extraCount} ${extraCount === 1 ? formText('form.photoMoreSingular', 'more') : formText('form.photoMorePlural', 'more')}`
      : firstName;
  }
}

function setFormNote(type, title, detail) {
  note.className = `form-note status-message ${type}`;
  note.innerHTML = `<strong>${title}</strong><span>${detail}</span>`;
}

function validatePhotos() {
  const files = Array.from(projectPhotos.files || []);
  const oversized = files.some(file => file.size > maxPhotoBytes);
  const invalidType = files.some(file => !allowedPhotoTypes.includes(file.type));
  let message = '';
  if (files.length > 3) message = formText('form.photoCountError', 'Please choose no more than 3 photos.');
  else if (oversized) message = formText('form.photoSizeError', 'Each photo must be 8 MB or smaller.');
  else if (invalidType) message = formText('form.photoTypeError', 'Only JPG, PNG and WebP images are accepted.');
  projectPhotos.setCustomValidity(message);
  photoStatus.textContent = message || (files.length ? formText('form.photoAttachNote', 'Photos will be attached when you send the request.') : '');
  photoStatus.classList.toggle('error', Boolean(message));
  updatePhotoUploadUI(files, message);
  renderPhotoList(files);
  return !message;
}
projectPhotos.addEventListener('change', () => {
  selectedPhotoFiles = mergePhotoFiles(selectedPhotoFiles, Array.from(projectPhotos.files || []));
  syncPhotoInputFiles();
  validatePhotos();
});
form.addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!validatePhotos()) {
    projectPhotos.reportValidity();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = formText('form.sending', 'Sending your request...');
  setFormNote('sending', formText('form.sendingTitle', 'Sending request'), formText('form.sendingDetail', 'Please wait while we send your project details.'));

  try {
    const response = await fetch(form.getAttribute('action') || '/api/contact', {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) throw new Error('Request failed');

    form.reset();
    selectedPhotoFiles = [];
    syncPhotoInputFiles();
    const formLanguage = document.getElementById('formLanguage');
    if (formLanguage) formLanguage.value = currentLang === 'es' ? 'Spanish' : 'English';
    validatePhotos();
    resetPhotoUploadCopy();
    setFormNote('success', formText('form.successTitle', 'Request sent successfully'), formText('form.successDetail', 'We received your quote request and will reply within 1-2 business days.'));
  } catch (error) {
    setFormNote('error', formText('form.errorTitle', 'Request not sent'), formText('form.errorDetail', 'Please call or text (708) 983-8587 and we will help you directly.'));
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

// TikTok-style video cards: click a thumbnail to open the big lightbox player.
// Since playback only happens inside the lightbox (a fixed overlay that blocks
// the rest of the page), there's no way for a clip to keep playing in the
// background while you've scrolled off somewhere else on the site — closing
// the lightbox stops it instantly, and it can't be left open while browsing.
const videoCards = document.querySelectorAll('[data-tt-video]');
const lightbox = document.getElementById('videoLightbox');
const lightboxVideo = document.getElementById('vlVideo');
const lightboxSource = document.getElementById('vlSource');
const lightboxClose = document.getElementById('vlClose');

function openLightbox(src, poster) {
  lightboxSource.setAttribute('src', src);
  lightboxVideo.setAttribute('poster', poster);
  lightboxVideo.load();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxVideo.play().catch(() => { });
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxVideo.pause();
  lightboxVideo.currentTime = 0;
  document.body.style.overflow = '';
}
videoCards.forEach(card => {
  card.addEventListener('click', () => {
    openLightbox(card.dataset.src, card.dataset.poster);
  });
});
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  if (e.key === 'Escape' && imageLightbox.classList.contains('open')) closeImageLightbox();
});
