# Animated gift spectacles

Two original transparent PNG atlases, six equal cells each (3×2). Generated originals remain under Codex generated_images:
- formations.png: exec-180800db-0010-4369-95da-b1cd396d4fe1.png
- impacts.png: exec-d5d02472-5fa7-4781-ad01-9eed76d678ce.png

Runtime: public/gift-spectacle.js. Lazy cached 320px frames, approximately 4.7 MiB RGBA total. Source atlases released after slicing. No per-frame image loads or blur filters.

Real event value is coins × delta count. Exact milestones 500 / 700 / 1000 / 1500 / 2000 select separate artwork and names. 3000 and 10000 enhance the emperor art with more waves, longer duration and more geometry. Existing reward/stat/dedup rules remain untouched.

Continuous time-based animation: formation grows and rotates, smoke breathes, thunder bolts bend, dragon seal swoops and bobs, swords traverse the screen in staggered waves, impact PNGs expand/rotate/fade, shock rings spread, debris flies and falls. Whole-character casting animation extends through 85% of the performance.

Heavy displays use the existing solo stage and bounded presentation/luxury queues. Light mode caps 36 sword instances and 36 debris particles even at 10000+; lower milestones use less. Camera opens wide, adds two short bounded impact impulses, clamps to scenery and disables shake with reduced motion or camera-off. Two audio callbacks per display max, tied to the impact times and existing mute/volume/limiter settings.

Preview: /gift-preview.html runs the actual Scene renderer in isolation without POSTing player actions to the server. Events tab links to it. Refresh the LIVE Link source once to load the new JS modules; no URL/version parameter needed.
