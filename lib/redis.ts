import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

let isConnected = false;

export async function connectRedis() {
  if (!isConnected && !redisClient.isOpen) {
    try {
      await redisClient.connect();
      isConnected = true;
      console.log('Redis connected successfully');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }
  return redisClient;
}

export { redisClient };
