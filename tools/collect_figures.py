"""Copy one lead figure per project into assets/img/ as WebP (960 px + a 480 px version for phones).

Run from the repository root:  python tools/collect_figures.py
Source repositories: folder given by the PORTFOLIO_REPOS environment variable,
or by default Desktop\\les memoires et projet pour le cv\\github.
"""
import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REPOS = Path(os.environ.get(
    "PORTFOLIO_REPOS",
    Path.home() / "Desktop" / "les memoires et projet pour le cv" / "github",
))
OUT = ROOT / "assets" / "img"
MAX_W = 960

FIGURES = {
    "aes128-sidechannel-lab": "figures/m2_correlation_vs_guess.png",
    "audio-deepfake-generalization": "results/m5/channels_eer.png",
    "autorange-current-profiler": "docs/figures/j1_g1_bode.png",
    "eurosat-onboard-transfer": "figures/data_efficiency.png",
    "fp8-mac-vhdl": "docs/architecture.png",
    "fraud-detection-alert-budget": "figures/stress_test.png",
    "french-bpe-tokenizer": "figures/comparison_fertility.png",
    "health-monitor-iot": "docs/architecture.png",
    "home-assistant-weather-station": "docs/dashboard_demo.png",
    "int8-neon-inference-pi5": "figures/m1_reference_vs_ort.png",
    "lunarlander-dqn-vs-ppo": "figures/learning_curves.png",
    "optimizers-low-precision": "docs/img/precision_accuracy.png",
    "plc-drift-twin": "results/J1/drift_trajectories.png",
    "qt6-uart-fpga-api": "docs/images/console_rx_tx_result.png",
    "sky130-opamp-sizing-bench": "results/j0/figures/j0_time_per_sim.png",
    "smart-house-solar-energy": "docs/house_model_roof.jpg",
    "spam-classic-vs-transformer-edge": "figures/quality_vs_cost_pc.png",
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for repo, rel in FIGURES.items():
        src = REPOS / repo / rel
        if not src.exists():
            print(f"MISSING {src}")
            continue
        img = Image.open(src)
        img = img.convert("RGB") if src.suffix.lower() in (".jpg", ".jpeg") else img.convert("RGBA")
        if img.width > MAX_W:
            img = img.resize((MAX_W, round(img.height * MAX_W / img.width)), Image.LANCZOS)
        dst = OUT / f"{repo}.webp"
        img.save(dst, "WEBP", quality=80, method=6)
        if img.width > 480:
            img.resize((480, round(img.height * 480 / img.width)), Image.LANCZOS).save(OUT / f"{repo}-480.webp", "WEBP", quality=78, method=6)
        # the size goes in the DIMS table of js/app.js (lets the browser reserve the space)
        print(f"{dst.name:45s} {dst.stat().st_size // 1024:5d} KB")


if __name__ == "__main__":
    main()
