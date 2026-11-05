// v4: shared free-qi budget and high-realm daily ascension gate; see daily-practice.mjs.
// 05/11/2026: keep entry through Hoa Than (realm0..4) unchanged.
// From current realm5, the showcase reward floor is approximately 1/10 of its prior value.
// This changes future practice gains only; earned qi, realm, gifts and opportunity costs stay intact.
export const ASCENSION_PACING_VERSION=4;
export const ASCENSION_PRACTICE_STEPS=Object.freeze([2,3,4,5,6,70,80,90,1650,1900,2100,2400,2700,3100,3450,3900,4400,4950,7000,10000,15000]);
export function ascensionPracticeReward(realm,kind,neededQi,neededStones){
 const steps=ASCENSION_PRACTICE_STEPS[Math.max(0,Math.min(ASCENSION_PRACTICE_STEPS.length-1,Number(realm)||0))],weight={cultivate:1,gather:1.4,attack:.35}[kind]||0;
 return {qi:Math.ceil(neededQi/steps*weight),stones:Math.ceil(neededStones/steps*weight),steps};
}
