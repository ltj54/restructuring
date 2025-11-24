import { expect, test, vi } from "vitest";
import { api } from "../api";

test("api helper bygger riktig request", async () => {
  const mockJson = vi.fn().mockResolvedValue({ ok: true });

  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: mockJson,
    headers: { get: () => 'application/json' },
  } as any);

  const result = await api("/hello");

  expect(fetch).toHaveBeenCalled();
  expect(result).toEqual({ ok: true });
});
