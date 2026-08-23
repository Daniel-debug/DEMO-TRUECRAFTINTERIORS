const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
// Se acepta cualquier imagen. Un iPhone en "Alta eficiencia" sube image/heic,
// que Cloudinary convierte sin problema. Si el navegador no informa el tipo,
// se valida por extension.
const PHOTO_EXTENSION_PATTERN = /\.(jpe?g|png|webp|heic|heif|avif|gif|bmp|tiff?|jfif|dng)$/i;
function isPhotoFile(file) {
  if (file.type) return /^image\//i.test(file.type);
  return PHOTO_EXTENSION_PATTERN.test(file.name || '');
}
const DEFAULT_CLOUDINARY_FOLDER = 'quote-requests/true-craft-interiors';
const BRAND_NAME = 'True Craft Interiors';
const SITE_URL = 'https://truecraftinteriorschicago.com';
const LOGO_URL = `${SITE_URL}/assets/logo.png`;

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
  if (photos.some(file => !isPhotoFile(file))) return 'Only image files are accepted.';
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

  const safeSource = escapeHtml(fields.source);
  const photoLinks = uploads.length
    ? uploads.map((photo, index) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee7dd;">
          <a href="${escapeHtml(photo.url)}" style="color:#c45a1b;text-decoration:none;font-weight:700;">Photo ${index + 1}: ${escapeHtml(photo.name)}</a>
        </td>
      </tr>
    `).join('')
    : '<tr><td style="padding:10px 0;color:#6f6a62;">No photos uploaded.</td></tr>';

  const textPhotoLinks = uploads.length
    ? uploads.map((photo, index) => `Photo ${index + 1}: ${photo.url}`).join('\n')
    : 'No photos uploaded.';

  const html = `
    <div style="margin:0;padding:0;background:#f4f0e8;font-family:Arial,Helvetica,sans-serif;color:#24211d;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f4f0e8;">
        <tr>
          <td align="center" style="padding:28px 14px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;border-collapse:collapse;background:#fffaf2;border:1px solid #e1d8ca;">
              <tr>
                <td style="background:#191816;padding:22px 26px;border-bottom:4px solid #e56f24;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="vertical-align:middle;">
                        <img src="${LOGO_URL}" alt="${BRAND_NAME}" width="54" height="54" style="display:block;border:0;border-radius:2px;">
                      </td>
                      <td style="vertical-align:middle;padding-left:14px;">
                        <div style="font-size:20px;line-height:1.1;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#ffffff;">${BRAND_NAME}</div>
                        <div style="font-size:12px;line-height:1.4;color:#d8d2c8;text-transform:uppercase;letter-spacing:1.5px;">New Quote Request</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 26px 10px;">
                  <h1 style="margin:0 0 8px;font-size:26px;line-height:1.2;color:#24211d;">New quote request</h1>
                  <p style="margin:0;color:#6f6a62;font-size:14px;">A customer submitted the website quote form.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 26px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#ffffff;border:1px solid #eee7dd;">
                    <tr><td style="padding:14px 16px;border-bottom:1px solid #eee7dd;"><strong>Name:</strong> ${escapeHtml(fields.name)}</td></tr>
                    <tr><td style="padding:14px 16px;border-bottom:1px solid #eee7dd;"><strong>Phone:</strong> <a href="tel:${escapeHtml(fields.phone)}" style="color:#c45a1b;text-decoration:none;">${escapeHtml(fields.phone)}</a></td></tr>
                    <tr><td style="padding:14px 16px;border-bottom:1px solid #eee7dd;"><strong>Email:</strong> <a href="mailto:${escapeHtml(fields.email)}" style="color:#c45a1b;text-decoration:none;">${escapeHtml(fields.email)}</a></td></tr>
                    <tr><td style="padding:14px 16px;border-bottom:1px solid #eee7dd;"><strong>Service:</strong> ${escapeHtml(fields.service)}</td></tr>
                    <tr><td style="padding:14px 16px;border-bottom:1px solid #eee7dd;"><strong>Language:</strong> ${escapeHtml(fields.language)}</td></tr>
                    <tr><td style="padding:14px 16px;"><strong>Source:</strong> <a href="${SITE_URL}" style="color:#c45a1b;text-decoration:none;">${safeSource}</a></td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 26px 14px;">
                  <h2 style="margin:0 0 8px;font-size:18px;color:#24211d;">Project details</h2>
                  <div style="background:#ffffff;border:1px solid #eee7dd;padding:16px;line-height:1.6;font-size:15px;">${escapeHtml(fields.details)}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 26px 30px;">
                  <h2 style="margin:0 0 8px;font-size:18px;color:#24211d;">Project photos</h2>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#ffffff;border:1px solid #eee7dd;padding:0 16px;">
                    ${photoLinks}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 26px;background:#24211d;color:#d8d2c8;font-size:12px;line-height:1.5;">
                  Reply directly to this email to contact the customer. Built Right. Finished Perfectly.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
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
    for (let index = 0; index < photos.length; index += 1) {
      uploads.push(await uploadPhoto(photos[index], env));
    }

    await sendEmail({ env, fields, uploads });

    return jsonResponse({ ok: true, uploadedPhotos: uploads.length });
  } catch (error) {
    console.error('Contact form error:', error);
    return jsonResponse({ ok: false, error: 'Unable to send quote request.' }, 500);
  }
}
