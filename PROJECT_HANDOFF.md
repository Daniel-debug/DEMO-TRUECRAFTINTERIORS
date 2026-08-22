# True Craft Interiors - Project Handoff

Last updated: 2026-08-22

This document is intended for another developer or AI agent that needs to understand the project quickly without reading the full conversation history.

## Project Summary

True Craft Interiors is a bilingual static marketing website for a drywall/interior construction business serving Chicagoland, south suburbs, and select Indiana areas.

The site is primarily a static HTML/CSS/JavaScript project hosted on Cloudflare Pages/Workers. It includes:

- English homepage at `/`.
- Spanish homepage at `/es/`.
- SEO/service pages in English and Spanish.
- A professional quote form that posts to `/api/contact`.
- Server-side form handling through Cloudflare Worker/Pages-compatible code.
- Photo upload to Cloudinary.
- Email delivery through Resend.

Production GitHub remote:

```text
https://github.com/Daniel-debug/DEMO-TRUECRAFTINTERIORS.git
```

Main deployment branch:

```text
main
```

Development branch:

```text
Development
```

Cloudflare is expected to deploy from `main`.

## High-Level Architecture

The project does not use a bundler, framework, or package manager. It is intentionally simple:

```text
HTML pages
  -> CSS files in assets/css/
  -> JavaScript files in assets/js/
  -> Static images in assets/
  -> Worker route /api/contact for quote form submissions
```

### Runtime Flow

1. Visitor loads `/` or `/es/`.
2. `assets/js/translations.js` provides bilingual strings.
3. `assets/js/main.js` controls:
   - language behavior
   - mobile navigation
   - scroll reveal effects
   - gallery lightbox
   - review card swipe/drag behavior
   - quote form validation and submission
4. Quote form posts `multipart/form-data` to `/api/contact`.
5. `worker.js` intercepts `/api/contact`.
6. `worker.js` calls `functions/api/contact.js`.
7. The backend validates fields/photos.
8. Uploaded photos are stored in Cloudinary.
9. Resend sends an email containing the form fields and Cloudinary photo links.

## Important Files

### Root

```text
index.html
```

Main English homepage. This is the primary public experience.

```text
es/index.html
```

Spanish homepage. It mirrors the English homepage and uses the same main CSS/JS system.

```text
worker.js
```

Cloudflare Worker entrypoint. It routes:

- `POST /api/contact`
- `POST /api/contact/`

Everything else is served as static assets through `env.ASSETS.fetch(request)`.

```text
wrangler.toml
```

Cloudflare Worker/assets configuration.

Current important settings:

```toml
name = "truecraftinteriors"
main = "worker.js"
compatibility_date = "2026-08-21"

[assets]
directory = "."
binding = "ASSETS"
run_worker_first = ["/api/*"]
```

```text
.assetsignore
```

Controls which files are excluded from static asset upload.

```text
sitemap.xml
robots.txt
404.html
site.webmanifest
favicon.ico
```

SEO and browser metadata support files.

## CSS Structure

```text
assets/css/main.css
```

Primary design system for the English and Spanish homepages.

It includes:

- global layout
- hero section
- about/mission/vision
- service rows
- project gallery
- review preview cards
- TikTok/video section
- FAQ
- contact form
- footer
- mobile bar
- responsive behavior
- mobile fixes for gallery, footer, form, and reviews

```text
assets/css/seo-pages.css
```

Design system for internal SEO/service pages. These pages intentionally exist for SEO, but the visible homepage navigation was changed so users are not normally sent into these pages because their design is not identical to the main homepage.

```text
assets/css/mobile-fixes.css
```

Shared overflow and mobile safety fixes for SEO/internal pages.

## JavaScript Structure

```text
assets/js/translations.js
```

Contains bilingual dictionaries:

- `I18N.en`
- `I18N.es`
- `TESTIMONIALS_I18N.en`
- `TESTIMONIALS_I18N.es`

Most visible homepage text is translated through `data-i18n` attributes.

```text
assets/js/main.js
```

Main homepage JavaScript.

Responsibilities:

- Applies English/Spanish translations.
- Handles language toast and language links.
- Calculates scroll progress.
- Controls FAQ accordion.
- Controls mobile nav.
- Handles smooth in-page navigation with sticky-header offset.
- Runs scroll reveal animation.
- Rotates review preview cards.
- Adds swipe/drag animation to review cards.
- Opens image lightbox for review/gallery images.
- Manages gallery navigation in the lightbox.
- Manages quote form:
  - required field validation
  - localized error messages
  - photo validation
  - photo list and remove buttons
  - submit state
  - success/error state

```text
assets/js/quote-form.js
```

Standalone form logic for `/es/cotizacion/`. It mirrors the validation and photo behavior used on the homepage form, but text is hardcoded in Spanish.

## Backend / Contact API

```text
functions/api/contact.js
```

This file exports:

```js
export async function onRequestPost({ request, env })
```

It handles the quote form request.

### Request Type

The form submits:

```text
multipart/form-data
```

Endpoint:

```text
/api/contact
```

### Required Fields

The backend requires:

- `name`
- `phone`
- `email`
- `service`
- `details`
- `contact_consent`

Optional fields:

- `language`
- `source`
- `project_photos[]`

### Spam Protection

There is a honeypot field:

```text
company_website
```

If filled, the backend returns `{ ok: true }` without sending an email.

### Photo Rules

The backend accepts up to 3 photos.

Allowed types:

- JPG / JPEG
- PNG
- WebP

Maximum size:

```text
8 MB per photo
```

Photos are uploaded to Cloudinary before email delivery.

### Email Flow

After validation and Cloudinary uploads, the backend sends an email through Resend.

The email includes:

- Name
- Phone
- Email
- Service
- Language
- Source
- Project details
- Links to uploaded photos

The email uses a branded HTML template with the True Craft Interiors logo.

## Required Cloudflare Environment Variables

Do not commit secret values into the repo.

Cloudflare must define:

```text
RESEND_API_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
MAIL_TO
MAIL_FROM
CLOUDINARY_FOLDER
```

Expected values/notes:

```text
MAIL_TO=truecraftinteriors1@gmail.com
MAIL_FROM=True Craft Interiors <onboarding@resend.dev>
CLOUDINARY_FOLDER=quote-requests/true-craft-interiors
```

During testing, `MAIL_TO` can temporarily point to a personal test email.

## Form Behavior

The homepage form has custom validation instead of native browser bubbles.

Important behavior:

- `novalidate` is set on the form.
- Missing fields display an inline error below the specific field.
- The first invalid field receives focus.
- Error messages follow the selected page language.
- The consent checkbox row uses CSS grid to avoid mobile text collapse.
- After a successful submit, required-field errors are cleared so the reset form does not remain red.
- The form shows sending, success, and error messages.

Known user-facing success text:

```text
Request sent successfully
We received your quote request and will reply within 1-2 business days.
```

Spanish:

```text
Solicitud enviada correctamente
Recibimos tu solicitud y te responderemos en 1-2 dias habiles.
```

## Homepage Navigation Notes

The homepages no longer send normal users into internal service pages from the visible Services and Company footer links.

Why:

- Internal SEO pages use `seo-pages.css`.
- Their layout is intentionally different and less polished than the homepage.
- The user noticed this as a design inconsistency.

Current behavior:

- Service titles in the homepage go to `#contacto`.
- Footer service links go to `#servicios`.
- Service Areas in the footer goes to `#contacto`.

The internal pages still exist for SEO and sitemap purposes.

## Gallery and Reviews

### Project Gallery

The homepage gallery uses these assets:

```text
assets/gallery/project-framing-prep.jpg
assets/gallery/project-drywall-installation.jpg
assets/gallery/project-finished-ceiling.jpg
assets/gallery/project-boarded-room.jpg
assets/gallery/project-ceiling-taping.jpg
assets/gallery/project-commercial-drywall.jpg
```

Behavior:

- Instagram-style square grid.
- Opens image lightbox.
- Lightbox supports previous/next buttons.
- Keyboard supports left/right arrows.
- Touch swipe works in the lightbox.

### Reviews

Reviews are marked as preview/fake until replaced with verified client reviews.

Current review image assets:

```text
assets/reviews/review-room-drywall-installation.jpg
assets/reviews/review-commercial-wall-finish.jpg
assets/reviews/review-ceiling-finish-detail.jpg
```

Review card behavior:

- Auto-rotates.
- Dot controls.
- Card swipe/drag changes review.
- Drag animation includes tilt, shadow, orange glow, bottom bar feedback, snap, and rebound.

## Video Section

The homepage includes embedded Cloudinary/player videos in the "Watch us work" section.

The videos are hosted externally through Cloudinary and displayed in a custom-styled section.

## Local Development

There is no package install step.

Recommended local preview:

```powershell
powershell -ExecutionPolicy Bypass -File tools\preview-site.ps1
```

Or run a simple local server from the project root:

```powershell
python -m http.server 8080
```

Then open:

```text
http://localhost:8080/
http://localhost:8080/es/
```

For phone testing on the same Wi-Fi, use the machine IP and port, for example:

```text
http://192.168.68.101:8080/
```

## Validation / QA

Main audit command:

```powershell
powershell -ExecutionPolicy Bypass -File tools\audit-site.ps1
```

This checks:

- HTML routes
- titles
- language attributes
- meta descriptions
- canonical URLs
- browser icon
- duplicate IDs
- missing local asset references
- sitemap route consistency
- required homepage markers
- required assets

JavaScript syntax checks:

```powershell
node --check assets\js\main.js
node --check assets\js\quote-form.js
```

Note: in some sandboxed environments, `node --check` may need to run outside the sandbox because resolving `C:\Users\el_da` can fail with `EPERM`.

## Git Workflow Used

Typical workflow:

1. Work in `Development`.
2. Test locally.
3. Commit.
4. Merge to `main`.
5. Push both branches if needed.

Recent important commits:

```text
47de926 Polish mobile UI and quote form validation
2dc4af6 Fix quote form mobile validation states
```

Current expected deployment branch:

```text
main
```

## Known Local Cleanup Note

There may be untracked local image files in:

```text
assets/reviews/review-drywall-bathroom.jpg
assets/reviews/review-drywall-installation.jpg
assets/reviews/review-room-under-construction.jpg
```

They were not committed because the current public pages do not reference them.

Do not add them unless they are intentionally selected for gallery/reviews.

## Important Implementation Cautions

- Do not expose Resend or Cloudinary secrets in frontend JavaScript.
- Do not replace the Cloudflare Worker flow with `mailto`.
- Keep `/api/contact` as the main form endpoint.
- Keep photo size/type/count validation in both frontend and backend.
- If changing form field names, update:
  - homepage HTML
  - Spanish homepage HTML
  - `assets/js/main.js`
  - `functions/api/contact.js`
  - `assets/js/quote-form.js` if the standalone Spanish quote page is affected
- If adding new pages, update:
  - `sitemap.xml`
  - `tools/audit-site.ps1` if new required assets or route expectations are introduced
- If changing homepage text, update both:
  - base HTML fallback text
  - `assets/js/translations.js`

