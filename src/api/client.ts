export interface SessionSummary {
  id: string;
  updatedAt: string;
  cwd: string;
  sourceKind: string;
  rolloutPath: string;
  title?: string;
  slug?: string;
  summary?: string;
  firstUserPrompt?: string;
  messageCount: number;
  mainModels?: string[];
  mainUsage?: TokenUsage;
  resumeCommand: string;
  searchText: string;
  parseError?: string;
}

export interface SessionMessage {
  id: string;
  parentId?: string;
  timestamp: string;
  role: string;
  text: string;
  type: string;
  model?: string;
  modelSource?: string;
  usage?: TokenUsage;
  raw?: unknown;
}

export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  premiumRequests?: number;
  reasoningTokens?: number;
  cttl?: CacheWriteTTL;
  server?: ServerToolUsage;
  cost: UsageCost;
}

export interface CacheWriteTTL {
  ephemeral5m?: number;
  ephemeral1h?: number;
}

export interface ServerToolUsage {
  webSearch?: number;
  webFetch?: number;
}

export interface UsageCost {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  total: number;
}

export interface CwdOption {
  cwd: string;
  count: number;
}

export interface ListSessionsResponse {
  items: SessionSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListMessagesResponse {
  items: SessionMessage[];
  total: number;
  limit: number;
  offset: number;
  toolCallCount: number;
  toolResultCount: number;
}

export async function fetchSessions(params: URLSearchParams = new URLSearchParams()) {
  const response = await fetch(`/api/sessions?${params.toString()}`);
  return parseResponse<ListSessionsResponse>(response);
}

export async function fetchCwds() {
  const response = await fetch("/api/cwds");
  return parseResponse<{ items: CwdOption[] }>(response);
}

export async function fetchMessages(
  id: string,
  includeRaw: boolean,
  includeToolCalls: boolean,
  includeToolResults: boolean,
) {
  const params = new URLSearchParams({ limit: "5000" });
  if (includeRaw) {
    params.set("includeRaw", "true");
  }
  if (includeToolCalls) {
    params.set("includeToolCalls", "true");
  }
  if (includeToolResults) {
    params.set("includeToolResults", "true");
  }
  const response = await fetch(
    `/api/sessions/${encodeURIComponent(id)}/messages?${params.toString()}`,
  );
  return parseResponse<ListMessagesResponse>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = (await response.json()) as { error?: string };
      message = body.error ?? message;
    } catch {
      // Keep status fallback.
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}
