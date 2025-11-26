import { expect, test, vi } from "vitest";
import { api } from "../api";

test("api helper bygger riktig request", async () => {
  const mockJson = vi.fn().mockResolvedValue({ ok: true });

  // Typing for mocked fetch response
  const mockResponse: Response = {
    ok: true,
    json: mockJson,
    headers: {
      get: () => "application/json",
    },
  } as unknown as Response;

  globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

  const result = await api("/hello");

  expect(fetch).toHaveBeenCalled();
  expect(result).toEqual({ ok: true });
});
