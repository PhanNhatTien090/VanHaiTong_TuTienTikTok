# Cinematic Combat V6 — real integrated assets (milestone 1)

This folder contains two ORIGINAL lightweight **transparent SVGs** (no baked-in UI and no third-party characters):
- `thunder-sigil.svg` — Lôi Long vận công, decoded into `scene.v6Assets.thunderSeal` once when a duel starts. Rendered in `charge()` for `thunder`.
- `taiji-seal.svg` — Thái Cực Phong Thiên, decoded into `scene.v6Assets.yinYang` and rendered as a rotating glyph during both charge and release.

**These are not disconnected mockups.** Runtime loader `public/duel-showcase-v6.js` sets `Image.src` before the ultimate (~19.8s into each match), and `drawDuelV6Ultimate()` paints them in the actual `public/social-stage.js` frame loop. On decode failure there is a deterministic geometric fallback; the operator preview reports failures.

Other project art deliberately reused without duplicating its compressed footprint:
- `/assets/god-forms-v1/thunder-dragon.png` → storm dragon
- `/assets/god-forms-v1/phoenix-fire.png` → phoenix fire
- `/assets/god-forms-v1/jade-dragon.png` → azure dragon
- Sword swarm, frost crystal eruption are authored deterministic Canvas geometry and allocate **no image** at hit time.

Six distinct V6 render families are mapped from `attackTechnique(player).id`:
- thunder, sword, flame, azure, frost, yinYang
- unsupported techniques retain previous V5 rendering, not blank output
- both duel sides keep independent charge/attack/counter timings and portraits

## Operator QA
`/event-vfx-preview.html` → Trợ lực sự kiện → Luận Kiếm → `V6 · Mẫu tuyệt kỹ` → select one of six.
Compare V6/Trước nâng cấp, phase Tụ lực/Cao trào/Dư âm, Balanced vs Light, Reduced Flash/Motion, sound on.
See **ảnh V6:** under FPS/P95 to confirm decoded images actually loaded. An error is explicitly labelled `LỖI`.

## Performance constraints
- Image fetch/decode only in `prewarmDuelV6`, keyed per match; max two fighter families plus a small sigil, no request inside draw.
- One signature primary and one smaller counter. With crowded/pressed rendering, secondary effect reduces to low-cost local seal/impact, main bolts 8→3, flying swords 19→7, side streams 7→3.
- No canvas `filter`, shadow-blur, full-screen flash, new animation loop or randomized particles in this module.
- Existing `RenderBudget` retains 24 FPS crowd target and global 1080×1920 pixel limit.
- Does NOT modify authoritative `social-events.mjs` winner, rewards, scores or hit receipts. Ward values remain server-owned.

## Automated validation
`test/duel-v6-showcase.test.mjs` checks disk asset paths, six visual families, off-frame image prewarming, real PNG draw, simultaneous cut-ins, reduced work budgets, and no gameplay mutation.
Run `npm run check && npm test` before promoting.
Production LIVE Studio FPS and audio have **not** yet been benchmarked. Keep the PR as Draft until actual capture is reviewed.
