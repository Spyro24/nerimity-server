export function debounceByKey<Args extends unknown[]>(fn: (...args: Args) => void, delay: number, getKey: (...args: Args) => string, maxDelay?: number) {
  const timeouts = new Map<string, ReturnType<typeof setTimeout>>();
  const pendingArgs = new Map<string, Args>();
  const firstCallAt = new Map<string, number>();

  const run = (key: string) => {
    const existing = timeouts.get(key);
    if (existing) clearTimeout(existing);
    timeouts.delete(key);
    firstCallAt.delete(key);

    const latestArgs = pendingArgs.get(key);
    pendingArgs.delete(key);
    if (latestArgs) fn(...latestArgs);
  };

  const debounced = (...args: Args) => {
    const key = getKey(...args);

    const existing = timeouts.get(key);
    if (existing) clearTimeout(existing);

    pendingArgs.set(key, args);

    if (!firstCallAt.has(key)) {
      firstCallAt.set(key, Date.now());
    }

    const elapsedSinceFirst = Date.now() - firstCallAt.get(key)!;
    const remainingMaxWait = maxDelay ? maxDelay - elapsedSinceFirst : Infinity;

    const waitTime = Math.max(0, Math.min(delay, remainingMaxWait));

    const timeoutId = setTimeout(() => run(key), waitTime);
    timeouts.set(key, timeoutId);
  };

  debounced.cancel = (key: string) => {
    const existing = timeouts.get(key);
    if (existing) clearTimeout(existing);
    timeouts.delete(key);
    pendingArgs.delete(key);
    firstCallAt.delete(key);
  };

  debounced.flush = (key: string) => {
    if (!timeouts.has(key)) return;
    run(key);
  };

  debounced.peek = (key: string): Args | undefined => {
    return pendingArgs.get(key);
  };

  return debounced;
}
