Use your built-in image generation tool (image_gen) to create the images below and save each as PNG in this folder with the exact filename. Style: stylized 2.5D Chinese xianxia / donghua game art, bright and clean, soft lighting (see style-ref.png in this folder for the look of the existing race background). No people, no text, no letters, no UI, no watermark.

A. BACKGROUNDS for a vertical TikTok LIVE sword-flying race (portrait 900x1600 screen). The camera looks along the flight path; racers fly UP the screen, so the world scrolls DOWN. The image will be TILED VERTICALLY and scrolled endlessly, so:
   - It must be SEAMLESS vertically: the top edge must continue perfectly into the bottom edge (after generating, verify and fix with Python if needed: e.g. crossfade the top 12% into the bottom 12% so a vertical repeat has no visible seam).
   - Keep the central 60% width mostly open sky/clouds (racers fly there); put detail (floating peaks, pagodas, waterfalls, cloud banks, golden spirit rings) along the left and right sides.
1. race-scroll-sky.png — 1024x2048 portrait, high in the sky over a sea of clouds at sunrise, floating mountain islands with small pavilions and waterfalls along both sides, a few glowing golden ring gates, warm gold + cyan + white palette, bright and fast-feeling.
2. race-scroll-clouds.png — 1024x2048 portrait, ONLY soft white wispy cloud streaks and a few elongated light streaks, on a PURE BLACK background (it will be blended with 'screen'), sparse (about 25% coverage), mostly near the left and right edges, also seamless vertically.

B. SIX FLYING SWORD SKINS, each its own PNG, 1400x420 landscape, the sword lying HORIZONTALLY with the tip pointing RIGHT, big ornate legendary blade, whole sword visible with margin, slight 3/4 view so the flat of the blade is visible (a cultivator will stand on it). TRANSPARENT background (if you cannot, use pure #00FF00 green then chroma-key it out yourself with Python, de-spill green fringe, trim, and save PNG with alpha). Include a little built-in aura/energy hugging the blade, but keep the background transparent.
3. sword-loi-than.png — "Lôi Thần Phá Quân": silver-violet blade crackling with blue-white lightning, thunder-cloud guard, purple gem.
4. sword-hoa-phuong.png — "Hỏa Phượng Liệt Diễm": crimson-gold blade wreathed in flames, phoenix-wing crossguard, flame-feather tip.
5. sword-bang-phach.png — "Băng Phách Hàn Nguyệt": translucent ice-crystal blade, frost mist, crescent-moon guard, pale cyan glow.
6. sword-kim-long.png — "Cửu Long Tử Kim": heavy imperial gold blade with a coiled golden dragon along it, red jewels, majestic.
7. sword-thanh-ngoc.png — "Thanh Ngọc Tiên Kiếm": elegant slim jade-green blade, lotus guard, flowing silk ribbon, spring leaves.
8. sword-tinh-ha.png — "Hư Không Tinh Hà": dark cosmic blade with a galaxy/starfield inside the steel, violet nebula glow, star sparkles.

After saving, verify transparency (alpha channel, transparent corners) for the swords and seamlessness for the two backgrounds, then list the files. Do not modify anything else.
