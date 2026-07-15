import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TTLCache } from "./cache";

describe("TTLCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores and retrieves values", () => {
    const cache = new TTLCache<string>(5000);
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("returns undefined for missing keys", () => {
    const cache = new TTLCache<string>();
    expect(cache.get("missing")).toBeUndefined();
  });

  it("expires entries after TTL", () => {
    const cache = new TTLCache<string>(1000);
    cache.set("key1", "value1");

    vi.advanceTimersByTime(500);
    expect(cache.get("key1")).toBe("value1");

    vi.advanceTimersByTime(600);
    expect(cache.get("key1")).toBeUndefined();
  });

  it("supports per-key TTL override", () => {
    const cache = new TTLCache<string>(10_000);
    cache.set("short", "val", 500);
    cache.set("long", "val", 5000);

    vi.advanceTimersByTime(600);
    expect(cache.get("short")).toBeUndefined();
    expect(cache.get("long")).toBe("val");
  });

  it("has() returns false for expired keys", () => {
    const cache = new TTLCache<number>(100);
    cache.set("x", 42);

    expect(cache.has("x")).toBe(true);
    vi.advanceTimersByTime(200);
    expect(cache.has("x")).toBe(false);
  });

  it("delete removes a key", () => {
    const cache = new TTLCache<number>();
    cache.set("x", 1);
    cache.delete("x");
    expect(cache.get("x")).toBeUndefined();
  });

  it("clear removes all keys", () => {
    const cache = new TTLCache<number>();
    cache.set("a", 1);
    cache.set("b", 2);
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  it("size excludes expired entries", () => {
    const cache = new TTLCache<number>(1000);
    cache.set("a", 1);
    cache.set("b", 2, 200);

    vi.advanceTimersByTime(300);
    expect(cache.size()).toBe(1);
  });

  it("cleanup removes expired entries", () => {
    const cache = new TTLCache<number>(500);
    cache.set("a", 1);
    cache.set("b", 2);

    vi.advanceTimersByTime(600);
    cache.cleanup();
    expect(cache.size()).toBe(0);
  });
});
