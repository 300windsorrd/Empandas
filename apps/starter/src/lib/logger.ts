export function logAction(message: string, details?: Record<string, any>) {
  const entry = { ts: new Date().toISOString(), message, ...(details || {}) };
  // Hook up Sentry here if SENTRY_DSN configured
  // For now, console log with structured JSON
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}

