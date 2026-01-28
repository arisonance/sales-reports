export interface FetchResult<T> {
  success: boolean
  data?: T
  error?: string
}

export async function fetchWithRetry<T>(
  url: string,
  maxRetries = 3
): Promise<FetchResult<T>> {
  let lastError = ''

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 500ms, 1000ms, 2000ms
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt - 1)))
      }

      const res = await fetch(url)

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        lastError = (body as Record<string, string>).error || `HTTP ${res.status}`
        continue
      }

      const data: T = await res.json()
      return { success: true, data }
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Network error'
    }
  }

  return { success: false, error: lastError }
}
