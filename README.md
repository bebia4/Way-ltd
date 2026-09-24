# Way International Services — website

A static marketing site for Way International Services Limited. Plain HTML, CSS and
vanilla JavaScript: no framework, no build step, no `npm install`. Every page is a
file you can open and edit directly.

---

## Run it locally

Any static server will do. From the project root:

```bash
python3 -m http.server 8000
# then open http://127.0.0.1:8000
```

Use a server rather than opening the files directly — the pages link assets from the
site root (`/assets/…`), which `file://` cannot resolve.

---

## What is in here

```
index.html          Home — hero, problem, solution, ten services, process, contact
services.html       The ten service pillars in detail (anchors: #ai-automation …)
work.html           Build patterns, with generated artwork
pricing.html        Launch / Scale / Enterprise tiers + FAQ
about.html          Positioning, who we build for, how we operate
contact.html        Enquiry form and next steps
privacy.html        Privacy notice
terms.html          Terms of use
404.html            Not-found page

assets/css/site.css    The whole design system (tokens → components → responsive)
assets/css/fonts.css   Self-hosted @font-face declarations
assets/fonts/          Webfonts, woff2, latin + latin-ext only
assets/js/site.js      Scroll reveals, nav, menu, form handling — all progressive
assets/img/            Logo lock-ups, icons, and eight generated artwork SVGs
                       way-mark.png       wordmark only — used in the header
                       way-logo-dark.png  full lock-up for dark surfaces — footer
                       way-logo.png       full lock-up for light surfaces (spare)

robots.txt  sitemap.xml  netlify.toml  vercel.json
```

---

## Design system

Everything is driven by custom properties at the top of `assets/css/site.css`. Change
a token there and it propagates across all nine pages.

**Brand palette** — sampled pixel-by-pixel from the supplied wordmark, so the site and
the logo are literally the same gradient:

| Token | Value | Where it sits in the logo |
|---|---|---|
| `--violet` | `#6F0EC7` | leading `W` |
| `--iris`   | `#6F3CDA` | |
| `--blue`   | `#3D71F1` | |
| `--azure`  | `#1D8DF9` | centre of the `A` |
| `--coral`  | `#F07F72` | |
| `--amber`  | `#F8AB73` | trailing dot |

`--brand` composes these into the gradient used on primary buttons, headline accents
and hover rules.

**Type** — four families, each doing one job:

- **Bricolage Grotesque** — display headlines (`.t-hero`, `.t-xl`, `.t-lg`, `.t-md`)
- **Instrument Serif italic** — the `.ital` accent, one word per headline, never more
- **Inter Tight** — body copy and UI
- **JetBrains Mono** — eyebrows, numerals, metadata

Sizes are fluid `clamp()` values, so there are no typographic breakpoints to maintain.

**Surfaces** — `.on-light` flips a section to the warm bone palette; dark is the
default. `.band` sets the vertical rhythm, `.band-tight` and `.band-flush` are the
tighter variants.

---

## Editing content

The header, footer and mobile menu are duplicated in each page rather than injected at
runtime — that keeps the markup server-rendered for search engines and avoids a flash
of missing navigation. **If you change a nav link or a footer column, change it in all
nine pages.** A quick way to catch a miss:

```bash
grep -c 'class="ftr-top"' *.html     # every page should print 1
```

Service copy lives inline in `services.html` and in the `.svcs` grid on `index.html`.
The anchors (`#ai-automation`, `#saas-platforms`, …) are what the homepage
"Learn more" links point at, so keep the `id` attributes stable.

---

## Before this goes live

These are placeholders in the current build. Each one needs a real value.

1. **Email address.** `hello@wayinternational.services` appears in the header of every
   page, the footer, the contact page and `assets/js/site.js`. Replace it everywhere:
   ```bash
   grep -rl 'hello@wayinternational.services' . --include='*.html' --include='*.js'
   ```
2. **Domain.** `https://wayinternational.services/` is used in every `<link rel="canonical">`,
   the Open Graph tags, `robots.txt` and `sitemap.xml`.
3. **Pricing figures.** `pricing.html` carries indicative numbers (`from $12k`,
   `from $35k`) shaped to the tier model, not quoted rates. Confirm or replace all of
   them — and the budget bands in the contact form's `Budget range` select.
4. **Work page.** `work.html` describes six *build patterns*, deliberately written
   without client names or claimed results. Swap each card for a real, referenceable
   case study as they become available.
5. **Company details.** Registered company number and address usually belong in the
   footer and the legal pages — add them once confirmed.
6. **Legal pages.** `privacy.html` and `terms.html` are a sound starting draft, not
   legal advice. Have them reviewed before launch.

---

## Wiring up the contact form

There is no backend. Until one exists, `assets/js/site.js` intercepts the submit,
formats the fields and hands the enquiry to the visitor's mail client via `mailto:`.
That loses nothing, but it is not a real form.

To point it at a service instead, give the `<form>` in `contact.html` an `action` and
`method`, and delete the `data-form` attribute — the handler in `site.js` only takes
over when `data-form` is present, so the form falls back to a normal POST:

```html
<form class="form" action="https://formspree.io/f/xxxxxxx" method="POST">
```

Netlify Forms works the same way — add `netlify` and a `name` to the `<form>` tag and
remove `data-form`.

---

## Artwork

`assets/img/art-1.svg` … `art-8.svg` are generated abstract compositions built from the
brand gradient — concentric rings, wave fields, a perspective grid, a dot matrix,
orbits, diagonal bars, contours and frequency bars. They are vector, total about 84 KB,
and need no external requests.

To use photography instead, drop a JPG or WebP into `assets/img/` and swap the `src`
on the relevant `<img>` in `work.html` or `about.html`. The containers already crop
with `object-fit: cover`, so any aspect ratio will sit correctly.

> Stock-image CDNs were unreachable from the environment this site was built in, so no
> third-party photography is referenced anywhere. Nothing will 404 on launch.

---

## Accessibility and performance

- Single `<h1>` per page; headings descend in order.
- Visible focus rings on every interactive element, and a skip link to `#main`.
- The mobile menu traps nothing, closes on `Escape`, and reports state via
  `aria-expanded` / `aria-hidden`.
- `prefers-reduced-motion: reduce` disables the aurora drift, marquee, reveals and
  cursor halo — it is honoured, not merely declared.
- Decorative artwork is `alt=""` and `aria-hidden`; the logo carries a real `alt`.
- Fonts are self-hosted, so no visitor data reaches a third-party font provider and
  there is no extra DNS round trip.
- JavaScript is entirely progressive. With it disabled every page still renders, all
  content is visible, and every link works.

Verified with no console errors, no failed requests and no horizontal overflow at
375 px, 768 px and 1440 px.

---

## Deploying

No build step, so any static host works.

- **Netlify** — `netlify.toml` sets the publish directory and security/caching headers.
- **Vercel** — `vercel.json` does the same.
- **GitHub Pages / S3 / nginx / cPanel** — upload the repository contents as-is.

If your host supports a custom 404, point it at `404.html`.
