// src/logging/useGlobalErrorReporter.ts
import { useEffect } from "react";
import { sendStructuredLog } from "./structuredLogger";

export function useGlobalErrorReporter() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      sendStructuredLog({
        context: "GlobalError",
        event: "UnhandledError",
        level: "ERROR",
        message: event.message,
        error: {
          message: event.error?.message ?? event.message,
          name: event.error?.name ?? "Error",
          stack: event.error?.stack,
        },
      });
    };

    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);
}
