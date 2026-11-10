"""Regenerates the lossy sidebar background from the approved painting.

The original (static/art/approved/paintings/05_Cartao_Mapa.webp, 2.4 MB) is kept
untouched. The full-resolution compressed option was selected by the author
after a 1x/2x comparison on 2026-11-09. Requires Pillow with WebP support.
Usage: python scripts/optimize-sidebar-art.py
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
source = root / "static/art/approved/paintings/05_Cartao_Mapa.webp"
target = root / "static/art/ui/sidebar-map.webp"
image = Image.open(source).convert("RGB")
image.save(target, "WEBP", quality=62, method=6)
print(f"{target.relative_to(root)}: {image.size[0]}x{image.size[1]}, {target.stat().st_size // 1024} KB")
