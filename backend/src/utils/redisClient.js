const Redis = require('ioredis');

// In-memory fallback cache/lock store
const memoryStore = new Map();
const memoryExpiries = new Map();

const isExpired = (key) => {
  const expiry = memoryExpiries.get(key);
  if (expiry && Date.now() > expiry) {
    memoryStore.delete(key);
    memoryExpiries.delete(key);
    return true;
  }
  return false;
};

let client = null;
let isRedisConnected = false;

if (process.env.REDIS_URL) {
  try {
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 3) {
          return null; // Stop reconnecting after 3 tries
        }
        return Math.min(times * 500, 2000);
      },
    });

    client.on('connect', () => {
      isRedisConnected = true;
      console.log('Connected to Redis');
    });

    client.on('error', (err) => {
      isRedisConnected = false;
      console.warn('Redis warning (using in-memory fallback):', err.message);
    });
  } catch (err) {
    console.warn('Failed to initialize Redis client, using in-memory store:', err.message);
  }
} else {
  console.log('No REDIS_URL provided. Running with in-memory caching and slot locking.');
}

// Unified interface supporting both Redis and in-memory fallback
const redis = {
  async get(key) {
    if (isRedisConnected && client) {
      try {
        return await client.get(key);
      } catch (err) {
        console.warn('Redis get error, falling back to memory:', err.message);
      }
    }
    if (isExpired(key)) return null;
    return memoryStore.get(key) || null;
  },

  async set(key, value, mode, duration, condition) {
    if (isRedisConnected && client) {
      try {
        return await client.set(key, value, mode, duration, condition);
      } catch (err) {
        console.warn('Redis set error, falling back to memory:', err.message);
      }
    }
    // In-memory slot locking with NX and EX support
    if (condition === 'NX' && memoryStore.has(key) && !isExpired(key)) {
      return null;
    }
    memoryStore.set(key, value);
    if (mode === 'EX' && typeof duration === 'number') {
      memoryExpiries.set(key, Date.now() + duration * 1000);
    }
    return 'OK';
  },

  async setex(key, seconds, value) {
    if (isRedisConnected && client) {
      try {
        return await client.setex(key, seconds, value);
      } catch (err) {
        console.warn('Redis setex error, falling back to memory:', err.message);
      }
    }
    memoryStore.set(key, value);
    memoryExpiries.set(key, Date.now() + seconds * 1000);
    return 'OK';
  },

  async del(...keys) {
    const flatKeys = keys.flat();
    if (isRedisConnected && client && flatKeys.length > 0) {
      try {
        return await client.del(...flatKeys);
      } catch (err) {
        console.warn('Redis del error, falling back to memory:', err.message);
      }
    }
    for (const key of flatKeys) {
      memoryStore.delete(key);
      memoryExpiries.delete(key);
    }
    return flatKeys.length;
  },

  async keys(pattern) {
    if (isRedisConnected && client) {
      try {
        return await client.keys(pattern);
      } catch (err) {
        console.warn('Redis keys error, falling back to memory:', err.message);
      }
    }
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matched = [];
    for (const key of memoryStore.keys()) {
      if (!isExpired(key) && regex.test(key)) {
        matched.push(key);
      }
    }
    return matched;
  },
};

module.exports = redis;
