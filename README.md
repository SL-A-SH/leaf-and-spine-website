# Leaf & Spine — Cinematic Scroll Website

An interactive short film: five Seedance 2.0 clips, chained frame-to-frame, scrubbed
by scroll through a canvas frame sequence with Lenis smooth scrolling.

## Run locally

Any static server from the repo root works:

```bash
# option 1
python -m http.server 5173
# option 2
npx serve -l 5173
```

Then open http://localhost:5173

## Structure

- `index.html` — the whole experience (nav, hero, pinned sections, final CTA)
- `css/style.css` — design system: walnut / charcoal / cream / leather / brass
- `js/main.js` — scroll engine: Lenis + canvas frame scrubbing + scene windows
- `vendor/` — Lenis (vendored locally, no CDN needed)
- `assets/clip1..5.mp4` — the five generated film clips
- `assets/trailer.mp4`, `assets/poster.jpg` — built by `tools/extract.sh`
- `frames/` — baked JPEG frame sequence + `manifest.js` (built by `tools/extract.sh`)

## Rebuild the frame sequence

With `assets/clip1.mp4 … clip5.mp4` present:

```bash
bash tools/extract.sh
```

## Scene map (film progress)

| Window       | Clip              | Overlay                     |
|--------------|-------------------|-----------------------------|
| 0.00 – 0.20  | The Invitation    | Hero                        |
| 0.20 – 0.41  | The Story         | Reading                     |
| 0.41 – 0.61  | The Sanctuary     | Focus × 4 environments      |
| 0.61 – 0.80  | The Reader        | Study, Habit                |
| 0.80 – 1.00  | The Collection    | Bookshelf, Privacy          |
| hold (x > 1) | Final frame held  | Premium grid, Final CTA     |

Windows were tuned to the actual rendered content (see data-in/data-out on each
section in index.html). Frames 98–105 are a synthesized morph bridge smoothing
the clip 1 → 2 seam.

The previous privacy-policy React app is preserved in git history
(and its README as `README.privacy-site.md`).
