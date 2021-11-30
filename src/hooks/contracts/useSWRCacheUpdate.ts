import { useSWRConfig } from 'swr'

export function useSWRCacheUpdate(cacheKey: string) {
  const { cache, mutate } = useSWRConfig()
  if (!(cache instanceof Map)) {
    throw new Error('matchMutate requires the cache provider to be a Map instance')
  }

  return () => {
    for (const key of cache.keys()) {
      if (key.includes(cacheKey)) {
        mutate(key)
      }
    }
  }
}
