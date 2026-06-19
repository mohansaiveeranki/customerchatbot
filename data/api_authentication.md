# API Authentication Guide
Section: Technical Support

To authenticate requests to the OmniSupport API, you must include a Bearer token in your HTTP headers.
Format:
`Authorization: Bearer <YOUR_API_KEY>`

### Troubleshooting Authentication Failures:
1. **Expired Token**: Regenerate the API token in your Settings > Developer Console.
2. **Malformed Header**: Ensure the word 'Bearer' is followed by a space and that the token has no leading/trailing spaces.
3. **Invalid Scope**: Verify that your API key has the correct read/write permissions for the endpoints you are calling.