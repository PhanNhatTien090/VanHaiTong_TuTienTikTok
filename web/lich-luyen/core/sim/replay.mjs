// Lịch luyện — chạy lại trận từ đầu vào đã ghi (server dùng để xác nhận trước khi phát thưởng),
// và chạy trận bằng bot (tự động chiến đấu, giả lập cân bằng).
import { createBattle, tick, battleResult } from './battle.mjs';
import { decodeInputs, IDLE } from './inputs.mjs';
import { botInput } from './bot.mjs';

// Trả kết quả do SERVER tính. Client chỉ gửi đầu vào; không tin bất cứ con số nào client báo.
// complete=false nghĩa là đầu vào hết mà trận chưa xong (bỏ dở / gửi thiếu) → không thưởng.
export function runReplay(content, setup, rle) {
  const state = createBattle(content, setup);
  const { frames } = decodeInputs(rle, state.maxTicks);
  for (const f of frames()) { if (state.over) break; tick(content, state, f); }
  const result = battleResult(state);
  return { ...result, complete: state.over };
}

// So kết quả server với kết quả client tự báo (để ghi log lệch/gian lận). Thưởng luôn theo `server`.
export function verifyReplay(content, setup, rle, claimed = {}) {
  const server = runReplay(content, setup, rle);
  const mismatch = claimed.hash !== undefined && claimed.hash !== server.hash;
  return { server, mismatch, accepted: server.complete };
}

// Bot đánh tới khi xong. Trả về kết quả + đầu vào đã dùng (để test chạy lại).
export function runBot(content, setup, controller = botInput) {
  const state = createBattle(content, setup), frames = [];
  while (!state.over) { const f = controller(content, state) || IDLE; frames.push(f); tick(content, state, f); }
  return { result: battleResult(state), frames, state };
}
