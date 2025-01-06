interface IRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  jitterMax?: number;
  isRetryable?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number, delay: number) => void;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    jitterMax = 200,
    isRetryable = () => true,
    onRetry,
  }: IRetryOptions = {}
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw new RetryError(`Operation failed after ${maxRetries} attempts`, lastError);
      }

      if (!isRetryable(error)) {
        throw new RetryError('Operation failed with non-retryable error', lastError);
      }

      const delay = calculateDelay(attempt, { initialDelay, maxDelay, jitterMax });

      if (onRetry) {
        onRetry(error, attempt, delay);
      }

      await sleep(delay);
    }
  }

  throw new RetryError('Operation failed after all retries', lastError);
}

function calculateDelay(
  attempt: number,
  { initialDelay, maxDelay, jitterMax }: Required<Pick<IRetryOptions, 'initialDelay' | 'maxDelay' | 'jitterMax'>>
): number {
  const exponentialDelay = initialDelay * 2 ** (attempt - 1);
  const jitter = Math.random() * jitterMax;

  return Math.min(exponentialDelay + jitter, maxDelay);
}

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
