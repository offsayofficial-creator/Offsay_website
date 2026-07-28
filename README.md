# OffSay Public Website

The public, SEO-focused marketing website for OffSay. It is intentionally separate from the customer Flutter app and the authenticated Superadmin/merchant portal.

## Local development

1. Copy `.env.example` to `.env.local` and replace the placeholder URLs and email address.
2. Install dependencies with `npm install`.
3. Start development with `npm run dev`.
4. Open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The production build is a fully static export in `out/`, suitable for Cloudflare Pages or another static host.

## Environment variables

- `NEXT_PUBLIC_SITE_URL`: canonical public website URL
- `NEXT_PUBLIC_PORTAL_URL`: OffSay business portal URL (defaults to the GitHub Pages redirect)
- `NEXT_PUBLIC_PLAY_STORE_URL`: official Android listing (leave blank for “Coming soon”)
- `NEXT_PUBLIC_APP_STORE_URL`: official iOS listing (leave blank for “Coming soon”)
- `NEXT_PUBLIC_CONTACT_EMAIL`: public support email
