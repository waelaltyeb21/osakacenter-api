const { rateLimit } = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 50 requests per windowMs
  message: "Too many requests from this source, please try again later.",
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = limiter;
