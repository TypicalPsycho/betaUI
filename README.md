# SignalBench Beta UI

Private beta UI hosted on GitHub Pages and protected by Cloudflare Access (Email OTP).

## Live URLs
- Beta entry: `https://beta.signal-bench.com/app.html`
- App shell: `https://beta.signal-bench.com/app.html`

## Hosting
- Static files hosted on GitHub Pages.
- Repo: `TypicalPsycho/betaUI` (public repo; Access controls visibility).

## Access Control (Cloudflare)
Cloudflare Access sits in front of the beta site and requires Email OTP for allowlisted users.

- Access application: `SignalBench Beta1`
- Protected host: `beta.signal-bench.com`
- Login method: One-time PIN (Email OTP)
- Allowlist: specific invited emails (employees + friends)

## Security model (beta)
- UI access is gated by Cloudflare Access (Email OTP).
- API access is separately gated by Cloudflare Access on `api.signal-bench.com`.
- The orchestrator validates the Access JWT on every request and derives user identity from it.
- Client-provided user_id values are ignored when Access is enabled.

## DNS / Domain Setup (Cloudflare)
- `beta` CNAME -> `typicalpsycho.github.io` (proxied, orange cloud)
- SSL/TLS mode: **Full (Strict)**

## GitHub Pages Configuration
- Pages source: `main` branch `/ (root)`
- Custom domain: `beta.signal-bench.com`
- Enforce HTTPS: enable when available

## Folder Structure
```
/
  app.html
  landing.html
  auth.html
  onboarding.html
  casefile_new.html
  demo_router.html
  feedback.html
  settings.html
  ui_shell.css
  ui_theme.js
  ui_store.js
  icons/
```

## SEO / Crawler Notes
To reduce discovery during private beta:
- `robots.txt` disallows `/` (or beta paths if you later add subfolders)
- Each beta HTML file includes:
  `<meta name="robots" content="noindex, nofollow" />`

## Updating the Beta
1) Edit files locally.
2) Commit + push to `main`.
3) GitHub Pages auto-deploys.

## Troubleshooting
- If HTTPS isn't available in GitHub Pages, wait 10-30 minutes after DNS changes.
- If still blocked, temporarily set the `beta` CNAME to **DNS only**, enable HTTPS in GitHub, then switch back to **Proxied**.

---

Owner: SignalBench
Date: 2026-01-30
