"""Read-only comparison of captured stage 1/4 canvases; records strict failures."""
from pathlib import Path
from PIL import Image
import numpy as np
import json

root = Path(r'D:\Codex-artifacts\camp-modular-20261103')
results = {}
for name, width, height, bounds in [
    ('center', 1620, 970, (1020, 250, 1615, 725)),
    ('garden', 836, 470, (188, 0, 681, 354)),
]:
    first = np.asarray(Image.open(root / 'captures' / f'desktop-{name}-stage-1-canvas.png').convert('RGB'))
    last = np.asarray(Image.open(root / 'captures' / f'desktop-{name}-stage-4-canvas.png').convert('RGB'))
    assert first.shape == last.shape, name + ' changed canvas dimensions'
    h, w = first.shape[:2]
    x = np.arange(w)[None, :] / w * width
    y = np.arange(h)[:, None] / h * height
    left, top, right, bottom = bounds
    fixed = ~((x >= left) & (x <= right) & (y >= top) & (y <= bottom))
    delta = np.max(np.abs(first.astype(np.int16) - last.astype(np.int16)), axis=2)[fixed]
    outside = int(np.count_nonzero(delta > 2))
    results[name] = {
        'canvasPixels': [w, h], 'intrinsicCanvas': [width, height],
        'dynamicBounds': bounds, 'fixedPixelCount': int(delta.size),
        'changedPixelsOutsideDynamicArea': outside, 'thresholdPerChannel': 2,
        'maxFixedChannelDifference': int(delta.max()),
        'meanFixedChannelDifference': float(delta.mean()),
        'strictFixedComparisonPassed': outside == 0,
    }
(root / 'pixel-comparison.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
print(json.dumps(results))
if not all(row['strictFixedComparisonPassed'] for row in results.values()):
    raise SystemExit('Strict comparison did not pass for every scene. See recorded measurements; do not claim pixel identity.')