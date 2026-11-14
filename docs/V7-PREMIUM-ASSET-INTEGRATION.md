# V7 — Premium Alpha Art: actual in-game integration

The repo now contains two fully integrated art modes:
- **Default:** eight original SVG vectors (including screen fracture) and reused pre-existing transparent game assets. Works immediately from PR #6; all thirteen ultimates and six gift classes remain visible.
- **Premium:** seven optional transparent WebP layers derived from the art pack already generated during the design conversation. A small config enables WebP only once files have actually been placed under `public/assets/v7-premium/`. This avoids false claims that generated ChatGPT binary files are automatically in GitHub.

## Install the actual generated premium imagery
1. Download `van_hai_tong_v7_asset_pack.zip` from the conversation, or the smaller `van_hai_tong_v7_premium_runtime_ready.zip` containing only runtime files.
2. Checkout `feat/v7-overdrive-screen-shatter-assets-20261115` in your local copy of the game. Do not deploy the LIVE branch yet.
3. With the original 31 MB archive, run:

```powershell
npm run assets:v7-install -- "C:\\Users\\You\\Downloads\\van_hai_tong_v7_asset_pack.zip"
```

The cross-platform installer has no third-party dependencies: it reads a ZIP central directory, extracts only seven whitelisted WebPs, rejects invalid RIFF/WEBP contents and sizes above 900 KB, creates a SHA256 manifest, and enables the `public/v7-premium-config.js` switch. It also works with the already extracted folder.

Alternatively, unzip the **runtime-ready** ZIP directly at the repository root. It includes `public/assets/v7-premium/` and the enabled config (no CLI needed). Do not combine the two methods: they produce the same runtime files.

## Art mapping
| Sprite | Actual LIVE consumer |
|---|---|
| `thunder-dragon.webp` | Lôi Long charge + dragon flight |
| `thunder-dragon-impact.webp` | Dragon collision / burst |
| `divine-sword-storm.webp` | Vạn Kiếm sword swarm |
| `flame-phoenix.webp` | Phượng Hoàng charge + flame travel |
| `phoenix-impact.webp` | Phoenix collision |
| `taiji-seal.webp` | Thái Cực sealing portal |
| `screen-shatter.webp` | screen-wide fracture/impact, correctly aspect-fit around the collision |

All seven are genuine WebPs with alpha, predecoded per active match. There are no placeholder network URLs or runtime CSS full-screen filters. The V7 original SVG fallback is always available.

## Memory / lag rules
- For **Light**, **Crowded**, or **Pressured** quality, the premium images are **not even fetched or decoded**. The game automatically falls back to its authored lightweight SVG/Canvas versions.
- At normal quality, only sprites for **the actual two current fighters** and one screen-shatter file are requested. Repeated state synchronizations do not reload the same images.
- Individual compressed assets are about 180–390 KB; only a subset is decoded at a time, not the full original 31MB archive.
- Zero new `requestAnimationFrame` loops, WebGL dependencies, CSS blur, or per-hit image allocations.
- All of this is a client-side cosmetic addition. The authoritative winner, gift coin calculation, server shield damage, and saved player state remain untouched.

## QA after installation
Run:
```bash
npm ci
npm test
node scripts/render-v7-overdrive-gallery.mjs
node scripts/bench-v7-render.mjs
```
The gallery switches to premium artwork automatically when the enabled config is present and outputs `output/v7-visual-proof/manifest.json` listing `premiumAssets`. In `/event-vfx-preview.html`, choose **Trợ lực → Luận Kiếm → V7 skill**, inspect `Premium WEBP:` next to the FPS/P95 panel, and try 20/50/80 players with Light and Balanced, while keeping Reduced Flash enabled if preferred.

A GitHub Actions runner tests the SVG-only version by default. Its CPU draw timings are **not** a guarantee of TikTok LIVE Studio FPS. Before production, capture at least one full 25-second match, a two-gift collision, and the same scene while streaming with actual LIVE overlays.

## Release policy
The V7 PR is stacked on V6 and V5; these are drafts. Do not merge into main, change player state, or deploy to production without explicit review. The original exported asset pack remains a separate conversation artifact; the GitHub PR does not contain its binary WebPs unless you complete the installation and commit those files.
