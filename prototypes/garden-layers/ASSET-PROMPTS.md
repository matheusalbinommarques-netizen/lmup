# Prompts finais dos assets

Ferramenta: ImageGen integrado, modo de edição. Entradas de apoio em `D:/Codex-artifacts/garden-layer-proof-20261103/source-art/`. Estes são os prompts solicitados; o README distingue o pedido do resultado efetivo e registra as limitações encontradas.

## garden-clean-plate.png

Entradas em ordem: approved-garden.png. `transparent_background: false`.

```text
EDIT TARGET: the supplied approved Jardim painting. Create a clean background plate for a layered 2D game, preserving the original framing, camera, geography, perspective, rocks, little paths, left foreground framing tree, right waterfall and spring, stream, fencing, distant ruined temple, sunset sky and exact warm painterly art direction. ONLY remove the CENTRAL golden-leaf magical tree, its trunk, branches and roots, and the dense flowers INSIDE its circular bed. Leave an empty circular patch of dark natural earth inside the EXACT SAME stone ring, suitable to place four tree stages later. Keep both standing rune stones in their original positions and shapes, with engraved markings dark/unlit. Carefully reconstruct the landscape that the central canopy previously obscured: continuation of the existing dry rocky valley and warm sky. Absolutely no new architecture, no rearranged foreground rocks or stream, no new trees in the empty planting space, no labels or UI. Do not change the crop or zoom. Match the input canvas aspect 836:470. This is object removal / clean plate, not a new scene.
```

## tree-ancient.png

Entradas em ordem: approved-garden.png. `transparent_background: true`.

```text
Use case: background-extraction. EDIT TARGET supplied approved Jardim painting. Extract ONLY the central mature golden tree as a genuinely transparent PNG game sprite. Faithfully preserve the SAME tree identity, exact branching structure, gnarled trunk, asymmetric umbrella canopy, golden-green leaves, roots and warm sunset painting style. Retain natural fine gaps between branches/leaves as transparency; no background sky/landscape in those gaps, no white halos. Keep all leaf tips and roots inside the canvas. Remove EVERYTHING else: the foreground left framing tree, distant hills, sky, water, fence, flowers, stones and rune monoliths, stone ring, terrain and UI. No opaque background or ground platform, no added magical particles or glow. Root tips may have a subtle tiny contact shadow only. Center the isolated tree, with its base at about 90 percent canvas height. Preserve its broad original silhouette, do not redesign or turn it into a symmetrical generic tree. This sprite will be anchored over the exact original tree planting point.
```

## tree-seed.png

Entradas em ordem: legacy-seed.webp; approved-garden.png. `transparent_background: true`.

```text
Background extraction / transparent game sprite. Image 1 is the edit target for the tiny two-leaf germinating seedling in its central circular planting bed. Image 2 provides the approved warm golden sunset painterly material and light for the Jardim. Extract / preserve ONLY that tiny curved green-gold stem with TWO rounded leaves and the small cracked seed at its base, a couple of tiny root tips. Real transparent background with clean alpha; NO opaque or translucent haze, NO golden fog, NO glow, NO background, NO rocks, NO stone ring, NO flowers, NO soil platform, NO UI. The sprout is very young, NOT a small tree with branching limbs. Warm left/back sunset rim light consistent with image 2, subtly painterly edges. Isolated subject centered with generous transparent margin, entire seed and leaves in frame. Keep it simple and faithful to the reference appearance.
```

## tree-sapling.png

Entradas em ordem: approved-center-sprout.png; approved-garden.png. `transparent_background: true`.

```text
Background extraction / precise object edit. Image 1 is the target reference: the SMALL GOLDEN SAPLING at the right of the cottage, underneath Jardim da Árvore label. Extract ONLY this sapling with its thin upright trunk, a few irregular slender branching twigs and a modest number of yellow-green leaves. Image 2 is lighting/style reference for the final sunset Jardim. The result must be an isolated sprite on truly transparent background, with all gaps between twigs and leaves transparent. No ground, no soil mound or grass, no stone ring, no house, no UI or embedded label, no golden atmospheric haze or translucent mist. Preserve the sparse young silhouette of the sapling from image 1; DO NOT make a broad bushy mature tree. Warm painterly golden side/back light like image 2. Entire sapling in frame including fine root tips. Transparent margin around it.
```

## tree-young.png

Entradas em ordem: legacy-young.webp; approved-garden.png. `transparent_background: true`.

```text
Transparent sprite extraction. Image 1 is the target: ONLY the young tree in the center circular planting bed. Image 2 is the approved final mature golden tree for art/lighting consistency. Extract the YOUNG TREE from image 1 with a thin brown trunk, branching slender limbs, modest developing uneven golden-green leafy canopy, a few visible roots. Faithfully preserve its intermediate appearance and branch arrangement, distinctly more developed than a sparse sapling but much smaller/thinner than image 2 mature tree. No landscape, no mountains, no stone bed, no grass mound, no flowers, no benches or fencing, no background. Truly transparent PNG with all gaps between branches/leaves clear and crisp alpha; no translucent yellow haze, no glow or fog, no shadow cloud. Warm painterly sunset light, entire tree and roots in frame, transparent margins. Keep the approved golden tree family and do not introduce a different species, fruit, flowers or effects.
```

## vegetation.png

Entradas em ordem: approved-garden.png. `transparent_background: true`.

```text
Background extraction: isolate ONLY the small purple wildflowers, golden grass tufts and low leafy plants INSIDE the circular tree planting bed of this approved painting, as a truly transparent 2D game groundcover sprite. Preserve the original purple/yellow/green palette, warm painterly sunset lighting, small natural irregular flower clusters and camera perspective. Arrange them as a WIDE SHALLOW HORIZONTAL OVAL CRESCENT, fitting 90 percent canvas width but only about 22 percent canvas height, with some open transparent space in its center for a separate tree trunk. Keep the foreground roots/trunk area empty. Only plants with clean transparent gaps around and between individual stems and leaves. Absolutely NO soil, NO terrain patch, NO rock platform, NO stone ring, NO rune stones, NO trunk or roots, NO fencing, NO landscape, NO flat dark or brown background, NO golden fog, NO opaque halo. The alpha channel must contain ONLY plant silhouettes, no translucent atmosphere. This is a plant cutout for placing on existing earth, not a floating island or a new garden scene. Leave generous transparent margins above and below the shallow strip. Do not add unapproved objects.
```
