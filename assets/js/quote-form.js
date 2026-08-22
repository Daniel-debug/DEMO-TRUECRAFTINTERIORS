const photos = document.getElementById('photos');
const photoStatus = document.getElementById('photoStatus');
const form = document.getElementById('quoteFormEs');
const submitButton = form.querySelector('button[type="submit"]');
const maxPhotoBytes = 8 * 1024 * 1024;
const allowedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp'];

function validatePhotos() {
  const files = [...(photos.files || [])];
  let message = '';
  if (files.length > 3) message = 'Selecciona un máximo de 3 fotos.';
  else if (files.some(file => file.size > maxPhotoBytes)) message = 'Cada foto debe pesar 8 MB o menos.';
  else if (files.some(file => !allowedPhotoTypes.includes(file.type))) message = 'Solo se aceptan imágenes JPG, PNG o WebP.';
  photos.setCustomValidity(message);
  photoStatus.textContent = message || (files.length ? `${files.length} foto${files.length === 1 ? '' : 's'} lista${files.length === 1 ? '' : 's'} para enviar.` : 'Hasta 3 fotos; máximo 8 MB por foto.');
  return !message;
}
photos.addEventListener('change', validatePhotos);
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!validatePhotos()) {
    photos.reportValidity();
    return;
  }

  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando...';
  photoStatus.textContent = 'Enviando tu solicitud...';

  try {
    const response = await fetch(form.getAttribute('action') || '/api/contact', {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) throw new Error('Request failed');

    form.reset();
    validatePhotos();
    photoStatus.textContent = 'Gracias. Tu solicitud de cotización fue enviada correctamente.';
  } catch (error) {
    photoStatus.textContent = 'No pudimos enviar tu solicitud. Por favor llama o envía mensaje al (708) 983-8587.';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});
