// Lịch luyện — bế quan (tụ linh khi không chơi). Thuần: tính theo khoảng thời gian, không cần hẹn giờ cho từng người.
// Mỗi giờ nhận ratePerHour ‰ lượng tu vi của bậc hiện tại; tối đa capHours giờ (quá thì ngừng tích, phải vào nhận).
export const IDLE = Object.freeze({ ratePerHour: 40, capHours: 8, minMinutes: 10 });

// stepQi: tu vi cần của bậc đang đứng. ms: thời gian đã bế quan. qiGain: ‰ cộng thêm từ mệnh cách.
export function idleQi(stepQi, ms, { qiGain = 0, rule = IDLE } = {}) {
  const capMs = rule.capHours * 3600000, used = Math.max(0, Math.min(ms, capMs));
  // tính theo phút nguyên để tất định và dễ đối chiếu
  const minutes = Math.floor(used / 60000);
  const base = Math.floor(stepQi * rule.ratePerHour * minutes / (1000 * 60));
  return { qi: Math.floor(base * (1000 + qiGain) / 1000), minutes, capped: ms >= capMs, claimable: minutes >= rule.minMinutes };
}
