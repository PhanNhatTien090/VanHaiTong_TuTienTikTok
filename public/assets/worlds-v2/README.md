# Không gian tu luyện v2

Four original AI-generated portrait environments replace the normal circular podium rotation. Original PNGs are retained in the Codex generated_images folder. These copies are used directly by the game.

- dungeon.png — Huyền Thạch Cổ Ngục: natural stone floor, torch glows, drifting dust/mist.
- jade-palace.png — Vân Thượng Ngọc Cung: flat jade hall, clouds and light motes.
- underwater.png — Thâm Hải Long Cung: sandy seabed, animated sea creatures, caustic strokes, bubbles and light shafts.
- cosmos.png — Vô Tận Tinh Vực: no floor; eight dispersed floating actor slots, stars and shooting stars.
- fish-atlas.png — transparent 3×2 atlas: koi, blue fish, angelfish, manta, turtle, jellyfish. Lazily sliced into six 128px cached frames; source image released after slicing.

Operator: Events tab → Không gian tu luyện. Manual selection persists per world; Auto rotates on the shared server clock every five minutes. Race/tournament/bond stages retain priority. POST /api/world-scene accepts only the four scene IDs or auto.

Environment layers reuse canvas caches. Light mode uses seven swimming creatures, eight bubbles and bounded particles. Fish are drawn behind all players. Space formations retain the existing eight-seat light cap and honor reduced motion. Environment controls can disable all ambient layers. Maps never create player profiles or award game rewards.

Original sources, in dungeon/jade/underwater/cosmos/fish order:
exec-5451a61e-776e-42b4-b765-0d0f59451f2d.png
exec-eb820ccf-fb39-4361-92b3-1ff8e33a16be.png
exec-0c849b1b-cf52-40ac-8d51-5e6d03da09c6.png
exec-9a0d9bfd-e03d-4a08-920d-db5c42e38fbc.png
exec-5d8a86d0-d652-48ae-887b-a873b813017a.png
