"""Draw the site icons (chip logo) and the link-preview card.

Run from the repository root:  python tools/make_icons.py
Writes favicon.svg, favicon.ico, assets/icons/*.png, assets/og-card.png and site.webmanifest.
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BG, LIME, MINT, INK = (5, 7, 6), (198, 244, 50), (62, 240, 168), (238, 243, 239)

SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="#050706"/>
<g stroke="#c6f432" stroke-width="2.4" stroke-linecap="round" opacity=".55">
<path d="M22 14V6M32 14V6M42 14V6M22 50v8M32 50v8M42 50v8M14 22H6M14 32H6M14 42H6M50 22h8M50 32h8M50 42h8"/></g>
<rect x="14" y="14" width="36" height="36" rx="7" fill="#0e1311" stroke="#c6f432" stroke-width="3"/>
<rect x="24" y="24" width="16" height="16" rx="3" fill="#c6f432"/>
</svg>
"""


def chip(size: int, pad: float = 0.0, round_bg: bool = True, transparent: bool = False) -> Image.Image:
    """Chip logo at `size` px; `pad` = safe-zone fraction for maskable icons."""
    s = 4 * size  # draw large, downsample for clean edges
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0) if (round_bg or transparent) else BG + (255,))
    d = ImageDraw.Draw(im)
    if round_bg:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=BG)
    inner = s * (1 - 2 * pad)
    o = s * pad
    u = inner / 64  # same geometry as the SVG
    def R(x0, y0, x1, y1, r, **kw):
        d.rounded_rectangle([o + x0 * u, o + y0 * u, o + x1 * u, o + y1 * u], radius=r * u, **kw)
    lime_dim = LIME + (140,)
    for v in (22, 32, 42):
        for a, b in (((v, 6), (v, 14)), ((v, 50), (v, 58)), ((6, v), (14, v)), ((50, v), (58, v))):
            d.line([o + a[0] * u, o + a[1] * u, o + b[0] * u, o + b[1] * u], fill=lime_dim, width=max(1, int(2.4 * u)))
    R(14, 14, 50, 50, 7, fill=(14, 19, 17), outline=LIME, width=max(1, int(3 * u)))
    R(24, 24, 40, 40, 3, fill=LIME)
    return im.resize((size, size), Image.LANCZOS)


def og_card() -> Image.Image:
    w, h = 1200, 630
    im = Image.new("RGB", (w, h), BG)
    glow = Image.new("RGB", (w, h), BG)
    ImageDraw.Draw(glow).ellipse([700, 60, 1260, 620], fill=(40, 60, 12))
    im = Image.blend(im, glow.filter(ImageFilter.GaussianBlur(120)), 1.0)
    d = ImageDraw.Draw(im)
    for x in range(0, w, 48):
        d.line([x, 0, x, h], fill=(14, 18, 16))
    for y in range(0, h, 48):
        d.line([0, y, w, y], fill=(14, 18, 16))
    logo = chip(250, round_bg=False, transparent=True)
    im.paste(logo, (880, 190), logo)
    def font(name, size):
        p = ROOT / "fonts" / name
        try:
            f = ImageFont.truetype(str(p), size)
            return f
        except OSError:
            return ImageFont.load_default()
    mono, disp, sans = font("JetBrainsMono.woff2", 24), font("Unbounded.woff2", 64), font("Inter.woff2", 28)
    for f, wght in ((mono, 600), (disp, 800), (sans, 500)):
        try:
            f.set_variation_by_axes([wght])
        except Exception:
            pass
    d.text((80, 120), "EMBEDDED SYSTEMS · FPGA · EMBEDDED AI", font=mono, fill=LIME)
    d.text((80, 175), "MOHAMED AMINE", font=disp, fill=INK)
    d.text((80, 255), "BELKACEM", font=disp, fill=LIME)
    d.text((80, 370), "24 measured projects · M2, University of Lorraine", font=sans, fill=(205, 214, 209))
    d.rounded_rectangle([80, 440, 560, 492], radius=26, fill=LIME)
    d.text((104, 452), "Internship from March 2027 · 6 months", font=font("Inter.woff2", 22), fill=BG)
    d.text((80, 540), "amine-belkacem.github.io", font=mono, fill=(125, 137, 131))
    return im


def main() -> None:
    (ROOT / "favicon.svg").write_text(SVG, encoding="utf-8")
    icons = ROOT / "assets" / "icons"
    icons.mkdir(parents=True, exist_ok=True)
    chip(180, round_bg=False).save(icons / "apple-touch-icon.png")  # iOS rounds the corners itself
    Image.alpha_composite(Image.new("RGBA", (180, 180), BG + (255,)), chip(180, round_bg=False)).save(icons / "apple-touch-icon.png")
    chip(192).save(icons / "icon-192.png")
    chip(512).save(icons / "icon-512.png")
    Image.alpha_composite(Image.new("RGBA", (512, 512), BG + (255,)), chip(512, pad=0.12, round_bg=False)).save(icons / "icon-maskable-512.png")
    chip(48).save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    og_card().save(ROOT / "assets" / "og-card.png", optimize=True)
    manifest = {
        "name": "Mohamed Amine Belkacem – Portfolio",
        "short_name": "MAB",
        "description": "Embedded systems, FPGA and embedded AI projects.",
        "start_url": "./",
        "scope": "./",
        "display": "standalone",
        "background_color": "#050706",
        "theme_color": "#050706",
        "icons": [
            {"src": "assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "assets/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    (ROOT / "site.webmanifest").write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print("icons, og card and manifest written")


if __name__ == "__main__":
    main()
