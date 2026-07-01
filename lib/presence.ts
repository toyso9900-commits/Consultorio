const ONLINE_THRESHOLD_MINUTES = 5;

export function isUserOnline(lastSeenAt: Date | null | undefined): boolean {
  if (!lastSeenAt) return false;
  const threshold = ONLINE_THRESHOLD_MINUTES * 60 * 1000;
  return Date.now() - new Date(lastSeenAt).getTime() < threshold;
}
