// Standalone quote page form (/quote/ and /es/cotizacion/).
// Text comes from I18N in assets/js/translations.js, so this file has no copy of
// its own to keep in sync. translations.js must be loaded before this script.
const quoteLang = document.documentElement.lang === 'es' ? 'es' : 'en';
const quoteDict = (typeof I18N !== 'undefined' && I18N[quoteLang]) || {};

function t(key, fallback) {
  const value = quoteDict[key];
  return value === undefined ? fallback : value;
}

const photos = document.getElementById('photos');
const photoStatus = document.getElementById('photoStatus');
const form = document.querySelector('form.quote-form');
const submitButton = form.querySelector('button[type="submit"]');
const photoUpload = photos?.closest('.photo-upload');
const photoUploadIcon = photoUpload?.querySelector('.photo-upload-icon');
const photoUploadTitle = photoUpload?.querySelector('.photo-upload-copy strong');
const photoUploadHint = photoUpload?.querySelector('.photo-upload-copy small');
const photoList = document.createElement('div');
const maxPhotoBytes = 8 * 1024 * 1024;
// Se acepta cualquier imagen que el dispositivo reporte como image/*.
// Los iPhone en "Alta eficiencia" entregan image/heic, que antes se rechazaba.
// Cuando el navegador no informa el tipo (pasa en algunos Android y en Windows)
// se cae al respaldo por extension.
const photoExtensionPattern = /\.(jpe?g|png|webp|heic|heif|avif|gif|bmp|tiff?|jfif|dng)$/i;
function isPhotoFile(file) {
  if (file.type) return /^image\//i.test(file.type);
  return photoExtensionPattern.test(file.name || '');
}
let selectedPhotoFiles = [];

photoList.className = 'photo-list';
photoList.setAttribute('aria-live', 'polite');
photoStatus?.insertAdjacentElement('afterend', photoList);

function getFieldContainer(field) {
  return field.closest('.field') || field.closest('.check') || field.parentElement;
}

function getFieldName(field) {
  const label = field.id ? form.querySelector(`label[for="${field.id}"]`) : null;
  return label?.textContent.trim() || field.name || (quoteLang === 'es' ? 'Este campo' : 'This field');
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
  if (field.type === 'checkbox' && !field.checked) return t('form.requiredConsent', 'Please agree before sending the request.');
  if (field.validity.valueMissing) return t('form.requiredField', '{field} is required.').replace('{field}', getFieldName(field));
  if (field.type === 'email' && field.validity.typeMismatch) return t('form.invalidEmail', 'Enter a valid email address.');
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

  if (firstInvalidField && focusFirst) firstInvalidField.focus({ preventScroll: false });
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
  photos.files = transfer.files;
}

function renderPhotoList(files) {
  photoList.replaceChildren();
  if (!files.length) return;

  files.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'photo-list-item';

    const name = document.createElement('span');
    name.className = 'photo-list-name';
    name.textContent = file.name || t('form.photoFallbackName', 'Project photo');

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'photo-list-remove';
    remove.setAttribute('aria-label', t('form.photoRemove', 'Remove photo'));
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
  if (photoUploadTitle) photoUploadTitle.textContent = t('form.photoButton', 'Upload photos');
  if (photoUploadHint) photoUploadHint.textContent = t('form.photoHint', 'Select clear project images');
}

function updatePhotoUploadUI(files, message) {
  if (!photoUpload) return;
  photoUpload.classList.toggle('has-files', files.length > 0 && !message);
  photoUpload.classList.toggle('has-error', Boolean(message));

  if (message) {
    if (photoUploadIcon) photoUploadIcon.textContent = '!';
    if (photoUploadTitle) photoUploadTitle.textContent = t('form.photoProblemTitle', 'Check your photos');
    if (photoUploadHint) photoUploadHint.textContent = message;
    return;
  }

  if (!files.length) {
    resetPhotoUploadCopy();
    return;
  }

  const firstName = files[0].name || t('form.photoFallbackName', 'Project photo');
  const extraCount = files.length - 1;
  if (photoUploadIcon) photoUploadIcon.textContent = '✓';
  if (photoUploadTitle) {
    photoUploadTitle.textContent = files.length === 1
      ? t('form.photoSelectedSingular', '1 photo selected')
      : t('form.photoSelectedPlural', '{count} photos selected').replace('{count}', files.length);
  }
  if (photoUploadHint) {
    const moreLabel = extraCount === 1
      ? t('form.photoMoreSingular', 'more')
      : t('form.photoMorePlural', 'more');
    photoUploadHint.textContent = extraCount > 0 ? `${firstName} + ${extraCount} ${moreLabel}` : firstName;
  }
}

function validatePhotos() {
  const files = [...(photos.files || [])];
  let message = '';
  if (files.length > 3) message = t('form.photoCountError', 'Please choose no more than 3 photos.');
  else if (files.some(file => file.size > maxPhotoBytes)) message = t('form.photoSizeError', 'Each photo must be 8 MB or smaller.');
  else if (files.some(file => !isPhotoFile(file))) message = t('form.photoTypeError', 'Only image files are accepted.');
  photos.setCustomValidity(message);
  photoStatus.textContent = message || (files.length
    ? t('form.photoAttachNote', 'Photos will be attached when you send the request.')
    : t('form.photoHelp', 'Up to 3 photos. Maximum 8 MB each. JPG, PNG or WebP.'));
  photoStatus.classList.remove('success', 'sending');
  photoStatus.classList.toggle('error', Boolean(message));
  updatePhotoUploadUI(files, message);
  renderPhotoList(files);
  return !message;
}
photos.addEventListener('change', () => {
  selectedPhotoFiles = mergePhotoFiles(selectedPhotoFiles, [...(photos.files || [])]);
  syncPhotoInputFiles();
  validatePhotos();
});

form.querySelectorAll('[required]').forEach(field => {
  const eventName = field.tagName === 'SELECT' || field.type === 'checkbox' ? 'change' : 'input';
  field.addEventListener(eventName, () => setFieldError(field, getFieldErrorMessage(field)));
});

function statusMessage(titleKey, titleFallback, detailKey, detailFallback) {
  photoStatus.replaceChildren();
  const title = document.createElement('strong');
  title.textContent = t(titleKey, titleFallback);
  const detail = document.createElement('span');
  detail.textContent = t(detailKey, detailFallback);
  photoStatus.append(title, detail);
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!validateRequiredFields({ focusFirst: true })) {
    photoStatus.classList.remove('sending', 'success');
    photoStatus.classList.add('error');
    statusMessage('form.validationTitle', 'Please complete the required fields',
      'form.validationDetail', 'Check the highlighted field and try again.');
    return;
  }

  if (!validatePhotos()) {
    photos.reportValidity();
    return;
  }

  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = t('form.sending', 'Sending your request...');
  photoStatus.classList.remove('error', 'success');
  photoStatus.classList.add('sending');
  statusMessage('form.sendingTitle', 'Sending request',
    'form.sendingDetail', 'Please wait while we send your project details.');

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
    clearRequiredFieldErrors();
    validatePhotos();
    resetPhotoUploadCopy();
    photoStatus.classList.remove('sending', 'error');
    photoStatus.classList.add('success');
    statusMessage('form.successTitle', 'Request sent successfully',
      'form.successDetail', 'We received your quote request and will reply within 1-2 business days.');
  } catch (error) {
    photoStatus.classList.remove('sending', 'success');
    photoStatus.classList.add('error');
    statusMessage('form.errorTitle', 'Request not sent',
      'form.errorDetail', 'Please call or text (708) 983-8587 and we will help you directly.');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});
