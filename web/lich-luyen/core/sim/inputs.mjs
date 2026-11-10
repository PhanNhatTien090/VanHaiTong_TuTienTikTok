// Lịch luyện — đầu vào trận đánh. Mỗi nhịp: { dir: -1 (đứng yên) | 0..63, buttons: bitmask }.
// Ghi lại theo RLE: [[số nhịp, dir, buttons], ...] — trận 3 phút thường chỉ vài trăm đoạn.
export const TICK_RATE = 30;
export const BTN = Object.freeze({ ATTACK: 1, SPECIAL: 2, DASH: 4, ULTIMATE: 8 });
export const BTN_MASK = 15;
export const IDLE = Object.freeze({ dir: -1, buttons: 0 });

export function validFrame(f) { return f && Number.isInteger(f.dir) && f.dir >= -1 && f.dir <= 63 && Number.isInteger(f.buttons) && f.buttons >= 0 && f.buttons <= BTN_MASK; }

export function encodeInputs(frames) {
  const out = [];
  for (const f of frames) {
    if (!validFrame(f)) throw RangeError('Đầu vào không hợp lệ');
    const last = out.at(-1);
    if (last && last[1] === f.dir && last[2] === f.buttons) last[0]++;
    else out.push([1, f.dir, f.buttons]);
  }
  return out;
}

// Giải nén có giới hạn (chống gửi dữ liệu khổng lồ). Trả về hàm lấy đầu vào theo nhịp.
export function decodeInputs(rle, maxTicks) {
  if (!Array.isArray(rle)) throw TypeError('Đầu vào phải là mảng');
  let total = 0;
  for (const seg of rle) {
    if (!Array.isArray(seg) || seg.length !== 3) throw TypeError('Đoạn đầu vào sai dạng');
    const [n, dir, buttons] = seg;
    if (!Number.isInteger(n) || n < 1 || !validFrame({ dir, buttons })) throw RangeError('Đoạn đầu vào sai giá trị');
    total += n;
    if (total > maxTicks) throw RangeError('Đầu vào dài hơn thời gian trận cho phép');
  }
  return { total, frames: function* () { for (const [n, dir, buttons] of rle) for (let i = 0; i < n; i++) yield { dir, buttons }; } };
}
