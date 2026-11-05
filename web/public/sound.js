// Âm thanh của web dùng lại bộ âm thanh LIVE (public/audio.js): nhạc nền bgm-theme-c + tiếng hiệu ứng tổng hợp.
// Trình duyệt chỉ cho phát sau khi người chơi chạm/bấm lần đầu → tự bật ở lần chạm đầu tiên nếu đang để "Bật".
import { CultivationAudio } from '/audio.js';

const audio = new CultivationAudio();
const KEY = 'vh-sound';
let wanted = true;
try { wanted = localStorage.getItem(KEY) !== 'off'; } catch {}
let starting = null, lastPlay = {};

async function start() {
  if (audio.enabled || starting) return starting;
  starting = audio.enable(true).catch(() => {}).finally(() => { starting = null; });
  return starting;
}
addEventListener('pointerdown', () => { if (wanted && !audio.enabled) start(); }, { capture: true });
addEventListener('keydown', () => { if (wanted && !audio.enabled) start(); }, { capture: true });

export const sound = {
  get on() { return wanted; },
  async toggle() {
    wanted = !wanted;
    try { localStorage.setItem(KEY, wanted ? 'on' : 'off'); } catch {}
    if (wanted) await start(); else await audio.enable(false);
    return wanted;
  },
  // Tiếng hiệu ứng LIVE: attack, sword, impact, boss, lotus, dragon, victory, qi, petal, breakthrough, skin, pet
  sfx(type, gapMs = 70) {
    if (!audio.enabled) return;
    const now = performance.now();
    if (now - (lastPlay[type] || 0) < gapMs) return;
    lastPlay[type] = now;
    try { audio.play(type); } catch {}
  },
};

// Nhạc: trang chủ êm, trận đánh to hơn một chút.
export const music = {
  hub() { audio.set('ambient', 0.45); },
  battle() { audio.set('ambient', 0.7); },
};
