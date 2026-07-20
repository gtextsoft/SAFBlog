# SAF Blog — Redesign & SEO/GEO Overhaul Plan

**Domain:** `https://blog.stephenakintayofoundation.org`
**Scope:** Entire platform — public site + admin panel
**Direction:** Editorial modernism, retaining SAF brand identity
**Rendering:** Migrate Vite SPA → Next.js App Router (SSR/SSG)

---

## 1. Audit — what's wrong today

### 1.1 Critical: the site is invisible to AI answer engines

The app is a pure client-side Vite SPA. Every meta tag, `<title>`, and JSON-LD block is
injected by `useEffect` **after** React hydrates (`src/components/seo/SEOHead.tsx:40`,
`src/components/seo/StructuredData.tsx:57`).

Googlebot renders JavaScript, so classic SEO half-works. But the crawlers that feed AI
answer engines — GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, CCBot — largely **do not
execute JavaScript**. They fetch `index.html`, find an empty `<div id="root">`, and leave.

Result: zero content is available for AI citation. This is the single highest-leverage fix
and it is the reason for the framework migration.

### 1.2 `/sitemap.xml` is non-functional

`src/pages/Sitemap.tsx` is a React route that builds an XML string, creates a Blob, then
`console.log`s a note to itself and returns `null`. Nothing is ever served.
`public/robots.txt` advertises this dead URL — and points at the wrong domain
(`safoundation.org`).

### 1.3 Base URL is derived from the browser

`const SITE_URL = typeof window !== "undefined" ? window.location.origin : ""`
appears in both SEO components. Canonicals and OG image URLs therefore:
- resolve to `""` in any non-browser context,
- silently become the preview domain on staging deploys, creating duplicate-content signals.

Must become a build-time env var.

### 1.4 Meta tag leak

`SEOHead` appends `article:tag` meta elements on every effect run with no cleanup
(`SEOHead.tsx:71-78`). Navigating between posts accumulates stale tags in `<head>`.

### 1.5 Missing SEO/GEO surface area

| Missing | Impact |
|---|---|
| RSS/Atom feed | No syndication; feeds are a strong AI-crawler discovery path |
| `llms.txt` / `llms-full.txt` | Emerging standard for AI-crawler content maps |
| Explicit AI-crawler policy in robots | Ambiguous default; some engines skip on ambiguity |
| Per-post OG images | Poor social CTR; generic logo on every share |
| `wordCount`, `articleBody`, `inLanguage`, `@id`, `speakable` in schema | Weak entity graph; less extractable |
| Author as a real `Person` entity with `sameAs` | No E-E-A-T signal |
| `FAQPage` / `HowTo` schema | Loses rich results and AI-quotable Q&A blocks |
| `WebSite` + `SearchAction` schema | No sitelinks search box |
| URL-based pagination | Blog list beyond page 1 is uncrawlable |
| `hreflang` / `inLanguage` | Unspecified locale |
| Image `width`/`height` | Cumulative Layout Shift |

### 1.6 Design — reads as an AI template

Current visual language (`src/pages/Index.tsx:173-211`, `src/index.css`):
- Gradient blobs with `blur-3xl` + `animate-pulse` as hero wallpaper
- Gradient-clipped text on the H1
- An emoji (`✨`) used as a UI element in the hero badge — violates the icon standard
- `--radius: 1rem` plus `rounded-full` on everything: no shape hierarchy
- Tailwind default `blue-500` (`#3b82f6`) as the brand primary
- Cool gray background, no editorial rhythm, no real grid
- Dark mode tokens exist in `index.css:85-141` but **no theme toggle is wired up anywhere**
- Decorative-only animation (`float`, `pulse-slow`, `gradient-shift`) — motion carries no meaning

### 1.7 Data model gaps

The schema (`supabase/migrations/20251118073929_*.sql`) has no fields for SEO control:
no `meta_title`, `meta_description`, `focus_keyword`, `og_image_url`, `canonical_url`,
`faq`, or `reading_minutes`. `authors` has no `slug` and no social profile URLs, so an
author entity cannot be built.

### 1.8 Security and correctness defects found during audit

These are live bugs, not design opinions. Ranked by severity.

| # | Issue | Location | Status |
|---|---|---|---|
| 1 | **`"Fuck you"` is rendered as the user-facing error message and toast on every failed admin login** — including a legitimate admin who mistypes a password | `src/pages/admin/AdminLogin.tsx:43,48,64,69` | **Fixed** |
| 2 | **Unsubscribe never worked.** RLS grants `SELECT` on `newsletter_subscribers` to admins only, so the page's opening `.select("*")` returned nothing for every real visitor — "Email not found" was the universal outcome. The unvalidated `token` was moot because the write was denied too | `src/pages/Unsubscribe.tsx` | **Fixed** — moved to a signed-token Edge Function |
| 3 | **Subscriber enumeration.** On unique-violation the signup re-selects the row's status, so an attacker can probe whether any email is subscribed | `src/components/newsletter/NewsletterSignup.tsx` | **Fixed** — all outcomes now identical |
| 4 | **PostgREST filter injection.** The blog search string is interpolated raw into `.or(...ilike...)`; commas and parentheses break or rewrite the filter | `src/pages/Blog.tsx` | **Fixed** |
| 5 | **CSV injection + corruption.** Subscriber export wraps cells in quotes but doesn't escape inner quotes; no guard on `=`/`+`/`-`/`@` prefixes | `src/pages/admin/AdminSubscribers.tsx` | **Fixed** |
| 6 | **Taxonomy save is non-transactional** — delete-then-insert; a failed insert leaves a post with no categories or tags | `src/pages/admin/AdminPostEditor.tsx` | Phase 6 |
| 7 | Admin gate is client-side only; security rests entirely on RLS | `src/components/admin/AdminLayout.tsx` | Phase 1 — middleware |
| 8 | **Related posts are not related.** `categoryIds` is computed and then never used in the query — it returns 3 arbitrary posts | `src/pages/PostDetail.tsx` | Phase 3 |
| 9 | Conditional hook order violation — hooks run before an early `return` when `!src` | `src/components/ui/optimized-image.tsx` | Phase 3 — file deleted, replaced by `next/image` |
| 10 | `format(new Date(publishedAt))` throws on null/empty `published_at`, which `Blog.tsx` passes as `""` | `PostCard`, `FeaturedPost`, `PostDetail` | Phase 3 |

**Still outstanding on newsletter signup:** no rate limiting, no captcha, and no
double opt-in. The endpoint is publicly writable and spammable. Double opt-in also
solves the token-distribution problem below, since the confirmation mail is the
natural place to establish a verified address. Recommended for Phase 6.

### 1.9 Two audit findings that change the migration plan

**Content is invisible without JavaScript.** `useScrollVisibility` sets `.animate-on-scroll { opacity: 0 }`
in CSS and only adds `.visible` once JS runs. Nearly every page calls it. Prerendering as-is would
ship server HTML whose content is transparent — defeating the entire point of the migration. The base
CSS must default to visible and let motion be the progressive enhancement.

**Markdown tables don't render.** `react-markdown` is used without `remark-gfm`, so tables,
strikethrough, task lists and autolinks are dropped — even though the editor toolbar has a
strikethrough button that emits markup rendering as literal tildes. Tables are one of the most
extractable formats for AI answer engines, so §5's GEO content strategy is blocked until this is
fixed. Adding `remark-gfm` is a one-line change.

Also worth noting: `BlogSidebar` issues an N+1 query storm (one query per category *and* per tag,
plus a count each); `AdminPosts` and `AdminSubscribers` fetch every row with no pagination; and
`optimized-image` never receives the `width`/`height` it exists to apply, so its stated
anti-CLS purpose is unmet and its `sizes` attribute is inert without a `srcSet`.

---

## 2. Target architecture

```
app/
├── layout.tsx                  Root: fonts, theme provider, skip-link, Organization+WebSite JSON-LD
├── page.tsx                    Home            (ISR)
├── blog/
│   ├── page.tsx                Index + ?page=  (ISR)
│   └── [slug]/
│       ├── page.tsx            Post            (SSG + generateStaticParams, ISR fallback)
│       └── opengraph-image.tsx Per-post OG via next/og
├── category/[slug]/page.tsx
├── tag/[slug]/page.tsx
├── author/[slug]/page.tsx      NEW — author entity pages for E-E-A-T
├── about/page.tsx
├── newsletter/page.tsx
├── unsubscribe/page.tsx
├── search/page.tsx             NEW — enables SearchAction schema
├── sitemap.ts                  Real dynamic sitemap
├── robots.ts                   Real robots with explicit AI-crawler rules
├── feed.xml/route.ts           RSS 2.0
├── llms.txt/route.ts           GEO content map
├── llms-full.txt/route.ts      Full-text corpus for AI crawlers
├── not-found.tsx
└── (admin)/admin/...           Client-heavy, `dynamic = 'force-dynamic'`, noindex

lib/
├── supabase/{server,client,admin}.ts   @supabase/ssr — cookie-based auth
├── queries/                            Typed, cached data access (React `cache()`)
├── seo/{metadata,schema,site}.ts       Metadata + JSON-LD builders
└── content/{markdown,toc,reading-time,excerpt}.ts
```

**Data fetching:** Server Components query Supabase directly with the anon key through
`@supabase/ssr`. RLS already restricts reads to `status = 'published'` for anonymous users,
so no policy changes are required for the public site. Admin routes use the
cookie-bound server client so `has_role()` continues to gate writes.

**Caching:** `revalidate = 3600` on public routes, plus a Supabase webhook →
`/api/revalidate` route so publishing a post purges its cache immediately rather than
waiting an hour.

---

## 3. Design system — Editorial Modernism

Keeps SAF's blue identity but replaces the template aesthetic with a publication one:
a real grid, a proper type scale, restraint in color, and motion that means something.

### 3.1 Typography

| Role | Face | Rationale |
|---|---|---|
| Display / headings | **Newsreader** | Variable serif with optical sizing, drawn for long-form reading. Editorial authority without Playfair's fashion connotation. |
| Body / UI | **Inter** | Already in the project. Best-in-class UI legibility, full variable axis. |
| Eyebrows / meta / dates | **Inter**, uppercase, `tracking-[0.14em]`, 12–13px | Typographic precision without a third font download. |

Article body sets in Newsreader at 19–20px / 1.75 with a 68ch measure — the reading
experience is the product.

Three weights per family, `display: swap`, self-hosted via `next/font` (removes the
render-blocking Google Fonts request currently in `index.html`).

### 3.2 Color

Warm paper instead of cool gray; ink instead of navy; a deeper, more serious blue that
actually passes contrast as a link color on white (the current `#3b82f6` does not).

```
--paper        38 30% 98%    warm off-white page
--ink          222 24% 10%   body text
--ink-muted    220 12% 42%   secondary text (4.6:1 on paper)
--saf-blue     221 68% 40%   primary — links, CTAs (7.1:1 on paper)
--saf-blue-alt 221 72% 56%   dark-mode primary
--amber        32 82% 44%    accent, used sparingly for editorial highlight
--rule         220 14% 88%   hairline rules — the main structural device
```

Accent color is for *emphasis*, not decoration. No gradients as background wallpaper.

### 3.3 Shape, space, motion

- Radius scale gets hierarchy: `2px` inputs · `4px` cards · `8px` modals. No `rounded-full`
  except avatars and genuine pills.
- Spacing on a strict 4/8px rhythm; section rhythm 48 / 72 / 112.
- 12-column grid with a defined editorial measure; asymmetric feature layouts.
- Hairline rules and whitespace carry structure — not shadows. Shadow scale reduced to
  two steps, used only for genuine elevation (dropdowns, dialogs).
- Motion: 150–250ms, `ease-out` in / `ease-in` out, transform+opacity only, every
  animation tied to a cause. `prefers-reduced-motion` respected globally.
- Dark mode fully re-derived (not inverted) and wired to a working toggle with no
  flash-of-wrong-theme.

---

## 4. SEO workstream

1. **Server-rendered HTML for every public route** — the foundational fix.
2. **Metadata API** per route via `generateMetadata`; canonical built from
   `NEXT_PUBLIC_SITE_URL`, never `window.location`.
3. **Server-rendered JSON-LD**, emitted in the HTML source:
   - `Organization` (typed `NGO`) + `WebSite` with `SearchAction` — root layout
   - `BlogPosting` with `articleBody`, `wordCount`, `inLanguage`, `@id`, `isPartOf`,
     `speakable`, real `Person` author — post pages
   - `BreadcrumbList` on all nested routes
   - `FAQPage` when a post defines FAQs
   - `CollectionPage` + `ItemList` on blog/category/tag indexes
4. **`app/sitemap.ts`** — real XML: static routes + posts + categories + tags + authors,
   with accurate `lastModified` from `updated_at`.
5. **`app/robots.ts`** — correct domain, `/admin` disallowed, sitemap declared.
6. **Per-post OG images** generated at the edge with `next/og`.
7. **`next/image`** everywhere with explicit dimensions, AVIF/WebP, blur placeholders,
   and `priority` only on the LCP image.
8. **URL-based pagination** (`/blog?page=2`) so deep pages are crawlable and indexable.
9. **Internal linking**: related posts by shared category/tag, plus in-body contextual
   links — distributes authority and increases crawl depth.
10. **Core Web Vitals**: font preloading, no render-blocking CSS, route-level code
    splitting, Suspense streaming so the article body is never blocked by the sidebar.

## 5. GEO workstream (Generative Engine Optimization)

SEO gets you ranked; GEO gets you *quoted*. These are the additions that make content
extractable and citable by AI answer engines.

1. **Explicit AI-crawler allowances in `robots.ts`** — GPTBot, OAI-SearchBot, ChatGPT-User,
   ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, CCBot, Applebot-Extended,
   Bytespider. Opting in is deliberate: the default is ambiguous and several engines skip
   on ambiguity. *(This makes SAF content available for AI training and citation — flagged
   here because it is a policy decision, not just a technical one.)*
2. **`/llms.txt`** — structured Markdown map of the site for AI crawlers, plus
   **`/llms-full.txt`** carrying the full text of published posts in one fetch.
3. **`/feed.xml`** RSS 2.0 with full content — a primary discovery route for AI crawlers.
4. **Answer-first content structure**, supported in the editor:
   - A "Key takeaways" block at the top of each post — the passage LLMs quote most
   - Question-form H2/H3 headings that mirror real queries
   - Definition blocks for named entities and programs
   - Tables for comparative/statistical claims — highly extractable
   - Explicit dates, figures, and named sources in prose; LLMs preferentially cite
     specific, attributable claims
5. **Entity clarity**: a consistent, machine-readable definition of the Stephen Akintayo
   Foundation, its programs, and its people, expressed in both prose and schema, with
   `sameAs` links to authoritative external profiles.
6. **Author authority pages** at `/author/[slug]` with bio, credentials, `sameAs` socials,
   and post list — the E-E-A-T signal AI engines weigh heavily.
7. **Freshness signals**: visible "Last updated" dates backed by accurate `dateModified`.

## 6. Schema migration

New migration adding SEO/GEO fields (all nullable — no breaking changes):

```sql
-- posts
meta_title text, meta_description text, focus_keyword text,
og_image_url text, canonical_url text,
faq jsonb,                    -- [{question, answer}] → FAQPage schema
key_takeaways text[],         -- answer-first block, GEO
reading_minutes int,
view_count int default 0,
noindex boolean default false

-- authors
slug text unique, twitter_url text, linkedin_url text, website_url text
```

Plus an index on `posts(published_at desc) where status = 'published'`.

---

## 7. Execution phases

| Phase | Work | Verifiable outcome |
|---|---|---|
| **1** | Next.js scaffold, `@supabase/ssr`, typed query layer, env config | `next build` succeeds; data reads from Supabase server-side |
| **2** | Design system: tokens, fonts, type scale, dark mode, primitives | Tokens applied; a11y contrast verified in both themes |
| **3** | Public routes rebuilt: home, blog, post, category, tag, about, newsletter, author, search | `curl` returns full HTML with content — the GEO fix, provable |
| **4** | SEO layer: metadata, JSON-LD, sitemap, robots, RSS, OG images | Rich Results Test passes; sitemap resolves |
| **5** | GEO layer: llms.txt, takeaways, FAQ, entity markup, author pages | AI-crawler surface live |
| **6** | Schema migration + admin panel rebuilt with SEO/GEO editor fields | Editors can set meta, FAQs, takeaways |
| **7** | Performance, a11y audit, redirects from old URLs, deploy config | Lighthouse ≥95, WCAG AA, no broken inbound links |

URL structure is preserved throughout (`/blog/[slug]`, `/category/[slug]`,
`/tag/[slug]`), so no existing link equity is lost.
