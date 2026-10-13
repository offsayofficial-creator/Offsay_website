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
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`: Microsoft Clarity project ID (`ywwrf3d5be` for Offsay). Tracking loads only in production after analytics acceptance. A blank ID disables Clarity.
- `NEXT_PUBLIC_GTM_ID`: Google Tag Manager container (`GTM-WCDZDKB5`). Loads in production after analytics acceptance. A blank ID disables Google tags. The consent UI is disabled when both provider IDs are blank.
- `NEXT_PUBLIC_PORTAL_URL`: OffSay business portal URL (defaults to the GitHub Pages redirect)
- `NEXT_PUBLIC_PLAY_STORE_URL`: optional override for the official Android listing
- `NEXT_PUBLIC_APP_STORE_URL`: official iOS listing (leave blank for “Coming soon”)
- `NEXT_PUBLIC_CONTACT_EMAIL`: public support email

## Microsoft Clarity

In Clarity project `ywwrf3d5be`, configure **Settings → Setup → Advanced settings** to require cookie consent. The website sends Consent V2 analytics permission after acceptance and keeps advertising storage denied. Rejection does not load Clarity; withdrawing consent revokes permission and reloads the page. The contact form is masked, and email-verification and password-reset routes do not initialize tracking.

The deployment workflow supplies the project ID. For another hosting service, set `NEXT_PUBLIC_CLARITY_PROJECT_ID=ywwrf3d5be` before building. Development runs do not show the consent prompt or send analytics. After deploying, accept analytics on the live website and verify sessions in the Clarity dashboard. Deployment is not performed by adding this integration.

## Google Tag Manager and Google Analytics

The deployment workflow supplies `NEXT_PUBLIC_GTM_ID=GTM-WCDZDKB5`. Create a GA4 Web data stream for the website, then configure its `G-…` Measurement ID in a Google tag inside this GTM container with the Initialization – All Pages trigger. Preview and verify the tag, then publish the container. Installing GTM alone does not configure GA4.

The website blocks GTM until analytics acceptance, grants analytics storage only, and denies advertising storage, user data, and personalization. An earlier Clarity-only consent choice requires a new choice for Google analytics. No unconditional noscript iframe is included because it would bypass this consent flow. Do not add another direct Google Analytics installation or a Clarity tag in GTM, which would duplicate tracking. After website deployment, accept analytics and use GTM Preview and GA4 Realtime to verify collection.
