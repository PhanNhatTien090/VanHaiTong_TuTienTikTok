# Current LIVE graphics policy — 06/11/2026 (supersedes earlier pixel-reduction policy)

Keep 1080 px LIVE output at every audience tier; sprite buffers retain at least 2.5 scale. Wings always draw. Only background/idle complexity decreases at 10, 15, 20 and above 20 viewers, with automatic recovery when viewers leave. Under 20 restore pets, relics and ordered side accents; old overlapping rotating circles remain replaced.

Root cause of stuck low quality: 36 profiles still marked active while TikFinity reported 15 actual viewers. The bridge now records roomUser.viewerCount and its timestamp. Graphics use fresh actual audience counts (including zero), falling back to active real profiles only if missing/stale for 120 seconds. Invalid/null values do not become zero. No profiles, cultivation or attendance timers are changed.

Breakthroughs use a full-detail high-quality drawing context for every realm regardless of audience. Crowd and compact flags are suspended during the draw and restored in finally. Ritual frame caps are independent from the idle crowd cap (30 fps, Luyện Khí 60 fps); reduced-motion preference remains respected. No ritual layers are removed to save performance.

Verified: TikFinity connected and viewerCount arrives; actual LIVE Studio telemetry reported renderWidth 1080 and no client error. Full suite 469/469 passed, including viewer-count override, threshold recovery, wings at strongest crowd setting, and full-detail ritual with state restoration. Backend restarted via the export/gift-buffer preserving helper.

Gift guide now uses four fixed image + benefit rows with no repeated gift names or coin counts: Tăng mạnh tu vi, Cơ duyên lớn, Thiên mệnh, Tông chủ. This is display copy; no automatic administrative authority is granted by the guide.
