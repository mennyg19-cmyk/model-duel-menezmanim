// === What's in this file ===
// A generic TTL (time-to-live) cache. Entries auto-expire after a
// configurable duration. Used by the render loop and sync layer to
// avoid redundant recalculations within a short window.
//
// TTLCache<T> class:
//   constructor(defaultTTL)  -- sets TTL in ms (default 60s).
//   get(key)                 -- returns cached value or undefined if expired.
//   set(key, value, ttl?)    -- stores a value with optional per-key TTL.
//   has(key)                 -- true if key exists and is not expired.
//   delete(key)              -- removes a single entry.
//   clear()                  -- removes all entries.
//   size()                   -- count of non-expired entries (triggers cleanup).
//   cleanup()                -- removes all expired entries.

export class TTLCache<T> {
  private cache: Map<string, { value: T; expires: number }>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 60_000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttl?: number): void {
    const expires = Date.now() + (ttl ?? this.defaultTTL);
    this.cache.set(key, { value, expires });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }
}
