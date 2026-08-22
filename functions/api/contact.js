const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DEFAULT_CLOUDINARY_FOLDER = 'quote-requests/true-craft-interiors';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function clean(value) {
  return String(value || '').trim();
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sha1Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-1', data);
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function signCloudinaryParams(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return sha1Hex(`${toSign}${apiSecret}`);
}

function getPhotos(formData) {
  return formData
    .getAll('project_photos[]')
    .filter(file => file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0);
}

function validatePhotos(photos) {
  if (photos.length > MAX_PHOTOS) return 'Please upload no more than 3 photos.';
  if (photos.some(file => file.size > MAX_PHOTO_BYTES)) return 'Each photo must be 8 MB or smaller.';
  if (photos.some(file => !ALLOWED_PHOTO_TYPES.has(file.type))) return 'Only JPG, PNG and WebP images are accepted.';
  return '';
}

async function uploadPhoto(file, env) {
  const cloudName = clean(env.CLOUDINARY_CLOUD_NAME);
  const apiKey = clean(env.CLOUDINARY_API_KEY);
  const apiSecret = clean(env.CLOUDINARY_API_SECRET);

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment variables are missing.');
  }

  const month = new Date().toISOString().slice(0, 7);
  const params = {
    folder: `${clean(env.CLOUDINARY_FOLDER) || DEFAULT_CLOUDINARY_FOLDER}/${month}`,
    tags: 'quote-request,true-craft-interiors',
    timestamp: Math.floor(Date.now() / 1000).toString()
  };
  const signature = await signCloudinaryParams(params, apiSecret);
  const uploadData = new FormData();

  uploadData.append('file', file, file.name || 'project-photo');
  uploadData.append('api_key', apiKey);
  uploadData.append('signature', signature);
  Object.entries(params).forEach(([key, value]) => uploadData.append(key, value));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: uploadData
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || 'Cloudinary upload failed.');
  }

  return {
    name: file.name || result.original_filename || 'Project photo',
    url: result.secure_url,
    publicId: result.public_id
  };
}

async function sendEmail({ env, fields, uploads }) {
  const resendApiKey = clean(env.RESEND_API_KEY);
  const mailTo = clean(env.MAIL_TO);
  const mailFrom = clean(env.MAIL_FROM) || 'True Craft Interiors <onboarding@resend.dev>';

  if (!resendApiKey || !mailTo) {
    throw new Error('Resend environment variables are missing.');
  }

  const photoLinks = uploads.length
    ? uploads.map((photo, index) => `<li><a href="${escapeHtml(photo.url)}">Photo ${index + 1}: ${escapeHtml(photo.name)}</a></li>`).join('')
    : '<li>No photos uploaded.</li>';

  const textPhotoLinks = uploads.length
    ? uploads.map((photo, index) => `Photo ${index + 1}: ${photo.url}`).join('\n')
    : 'No photos uploaded.';

  const html = `
    <h2>New quote request - True Craft Interiors</h2>
    <p><strong>Name:</strong> ${escapeHtml(fields.name)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(fields.phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(fields.email)}</p>
    <p><strong>Service:</strong> ${escapeHtml(fields.service)}</p>
    <p><strong>Language:</strong> ${escapeHtml(fields.language)}</p>
    <p><strong>Source:</strong> ${escapeHtml(fields.source)}</p>
    <p><strong>Project details:</strong><br>${escapeHtml(fields.details)}</p>
    <h3>Project photos</h3>
    <ul>${photoLinks}</ul>
  `;

  const text = [
    'New quote request - True Craft Interiors',
    '',
    `Name: ${fields.name}`,
    `Phone: ${fields.phone}`,
    `Email: ${fields.email}`,
    `Service: ${fields.service}`,
    `Language: ${fields.language}`,
    `Source: ${fields.source}`,
    '',
    'Project details:',
    fields.details,
    '',
    'Project photos:',
    textPhotoLinks
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: mailFrom,
      to: mailTo.split(',').map(item => item.trim()).filter(Boolean),
      reply_to: fields.email,
      subject: `New quote request - ${fields.name}`,
      html,
      text
    })
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || 'Resend email failed.');
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();

    if (clean(formData.get('company_website'))) {
      return jsonResponse({ ok: true });
    }

    const fields = {
      name: clean(formData.get('name')),
      phone: clean(formData.get('phone')),
      email: clean(formData.get('email')),
      service: clean(formData.get('service')),
      details: clean(formData.get('details')),
      language: clean(formData.get('language')) || 'English',
      source: clean(formData.get('source')) || 'truecraftinteriorschicago.com',
      consent: clean(formData.get('contact_consent'))
    };

    if (!fields.name || !fields.phone || !fields.email || !fields.service || !fields.details || !fields.consent) {
      return jsonResponse({ ok: false, error: 'Missing required fields.' }, 400);
    }

    if (!isValidEmail(fields.email)) {
      return jsonResponse({ ok: false, error: 'Invalid email address.' }, 400);
    }

    const photos = getPhotos(formData);
    const photoError = validatePhotos(photos);
    if (photoError) {
      return jsonResponse({ ok: false, error: photoError }, 400);
    }

    const uploads = [];
    for (const photo of photos) {
      uploads.push(await uploadPhoto(photo, env));
    }

    await sendEmail({ env, fields, uploads });

    return jsonResponse({ ok: true, uploadedPhotos: uploads.length });
  } catch (error) {
    console.error('Contact form error:', error);
    return jsonResponse({ ok: false, error: 'Unable to send quote request.' }, 500);
  }
}
