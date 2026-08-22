const photos = document.getElementById('photos');
const photoStatus = document.getElementById('photoStatus');
const form = document.getElementById('quoteFormEs');
const submitButton = form.querySelector('button[type="submit"]');
const photoUpload = photos?.closest('.photo-upload');
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
    name.textContent = file.name || 'Foto del proyecto';

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'photo-list-remove';
    remove.setAttribute('aria-label', 'Quitar foto');
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
  if (photoUploadTitle) photoUploadTitle.textContent = 'Subir fotos';
  if (photoUploadHint) photoUploadHint.textContent = 'Selecciona imágenes claras del proyecto';
}

function updatePhotoUploadUI(files, message) {
  if (!photoUpload) return;
  photoUpload.classList.toggle('has-files', files.length > 0 && !message);
  photoUpload.classList.toggle('has-error', Boolean(message));

  if (message) {
    if (photoUploadIcon) photoUploadIcon.textContent = '!';
    if (photoUploadTitle) photoUploadTitle.textContent = 'Revisa tus fotos';
    if (photoUploadHint) photoUploadHint.textContent = message;
    return;
  }

  if (!files.length) {
    resetPhotoUploadCopy();
    return;
  }

  const firstName = files[0].name || 'Foto del proyecto';
  const extraCount = files.length - 1;
  if (photoUploadIcon) photoUploadIcon.textContent = '✓';
  if (photoUploadTitle) photoUploadTitle.textContent = files.length === 1 ? '1 foto seleccionada' : `${files.length} fotos seleccionadas`;
  if (photoUploadHint) photoUploadHint.textContent = extraCount > 0 ? `${firstName} + ${extraCount} más` : firstName;
}

function validatePhotos() {
  const files = [...(photos.files || [])];
  let message = '';
  if (files.length > 3) message = 'Selecciona un máximo de 3 fotos.';
  else if (files.some(file => file.size > maxPhotoBytes)) message = 'Cada foto debe pesar 8 MB o menos.';
  else if (files.some(file => !allowedPhotoTypes.includes(file.type))) message = 'Solo se aceptan imágenes JPG, PNG o WebP.';
  photos.setCustomValidity(message);
  photoStatus.textContent = message || (files.length ? 'Las fotos se adjuntarán al enviar la solicitud.' : 'Hasta 3 fotos; máximo 8 MB por foto.');
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
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!validatePhotos()) {
    photos.reportValidity();
    return;
  }

  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando...';
  photoStatus.classList.remove('error', 'success');
  photoStatus.classList.add('sending');
  photoStatus.innerHTML = '<strong>Enviando solicitud.</strong><span>Espera un momento mientras enviamos los detalles del proyecto.</span>';

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
    validatePhotos();
    resetPhotoUploadCopy();
    photoStatus.classList.remove('sending', 'error');
    photoStatus.classList.add('success');
    photoStatus.innerHTML = '<strong>Solicitud enviada correctamente.</strong><span>Recibimos tu solicitud y te responderemos en 1-2 días hábiles.</span>';
  } catch (error) {
    photoStatus.classList.remove('sending', 'success');
    photoStatus.classList.add('error');
    photoStatus.innerHTML = '<strong>No se pudo enviar.</strong><span>Por favor llama o envía mensaje al (708) 983-8587.</span>';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});
