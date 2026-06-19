# API Rate Limits Policy
Section: Account Administration

All API requests are subject to rate limiting to protect system stability.

### Default Limits:
* **Free Tier**: 60 requests per minute, 5,000 requests per day.
* **Pro Tier**: 1,000 requests per minute, 100,000 requests per day.
* **Enterprise Tier**: Custom limits.

### Exceeding Limits:
When limits are exceeded, the API returns a `429 Too Many Requests` status code. The response headers include:
* `X-RateLimit-Limit`: The maximum number of requests allowed.
* `X-RateLimit-Remaining`: The remaining requests in the current window.
* `X-RateLimit-Reset`: The number of seconds until the rate limit resets.

To request a limit increase, escalate your ticket to the Account team with a detailed explanation of your application concurrency.