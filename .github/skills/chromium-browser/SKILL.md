---
name: chromium-browser
description: Use Chromium/Chrome to preview the event-hub app, take screenshots and visually verify UI changes. Use when asked to check a page, capture a screenshot, or test the front end in a browser.
---

# Chromium browser

## Preferred: Browser canvas
Open the app (or a local dev server) in the `browser` canvas to preview and verify UI visually.

## Fallback: headless CLI
On macOS, Chromium is not installed by default; Google Chrome (Chromium-based) is at:

```
/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
```

Screenshot a page:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --window-size=1280,800 \
  --screenshot=/tmp/shot.png http://localhost:3000
```

Dump rendered DOM: replace `--screenshot=...` with `--dump-dom`.

## Rules
- Start the dev server first (see `compose.yaml` and `back/`) and verify it responds with `curl` before opening it.
- Write screenshots to `/tmp` or the session files folder, never into the repo.
- Stop any server you started once verification is done.
