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
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
}
document.addEventListener('click', event => {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor) return;
  const hash = anchor.getAttribute('href');
  if (!hash || !document.getElementById(decodeURIComponent(hash.slice(1)))) return;
  event.preventDefault();
  history.pushState(null, '', hash);
  scrollToPageSection(hash);
});
window.addEventListener('hashchange', () => scrollToPageSection(window.location.hash));
if (window.location.hash) setTimeout(() => scrollToPageSection(window.location.hash), 50);

// scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));


// Client review rotator.
let tIndex = 0;
const tQuote = document.getElementById('tQuote');
const tWho = document.getElementById('tWho');
const tImage = document.getElementById('tImage');
const tImageButton = document.getElementById('tImageButton');
const tAvatar = document.getElementById('tAvatar');
const tName = document.getElementById('tName');
const tJob = document.getElementById('tJob');
const dots = document.querySelectorAll('#tDots button');
const tCard = document.getElementById('tCard');
let reviewTimer;
let reviewStartX = 0;
let reviewDeltaX = 0;
let reviewPointerId = null;
let reviewDragging = false;
let reviewAnimating = false;

function setReviewDragVisuals(deltaX) {
  const progress = Math.min(Math.abs(deltaX) / 150, 1);
  const direction = deltaX === 0 ? 0 : (deltaX > 0 ? 1 : -1);
  const dragX = Math.max(-132, Math.min(132, deltaX * 0.55));
  const rotate = dragX * 0.018;
  const scale = 1 - (progress * 0.018);
  tCard.style.setProperty('--review-drag-progress', progress.toFixed(3));
  tCard.style.setProperty('--review-drag-direction', String(direction));
  tCard.style.setProperty('--review-glow-position', direction > 0 ? '92%' : direction < 0 ? '8%' : '50%');
  tCard.style.setProperty('--review-glow-scale', (1 + (progress * 0.045)).toFixed(3));
  tCard.style.setProperty('--review-drag-edge', `${direction * 34}%`);
  tCard.style.setProperty('--review-bar-scale', (0.24 + (progress * 0.76)).toFixed(3));
  tCard.style.transform = `translateX(${dragX}px) rotate(${rotate}deg) scale(${scale})`;
}

function resetReviewDragVisuals() {
  tCard.style.removeProperty('--review-drag-progress');
  tCard.style.removeProperty('--review-drag-direction');
  tCard.style.removeProperty('--review-glow-position');
  tCard.style.removeProperty('--review-glow-scale');
  tCard.style.removeProperty('--review-drag-edge');
  tCard.style.removeProperty('--review-bar-scale');
  tCard.style.transform = '';
}

function getReviewList() {
  return TESTIMONIALS_I18N[currentLang] || TESTIMONIALS_I18N.en;
}

function showTestimonial(i) {
  const list = getReviewList();
  const safeIndex = (i + list.length) % list.length;
  const item = list[safeIndex];
  tIndex = safeIndex;
  tQuote.textContent = item.q;
  tWho.textContent = item.w;
  tImage.setAttribute('src', item.img);
  tImage.setAttribute('alt', item.alt);
  tAvatar.textContent = item.avatar;
  tName.innerHTML = item.name;
  tJob.textContent = item.job;
  dots.forEach(d => d.classList.toggle('active', Number(d.dataset.i) === safeIndex));
}

function animateTestimonialChange(nextIndex, direction = 1) {
  const list = TESTIMONIALS_I18N[currentLang] || TESTIMONIALS_I18N.en;
  const safeIndex = (nextIndex + list.length) % list.length;
  if (safeIndex === tIndex || reviewAnimating) return;
  reviewAnimating = true;
  tCard.classList.add(direction > 0 ? 'is-changing-next' : 'is-changing-prev');
  window.setTimeout(() => {
    showTestimonial(safeIndex);
    tCard.classList.remove('is-changing-next', 'is-changing-prev');
    tCard.classList.add('is-arriving');
    window.setTimeout(() => {
      tCard.classList.remove('is-arriving');
      reviewAnimating = false;
    }, 220);
  }, 130);
}

function restartReviewTimer() {
  window.clearInterval(reviewTimer);
  reviewTimer = window.setInterval(() => animateTestimonialChange(tIndex + 1, 1), 6500);
}

function goToTestimonial(index, direction) {
  animateTestimonialChange(index, direction);
  restartReviewTimer();
}

dots.forEach(d => d.addEventListener('click', () => {
  const nextIndex = Number(d.dataset.i);
  goToTestimonial(nextIndex, nextIndex > tIndex ? 1 : -1);
}));

if (tCard) {
  tCard.addEventListener('pointerdown', event => {
    if (reviewAnimating || event.target.closest('button, a')) return;
    reviewPointerId = event.pointerId;
    reviewStartX = event.clientX;
    reviewDeltaX = 0;
    reviewDragging = true;
    window.clearInterval(reviewTimer);
    tCard.classList.add('is-dragging');
    setReviewDragVisuals(0);
    tCard.setPointerCapture(event.pointerId);
  });

  tCard.addEventListener('pointermove', event => {
    if (!reviewDragging || event.pointerId !== reviewPointerId) return;
    reviewDeltaX = event.clientX - reviewStartX;
    setReviewDragVisuals(reviewDeltaX);
  });

  function finishReviewDrag(event) {
    if (!reviewDragging || event.pointerId !== reviewPointerId) return;
    reviewDragging = false;
    reviewPointerId = null;
    tCard.classList.remove('is-dragging');
    if (Math.abs(reviewDeltaX) > 58) {
      const direction = reviewDeltaX < 0 ? 1 : -1;
      tCard.classList.add(direction > 0 ? 'is-snap-next' : 'is-snap-prev');
      resetReviewDragVisuals();
      window.setTimeout(() => {
        tCard.classList.remove('is-snap-next', 'is-snap-prev');
        goToTestimonial(tIndex + direction, direction);
      }, 110);
    } else {
      tCard.classList.add('is-rebounding');
      resetReviewDragVisuals();
      window.setTimeout(() => tCard.classList.remove('is-rebounding'), 260);
      restartReviewTimer();
    }
    reviewDeltaX = 0;
  }

  tCard.addEventListener('pointerup', finishReviewDrag);
  tCard.addEventListener('pointercancel', finishReviewDrag);
}

showTestimonial(0);
restartReviewTimer();

const imageLightbox = document.getElementById('imageLightbox');
const imageLightboxImg = document.getElementById('ilImage');
const imageLightboxCaption = document.getElementById('ilCaption');
const imageLightboxClose = document.getElementById('ilClose');
const imageLightboxPrev = document.getElementById('ilPrev');
const imageLightboxNext = document.getElementById('ilNext');
let lightboxItems = [];
let lightboxIndex = 0;
let lightboxTouchStartX = 0;

function setLightboxImage(item) {
  if (!item) return;
  imageLightboxImg.setAttribute('src', item.img);
  imageLightboxImg.setAttribute('alt', item.alt);
  imageLightboxCaption.textContent = item.job;
}

function openImageLightbox(item, items, index = 0) {
  if (!item) item = (TESTIMONIALS_I18N[currentLang] || TESTIMONIALS_I18N.en)[tIndex];
  lightboxItems = items && items.length ? items : [item];
  lightboxIndex = Math.max(0, index);
  setLightboxImage(lightboxItems[lightboxIndex]);
  const hasMultiple = lightboxItems.length > 1;
  imageLightboxPrev.hidden = !hasMultiple;
  imageLightboxNext.hidden = !hasMultiple;
  imageLightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showLightboxStep(step) {
  if (!lightboxItems.length) return;
  lightboxIndex = (lightboxIndex + step + lightboxItems.length) % lightboxItems.length;
  imageLightboxImg.classList.add('is-changing');
  setTimeout(() => {
    setLightboxImage(lightboxItems[lightboxIndex]);
    imageLightboxImg.classList.remove('is-changing');
  }, 120);
}

function closeImageLightbox() {
  imageLightbox.classList.remove('open');
  imageLightboxImg.setAttribute('src', '');
  document.body.style.overflow = '';
}
tImageButton.addEventListener('click', () => openImageLightbox());
imageLightboxClose.addEventListener('click', closeImageLightbox);
imageLightbox.addEventListener('click', e => { if (e.target === imageLightbox) closeImageLightbox(); });
imageLightboxPrev.addEventListener('click', () => showLightboxStep(-1));
imageLightboxNext.addEventListener('click', () => showLightboxStep(1));
imageLightbox.addEventListener('touchstart', event => {
  lightboxTouchStartX = event.changedTouches[0]?.clientX || 0;
}, { passive: true });
imageLightbox.addEventListener('touchend', event => {
  const endX = event.changedTouches[0]?.clientX || 0;
  const deltaX = endX - lightboxTouchStartX;
  if (Math.abs(deltaX) < 45 || lightboxItems.length < 2) return;
  showLightboxStep(deltaX < 0 ? 1 : -1);
}, { passive: true });

const galleryTiles = Array.from(document.querySelectorAll('.gallery-grid [data-gallery-src]'));
const galleryItems = galleryTiles.map(tile => ({
  img: tile.dataset.gallerySrc,
  alt: tile.getAttribute('aria-label') || tile.dataset.galleryCaption || 'Project gallery image',
  job: tile.dataset.galleryCaption || ''
}));

galleryTiles.forEach((tile, index) => {
  function openGalleryImage() {
    openImageLightbox(galleryItems[index], galleryItems, index);
  }
  tile.addEventListener('click', openGalleryImage);
  tile.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openGalleryImage();
    }
  });
});

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
const fieldLabelKeys = {
  name: 'form.name',
  phone: 'form.phone',
  email: 'form.email',
  service: 'form.service',
  details: 'form.details'
};

photoList.className = 'photo-list';
photoList.setAttribute('aria-live', 'polite');
photoStatus?.insertAdjacentElement('afterend', photoList);

function formText(key, fallback) {
  return (typeof I18N !== 'undefined' && I18N[currentLang] && I18N[currentLang][key]) || fallback;
}

function plainFormText(key, fallback) {
  const holder = document.createElement('span');
  holder.innerHTML = formText(key, fallback);
  return holder.textContent.trim();
}

function getFieldName(field) {
  const key = fieldLabelKeys[field.name] || fieldLabelKeys[field.id];
  if (key) return plainFormText(key, field.name || field.id);
  return field.name || field.id || 'Field';
}

function getFieldContainer(field) {
  return field.closest('.field') || field.closest('.consent-row') || field.parentElement;
}

function getFieldErrorElement(field) {
  const container = getFieldContainer(field);
  if (!container) return null;
  const errorId = `${field.id || field.name}-error`;
  let error = container.querySelector(`#${errorId}`);
  if (!error) {
    error = document.createElement('span');
    error.id = errorId;
    error.className = 'field-error-message';
    error.setAttribute('aria-live', 'polite');
    container.append(error);
  }
  return error;
}

function setFieldError(field, message) {
  const container = getFieldContainer(field);
  const error = getFieldErrorElement(field);
  if (!container || !error) return;
  container.classList.toggle('field-error', Boolean(message));
  if (message) {
    error.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', error.id);
  } else {
    error.textContent = '';
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  }
}

function getFieldErrorMessage(field) {
  if (field.type === 'checkbox' && !field.checked) {
    return formText('form.requiredConsent', 'Please agree before sending the request.');
  }
  if (field.validity.valueMissing) {
    return formText('form.requiredField', '{field} is required.').replace('{field}', getFieldName(field));
  }
  if (field.type === 'email' && field.validity.typeMismatch) {
    return formText('form.invalidEmail', 'Enter a valid email address.');
  }
  return '';
}

function validateRequiredFields({ focusFirst = false } = {}) {
  const fields = Array.from(form.querySelectorAll('[required]'));
  let firstInvalidField = null;

  fields.forEach(field => {
    const message = getFieldErrorMessage(field);
    setFieldError(field, message);
    if (message && !firstInvalidField) firstInvalidField = field;
  });

  if (firstInvalidField && focusFirst) {
    const headerOffset = (document.querySelector('header')?.offsetHeight || 0) + 18;
    const top = firstInvalidField.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    firstInvalidField.focus({ preventScroll: true });
  }

  return !firstInvalidField;
}

function clearRequiredFieldErrors() {
  form.querySelectorAll('[required]').forEach(field => setFieldError(field, ''));
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

form.querySelectorAll('[required]').forEach(field => {
  const eventName = field.tagName === 'SELECT' || field.type === 'checkbox' ? 'change' : 'input';
  field.addEventListener(eventName, () => {
    setFieldError(field, getFieldErrorMessage(field));
  });
});

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!validateRequiredFields({ focusFirst: true })) {
    setFormNote('error', formText('form.validationTitle', 'Please complete the required fields'), formText('form.validationDetail', 'Check the highlighted field and try again.'));
    return;
  }

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
    clearRequiredFieldErrors();
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
  if (!imageLightbox.classList.contains('open')) return;
  if (e.key === 'ArrowRight') showLightboxStep(1);
  if (e.key === 'ArrowLeft') showLightboxStep(-1);
});
