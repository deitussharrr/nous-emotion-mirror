// Rate limiting utility to prevent API abuse

interface RateLimitEntry {
  count: number;
  lastRequest: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.lastRequest > CLEANUP_INTERVAL) {
      rateLimitMap.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export const checkRateLimit = (identifier: string, maxRequests: number = 10, timeWindow: number = 60000): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry) {
    rateLimitMap.set(identifier, { count: 1, lastRequest: now });
    return true;
  }

  // Reset if outside time window
  if (now - entry.lastRequest > timeWindow) {
    rateLimitMap.set(identifier, { count: 1, lastRequest: now });
    return true;
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return false;
  }

  // Increment count
  entry.count++;
  entry.lastRequest = now;
  return true;
};

export const getRateLimitInfo = (identifier: string) => {
  const entry = rateLimitMap.get(identifier);
  if (!entry) return null;
  
  return {
    count: entry.count,
    lastRequest: entry.lastRequest,
    remaining: Math.max(0, 10 - entry.count),
    resetTime: entry.lastRequest + 60000
  };
};