import type {
  ConflictStrategy,
  SyncChange,
  SyncLogEntry,
  SyncPullResponse,
  SyncPushResponse,
} from "./types";

export type SyncClientOptions = {
  baseUrl: string;
  orgId: string;
  headers?: () => HeadersInit;
  onChanges: (changes: SyncLogEntry[]) => void | Promise<void>;
  onError?: (error: Error) => void;
};

export class SyncClient {
  private cursor: string | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private isPulling = false;

  constructor(private readonly options: SyncClientOptions) {}

  async pull(limit = 100): Promise<SyncPullResponse> {
    const query = new URLSearchParams({ orgId: this.options.orgId, limit: String(limit) });
    if (this.cursor) query.set("cursor", this.cursor);
    const response = await fetch(`${this.options.baseUrl}/api/sync/pull?${query}`, {
      headers: this.options.headers?.(),
    });
    if (!response.ok) throw new Error(await this.errorMessage(response, "Sync pull failed"));

    const payload = (await response.json()) as SyncPullResponse;
    this.cursor = payload.cursor;
    if (payload.changes.length) await this.options.onChanges(payload.changes);
    return payload;
  }

  async push(
    changes: SyncChange[],
    strategy: ConflictStrategy = "last-write-wins",
  ): Promise<SyncPushResponse> {
    const headers = new Headers(this.options.headers?.());
    headers.set("Content-Type", "application/json");
    const response = await fetch(`${this.options.baseUrl}/api/sync/push`, {
      method: "POST",
      headers,
      body: JSON.stringify({ orgId: this.options.orgId, strategy, changes }),
    });
    if (!response.ok) throw new Error(await this.errorMessage(response, "Sync push failed"));
    return (await response.json()) as SyncPushResponse;
  }

  start(intervalMs = 5_000): void {
    if (this.timer) return;
    void this.poll();
    this.timer = setInterval(() => void this.poll(), intervalMs);
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  resetCursor(): void {
    this.cursor = null;
  }

  private async poll(): Promise<void> {
    if (this.isPulling) return;
    this.isPulling = true;
    try {
      await this.pull();
    } catch (error) {
      this.options.onError?.(error instanceof Error ? error : new Error("Sync pull failed"));
    } finally {
      this.isPulling = false;
    }
  }

  private async errorMessage(response: Response, fallback: string): Promise<string> {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    return payload?.error ?? `${fallback}: HTTP ${response.status}`;
  }
}
