# amine-belkacem.github.io

My portfolio, served by GitHub Pages at <https://amine-belkacem.github.io>.
Plain HTML, CSS and JavaScript, no framework and no build step. French and English.

| Path | Content |
|---|---|
| `index.html` | Page shell |
| `js/data.js` | All the content: profile, projects (FR + EN), skills, path |
| `js/app.js` | Rendering, domain filters, project details, language and theme switch |
| `css/style.css` | Screen styles, dark mode, and the print layout used for the PDF |
| `assets/img/` | One figure per project, copied from each repository |
| `portfolio-en.pdf`, `portfolio-fr.pdf` | PDF versions, printed from the same page |

## Updating

1. Edit `js/data.js`. Every number must come from the README or `results/` of the linked repository.
2. New figure: add it to `FIGURES` in `tools/collect_figures.py`, then `python tools/collect_figures.py`.
3. Rebuild the PDFs: `python tools/build_pdf.py` (needs Chrome).
4. Preview: `python -m http.server 8795`, then open <http://localhost:8795>. `?lang=fr` forces French.

## License

Code MIT. Texts and figures © Mohamed Amine Belkacem.
