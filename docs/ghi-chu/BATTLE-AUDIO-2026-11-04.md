# Âm chiến đấu — 04/11/2026

public/battle-audio.js: procedural Web Audio SFX, no external samples. Roles: blade (filtered whoosh), thunder (low impact/noise), fire (rising filtered rush), dragon (low magical breath), bell, ice, dark and magic. Boss charge/strike/shield and actual HP impact. Ma Long uses a longer/lower strike. These are synthesized effects, not recorded animal roars.

Mapping: Scene.addEffect attack → cast, automatic arena casts/bolts → bounded cast cues; tickBattleSound watches encounterPhase and actual HP changes. First observation mid-phase and long suspended gaps do not replay old transients. Boss uses epoch clock shared with visuals. No action API or damage changes.

Mix: existing fxBus/master/SFX slider; 0.24s cast cooldown, 0.32s hit, max three regular or five priority cues. Narration reduces new cue gains to 48%. Mute stops sources. Preview /abyss-preview.html has a battle sound toggle. Reload LIVE Studio source for JS update, no backend restart required.

Verification: test/battle-audio.test.mjs + audio/dashboard/voice tests 11/11. Verified modules served 200, syntax valid. No direct listening evaluation in this session, no claim that synthesis is a realistic animal recording. Source nodes use scheduled short envelopes, bounded two/three sources per cue.
