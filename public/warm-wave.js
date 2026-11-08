// 08/11/2026: âm sắc ấm cho dây/hợp xướng đột phá. Sóng răng cưa đầy đủ hài âm xếp 20 giọng thành tiếng "rè rè";
// sóng này giữ 10 hài đầu, giảm nhanh (1/n^1.6) nên tròn, ấm mà vẫn có thân. Mỗi AudioContext tạo một lần.
const cache=new WeakMap();
export function warmWave(c){if(cache.has(c))return cache.get(c);const n=11,re=new Float32Array(n),im=new Float32Array(n);for(let k=1;k<n;k++)im[k]=(k%2?1:.7)/k**1.6;const w=c.createPeriodicWave(re,im);cache.set(c,w);return w;}
