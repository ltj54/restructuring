// src/logging/LoggerTypes.ts

export type StructuredLogLevel = "INFO" | "WARN" | "ERROR";

export interface StructuredLogError {
  message?: string;
  name?: string;
  stack?: string;
}

export interface StructuredLogPayload {
  context: string;
  event: string;
  level: StructuredLogLevel;
  message: string;
  meta?: Record<string, unknown>;
  error?: StructuredLogError;
  timestamp: string;
  env?: string;
  app?: string;
}
