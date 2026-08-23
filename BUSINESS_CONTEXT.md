# True Craft Interiors - Business and Content Context

Last updated: 2026-08-23

This document summarizes the business context, content direction, and messaging decisions for the True Craft Interiors website.

## Business Identity

Business name:

```text
True Craft Interiors
```

Primary market:

```text
Chicagoland, south suburbs, and select Indiana areas
```

Main language support:

```text
English and Spanish
```

Primary contact email:

```text
truecraftinteriors1@gmail.com
```

Primary phone:

```text
(708) 983-8587
```

Business hours:

```text
7:00 AM - 7:00 PM
```

Credit line in footer:

```text
Designed by helloromina.mx
Diseñado por helloromina.mx
```

The footer credit is intentionally plain text, not a hyperlink.

## Main Services

The site presents the company as a dependable crew for:

- Drywall installation
- Drywall taping and finishing
- Drywall repair
- Interior framing
- Painting
- FRP installation

Materials and brands mentioned in service copy:

- USG
- CertainTeed
- Gold Bond
- TapeTech
- ProForm
- Trim-Tex

These are used to make the service content feel specific and credible.

## Business Positioning

Core positioning:

```text
Built Right. Finished Perfectly.
```

The brand should feel:

- reliable
- skilled
- family-rooted
- clean and professional
- direct
- practical
- bilingual
- construction/trades focused

Avoid making the site feel like a generic agency landing page. The tone should fit a trades business: clear, confident, useful, and grounded in real work.

## About Story

The company story is based on family construction experience.

Key points:

- The business grew from a construction family.
- Their father introduced them to job sites at a young age.
- Early job site experience shaped discipline, clean work habits, and attention to detail.
- The company now presents itself as licensed, fully insured, and focused on dependable drywall, taping, repair, framing, painting, and FRP installation.
- The site mentions more than 25 years of hands-on experience and more than 40 years of family drywall knowledge in the written story rather than as separate statistic cards.

## Mission

The site includes a mission block in the About section.

Meaning:

The company wants to deliver clean, dependable interior construction work with honest communication, respect for the client's space, and results that improve the property.

## Vision

The site includes a vision block in the same style as the mission.

Meaning:

The company wants to become a trusted leader in carpentry/remodeling/interior construction, recognized for craftsmanship, integrity, service, and long-term client relationships.

## Values

The values section includes these ideas:

- Integrity, transparency, and responsibility.
- Craftsmanship with attention to detail.
- Reliable scheduling, honest communication, and clean work areas.
- Licensed, fully insured, and backed by a 1-year workmanship warranty.
- Customer satisfaction, respect, and excellence in every project.

These values should be punctuated properly in English and Spanish.

## Warranty / License / Insurance

The questionnaire indicated that the company is:

- licensed
- fully insured
- backed by a 1-year workmanship warranty

This appears in the site copy and should be preserved unless the client changes it.

## Estimate / Quote Messaging

The quote/contact section should communicate:

- free estimate
- response within 1-2 business days
- project photos help start the estimate
- in-person visits can be scheduled for larger jobs
- English and Spanish communication available

Current quote flow:

1. User fills form.
2. User may upload up to 3 photos.
3. Photos are optional.
4. Form sends data to `/api/contact`.
5. Photos are uploaded to Cloudinary.
6. Email is sent through Resend with project information and photo links.

## Form UX Decisions

The form was improved for usability:

- It shows exactly which required field is missing.
- It works in English and Spanish.
- It focuses the first missing field.
- It allows optional project photos.
- It lists selected photo names.
- It lets users remove selected photos.
- It shows a clear success message after sending.
- It avoids leaving fields red after a successful reset.

Photo upload rules:

- Up to 3 photos.
- Maximum 8 MB each.
- Accepted formats: JPG, PNG, WebP.

## Gallery Direction

The project gallery should use real construction/project images.

Current direction:

- square grid
- Instagram-like layout
- click/tap to open image
- lightbox with next/previous controls
- mobile-friendly

The gallery should not become a long vertical dump of photos. A curated set is better.

Recommended quantity:

```text
6 to 9 strong photos
```

Too many images can make the homepage feel heavy, especially on mobile.

## Reviews Section

The three reviews on the homepage are **real client reviews**, confirmed by the business owner
on 2026-08-23. They are published using client initials plus area (J.R. / A.C. / M.P.), which is
the permission level agreed with the client.

Earlier versions of this project treated them as preview placeholders and the site displayed
"Preview" labels plus a visible warning note. That scaffolding was removed on 2026-08-23:
the section now presents them as ordinary client reviews.

If review text or names ever change, they live in `TESTIMONIALS_I18N` inside
`assets/js/translations.js` (both `en` and `es` arrays must be updated together).

Each review is paired with a real project photo to make the section more credible.

Current interaction:

- auto-rotating cards
- dot navigation
- swipe/drag card interaction
- animated card motion
- project image can open in a lightbox

Recommended next step:

The section holds three reviews today. To strengthen it, ask the client for:

- up to 3 additional real reviews
- permission to use first name/initials (already granted for the current three)
- city or area if allowed
- project type
- matching project photo if available

## Social Media

Facebook profile (this is the exact URL used in the site markup):

```text
https://www.facebook.com/people/True-Craft-Interiors-Chicago/61591278734624/
```

TikTok:

```text
https://www.tiktok.com/@truecraftinteriors
```

The social section should invite users to see real project updates, not distract from the quote form.

## Video Hosting / Media

Cloudinary is used for video embeds and project/photo upload storage.

Reason:

- keeps email lightweight
- provides hosted links to uploaded photos
- supports media delivery

Cloudinary is not part of Cloudflare. It is a separate service.

Resend is used for transactional email.

Cloudflare is used for hosting and the backend route.

## SEO Pages

The site includes internal SEO pages for specific services and Spanish equivalents.

English examples:

- `/services/`
- `/drywall-installation/`
- `/drywall-taping-finishing/`
- `/drywall-repair/`
- `/interior-framing/`
- `/painting/`
- `/frp-installation/`
- `/service-areas/`

Spanish examples:

- `/es/servicios/`
- `/es/instalacion-drywall/`
- `/es/acabado-drywall/`
- `/es/reparacion-drywall/`
- `/es/framing-interior/`
- `/es/pintura/`
- `/es/instalacion-frp/`
- `/es/areas-de-servicio/`

Important design decision:

These pages use a different CSS system (`seo-pages.css`). Because the user noticed the design difference, visible homepage navigation was changed so ordinary browsing stays on the homepage sections instead of linking users into the SEO pages.

If a future designer wants consistency, either:

1. Redesign the SEO pages to match the homepage fully.
2. Keep them primarily as search/SEO landing pages.

## Client Questions Still Worth Asking

For final polish, ask the client:

1. Do you have real reviews/testimonials we can publish?
2. Can we use customer initials, city, and project type?
3. Do you want the 1-year workmanship warranty displayed more prominently?
4. What license/insurance wording should be used exactly?
5. Which service is most profitable or should be promoted first?
6. Are there specific suburbs/cities to target for SEO?
7. Do you have before/after photos from the same angle?
8. Do you want emergency repair messaging or only scheduled work?
9. Should the form route emails to one address or multiple addresses?
10. Should uploaded photos be deleted from Cloudinary after a set period?

## Where Content Lives

Before editing any copy, read "Which Files Are Generated" and "How To Change Text" in
`PROJECT_HANDOFF.md`. Most pages of this site are generated from `index.html` and a translation
dictionary, so editing the page where you see the text is usually the wrong move and the change
gets overwritten later.

Quick map:

- Homepage copy, English and Spanish: `index.html` plus `I18N.en` / `I18N.es` in
  `assets/js/translations.js`.
- Client reviews: `TESTIMONIALS_I18N` in `assets/js/translations.js`.
- Service page copy: the `$services` table in `tools/generate-seo-pages.ps1`.

## Content Style Guide

English tone:

- clear
- concise
- professional
- construction-specific
- confident but not exaggerated

Spanish tone:

- natural bilingual Spanish for a U.S. construction audience
- keep common industry terms like drywall, framing, FRP if they are clearer for the audience
- avoid overly formal or academic Spanish

Avoid:

- generic marketing fluff
- claims that are not proven
- too much text in the first viewport
- fake certainty around reviews
- overloading mobile users with long sections

## Public Claims To Verify Before Final Launch

These claims should be verified with the client:

- licensed
- fully insured
- 1-year workmanship warranty
- 25+ years hands-on experience
- 40+ years family drywall knowledge
- "Serving Chicagoland since 2010" (appears in the homepage trust badges and in all 16 SEO
  pages as "Family-rooted since 2010" / "desde 2010"; note it sits next to the 25+ years
  claim, so confirm which date refers to the company and which to personal experience)
- service areas
- business hours
- exact phone/email
- exact social media URLs

## Language Priority

The primary audience is English-speaking (Chicagoland). English is the default language:
`/` is the canonical entry point and carries `hreflang="x-default"`. Spanish support at `/es/`
stays fully maintained as a secondary language for the bilingual portion of the market, but
optimization effort is prioritized for English.

