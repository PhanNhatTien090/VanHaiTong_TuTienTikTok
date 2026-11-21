# LIVE voice latency and crowd graphics — 06/11/2026

## Voice

Observed repeated `VieNeu chưa phản hồi` in the running server log. Four concurrent Node jobs were being sent to one serial local worker, accumulating stale synthesis. Only one uncached synthesis now enters the worker at a time; prewarming starts at most one available important job per tick.

Client keeps personalized speech when ready, but after 1,200 ms of synthesis wait uses a prerecorded response made with the same local Thiền Tâm Đức voice. Covers cultivation, combat, ready, breakthrough, gifts, entrance, gather, learn and other personal notices. Event announcements retain their explicit speech/file. Fallback lines do not claim a different name, realm, item or amount; the exact information remains visible. Late personalized audio never replays after fallback. This deadline concerns preparation when a speaking turn starts, not a guarantee of end-to-end latency during simultaneous events.

Important events can cancel a routine preparation before an Audio element exists. Only the newest routine response stays queued. Gift priorities and event announcement retries remain intact. No browser TTS or new external provider introduced. Static clip generation script and source texts are checked in alongside the assets.

## Graphics

Count active real players, excluding residents and puppets. 0–9: selected/automatic quality. 10–20: light (900 px, 24 fps, poses 8 fps), no spinning back halos or layered god aura sprites. 21+: crowded (720 px, 20 fps, poses 4 fps, mesh 1, atmosphere disabled), also hide idle wings, following pets, sea ornaments and orbiting relic decorations; keep bodies, names, health, combat and breakthrough presentations. Race wings remain functional visual cues.

Returning below thresholds restores the intermediate tier and selected quality. Reduced graphics never remove active players from the roster. A native-canvas integration test renders all 500 active profiles, a solo gift, and restores the roster.

Persistent Chân Tiên+ presence now uses one ordered side-accent layer (feathers, stars, shards, solar rays, lotus, jade, dragon whiskers, void cuts) and a small foot seal. Old overlapping rotated halo atlases and additional orbiting god dragon sprites are no longer drawn. No change to cultivation economy or player ownership.

## Deployment evidence

Frontend public files auto-reload through the existing index ETag watcher. Restarted backend using gift-buffer and export-preserving restart helper: 4,134 profiles, zero missing, zero realm/total-qi drops, TikFinity connected. Actual LIVE Studio telemetry after deployment reported 34 active users with 720 px backing width. Fast clip local HTTP fetches returned 200 in 3–98 ms. No claim of subjective listening validation or guaranteed FPS on the streaming machine.

New god skin previews for Thần Đế, Thần Tôn, Thần Tổ and Hồng Mông remain in output/realm-skins-v3, awaiting review; this graphics change does not install unapproved skins.
