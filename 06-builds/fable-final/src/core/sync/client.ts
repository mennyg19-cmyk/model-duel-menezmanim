// DK25 — SyncClient: pull/push against a cloud base URL with a device bearer token.

import type {
  ConflictStrategy,
  SyncChange,
  SyncPullResponse,
  SyncPushResponse,
} from "./protocol";

export type SyncUpdateListener = (event: {
  kind: "pull" | "push" | "error";
  pulled?: number;
  pushed?: number;
  conflicts?: number;
  cursor?: number;
  error?: string;
}) => void;

export class SyncClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
  ) {}

  private headers(json = false): Record<string, string> {
    const h: Record<string, string> = { authorization: `Bearer ${this.token}` };
    if (json) h["content-type"] = "application/json";
    return h;
  }

  async whoami(): Promise<{ org: Record<string, unknown> }> {
    const res = await fetch(`${this.baseUrl}/api/sync/whoami`, { headers: this.headers() });
    if (!res.ok) throw new Error(`whoami ${res.status}`);
    return res.json() as Promise<{ org: Record<string, unknown> }>;
  }

  async pull(since = 0): Promise<SyncPullResponse> {
    const res = await fetch(`${this.baseUrl}/api/sync/pull?since=${since}`, { headers: this.headers() });
    if (!res.ok) throw new Error(`pull ${res.status}`);
    return res.json() as Promise<SyncPullResponse>;
  }

  async push(changes: SyncChange[], strategy: ConflictStrategy = "last-write-wins"): Promise<SyncPushResponse> {
    const res = await fetch(`${this.baseUrl}/api/sync/push`, {
      method: "POST",
      headers: this.headers(true),
      body: JSON.stringify({ strategy, changes }),
    });
    if (!res.ok) throw new Error(`push ${res.status}`);
    return res.json() as Promise<SyncPushResponse>;
  }
}

/** G5/G6 — SyncManager: interval loop that notifies listeners (IPC-friendly). */
export class SyncManager {
  private cursor = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<SyncUpdateListener>();

  constructor(
    private readonly client: SyncClient,
    private readonly intervalMs: number,
    private readonly onLocalApply?: (changes: SyncChange[]) => Promise<void>,
  ) {}

  onUpdate(listener: SyncUpdateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: Parameters<SyncUpdateListener>[0]) {
    for (const l of this.listeners) l(event);
  }

  async tick(): Promise<void> {
    try {
      const pulled = await this.client.pull(this.cursor);
      if (this.onLocalApply) await this.onLocalApply(pulled.changes);
      this.cursor = pulled.cursor;
      this.emit({ kind: "pull", pulled: pulled.changes.length, cursor: this.cursor });
    } catch (err) {
      this.emit({ kind: "error", error: err instanceof Error ? err.message : String(err) });
    }
  }

  start(): void {
    if (this.timer) return;
    void this.tick();
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
