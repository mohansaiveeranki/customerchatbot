# Setting Up Webhooks
Section: Developer Integration

Webhooks allow you to receive real-time notifications about events in your workspace.

### Configuration Steps:
1. Go to Settings > Webhooks in your developer portal.
2. Click 'Add Endpoint' and enter your destination URL (must be HTTPS in production).
3. Select the events you want to listen to (e.g., `ticket.created`, `ticket.updated`, `message.sent`).
4. Copy the Webhook Signing Secret.

### Verifying Webhook Signatures:
OmniSupport includes a signature header `X-OmniSupport-Signature` generated using HMAC SHA256. To prevent spoofing, verify this signature using your signing secret before processing the payload.