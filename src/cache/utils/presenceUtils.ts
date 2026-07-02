import type { ActivityStatus } from '../UserCache';

function countDefinedKeys(a: ActivityStatus) {
  return Object.values(a).filter((v) => v !== undefined && v !== null).length;
}

// collapse duplicate external activities reported by multiple
// client sockets, keeping the richest entry per activity name
export function dedupeActivities(activities?: ActivityStatus[] | null) {
  if (!activities) return activities;

  const map = new Map<string, ActivityStatus>();

  for (const a of activities) {
    const key = a.name ?? '';
    const existing = map.get(key);

    if (!existing || countDefinedKeys(a) > countDefinedKeys(existing)) {
      map.set(key, a);
    }
  }

  return Array.from(map.values());
}
