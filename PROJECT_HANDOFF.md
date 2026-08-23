# True Craft Interiors - Project Handoff

Last updated: 2026-08-23

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

Controls which files are excluded from static asset upload. Because `wrangler.toml` sets
`directory = "."`, anything not listed here is published publicly. `*.md` is excluded on
purpose so these internal documents are not served at
`truecraftinteriorschicago.com/PROJECT_HANDOFF.md`. Do not remove that line.

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

Form logic shared by the two standalone quote pages, `/quote/` (English) and `/es/cotizacion/`
(Spanish). It mirrors the validation and photo behavior of the homepage form. All of its text
comes from `I18N` in `assets/js/translations.js`, picked by `document.documentElement.lang`, so
the file holds no copy of its own.

Two requirements for any page that uses it: `translations.js` must be loaded **before** it, and
the form must carry `class="quote-form"` (the script finds the form by that class, not by id).

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

The three homepage reviews are real client reviews, confirmed by the business owner on
2026-08-23. The previous "Preview" labels, the visible warning note, and the ASCII asterisk
rating were removed on that date. Review text lives in `TESTIMONIALS_I18N` in
`assets/js/translations.js`; the `en` and `es` arrays must always be updated together.

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

## Which Files Are Generated

This matters before editing anything. Of the 19 pages, **17 are generated** by
`tools/generate-seo-pages.ps1`. Editing a generated file appears to work and is silently lost
the next time the script runs.

Edited by hand:

```text
index.html                  the real product; the source everything else derives from
quote/index.html            standalone English quote page
es/cotizacion/index.html    standalone Spanish quote page
404.html                    not-found page
```

Generated - do not edit directly:

```text
es/index.html                       generated from index.html
services/, service-areas/           SEO landing pages
es/servicios/, es/areas-de-servicio/
6 English service pages             drywall-installation/, drywall-repair/,
6 Spanish service pages             drywall-taping-finishing/, interior-framing/,
                                    painting/, frp-installation/ and their /es/ pairs
```

`es/index.html` is generated, but it is not an SEO-only page: it is the full Spanish product,
same design and same features as the English homepage. The other 16 generated pages are search
landing pages built on `seo-pages.css`, intentionally simpler, and the homepage navigation does
not send ordinary visitors into them.

## How To Change Text

### Step 0 - decide which file owns the text

- Homepage text, English or Spanish: the source is `index.html`.
- Service page text: the source is the `$services` table at the top of
  `tools/generate-seo-pages.ps1` (fields `enLead` / `esLead` / `enBody` / `esBody`).
- Shared service-page copy (headings, the "How to start" list, footer): the `if($isEs){...}`
  expressions inside the `PageHtml` function in the same script.

### Step 1 - find out whether the text has a dictionary entry

Search the whole folder for a fragment of the text. Two results means it is translated text:
one in the HTML, one in `assets/js/translations.js`. Look at the element that wraps it:

```html
<p class="lead" data-i18n="hero.lead">Family-rooted drywall, taping, repair...
```

`hero.lead` is the dictionary key. Text with a `data-i18n` attribute lives in two places and
both must change, otherwise the browser overwrites the HTML with the old dictionary value as
soon as the page loads.

Text without `data-i18n` (a phone number, an `aria-label`, an `alt`) lives only in the HTML.

### Step 2 - edit the HTML

Replace the text between the tags in `index.html`. **Keep the `data-i18n` attribute.** Removing
it breaks the language switcher for that element.

### Step 3 - edit the dictionary

In `assets/js/translations.js`, search for the key. It appears **twice**: the first occurrence
is inside `I18N.en`, the second inside `I18N.es`. Change both. Watch the surrounding single
quotes and the trailing comma - a broken quote here breaks all JavaScript on the page, not just
the translation.

Reviews are separate: they live in `TESTIMONIALS_I18N` (`en` and `es` arrays), and their default
values are also in `index.html` as `#tQuote`, `#tName`, `#tWho`, `#tJob`.

### Step 4 - regenerate

```powershell
powershell -ExecutionPolicy Bypass -File tools\generate-seo-pages.ps1
```

Expected output: `157 textos traducidos` and `31/31 cadenas de atributos`. A lower count or any
`WARNING` means a key or an override string went stale - fix it before committing.

Attribute strings (`aria-label`, `alt`, gallery captions) additionally need their entry in
`$spanishAttributeOverrides` updated to match the new English string.

### Step 5 - verify

```powershell
node --check assets\js\translations.js
node --check assets\js\main.js
powershell -ExecutionPolicy Bypass -File tools\audit-site.ps1
```

Then open the site locally (`ABRIR-SITIO-LOCAL.cmd`), check `/` and `/es/`, and use the language
switcher in both directions.

### Step 6 - review the diff before committing

A homepage text change should touch exactly three files: `index.html`,
`assets/js/translations.js` and `es/index.html`. Any other generated page showing up in
`git status` means something changed that was not intended.

### The mistake that costs the most

Editing `es/index.html` directly. It is tempting because it is the file where the Spanish text is
visible, and it works: save, reload, looks right. Weeks later someone runs the generator and the
work disappears with no error message. Every change for the Spanish version goes into
`index.html` and the dictionary.

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

## Spanish Homepage Generation

`es/index.html` is generated from `index.html` by `tools/generate-seo-pages.ps1`, so both pages
stay structurally identical. The script runs three passes on the copy:

1. head/meta swaps: `lang`, `title`, `description`, `canonical`, `og:*`.
2. Spanish text: every `data-i18n` element and every `data-i18n-placeholder` gets its Spanish
   value written into the HTML, read from `I18N.es` in `assets/js/translations.js`. That is the
   same source the browser uses, so the generated HTML and the runtime translation cannot drift.
   The `data-i18n` attributes are preserved, so the language switcher keeps working in both
   directions.
3. Attribute strings the runtime translator never touches: `aria-label`, `alt`, `title`,
   gallery captions and the review card defaults. These live in `$spanishAttributeOverrides`
   near the end of the script.

Why pass 2 exists: crawlers that do not execute JavaScript would otherwise read `/es/` in
English, and `/` and `/es/` were 96.8% identical in the raw HTML, which risks the Spanish page
being treated as a duplicate of the English one.

Maintenance rules:

- Adding a translatable string means adding the key to **both** `I18N.en` and `I18N.es`, then
  re-running the script.
- Adding or changing an `aria-label`, `alt` or gallery caption in `index.html` means adding the
  matching entry to `$spanishAttributeOverrides`. The script prints
  `NN/NN cadenas de atributos traducidas` and warns for every string it could not find, so a
  count below the total means an override went stale.
- The script rewrites all 19 pages. Re-running it with no source changes reproduces the other
  18 byte for byte, so `git status` after a run should only ever show `es/index.html`.
- Known remaining English: the JSON-LD block on `/es/` (business description and service names
  in `Offer` entries). Structured data in English is acceptable, but it can be added to the
  override list if the client wants it localized.

## One Visual System, Two Stylesheets

`assets/css/main.css` styles the two homepages. `assets/css/seo-pages.css` styles everything
else: the 16 SEO pages, `/quote/`, `/es/cotizacion/` and `404.html`.

Two files, but **one visual language**. On 2026-08-23 the values in `seo-pages.css` were aligned
to `main.css` so the internal pages stop looking like a different site. What changed:

```text
header          dark with orange border     ->  light (--paper), 3px --ink bottom border
brand           58px square logo, upright   ->  38px circular logo, italic, 1.42rem
nav links       white uppercase 0.82rem     ->  dark 0.86rem, orange underline on hover
button          min-height 48, 2px border,  ->  padding 13px 24px, radius 2px, white text,
                black text, white on hover      hover to --orange-dark; same as .btn
hero h1         clamp(3.2rem -> 6.8rem)     ->  clamp(2.6rem -> 4.4rem)
section h2      clamp(2.5rem -> 4.7rem)     ->  clamp(2rem -> 2.9rem)
headings        weight 900, spacing -.02em  ->  weight 800, spacing .01em, line-height .95
container       1180px, padding 24          ->  1240px, padding 28 (18 on mobile)
section pad     78px                        ->  88px (56px on mobile)
footer          #d8d5ce, padding 38px       ->  #B7B4AC, padding 60px 0 26px
body            line-height 1.65            ->  1.55
fonts           @import inside the CSS      ->  <link> + preconnect in each page head
font fallback   'Big Shoulders', Impact     ->  'Big Shoulders', sans-serif
```

The class names still differ between the two files (`.button` vs `.btn`, `.brand` vs `.logo`,
`.footer` vs `footer`) because the two systems grew separately. Renaming them would mean
rewriting the markup the generator emits and pulling `main.js` into pages that today need no
JavaScript, so the names were left alone and only the values were aligned. Class names are not
visible to users; the rendered result is.

**If you change any value in that list inside `main.css`, change it in `seo-pages.css` too.**
The header comment of `seo-pages.css` repeats the list for whoever opens that file first.

Why keep a separate, smaller file: `seo-pages.css` is about 11 KB against 53 KB for `main.css`,
and these are search landing pages where load time converts. They also do not need the
homepage's gallery lightbox, review carousel, scroll animations or mobile bar.

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

These local image files are intentionally not tracked, and `.gitignore` now keeps them out of
`git status`:

```text
assets/reviews/review-drywall-bathroom.jpg
assets/reviews/review-drywall-installation.jpg
assets/reviews/review-room-under-construction.jpg
```

Do not add them unless they are intentionally selected for gallery/reviews.

Separately, three committed PNGs in `assets/reviews/` are not referenced by any HTML, CSS or
JS file and add roughly 1.6 MB to every deployment:

```text
assets/reviews/review-bathroom-durock.png     (345 KB)
assets/reviews/review-commercial-hall.png     (716 KB)
assets/reviews/review-wall-prep.png           (605 KB)
```

They can be removed with `git rm` once confirmed they are not planned for future use.

## Open Items

1. ~~Spanish page is not pre-translated in the HTML.~~ **Resolved 2026-08-23.**
   `tools/generate-seo-pages.ps1` now writes the Spanish text into `es/index.html` when it
   generates the page. See "Spanish Homepage Generation" below. Visible-text overlap between
   `/` and `/es/` dropped from 96.8% to 20.3%.

2. **`MAIL_FROM` falls back to `onboarding@resend.dev`.** That is Resend's testing sender.
   Production delivery needs a verified sending domain. Deferred: the business does not
   currently have email on its own domain.

3. **404 page is English only** and there is no `/es/404`. A Spanish visitor hitting a bad URL
   gets the English page.

4. ~~`/es/cotizacion/` has no English equivalent.~~ **Resolved 2026-08-23.** `/quote/` is the
   English mirror, and the 8 English SEO pages now point their three "Free Quote" links at it
   instead of `/#contacto`. Neither quote page is linked from its own homepage; both are reached
   from the SEO pages and from search.

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
  - `assets/js/quote-form.js` if either standalone quote page is affected
- If adding new pages, update:
  - `sitemap.xml`
  - `tools/audit-site.ps1` if new required assets or route expectations are introduced
- If changing homepage text, update both:
  - base HTML fallback text
  - `assets/js/translations.js`

