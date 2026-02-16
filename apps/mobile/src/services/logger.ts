type LogLevel = 'info' | 'warn' | 'error';

type LogPayload = {
  event: string;
  details?: Record<string, unknown>;
  error?: unknown;
};

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    value: String(error),
  };
}

function emit(level: LogLevel, payload: LogPayload): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event: payload.event,
    details: payload.details ?? {},
    ...(payload.error ? { error: serializeError(payload.error) } : {}),
  };

  if (level === 'error') {
    console.error('[TrustVibe]', entry);
    return;
  }

  if (level === 'warn') {
    console.warn('[TrustVibe]', entry);
    return;
  }

  console.info('[TrustVibe]', entry);
}

export function logInfo(event: string, details?: Record<string, unknown>): void {
  emit('info', { event, details });
}

export function logWarn(event: string, details?: Record<string, unknown>, error?: unknown): void {
  emit('warn', { event, details, error });
}

export function logError(event: string, error: unknown, details?: Record<string, unknown>): void {
  emit('error', { event, error, details });
}
