const photos = document.getElementById('photos');
const photoStatus = document.getElementById('photoStatus');
function validatePhotos() {
  const files = [...(photos.files || [])];
  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  let message = '';
  if (files.length > 3) message = 'Selecciona un máximo de 3 fotos.';
  else if (totalBytes > 6291456) message = 'Las fotos superan el límite total de 6 MB.';
  else if (files.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) message = 'Solo se aceptan imágenes JPG, PNG o WebP.';
  photos.setCustomValidity(message);
  photoStatus.textContent = message || 'Hasta 3 fotos; máximo 6 MB en total.';
  return !message;
}
photos.addEventListener('change', validatePhotos);
document.getElementById('quoteFormEs').addEventListener('submit', event => {
  if (!validatePhotos()) {
    event.preventDefault();
    photos.reportValidity();
  }
});
