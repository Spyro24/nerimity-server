import type { ActivityStatus } from "../UserCache";

// collapse duplicate extenal activities reported by mutiple
// client sockets
export function dedupeActivities(activities?: ActivityStatus[] | null) {
  if (!activities) return activities;
  const seen = new Set<string>();
  return activities.filter((a) => {
    const key = [a.name, a.action, a.title, a.subtitle, a.link, a.imgSrc].join('\u0000');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
