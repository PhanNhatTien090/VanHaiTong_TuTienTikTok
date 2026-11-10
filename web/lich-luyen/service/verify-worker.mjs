// Lịch luyện — luồng riêng chạy lại trận (để mô phỏng nặng không chặn API web).
// Dùng: const v = createVerifier(); await v.verify(setup, inputs); v.close();
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { loadContent } from '../content/index.js';
import { runReplay } from '../core/sim/replay.mjs';

if (!isMainThread && parentPort) {
  const content = loadContent();
  parentPort.on('message', ({ id, setup, inputs }) => {
    try { parentPort.postMessage({ id, ok: true, version: content.version, result: runReplay(content, setup, inputs) }); }
    catch (e) { parentPort.postMessage({ id, ok: false, message: e.message }); }
  });
}

// Một worker, xếp hàng; quá thời gian thì hủy worker và tạo lại (đầu vào độc hại không treo được server).
export function createVerifier({ timeoutMs = 4000 } = {}) {
  let worker = null, seq = 0;
  const waiting = new Map();
  const spawn = () => {
    worker = new Worker(new URL(import.meta.url));
    worker.unref();
    worker.on('message', m => { const w = waiting.get(m.id); if (!w) return; waiting.delete(m.id); clearTimeout(w.timer); m.ok ? w.resolve(m) : w.reject(Object.assign(Error(m.message), { code: 'BAD_INPUT' })); });
    worker.on('error', e => { for (const w of waiting.values()) { clearTimeout(w.timer); w.reject(e); } waiting.clear(); worker = null; });
  };
  return {
    verify(setup, inputs) {
      if (!worker) spawn();
      const id = ++seq;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { waiting.delete(id); worker?.terminate(); worker = null; reject(Object.assign(Error('Kiểm tra trận quá thời gian'), { code: 'TIMEOUT' })); }, timeoutMs);
        waiting.set(id, { resolve, reject, timer });
        worker.postMessage({ id, setup, inputs });
      });
    },
    close() { worker?.terminate(); worker = null; },
  };
}
