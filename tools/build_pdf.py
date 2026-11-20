"""Print the site to portfolio-en.pdf and portfolio-fr.pdf with headless Chrome.

Run from the repository root:  python tools/build_pdf.py
The PDF is the print stylesheet of index.html, so site and PDF never diverge.
"""
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    shutil.which("google-chrome") or "",
    shutil.which("chromium") or "",
]


def chrome() -> str:
    for c in CANDIDATES:
        if c and Path(c).exists():
            return c
    sys.exit("Chrome not found")


def main() -> None:
    exe = chrome()
    page = (ROOT / "index.html").as_uri()
    for lang in ("en", "fr"):
        out = ROOT / f"portfolio-{lang}.pdf"
        subprocess.run(
            [exe, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
             "--virtual-time-budget=8000", f"--print-to-pdf={out}", f"{page}?lang={lang}&print=1"],
            check=True, capture_output=True,
        )
        print(f"{out.name}: {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
