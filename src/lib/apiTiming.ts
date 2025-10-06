import { logger } from './logger';

export async function withTiming<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = process.hrtime.bigint();
  try {
    const result = await fn();
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1_000_000;
    logger.info({ evt: 'api_timing', name, durationMs: ms.toFixed(2) }, 'api timing');
    return result;
  } catch (e: any) {
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1_000_000;
    logger.error({ evt: 'api_timing', name, durationMs: ms.toFixed(2), error: e?.message }, 'api timing error');
    throw e;
  }
}
