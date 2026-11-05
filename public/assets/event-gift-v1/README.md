# Animated race and tournament gift art

Original transparent 3×2 PNG atlases, lazy cached into six 256px frames each (about 3 MiB total decoded frames). Originals retained in Codex generated_images:
- race.png: exec-4e6ad40c-c989-4b05-9412-39e0c0ac9101.png
- duel.png: exec-c4281176-918d-4623-8aee-cf6202aab17c.png

Six art styles: cyan wind, jade sword swarm, golden phoenix, crimson demon dragon, violet thunder, imperial gold dragon. Eight visual milestones at 1/30/100/500/700/1000/1500/2000 coin; 5000 and 10000 extend the top style. Each tier increases size, duration and blade count. Art is animated, not a stationary overlay: exhaust uses six independently moving bands, wing/trail pulses, follower sprites move with the racer, sonic cones propagate upward, duel projectiles traverse curved paths with staggered timing and contact rings, then debris disperses. Higher tiers use more waves. One compact attribution label accompanies each display.

Server event-gift-fx.mjs records only cosmetic receipts after normal gift validation and deduplication, bounded to 16 recent rows/15 seconds on the race/current match. No tournament strength, HP, score or paid win logic is introduced. Existing race boost rules remain authoritative; zero extra distance at the gift cap still produces a cosmetic honor effect, labelled as honor rather than claiming a further boost.

Client public/event-gift-fx.js holds one active heavy effect, up to eight waiting, coalesces small pending streaks per donor, prioritises larger gifts and deduplicates repeated snapshots. Changing event/match clears stale visuals. The stage retains eight racers or both duel fighters. Tournament spectators receive a named central tribute rather than being substituted for a fighter. Race legacy gift drawing is replaced, not doubled.

Camera impulses are bounded and use temporary 1.2% overscan at 1x to avoid black edges; reduced motion/camera off disables shake. Existing audio mute, limiter and cooldown apply. LIVE rewards are never simulated by the preview.

Operator preview: /event-gift-preview.html, also linked in the Events tab. Refresh the LIVE Link once after deployment, same stable URL. Native renderer review: output/event-gift-preview.png; tests cover deduplication, capped boosters, persistence, spectator/participant attribution, bounded queues and rendering, evolving animation frames, and camera bounds.
