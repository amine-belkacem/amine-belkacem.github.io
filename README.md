# amine-belkacem.github.io

My portfolio, served by GitHub Pages at <https://amine-belkacem.github.io>.
Version 2: plain HTML, CSS and JavaScript with no build step, three.js for the hero and GSAP for motion (both from a CDN, pinned versions). French and English.

| Path | Content |
|---|---|
| `index.html` | Page shell, import map for three.js 0.160.0, GSAP 3.12.5 |
| `js/data.js` | All the content: profile, projects (FR + EN), skills, path |
| `js/scene.js` | 3D circuit board hero: traces, signal pulses, bloom, mouse tilt, click the chip for a burst |
| `js/app.js` | Rendering, boot screen, scroll animations, horizontal gallery, search + filters (Flip), skill → project links, project viewer (← →), command palette (Ctrl K or /), custom cursor |
| `css/style.css` | Screen styles and the light print layout used for the PDF |
| `assets/img/` | One figure per project, copied from each repository |
| `portfolio-en.pdf`, `portfolio-fr.pdf` | PDF versions, printed from the same page |

## Updating

1. Edit `js/data.js`. Every number must come from the README or `results/` of the linked repository.
2. New figure: add it to `FIGURES` in `tools/collect_figures.py`, then `python tools/collect_figures.py`.
3. Rebuild the PDFs: `python tools/build_pdf.py` (needs Chrome).
4. Preview: `python -m http.server 8796`, then open <http://localhost:8796>. `?lang=fr` forces French, `?noboot` skips the boot screen.

Motion respects `prefers-reduced-motion`; without WebGL the hero falls back to a gradient.

## License

Code MIT. Texts and figures © Mohamed Amine Belkacem.
