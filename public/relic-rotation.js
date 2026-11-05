// v71: người đeo nhiều pháp bảo — cảnh chỉ vẽ MỘT món mỗi lúc, đổi lần lượt mỗi 7 giây để không che nhân vật.
const views=new WeakMap();
const hash=s=>{let h=0;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))|0;return Math.abs(h);};
export const RELIC_ROTATE_MS=7000;
export function shownRelicPlayer(p,t){const extra=p?.equippedExtra;if(!extra?.length||!p.equipped)return p;const list=[p.equipped,...extra];
  const id=list[Math.floor(t/RELIC_ROTATE_MS+hash(p.id)%list.length)%list.length];if(id===p.equipped)return p;
  let v=views.get(p);if(!v||v.equipped!==id){v={...p,equipped:id};views.set(p,v);}return v;}
