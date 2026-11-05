# Flying dragon and phoenix gift ensembles

Original transparent generated assets retained in Codex generated_images:
- dragon.png: exec-76ad7fbb-56f3-4c91-b2a6-09f1a665e0e8.png. Three columns (scarlet/violet/gold); rows are head/body/tail. Unequal original row boundaries are explicitly 0/.378/.634/1 of height, rather than cutting heads at one third.
- phoenix.png: exec-8ee06f75-702a-484a-8120-69ea3f127d49.png. Three columns body/left wing/right wing; gold and violet-cyan variants on two equal rows.

public/gift-spirit-beasts.js lazily slices 15 cached 256px parts (~3.75 MiB RGBA) and releases source images. Each dragon has a head and tail plus 14 articulated overlapping body segments in light mode (22 otherwise). Parts rotate along tangents on a curved flight path. Phoenix wings hinge independently at shoulders, foreshorten on flaps, and five body/tail bands sway behind the bird. Entrance dives, orbit/swoop, landing shock ring and upward departure all follow normalized event time.

500: fire phoenix. 700: violet dragon. 1000: gold dragon + violet phoenix. 1500: scarlet and gold dragons. 2000: two dragons + fire phoenix. 3000+: two dragons + two phoenixes. 10000 increases scale. No player stats, boost amounts, race rankings or tournament scores change.

Integrated into solo gift spectacles and compact race/duel displays. All beasts render in the background pass before every player body. Large old formation art is dimmed and duplicate seal ornaments suppressed once beast art is available. Light sword-rain PNG count is reduced to 12 to offset the articulated beasts; total draw work is tested with loaded beast sprites. Existing heavy queues are retained. Reduced motion freezes paths, wing flaps and tail motion and already disables camera impulses.

Preview /gift-preview.html and /event-gift-preview.html wait for both sprite sets before autoplay. This update is client-side; reload the LIVE Link once, same URL, no game server restart needed.
