// Màn đánh bí cảnh: nhân vật LIVE của người chơi (live-actor.js) đấu boss LIVE (boss-atlas.png).
// Vẽ bằng PixiJS. Điều khiển: joystick/WASD di chuyển, nút đánh/J (combo 3 nhát), né/K, chiêu 1-2-3 (U/I/O), đan/H.
import { Application, Assets, Container, Sprite, Graphics, Text, Texture, Rectangle } from '/lib/pixi.mjs';
import { LiveActor } from '/live-actor.js';
import { sound } from '/sound.js';

const WORLD_H = 793;             // chiều cao ảnh nền vùng = đơn vị thế giới
let GROUND_TOP = 585, GROUND_BOTTOM = 768; // đặt lại theo từng vùng (info.ground)
const PX_PER_LIVE = 1.9;         // 1 đơn vị vẽ của LIVE = 1,9 đơn vị thế giới
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const depthScale = y => 0.88 + 0.24 * (y - GROUND_TOP) / (GROUND_BOTTOM - GROUND_TOP);

const SKILLS = [
  { id: 'kiemkhi', name: 'Kiếm Khí', icon: '/art/battle/sk-kiemkhi.png', cost: 20, cd: 3.5, key: ['KeyU', 'Digit1'] },
  { id: 'lienhoa', name: 'Liên Hoa Kiếm Trận', icon: '/art/battle/sk-lienhoa.png', cost: 35, cd: 9, key: ['KeyI', 'Digit2'] },
  { id: 'thienloi', name: 'Thiên Lôi', icon: '/art/battle/sk-thienloi.png', cost: 50, cd: 14, key: ['KeyO', 'Digit3'] },
];
const MAT_NAMES = { 'huyen-thiet': 'Huyền Thiết', 'tinh-kim': 'Tinh Kim', 'long-tuy': 'Long Tủy', 'linh-qua': 'Linh Quả' };
const ELEMENT_COLOR = { thunder: 0x9fdcff, water: 0x7fffd0, fire: 0xffa060 };

export async function runBattle(host, { info, stats, sceneState, onFinish, onExit, extraPills = 0 }) {
  const PILLS = 3 + Math.max(0, extraPills | 0);
  host.innerHTML = '';
  host.hidden = false;
  const enemyDef = info.waves[0].enemies[0];
  [GROUND_TOP, GROUND_BOTTOM] = info.ground || [585, 768];
  const pet = stats.pet;
  const color = ELEMENT_COLOR[enemyDef.element] || 0xffffff;

  // ---------- Pixi ----------
  const app = new Application();
  await app.init({ resizeTo: host, antialias: true, autoDensity: true, resolution: Math.min(2, devicePixelRatio || 1), background: '#0b1d1c', preference: 'webgl' });
  host.appendChild(app.canvas);
  const [bgTex, fgTex, atlas, tWave, tSpark, tArray, tLight, tLotus, tOrb] = await Promise.all([
    Assets.load(info.bg), info.fg ? Assets.load(info.fg) : null, Assets.load(enemyDef.atlas || '/assets/boss-atlas.png'),
    Assets.load('/art/battle/fx-wave.png'), Assets.load('/art/battle/fx-spark.png'), Assets.load('/art/battle/fx-array.png'),
    Assets.load('/art/battle/fx-lightning.png'), Assets.load('/art/battle/fx-lotus.png'), Assets.load('/art/battle/fx-orb.png'),
  ]);
  const WORLD_W = bgTex.width;
  const cellW = atlas.width / 3;
  const bossTex = new Texture({ source: atlas.source, frame: new Rectangle(cellW * enemyDef.cell, 0, cellW, atlas.height) });
  // Linh thú LIVE (3 tư thế trong một ảnh: ngồi, phóng, phóng cười).
  let petTex = null;
  if (pet) {
    const img = await Assets.load('/assets/spirit-pets-v1/' + pet.id + '.png').catch(() => null);
    if (img) {
      const cuts = pet.id === 'astral-dragon' ? [0, 0.292, 0.668, 1] : [0, 1 / 3, 2 / 3, 1];
      petTex = [0, 1, 2].map(i => new Texture({ source: img.source, frame: new Rectangle(Math.round(cuts[i] * img.width), 0, Math.round((cuts[i + 1] - cuts[i]) * img.width), img.height) }));
    }
  }

  const camera = new Container(), world = new Container(), ground = new Container(), actors = new Container(), fxLayer = new Container(), fgLayer = new Container();
  app.stage.addChild(camera);
  camera.addChild(world);
  world.addChild(new Sprite(bgTex), ground, actors, fxLayer);
  camera.addChild(fgLayer);
  actors.sortableChildren = true;
  const fg = fgTex ? new Sprite(fgTex) : null; if (fg) fgLayer.addChild(fg);

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return Texture.from(c);
  })();

  // ---------- Nhân vật người chơi (đúng model LIVE) ----------
  const actor = new LiveActor(sceneState);
  const player = {
    x: WORLD_W * 0.28, y: (GROUND_TOP + GROUND_BOTTOM) / 2 + 20, face: 1, hp: stats.maxHp, maxHp: stats.maxHp, qi: 100, maxQi: 100,
    invulnUntil: 0, dodgeUntil: 0, dodgeCd: 0, attackUntil: 0, combo: 0, comboQueued: false, hits: [], pills: PILLS, pillCd: 0, dead: false,
    shadow: new Sprite(glowTex), sprite: new Sprite(actor.texture),
  };
  player.sprite.anchor.set(actor.anchor.x, actor.anchor.y);
  player.shadow.anchor.set(0.5); player.shadow.tint = 0x000000; player.shadow.alpha = 0.45;
  ground.addChild(player.shadow); actors.addChild(player.sprite);
  const skillCd = Object.fromEntries(SKILLS.map(s => [s.id, 0]));

  // ---------- Boss (đúng model LIVE) ----------
  const boss = {
    x: WORLD_W * 0.7, y: (GROUND_TOP + GROUND_BOTTOM) / 2, face: -1, hp: enemyDef.hp, maxHp: enemyDef.hp, atk: enemyDef.atk, name: enemyDef.name,
    state: 'intro', t: 0, cd: 1.6, stunUntil: 0, flash: 0, dead: false, enraged: false, lift: -420, knock: 0, action: null,
    sprite: new Sprite(bossTex), flashSprite: new Sprite(bossTex), shadow: new Sprite(glowTex),
  };
  for (const s of [boss.sprite, boss.flashSprite]) s.anchor.set(0.5, 0.92);
  boss.flashSprite.blendMode = 'add'; boss.flashSprite.alpha = 0;
  boss.shadow.anchor.set(0.5); boss.shadow.tint = 0x000000; boss.shadow.alpha = 0.5;
  ground.addChild(boss.shadow);
  const bossBox = new Container(); bossBox.addChild(boss.sprite, boss.flashSprite); actors.addChild(bossBox);
  const BOSS_SCALE = (enemyDef.atlas?.includes('celestial') ? 470 : 405) / bossTex.height;
  const BOSS_FLIP = enemyDef.faceRight === false ? -1 : 1; // ảnh nhìn sang trái thì lật ngược
  // Linh thú trợ chiến
  const petState = pet && petTex ? { x: player.x - 90, y: player.y + 10, face: 1, nextAt: 1.5, mode: 'follow', t: 0, sprite: new Sprite(petTex[0]), shadow: new Sprite(glowTex) } : null;
  if (petState) {
    petState.sprite.anchor.set(0.5, 0.9);
    petState.shadow.anchor.set(0.5); petState.shadow.tint = 0x000000; petState.shadow.alpha = 0.35;
    ground.addChild(petState.shadow); actors.addChild(petState.sprite);
  }

  // ---------- Hiệu ứng ----------
  const effects = [];
  function addFx(sprite, life, update, layer = fxLayer) {
    layer.addChild(sprite);
    effects.push({ sprite, life, age: 0, update });
  }
  function spark(x, y, tint = 0xffffff, size = 1) {
    const s = new Sprite(tSpark); s.anchor.set(0.5); s.blendMode = 'add'; s.tint = tint; s.position.set(x, y); s.rotation = rand(0, 6.28);
    addFx(s, 0.28, (f) => { s.scale.set((0.25 + f * 0.35) * size); s.alpha = 1 - f; });
    for (let i = 0; i < 8; i++) {
      const p = new Sprite(glowTex); p.anchor.set(0.5); p.blendMode = 'add'; p.tint = tint;
      const a = rand(0, 6.28), v = rand(200, 520);
      p.position.set(x, y);
      addFx(p, rand(0.25, 0.5), (f, dt) => { p.x += Math.cos(a) * v * dt; p.y += Math.sin(a) * v * dt; p.scale.set(0.14 * (1 - f) * size); p.alpha = 1 - f; });
    }
  }
  function damageNumber(x, y, value, { crit = false, heal = false, hurt = false } = {}) {
    const t = new Text({ text: (heal ? '+' : '') + Math.round(value).toLocaleString('vi-VN'), style: {
      fontFamily: 'Noto Serif, Georgia, serif', fontWeight: '900', fontSize: crit ? 54 : 38,
      fill: heal ? 0x8dffb0 : hurt ? 0xff6a5a : crit ? 0xffd75e : 0xffffff,
      stroke: { color: 0x2a0c00, width: 6 }, dropShadow: { color: 0x000000, alpha: 0.6, blur: 4, distance: 3 } } });
    t.anchor.set(0.5); t.position.set(x + rand(-20, 20), y);
    addFx(t, 0.9, (f, dt) => { t.y -= 90 * dt * (1 - f); t.alpha = f < 0.7 ? 1 : 1 - (f - 0.7) / 0.3; t.scale.set(f < 0.12 ? 0.6 + f * 4 : 1.08 - f * 0.1); });
  }
  // Vết chém: vòng cung sáng trước mặt nhân vật.
  function slashArc(x, y, face, big) {
    const g = new Graphics(); g.blendMode = 'add';
    const r = big ? 190 : 150, start = face > 0 ? -1.9 : Math.PI + 1.9, sweep = face > 0 ? 2.6 : -2.6;
    addFx(g, 0.22, (f) => {
      g.clear();
      const a0 = start, a1 = start + sweep * Math.min(1, f * 2.2);
      for (let i = 0; i < 4; i++) g.arc(x, y - 90, r - i * 8, Math.min(a0, a1), Math.max(a0, a1)).stroke({ color: i ? color : 0xffffff, width: (big ? 16 : 11) - i * 3, alpha: (1 - f) * (1 - i * 0.2) });
    });
  }
  // Vùng cảnh báo trên mặt đất trước khi boss ra đòn.
  function telegraph({ x, y, w, h, shape = 'ellipse', time }) {
    const g = new Graphics();
    ground.addChild(g);
    const fx = { sprite: g, life: time, age: 0, update: (f) => {
      g.clear();
      if (shape === 'rect') { g.rect(x - w / 2, y - h / 2, w, h).fill({ color: 0xff3020, alpha: 0.18 }).stroke({ color: 0xff5a40, width: 3, alpha: 0.8 }); g.rect(x - w / 2, y - h / 2, w * f, h).fill({ color: 0xff3020, alpha: 0.25 }); }
      else { g.ellipse(x, y, w / 2, h / 2).fill({ color: 0xff3020, alpha: 0.18 }).stroke({ color: 0xff5a40, width: 3, alpha: 0.8 }); g.ellipse(x, y, w / 2 * f, h / 2 * f).fill({ color: 0xff3020, alpha: 0.3 }); }
    } };
    effects.push(fx);
  }

  // ---------- Rung màn hình, khựng hình ----------
  let shake = 0, hitStop = 0, flash = 0;
  const flashG = new Graphics(); app.stage.addChild(flashG);

  // ---------- Giao diện (HTML phủ lên canvas) ----------
  const ui = document.createElement('div');
  ui.className = 'battle-ui';
  ui.innerHTML = `
    <div class="b-top">
      <div class="b-player"><img class="b-ava" src="/art/ui/avatar-${sceneState.players[0]?.gender === 'nu' ? 'nu' : 'nam'}.png" alt="">
        <div class="b-bars"><b>${escapeHtml(sceneState.players[0]?.name || '')}</b>
          <div class="b-hp"><i></i><span></span></div><div class="b-qi"><i></i></div></div></div>
      <div class="b-boss"><div class="b-boss-name">${escapeHtml(boss.name)}</div><div class="b-boss-bar"><div class="track"><i></i></div><em></em></div></div>
      <button class="b-exit" aria-label="Rời trận">✕</button>
    </div>
    <div class="b-joy"><img src="/art/battle/joy-base.png" alt=""><img class="knob" src="/art/battle/joy-knob.png" alt=""></div>
    <div class="b-actions">
      <button class="b-btn b-attack" data-k="attack"><img src="/art/battle/btn-attack.png" alt="Đánh"></button>
      <button class="b-btn b-dodge" data-k="dodge"><img src="/art/battle/btn-dodge.png" alt="Né"><i class="cd"></i></button>
      ${SKILLS.map((s, i) => `<button class="b-btn b-skill s${i}" data-k="${s.id}" title="${s.name}"><img src="${s.icon}" alt="${s.name}"><i class="cd"></i><small>${s.cost}</small></button>`).join('')}
      <button class="b-btn b-pill" data-k="pill"><img src="/art/battle/btn-pill.png" alt="Đan"><i class="cd"></i><small class="n">${PILLS}</small></button>
    </div>
    <div class="b-banner"></div>
    <div class="b-result" hidden></div>
    <div class="b-rotate">Xoay ngang điện thoại để chơi tốt hơn</div>`;
  host.appendChild(ui);
  const $ = s => ui.querySelector(s);

  function banner(text, ms = 1600) {
    const b = $('.b-banner'); b.textContent = text; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    clearTimeout(banner.t); banner.t = setTimeout(() => b.classList.remove('show'), ms);
  }

  // ---------- Điều khiển ----------
  const keys = new Set();
  const joy = { x: 0, y: 0, id: null };
  const pressed = new Set();
  const onKey = e => {
    if (e.type === 'keydown') {
      if (e.repeat && !e.code.startsWith('Arrow') && !'KeyWKeyAKeySKeyD'.includes(e.code)) return;
      keys.add(e.code);
      if (e.code === 'KeyJ' || e.code === 'Space') pressed.add('attack');
      if (e.code === 'KeyK' || e.code === 'ShiftLeft') pressed.add('dodge');
      if (e.code === 'KeyH') pressed.add('pill');
      for (const s of SKILLS) if (s.key.includes(e.code)) pressed.add(s.id);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    } else keys.delete(e.code);
  };
  addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  const joyEl = $('.b-joy'), knob = $('.knob');
  joyEl.addEventListener('pointerdown', e => { joy.id = e.pointerId; joyEl.setPointerCapture(e.pointerId); moveJoy(e); });
  joyEl.addEventListener('pointermove', e => { if (e.pointerId === joy.id) moveJoy(e); });
  const endJoy = e => { if (e.pointerId !== joy.id) return; joy.id = null; joy.x = joy.y = 0; knob.style.transform = ''; };
  joyEl.addEventListener('pointerup', endJoy); joyEl.addEventListener('pointercancel', endJoy);
  function moveJoy(e) {
    const r = joyEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width * 0.36;
    let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    joy.x = dx / R; joy.y = dy / R;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  }
  for (const b of ui.querySelectorAll('[data-k]')) {
    b.addEventListener('pointerdown', e => { e.preventDefault(); pressed.add(b.dataset.k); b.classList.add('down'); });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, () => b.classList.remove('down'));
  }
  $('.b-exit').onclick = () => finish(false, true);

  // ---------- Hành động người chơi ----------
  const now = () => performance.now() / 1000;
  function hitBoss(mult, { crit = Math.random() < 0.15, knock = 14, sparkAt, tint, gainQi = true } = {}) {
    if (boss.dead || boss.state === 'intro') return;
    const dmg = Math.max(1, Math.round(stats.attack * mult * rand(0.9, 1.1) * (crit ? 1.8 : 1)));
    boss.hp = Math.max(0, boss.hp - dmg);
    boss.flash = 1; boss.knock += knock * (player.x < boss.x ? 1 : -1);
    const p = sparkAt || { x: boss.x - boss.face * -40 + rand(-30, 30), y: boss.y - 160 + rand(-40, 40) };
    spark(p.x, p.y, tint ?? (crit ? 0xffe08a : color), crit ? 1.4 : 1);
    damageNumber(boss.x + rand(-40, 40), boss.y - 300, dmg, { crit });
    if (gainQi) player.qi = Math.min(player.maxQi, player.qi + 4);
    hitStop = Math.max(hitStop, crit ? 0.09 : 0.05); shake = Math.max(shake, crit ? 14 : 7);
    sound.sfx(crit ? 'impact' : 'attack', 60);
    if (boss.hp <= 0) killBoss();
    else if (!boss.enraged && boss.hp < boss.maxHp * 0.4) { boss.enraged = true; banner(`${boss.name} nổi giận!`); }
    return dmg;
  }
  function inFront(range, depth = 120) {
    const dx = (boss.x - player.x) * player.face;
    return dx > -40 && dx < range && Math.abs(boss.y - player.y) < depth;
  }
  function doAttack(t) {
    if (t < player.attackUntil - 0.14) { player.comboQueued = true; return; }
    if (t > player.attackUntil + 0.35) player.combo = 0;
    player.combo = player.combo % 3 + 1;
    const big = player.combo === 3;
    player.attackUntil = t + (big ? 0.42 : 0.3);
    actor.act('slash', big ? 700 : 520);
    player.x += player.face * (big ? 40 : 18);
    player.hits.push({ at: t + (big ? 0.2 : 0.12), mult: big ? 1.8 : 1 + player.combo * 0.1, range: big ? 260 : 210, big });
  }
  function doDodge(t) {
    if (t < player.dodgeCd) return;
    player.dodgeUntil = t + 0.28; player.invulnUntil = t + 0.38; player.dodgeCd = t + 0.9;
    actor.dash();
    const dirX = Math.abs(inputX()) > 0.2 ? Math.sign(inputX()) : player.face;
    player.dodgeDir = { x: dirX, y: inputY() };
    for (let i = 0; i < 4; i++) {
      const ghost = new Sprite(actor.texture); ghost.anchor.copyFrom(player.sprite.anchor); ghost.scale.copyFrom(player.sprite.scale);
      ghost.position.copyFrom(player.sprite.position); ghost.tint = 0x9fffe0; ghost.alpha = 0.35;
      setTimeout(() => addFx(ghost, 0.3, (f) => { ghost.alpha = 0.35 * (1 - f); }, actors), i * 50);
    }
  }
  function castSkill(s, t) {
    if (t < skillCd[s.id]) return;
    if (player.qi < s.cost) { banner('Chưa đủ linh lực', 700); return; }
    player.qi -= s.cost; skillCd[s.id] = t + s.cd;
    const face = player.face;
    sound.sfx(s.id === 'kiemkhi' ? 'sword' : s.id === 'lienhoa' ? 'lotus' : 'dragon', 0);
    if (s.id === 'kiemkhi') {
      actor.act('cast', 600);
      setTimeout(() => {
        const w = new Sprite(tWave); w.anchor.set(0.5); w.blendMode = 'add'; w.scale.set(0.55 * face, 0.55);
        const start = { x: player.x + face * 60, y: player.y - 110 }; w.position.set(start.x, start.y);
        let hit = false;
        addFx(w, 0.9, (f, dt) => {
          w.x += face * 1150 * dt; w.alpha = f < 0.8 ? 1 : (1 - f) * 5; w.scale.y = 0.55 + f * 0.25;
          if (!hit && Math.abs(w.x - boss.x) < 140 && Math.abs(player.y - boss.y) < 160) { hit = true; hitBoss(2.4, { knock: 30, sparkAt: { x: w.x, y: w.y } }); }
        });
      }, 220);
    } else if (s.id === 'lienhoa') {
      actor.act('cast', 900);
      const cx = player.x, cy = player.y;
      const arr = new Sprite(tArray); arr.anchor.set(0.5); arr.blendMode = 'add'; arr.position.set(cx, cy);
      addFx(arr, 1.4, (f) => { arr.scale.set(0.9 * Math.min(1, f * 5), 0.3 * Math.min(1, f * 5)); arr.rotation = 0; arr.alpha = f < 0.85 ? 0.95 : (1 - f) * 6; arr.skew.x = 0; arr.angle = f * 120; }, ground);
      const lotus = new Sprite(tLotus); lotus.anchor.set(0.5, 0.8); lotus.blendMode = 'add'; lotus.position.set(cx, cy);
      addFx(lotus, 1.4, (f) => { lotus.scale.set(0.2 + Math.min(1, f * 3) * 0.45); lotus.y = cy - f * 60; lotus.alpha = f < 0.7 ? 1 : (1 - f) / 0.3; });
      for (let i = 0; i < 4; i++) setTimeout(() => { if (Math.hypot(boss.x - cx, (boss.y - cy) * 2) < 380) hitBoss(1.1, { knock: 6, sparkAt: { x: boss.x + rand(-60, 60), y: boss.y - rand(60, 240) } }); }, 250 + i * 250);
    } else if (s.id === 'thienloi') {
      actor.act('ascend', 1100);
      flash = 0.6;
      for (let i = 0; i < 3; i++) setTimeout(() => {
        const l = new Sprite(tLight); l.anchor.set(0.5, 1); l.blendMode = 'add'; l.position.set(boss.x + rand(-60, 60), boss.y - 40); l.scale.set(0.9, 1.3);
        addFx(l, 0.35, (f) => { l.alpha = 1 - f; l.scale.x = 0.9 * (1 - f * 0.5); });
        flash = Math.max(flash, 0.35); shake = Math.max(shake, 16);
        hitBoss(1.6, { crit: Math.random() < 0.3, knock: 4, sparkAt: { x: l.x, y: boss.y - 150 } });
        boss.stunUntil = now() + 1.2;
      }, 450 + i * 180);
    }
  }
  function usePill(t) {
    if (player.pills <= 0 || t < player.pillCd || player.hp >= player.maxHp) return;
    player.pills--; player.pillCd = t + 8;
    const heal = Math.round(player.maxHp * 0.35);
    player.hp = Math.min(player.maxHp, player.hp + heal);
    damageNumber(player.x, player.y - 260, heal, { heal: true });
    actor.act('cast', 600); sound.sfx('petal', 0);
    $('.b-pill .n').textContent = player.pills;
  }
  function hurtPlayer(amount) {
    if (player.dead || now() < player.invulnUntil) return;
    // 08/11 tối: giáp linh thú hút sát thương trước
    if (player.shield > 0 && now() < player.shieldUntil) { const soak = Math.min(player.shield, amount); player.shield -= soak; amount -= soak; floatText(player.x, player.y - 300, 'Giáp -' + Math.round(soak).toLocaleString('vi-VN'), 0x8fd8ff, 30); if (amount <= 0) { player.invulnUntil = now() + 0.5; sound.sfx('sword', 200); return; } }
    player.hp = Math.max(0, player.hp - amount);
    player.invulnUntil = now() + 0.5;
    actor.hurt();
    damageNumber(player.x, player.y - 250, amount, { hurt: true });
    sound.sfx('boss', 200);
    shake = Math.max(shake, 12); flash = Math.max(flash, 0.15);
    if (player.hp <= 0) { player.dead = true; actor.act('celebrate', 10); banner('Trọng thương!', 2000); setTimeout(() => finish(false), 1800); }
  }
  const inputX = () => (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + joy.x;
  const inputY = () => (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) + joy.y;

  // ---------- Trí khôn boss (theo hệ: lôi / thủy / hỏa) ----------
  function bossThink(t, dt) {
    const speedMul = boss.enraged ? 1.35 : 1;
    if (boss.state === 'intro') {
      boss.lift = Math.min(0, boss.lift + 900 * dt);
      if (boss.lift === 0) { boss.state = 'chase'; shake = 20; sound.sfx('boss', 0); spark(boss.x, boss.y - 20, color, 2); banner(`${boss.name} giáng thế!`); }
      return;
    }
    if (t < boss.stunUntil) return;
    const dx = player.x - boss.x, dist = Math.abs(dx);
    if (boss.state === 'chase') {
      boss.face = Math.sign(dx) || boss.face;
      if (dist > 300) boss.x += Math.sign(dx) * 150 * speedMul * dt;
      boss.y += clamp(player.y - boss.y, -1, 1) * 80 * dt;
      boss.cd -= dt * speedMul;
      if (boss.cd <= 0 && !player.dead) {
        const roll = Math.random();
        const pick = dist < 330 && roll < 0.45 ? 'claw' : roll < 0.75 ? 'pounce' : 'element';
        startBossMove(pick, t);
      }
    } else if (boss.action && t >= boss.action.end) {
      boss.action.resolve?.();
      boss.state = 'chase'; boss.cd = rand(1.1, 2) / speedMul; boss.action = null;
    } else if (boss.action?.tick) boss.action.tick(t, dt);
  }
  function startBossMove(kind, t) {
    boss.state = kind;
    const tele = boss.enraged ? 0.75 : 1;
    if (kind === 'claw') {
      const w = 340, x = boss.x + boss.face * 170;
      telegraph({ x, y: boss.y, w, h: 150, time: 0.55 * tele });
      boss.action = { end: t + 0.55 * tele + 0.25, windup: t + 0.55 * tele, resolve: null, tick: (tt) => {
        if (!boss.action.done && tt >= boss.action.windup) {
          boss.action.done = true; boss.knock += boss.face * 50; shake = 8;
          slashArc(x, boss.y, boss.face, true);
          if (Math.abs(player.x - x) < w / 2 && Math.abs(player.y - boss.y) < 90) hurtPlayer(boss.atk);
        }
      } };
    } else if (kind === 'pounce') {
      const tx = clamp(player.x, 120, WORLD_W - 120), ty = player.y;
      telegraph({ x: tx, y: ty, w: 280, h: 110, time: 0.7 * tele });
      const from = { x: boss.x, y: boss.y };
      boss.action = { end: t + 0.7 * tele + 0.45, start: t + 0.7 * tele, tick: (tt) => {
        const f = clamp((tt - boss.action.start) / 0.4, 0, 1);
        if (tt < boss.action.start) { boss.crouch = 1; return; }
        boss.crouch = 0;
        boss.x = from.x + (tx - from.x) * f; boss.y = from.y + (ty - from.y) * f; boss.lift = -Math.sin(f * Math.PI) * 170;
        if (f >= 1 && !boss.action.landed) {
          boss.action.landed = true; shake = 18; spark(tx, ty - 10, color, 1.6);
          if (Math.hypot(player.x - tx, (player.y - ty) * 2) < 170) hurtPlayer(Math.round(boss.atk * 1.4));
        }
      } };
    } else {
      // Đòn hệ: lôi bổ 3 điểm (Lôi Hổ), cầu nước (Huyền Vũ), mưa lửa (Phượng Hoàng).
      const spots = Array.from({ length: boss.enraged ? 5 : 3 }, (_, i) => ({ x: clamp(player.x + (i - 1) * 150 + rand(-40, 40), 80, WORLD_W - 80), y: clamp(player.y + rand(-40, 40), GROUND_TOP, GROUND_BOTTOM) }));
      for (const s of spots) telegraph({ x: s.x, y: s.y, w: 190, h: 80, time: 0.95 * tele });
      boss.action = { end: t + 0.95 * tele + 0.3, at: t + 0.95 * tele, tick: (tt) => {
        if (boss.action.done || tt < boss.action.at) return;
        boss.action.done = true; flash = 0.25; shake = 14;
        for (const s of spots) {
          const tex = enemyDef.element === 'thunder' ? tLight : enemyDef.element === 'water' ? tOrb : tSpark;
          const fx = new Sprite(tex); fx.anchor.set(0.5, enemyDef.element === 'thunder' ? 1 : 0.5); fx.blendMode = 'add';
          fx.tint = enemyDef.element === 'fire' ? 0xff7a30 : 0xffffff; fx.position.set(s.x, s.y - (enemyDef.element === 'thunder' ? 0 : 40));
          addFx(fx, 0.4, (f) => { fx.alpha = 1 - f; fx.scale.set(enemyDef.element === 'thunder' ? 0.7 : 0.35 + f * 0.3); });
          if (Math.hypot(player.x - s.x, (player.y - s.y) * 2) < 110) hurtPlayer(Math.round(boss.atk * 1.2));
        }
      } };
    }
  }
  // ---------- 08/11 tối: KỸ NĂNG LINH THÚ (hồi máu, giáp, thiêu đốt, đại chiêu, choáng, hút máu) ----------
  const petTimers = [];
  function floatText(x, y, text, fill, size = 34) {
    const t = new Text({ text, style: { fontFamily: 'Noto Serif, Georgia, serif', fontWeight: '900', fontSize: size, fill, stroke: { color: 0x10141c, width: 6 }, dropShadow: { color: 0x000000, alpha: 0.6, blur: 4, distance: 3 } } });
    t.anchor.set(0.5); t.position.set(x, y);
    addFx(t, 1.3, (f, dt) => { t.y -= 60 * dt; t.alpha = f < 0.75 ? 1 : 1 - (f - 0.75) / 0.25; t.scale.set(f < 0.1 ? 0.5 + f * 5 : 1); });
  }
  function healPlayer(amount, quiet = false) {
    amount = Math.round(Math.min(amount, player.maxHp - player.hp)); if (amount <= 0) return;
    player.hp += amount; damageNumber(player.x + rand(-30, 30), player.y - 270, amount, { heal: true });
    if (!quiet) { sound.sfx('qi', 150); for (let i = 0; i < 10; i++) { const p = new Sprite(glowTex); p.anchor.set(0.5); p.blendMode = 'add'; p.tint = 0x8dffb0; const ox = rand(-70, 70); p.position.set(player.x + ox, player.y - rand(0, 40)); addFx(p, rand(0.7, 1.1), (f, dt) => { p.y -= 160 * dt; p.scale.set(0.16 * (1 - f)); p.alpha = 1 - f; }); } }
  }
  const shieldG = new Graphics(); shieldG.blendMode = 'add'; fxLayer.addChild(shieldG);
  function updateShield(t) {
    shieldG.clear(); if (!(player.shield > 0) || t >= player.shieldUntil || player.dead) { if (t >= player.shieldUntil) player.shield = 0; return; }
    const k = Math.min(1, player.shield / (player.shieldMax || 1)), ds = depthScale(player.y), r = 120 * ds + Math.sin(t * 5) * 4, cy = player.y - 130 * ds, col = pet.skill?.hot ? 0xffa64a : 0x8fd8ff;
    shieldG.ellipse(player.x, cy, r, r * 1.25).fill({ color: col, alpha: 0.10 + 0.12 * k }).stroke({ color: col, width: 4, alpha: 0.5 + 0.4 * k });
    for (let i = 0; i < 6; i++) { const a = t * 1.6 + i * 1.047; shieldG.circle(player.x + Math.cos(a) * r, cy + Math.sin(a) * r * 1.25, 5).fill({ color: 0xffffff, alpha: 0.6 * k }); }
  }
  function lightning(x1, y1, x2, y2, tint) {
    const g = new Graphics(); g.blendMode = 'add'; const pts = [[x1, y1]]; for (let i = 1; i < 8; i++) pts.push([x1 + (x2 - x1) * i / 8 + rand(-40, 40), y1 + (y2 - y1) * i / 8]); pts.push([x2, y2]);
    const path = () => { g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); };
    addFx(g, 0.35, (f) => { g.clear(); path(); g.stroke({ color: tint, width: 12 * (1 - f), alpha: 1 - f }); path(); g.stroke({ color: 0xffffff, width: 4 * (1 - f), alpha: 1 - f }); });
  }
  function castPetSkill(t, s) {
    const k = pet.skill, tint = parseInt(pet.color.slice(1), 16), py = s.y + (pet.flying ? -110 : 0);
    floatText(s.x, py - 120, '✦ ' + k.name, tint, 36); spark(s.x, py - 60, tint, 1.6); shake = Math.max(shake, 6);
    if (k.strike) {
      if (k.stun) { lightning(boss.x + rand(-60, 60), boss.y - 900, boss.x, boss.y - 120, 0xb9a2ff); sound.sfx('boss', 0); }
      else if (pet.id === 'van-thu') { lightning(s.x, py - 60, boss.x, boss.y - 150, 0xff4d6d); sound.sfx('impact', 0); }
      else { for (let i = 0; i < 3; i++) setTimeout(() => spark(boss.x + rand(-80, 80), boss.y - 160 + rand(-60, 60), tint, 1.8), i * 90); sound.sfx('dragon', 0); }
      hitBoss(k.strike, { crit: false, knock: 18, tint, gainQi: false });
    }
    if (k.stun) { boss.stunUntil = Math.max(boss.stunUntil || 0, t + k.stun); floatText(boss.x, boss.y - 380, 'Choáng!', 0xd9c2ff, 40); }
    if (k.burn) { sound.sfx('lotus', 0); for (let i = 0; i < k.burn.ticks; i++) petTimers.push({ at: t + 0.5 + i * 0.5, fn: () => { hitBoss(k.burn.mult, { crit: false, knock: 0, tint: 0xff7a2a, gainQi: false }); spark(boss.x + rand(-60, 60), boss.y - rand(60, 260), 0xff7a2a, 1.1); } }); }
    if (k.heal) healPlayer(player.maxHp * k.heal);
    if (k.hot) { const n = k.hot.secs * 2, per = player.maxHp * k.hot.total / n; for (let i = 1; i <= n; i++) petTimers.push({ at: t + i * 0.5, fn: () => healPlayer(per, i % 2 === 0) }); }
    if (k.shield) { const amt = Math.round(player.maxHp * k.shield); player.shield = Math.max(player.shield || 0, amt); player.shieldMax = player.shield; player.shieldUntil = t + 6; floatText(player.x, player.y - 330, 'Giáp +' + amt.toLocaleString('vi-VN'), 0x8fd8ff, 32); sound.sfx('skin', 0); }
  }
  // Linh thú: theo sau lưng chủ, cứ ~1,5 giây lao tới cắn boss rồi quay về.
  function updatePet(t, dt) {
    const s = petState, fly = pet.flying ? -110 : 0;
    s.t += dt;
    for (let i = petTimers.length - 1; i >= 0; i--) if (t >= petTimers[i].at) { const job = petTimers.splice(i, 1)[0]; if (!player.dead && !boss.dead) job.fn(); }
    if (pet.skill && !boss.dead && !player.dead && boss.state !== 'intro' && t >= (s.skillAt ??= t + 4)) { s.skillAt = t + pet.skill.every; castPetSkill(t, s); }
    updateShield(t);
    let tx = player.x - player.face * 95, ty = player.y + 14;
    if (s.mode === 'follow' && !boss.dead && boss.state !== 'intro' && s.t >= s.nextAt && Math.abs(boss.x - player.x) < 900) { s.mode = 'dash'; s.t = 0; }
    if (s.mode === 'dash') {
      tx = boss.x - Math.sign(boss.x - s.x || 1) * 90; ty = boss.y + 10;
      if (Math.abs(s.x - tx) < 30 || s.t > 0.6) {
        s.mode = 'back'; s.t = 0;
        if (!boss.dead) { const dmg = hitBoss(pet.mult, { knock: 4, tint: parseInt(pet.color.slice(1), 16), gainQi: false, sparkAt: { x: boss.x - Math.sign(boss.x - s.x) * 60, y: boss.y - 120 } }); if (dmg && pet.skill?.leech) healPlayer(dmg * pet.skill.leech, true); }
      }
    } else if (s.mode === 'back' && s.t > 0.35) { s.mode = 'follow'; s.t = 0; s.nextAt = 1.5; }
    const speed = s.mode === 'dash' ? 14 : 5;
    const dx = tx - s.x;
    s.x += dx * Math.min(1, dt * speed); s.y += (ty - s.y) * Math.min(1, dt * speed);
    if (Math.abs(dx) > 4) s.face = Math.sign(dx);
    const moving = Math.abs(dx) > 25 || s.mode !== 'follow';
    s.sprite.texture = petTex[moving ? (Math.floor(performance.now() / 160) % 2 ? 1 : 2) : 0];
    const k = (150 / s.sprite.texture.height) * depthScale(s.y);
    const bob = pet.flying ? Math.sin(performance.now() / 300) * 8 : moving ? -Math.abs(Math.sin(performance.now() / 90)) * 10 : 0;
    s.sprite.position.set(s.x, s.y + fly + bob);
    s.sprite.scale.set(-s.face * k, k); // ảnh linh thú nhìn sang trái
    s.sprite.zIndex = s.y - 1;
    s.shadow.position.set(s.x, s.y + 4); s.shadow.scale.set(0.6, 0.16);
  }
  function killBoss() {
    boss.dead = true; boss.state = 'dead';
    hitStop = 0.25; shake = 26; flash = 0.8;
    for (let i = 0; i < 6; i++) setTimeout(() => spark(boss.x + rand(-120, 120), boss.y - rand(40, 320), color, 1.5), i * 120);
    banner('Chiến thắng!', 2500);
    sound.sfx('victory', 0);
    setTimeout(() => { actor.act('celebrate', 2400); }, 400);
    setTimeout(() => finish(true), 2200);
  }

  // ---------- Vòng lặp ----------
  let finished = false;
  function layout() {
    const W = app.screen.width, H = app.screen.height;
    const s = H / WORLD_H;
    camera.scale.set(s);
    layout.viewW = W / s;
    if (fg) { fg.width = Math.max(WORLD_W, layout.viewW); fg.height = WORLD_H; }
    flashG.clear().rect(0, 0, W, H).fill(0xffffff);
    ui.classList.toggle('portrait', H > W);
  }
  layout(); app.renderer.on('resize', layout);

  app.ticker.add(ticker => {
    const dt = Math.min(0.05, ticker.deltaMS / 1000), t = now();
    // Nhận thao tác
    if (!player.dead && !boss.dead) {
      for (const k of pressed) {
        if (k === 'attack') doAttack(t); else if (k === 'dodge') doDodge(t); else if (k === 'pill') usePill(t);
        else { const s = SKILLS.find(x => x.id === k); if (s) castSkill(s, t); }
      }
    }
    pressed.clear();
    if (hitStop > 0) { hitStop -= dt; }
    else {
      // Di chuyển
      let mx = clamp(inputX(), -1, 1), my = clamp(inputY(), -1, 1);
      if (player.dead || boss.dead) mx = my = 0;
      const attacking = t < player.attackUntil;
      if (t < player.dodgeUntil) { player.x += player.dodgeDir.x * 1500 * dt; player.y += player.dodgeDir.y * 500 * dt; }
      else if (!attacking) { player.x += mx * 380 * dt; player.y += my * 230 * dt; }
      if (Math.abs(mx) > 0.15 && !attacking) player.face = Math.sign(mx);
      player.x = clamp(player.x, 80, WORLD_W - 80); player.y = clamp(player.y, GROUND_TOP, GROUND_BOTTOM);
      actor.setMove(attacking ? 0 : Math.min(1, Math.hypot(mx, my)));
      // Đòn đánh tới lúc chạm
      for (const h of player.hits) if (!h.done && t >= h.at) {
        h.done = true;
        slashArc(player.x + player.face * 60, player.y, player.face, h.big);
        if (inFront(h.range, 150)) hitBoss(h.mult, { knock: h.big ? 36 : 14 });
      }
      player.hits = player.hits.filter(h => !h.done);
      if (player.comboQueued && t >= player.attackUntil - 0.14) { player.comboQueued = false; doAttack(t); }
      player.qi = Math.min(player.maxQi, player.qi + 9 * dt);
      if (!boss.dead) bossThink(t, dt);
      for (const e of effects) e.age += dt;
    }
    // Hiệu ứng
    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i], f = Math.min(1, e.age / e.life);
      e.update(f, hitStop > 0 ? 0 : dt);
      if (f >= 1) { e.sprite.destroy(); effects.splice(i, 1); }
    }
    // Vẽ nhân vật (đúng code LIVE)
    actor.render();
    const ds = depthScale(player.y);
    player.sprite.position.set(player.x, player.y);
    player.sprite.scale.set(PX_PER_LIVE / actor.res * ds * player.face, PX_PER_LIVE / actor.res * ds);
    player.sprite.zIndex = player.y;
    player.sprite.alpha = t < player.invulnUntil && t > player.dodgeUntil ? 0.6 + 0.4 * Math.sin(t * 60) : 1;
    player.shadow.position.set(player.x, player.y + 4); player.shadow.scale.set(1.1 * ds, 0.28 * ds);
    // Vẽ boss: thở như LIVE + lùi khi trúng đòn + nhảy vồ
    boss.knock *= 0.85; boss.x = clamp(boss.x + boss.knock * dt * 8, 120, WORLD_W - 120);
    if (petState) updatePet(t, dt);
    const bs = depthScale(boss.y) * BOSS_SCALE, breath = Math.sin(t * 2) * 0.015;
    const crouch = boss.crouch ? 0.08 + Math.sin(t * 40) * 0.01 : 0;
    bossBox.position.set(boss.x + (boss.crouch ? Math.sin(t * 50) * 3 : 0), boss.y + boss.lift);
    bossBox.scale.set(bs * boss.face * BOSS_FLIP * (1 + breath + crouch * 0.5), bs * (1 - breath - crouch));
    bossBox.zIndex = boss.y;
    boss.flash = Math.max(0, boss.flash - dt * 6); boss.flashSprite.alpha = boss.flash * 0.8;
    boss.sprite.tint = boss.enraged ? 0xffc6c0 : 0xffffff;
    if (boss.dead) { bossBox.alpha = Math.max(0, bossBox.alpha - dt * 0.6); boss.lift -= dt * 40; }
    boss.shadow.position.set(boss.x, boss.y + 6); boss.shadow.scale.set(3.2 * bs / BOSS_SCALE, 0.7 * bs / BOSS_SCALE); boss.shadow.alpha = 0.5 * (1 + boss.lift / 500);
    // Máy quay
    const viewW = layout.viewW || 1000;
    let camX = viewW >= WORLD_W ? (WORLD_W - viewW) / 2 : clamp((player.x + boss.x) / 2 - viewW / 2, 0, WORLD_W - viewW);
    const sx = shake > 0.3 ? rand(-shake, shake) : 0, sy = shake > 0.3 ? rand(-shake, shake) * 0.6 : 0;
    shake *= 0.86;
    world.position.set(-camX + sx, sy);
    fgLayer.position.set(-camX * 1.15 + sx * 1.3, sy);
    flash = Math.max(0, flash - dt * 2.5); flashG.alpha = flash * 0.5;
    renderUi(t);
  });

  function renderUi(t) {
    $('.b-hp i').style.width = (player.hp / player.maxHp * 100) + '%';
    $('.b-hp span').textContent = `${Math.round(player.hp).toLocaleString('vi-VN')} / ${player.maxHp.toLocaleString('vi-VN')}` + (player.shield > 0 && t < player.shieldUntil ? ` · 🛡 ${Math.round(player.shield).toLocaleString('vi-VN')}` : '');
    $('.b-qi i').style.width = (player.qi / player.maxQi * 100) + '%';
    $('.b-boss-bar i').style.width = (boss.hp / boss.maxHp * 100) + '%';
    $('.b-boss-bar em').textContent = `${Math.round(boss.hp).toLocaleString('vi-VN')} / ${boss.maxHp.toLocaleString('vi-VN')}`;
    for (const s of SKILLS) {
      const left = Math.max(0, skillCd[s.id] - t), el = ui.querySelector(`[data-k="${s.id}"]`);
      el.querySelector('.cd').style.setProperty('--p', left / s.cd);
      el.classList.toggle('nope', player.qi < s.cost);
    }
    ui.querySelector('[data-k="dodge"] .cd').style.setProperty('--p', Math.max(0, player.dodgeCd - t) / 0.9);
    ui.querySelector('[data-k="pill"] .cd').style.setProperty('--p', player.pills ? Math.max(0, player.pillCd - t) / 8 : 1);
  }

  async function finish(victory, quit = false) {
    if (finished) return;
    finished = true;
    if (quit && !confirmQuit()) { finished = false; return; }
    const result = await onFinish?.({ victory, hpLeft: player.hp / player.maxHp, quit, pillsUsed: PILLS - player.pills });
    const r = $('.b-result');
    r.hidden = false;
    if (victory && result?.ok) {
      const rw = result.reward || {};
      r.innerHTML = `<div class="b-res-card win"><h2>${result.tower ? 'Qua tầng ' + result.floor : 'Chiến thắng'}</h2><div class="stars">${'★'.repeat(result.stars)}${'☆'.repeat(3 - result.stars)}</div>
        <p>${result.tower ? 'Tháp Trấn Yêu · bấm Đánh lại để leo tầng kế' : result.event ? 'Sự kiện LIVE · nguyên liệu ×2' : result.first ? 'Lần đầu vượt ải · thưởng gấp đôi' : 'Vượt ải'}</p>
        <ul><li><img src="/art/ui/icon-stone.png" alt="">+${(rw.stones || 0).toLocaleString('vi-VN')} linh thạch</li><li><img src="/art/ui/icon-herb.png" alt="">+${rw.herbs || 0} linh thảo</li>${rw.qi || rw.capped ? `<li>✦ +${(rw.qi || 0).toLocaleString('vi-VN')} tu vi${rw.capped ? ' (đã đạt trần hôm nay)' : ''}</li>` : ''}${Object.entries(rw.mats || {}).map(([k, v]) => `<li><img src="/art/ui/mat-${k}.png" alt="">+${v} ${MAT_NAMES[k] || k}</li>`).join('')}</ul>
        <div class="b-res-act"><button data-r="again">Đánh lại</button><button data-r="exit" class="gold">Về tông môn</button></div></div>`;
    } else {
      r.innerHTML = `<div class="b-res-card"><h2>${quit ? 'Rời trận' : 'Thất bại'}</h2><p>${result?.message || 'Hãy tu luyện thêm rồi quay lại.'}</p>
        <div class="b-res-act"><button data-r="again">Đánh lại</button><button data-r="exit" class="gold">Về tông môn</button></div></div>`;
    }
    r.onclick = e => { const b = e.target.closest('[data-r]'); if (!b) return; destroy(); onExit?.(b.dataset.r); };
  }
  function confirmQuit() { return window.confirm('Rời trận? Trận này sẽ tính là thua và mất nửa thể lực.'); }
  function destroy() {
    removeEventListener('keydown', onKey); removeEventListener('keyup', onKey);
    app.destroy(true, { children: true });
    host.innerHTML = ''; host.hidden = true;
  }
  return { destroy };
}

function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
