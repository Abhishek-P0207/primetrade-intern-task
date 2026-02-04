import { redisClient, connectRedis } from './redis';

const CACHE_TTL = {
  USER: 3600, // 1 hour
  TASKS: 300, // 5 minutes
  TASK: 600, // 10 minutes
  SESSION: 7 * 24 * 60 * 60, // 7 days
};

// Ensure Redis is connected before operations
async function ensureConnection() {
  try {
    await connectRedis();
    return true;
  } catch (error) {
    console.error('Redis connection error:', error);
    return false;
  }
}

// ============================================
// User Caching
// ============================================

export async function getCachedUser(userId: string) {
  try {
    if (!(await ensureConnection())) return null;
    const cached = await redisClient.get(`user:${userId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCachedUser(userId: string, userData: any) {
  try {
    if (!(await ensureConnection())) return;
    await redisClient.setEx(
      `user:${userId}`,
      CACHE_TTL.USER,
      JSON.stringify(userData)
    );
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function invalidateUserCache(userId: string) {
  try {
    if (!(await ensureConnection())) return;
    await redisClient.del(`user:${userId}`);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

// ============================================
// Task List Caching
// ============================================

export async function getCachedTasks(userId: string) {
  try {
    if (!(await ensureConnection())) return null;
    const cached = await redisClient.get(`tasks:${userId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCachedTasks(userId: string, tasks: any[]) {
  try {
    if (!(await ensureConnection())) return;
    await redisClient.setEx(
      `tasks:${userId}`,
      CACHE_TTL.TASKS,
      JSON.stringify(tasks)
    );
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function invalidateTasksCache(userId: string) {
  try {
    if (!(await ensureConnection())) return;
    await redisClient.del(`tasks:${userId}`);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

// ============================================
// Individual Task Caching
// ============================================

export async function getCachedTask(taskId: string) {
  try {
    if (!(await ensureConnection())) return null;
    const cached = await redisClient.get(`task:${taskId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCachedTask(taskId: string, task: any) {
  try {
    if (!(await ensureConnection())) return;
    await redisClient.setEx(
      `task:${taskId}`,
      CACHE_TTL.TASK,
      JSON.stringify(task)
    );
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function invalidateTaskCache(taskId: string, userId: string) {
  try {
    if (!(await ensureConnection())) return;
    await Promise.all([
      redisClient.del(`task:${taskId}`),
      redisClient.del(`tasks:${userId}`),
    ]);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

// ============================================
// Session Management
// ============================================

export async function storeSession(
  userId: string,
  tokenId: string,
  token: string
) {
  try {
    if (!(await ensureConnection())) return;
    await redisClient.setEx(
      `session:${userId}:${tokenId}`,
      CACHE_TTL.SESSION,
      token
    );
  } catch (error) {
    console.error('Session store error:', error);
  }
}

export async function validateSession(
  userId: string,
  tokenId: string
): Promise<boolean> {
  try {
    if (!(await ensureConnection())) return true; // Allow if Redis is down
    const exists = await redisClient.exists(`session:${userId}:${tokenId}`);
    return exists === 1;
  } catch (error) {
    console.error('Session validation error:', error);
    return true; // Allow if Redis is down
  }
}

export async function revokeSession(userId: string, tokenId: string) {
  try {
    if (!(await ensureConnection())) return;
    await redisClient.del(`session:${userId}:${tokenId}`);
  } catch (error) {
    console.error('Session revocation error:', error);
  }
}

export async function revokeAllUserSessions(userId: string) {
  try {
    if (!(await ensureConnection())) return;
    const keys = await redisClient.keys(`session:${userId}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Session revocation error:', error);
  }
}

// ============================================
// Rate Limiting
// ============================================

export async function checkRateLimit(
  userId: string,
  endpoint: string,
  maxRequests: number = 100
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    if (!(await ensureConnection())) {
      return { allowed: true, remaining: maxRequests };
    }

    const key = `ratelimit:${userId}:${endpoint}`;
    const current = await redisClient.incr(key);

    if (current === 1) {
      await redisClient.expire(key, 60); // 1 minute window
    }

    return {
      allowed: current <= maxRequests,
      remaining: Math.max(0, maxRequests - current),
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: true, remaining: maxRequests };
  }
}

// ============================================
// Cache Statistics
// ============================================

export async function getCacheStats() {
  try {
    if (!(await ensureConnection())) {
      return { connected: false };
    }

    const info = await redisClient.info('stats');
    const dbSize = await redisClient.dbSize();

    return {
      connected: true,
      dbSize,
      info,
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return { connected: false, error: String(error) };
  }
}
