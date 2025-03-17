const Redis = require("ioredis");

const redis = new Redis({
  host: "redis",
  port: 6379,
});

redis.on("connect", () => console.log("🔌 Connected to Redis"));
redis.on("error", (err) => console.error("Redis Error:", err));

module.exports = redis;