import crypto from 'node:crypto';

export const SCHEMA_VERSION = 1;
export const WORLD_FIELDS = ['createdAt','sectQi','settings','gifts','boss','feed','events','social','tournament','race','bondFestival','flowerEvent','visitor','petEvent','lanternFestival','companions','liveSession','patronEnabled','patronCurrent','totalGifts','totalInteractions','sectBuild','giftPolicyVersion','divineWardrobeVersion','lastBossResult','opportunity','likeGoal','quiz','envelope','competitionSchedule','nextBossAt','lastBlessingAt'];
const PLAYER_FIELDS = ('id name gender avatar realm qi totalQi stones herbs giftCoins interactions joinedAt lastActive lastRealInteractionAt leftLiveAt activeMs artifacts manuals pills equipped equippedExtra rewardSkins skinChoice skinChoiceSource divineRoles divineRoleChoice divineRoleHidden relicVariant socialCode bondId bondMilestone bondFestivalWins tournamentTitle tournamentWins tournamentMedals raceTitle raceWins raceMedals raceSwordChoice raceSwordSkins spiritPet spiritPets petProgress companionPoints contribution loyaltyRewards ascensionAccess buffMult buffUntil cooldowns day checkinStreak lastCheckinDay cultivatedAt gatheredAt novicePractice web webOnly lanternTitle lanternFriendships sectFounder').split(' ');
export const digest = value => crypto.createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
export function validId(id) { return typeof id === 'string' && id.length > 0 && id.length <= 128 && !['__proto__','constructor','prototype'].includes(id); }
export function projectPlayer(p) {
  if (!p || !validId(p.id) || p.resident || p.puppet || p.webOnly || p.actorKind === 'npc') return null;
  const result = {};
  for (const field of PLAYER_FIELDS) if (p[field] !== undefined) result[field] = p[field];
  return result;
}
export function projectWorld(world) {
  if (world?.version !== 1 || !world.players || typeof world.players !== 'object') throw Error('Source world is invalid');
  const players = Object.values(world.players).map(projectPlayer).filter(Boolean);
  const meta = {};
  for (const field of WORLD_FIELDS) if (world[field] !== undefined) meta[field] = world[field];
  meta.events = (meta.events || []).slice(-40);
  meta.feed = (meta.feed || []).slice(0, 30);
  // The cloud never needs raw gift history, audit, credentials or the source's outbox.
  return { players, meta };
}
export function signature(secret, method, pathname, timestamp, body) {
  return crypto.createHmac('sha256', secret).update(`${method}\n${pathname}\n${timestamp}\n${digest(body)}`).digest('hex');
}
export function authenticate(req, pathname, body, secret, now = Date.now()) {
  const timestamp = String(req.headers['x-vh-time'] || ''), actual = String(req.headers['x-vh-signature'] || '');
  if (!/^\d{13}$/.test(timestamp) || Math.abs(now - Number(timestamp)) > 120000 || !/^[a-f0-9]{64}$/.test(actual)) return false;
  const expected = signature(secret, req.method, pathname, timestamp, body);
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(actual, 'hex'));
}
export function validateBatch(batch) {
  if (!batch || batch.schema !== SCHEMA_VERSION || !validId(batch.agentId) || !validId(batch.id) || !Number.isSafeInteger(batch.seq) || batch.seq < 1 || typeof batch.full !== 'boolean') throw Error('Invalid sync envelope');
  if (!Array.isArray(batch.players) || batch.players.length > 12000 || !Array.isArray(batch.deleted) || batch.deleted.length > 12000 || !batch.meta || typeof batch.meta !== 'object') throw Error('Invalid sync data');
  const ids = new Set();
  for (const p of batch.players) {
    if (!validId(p?.id) || ids.has(p.id) || !Number.isInteger(p.realm) || p.realm < 0 || p.realm > 100 || !Array.isArray(p.artifacts) || !Array.isArray(p.manuals) || typeof p.name !== 'string' || p.name.length > 200 || !projectPlayer(p)) throw Error('Invalid player');
    ids.add(p.id);
  }
  for (const id of batch.deleted) if (!validId(id) || ids.has(id)) throw Error('Invalid deletion');
  for (const key of Object.keys(batch.meta)) if (!WORLD_FIELDS.includes(key)) throw Error('Unexpected world field');
}
