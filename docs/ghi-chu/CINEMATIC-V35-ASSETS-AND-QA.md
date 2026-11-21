# Cinematic V3.5 — asset & feature integration (review branch)

> **Status: Draft PR only. Do not merge into a live production branch before validating in TikTok LIVE Studio.**

## Original image assets

Seven transparent SVG assets with zero external dependencies and no runtime drawing filters:

| Asset | Used by |
| --- | --- |
| `assets/vfx-v35/celestial-seal.svg` | Major-realm guardian seals |
| `assets/vfx-v35/void-rift.svg` | Luyện Hư void gate, Balanced/High only |
| `assets/vfx-v35/celestial-impact.svg` | Major-realm assisted impact |
| `assets/vfx-v35/crystal-blue.svg` | Spirit-stone showers |
| `assets/vfx-v35/crystal-violet.svg` | Spirit-stone showers |
| `assets/vfx-v35/crystal-gold.svg` | Rare/high-volume spirit-stone showers |
| `assets/vfx-v35/heart-spark.svg` | Heart milestones |

Also 11 original, lightweight inventory icons in `public/assets/ui-inventory/`. These are **not** large character illustrations.

**Review:** `/vfx-v35-gallery.html` is a static thumbnail gallery. `/live-feedback-preview.html` is a client-only interactive VFX/SFX preview. The requested cinematic UI concept image may serve as visual direction, but it is **not** an in-game PNG atlas.

SVGs are decoded only once by `prepareCinematicArt()` and `prepareFeedbackArt()`, with procedural Canvas fallbacks until decoding completes. They are rendered with at most one additional `drawImage` in the chosen high-priority moments; Light removes the ornamental extras. No realtime SVG DOM, fullscreen blur or extra animation loop.

## Integrated live visual changes

- **Spirit stones:** deterministic particle rain and short cached crystal chimes at actual resource events; throttle/dedupe.
- **Hearts:** bounded heart burst and player-name spotlight at actual count milestones, with lower priority than major rituals.
- **Stage-ups:** minor/mid/late realm transitions have short rings and text.
- **Combat:** event-bound hit reactions, banner for one major skill at a time and capped camera impulse.
- **Duels:** actual existing aura/boosts displayed, with a visual cast/recovery rhythm; no fictitious HP resource added.
- **Inventories:** up to four concurrent, independently timed illustrated inventory/pets/skins cards. The backend reports catalog names and stats, main/secondary relic selection, and capped item lists.
- **Guardian tribulation:** recognizes the three real pre-registered helpers in `guardHelpers` for realm 6+, using a duration-relative timeline even when specialized awakening functions return no phase. No new gift or donation requirement.
- **Gift tiers:** 500+ receive light cinematic feedback, with stronger tier cues only above existing threshold.
- **Luyện Hư:** one cached void-gate backdrop with an additional preloaded SVG for richer geometry (Balanced/High only).

## Performance guardrails

- 5 procedural reward stamps (~80 px) are pre-rasterized and 7 SVGs decode outside the frame loop.
- No new `requestAnimationFrame`, no new scene-to-DOM updates per frame.
- Global event queue remains capped, only 1–2 concurrent overlays; Light mode caps particles.
- Important breakthrough/large-gift moments suppress incidental reward ribbons.
- UI card HTML replaces only when an inventory request is received (no per-frame layout).
- Localized visual impact, no full-viewport rapid white flashing; Reduced Motion and Reduced Flash respected.
- High visual quality is never forced on a pressured LIVE render.

## QA status

- GitHub Actions `v3-pr-checks.yml` was added to run `npm run check`, `npm test`, and syntax checks; a separate diagnostic job runs **unmodified main** for comparison (does not write to main).
- Initial workflow: syntax check passed; 655/667 tests passed, 12 failed. This count is **not a V3 success claim**; the failed cases include inherited assumptions about High ritual rendering and other progression/audio tests that need comparison to main. One ritual test has been updated to verify manual Performance is honored.
- New tests cover original SVG safety, inventory art path safety, four-owner cap, and real guardian activation.
- **Not yet verified:** actual TikTok LIVE Studio FPS/frame P95/P99; audio ducking/real listening; all gameplay screens on real data; screenshots comparing all new features.

## Review checklist

1. Inspect the seven images in `/vfx-v35-gallery.html`.
2. Preview crystal shower, heart milestones and skill hits in `/live-feedback-preview.html`.
3. Compare solo Luyện Hư and a supported large-realm breakthrough with 0–3 actual helpers.
4. Show 1–4 inventory cards concurrently using test users, and verify names/assets/values match their real profiles.
5. During a duel, verify aura and helper boost cues; no fake HP shown.
6. Stress-test 20/50/80 active users and gifts, record frame time, watch audio.
7. Review CI results, fix **new** regressions before merge; keep the PR Draft until then.

## Out of scope / remaining

This set of changes is an **incremental visual & UX upgrade, not a rewrite of every existing event, boss and realm**. It does not implement true combat healing/HP or change tournament winner rules. These need an explicit gameplay architecture and balancing tests rather than fake visuals. Production deployment is intentionally untouched.
