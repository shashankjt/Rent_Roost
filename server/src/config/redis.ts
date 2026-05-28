import { createClient } from 'redis';

// Configure client with a maximum reconnect retry strategy to prevent log spamming if Redis is offline
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            // Stop retrying reconnects after 3 attempts to fallback gracefully to DB
            if (retries >= 3) {
                console.warn('Redis reconnection attempts exhausted. Operating in DB-only mode.');
                return false; 
            }
            // Delay before retrying
            return 2000;
        }
    }
});

redisClient.on('error', (err) => {
    // Only log first connection error details, suppress subsequent retry noise
    if (redisClient.isOpen) {
        console.error('Redis Client Error:', err.message || err);
    }
});

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
        console.log('Redis connected successfully');
    } catch (error) {
        console.warn('Could not establish initial connection to Redis. Falling back to MongoDB only.');
    }
})();

export const getCached = async (key: string): Promise<string | null> => {
    if (!redisClient.isOpen) return null;
    try {
        return await redisClient.get(key);
    } catch (error) {
        console.error(`Error getting cache for key ${key}:`, error);
        return null;
    }
};

export const setCached = async (key: string, value: string, ttl = 3600): Promise<void> => {
    if (!redisClient.isOpen) return;
    try {
        await redisClient.set(key, value, { EX: ttl });
    } catch (error) {
        console.error(`Error setting cache for key ${key}:`, error);
    }
};

export const deleteCached = async (key: string): Promise<void> => {
    if (!redisClient.isOpen) return;
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error(`Error deleting cache for key ${key}:`, error);
    }
};

export const deleteCachedPattern = async (pattern: string): Promise<void> => {
    if (!redisClient.isOpen) return;
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (error) {
        console.error(`Error deleting cache pattern ${pattern}:`, error);
    }
};

export default redisClient;
