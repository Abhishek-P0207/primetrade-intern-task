import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redisClient, connectRedis } from '@/lib/redis';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  // Check Redis
  try {
    await connectRedis();
    await redisClient.ping();
    health.services.redis = 'healthy';
  } catch (error) {
    health.services.redis = 'unhealthy';
    // Redis is optional, so don't mark as degraded
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
