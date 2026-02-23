function createRateLimit({ windowMs, maxRequests, keyFn }) {
  const buckets = new Map();

  return (req, res, next) => {
    const key = keyFn ? keyFn(req) : req.ip;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= maxRequests) {
      return res.status(429).json({
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMITED'
      });
    }

    bucket.count += 1;
    next();
  };
}

const loginRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyFn: (req) => `${req.ip}:${String(req.body?.email || '').toLowerCase()}`
});

module.exports = {
  createRateLimit,
  loginRateLimit
};
