# Troubleshooting Database Connections
Section: Infrastructure & Tech

If your backend is failing to connect to the database (PostgreSQL/MySQL), check the following common issues:

1. **Connection Timeout**: Ensure that the database server is running and accessible from the network where the app is hosted.
2. **Credentials Error**: Double-check that your `DATABASE_URL` matches the format: `dialect+driver://username:password@host:port/database`.
3. **Firewall Rules**: If database hosting is on a platform like AWS RDS or GCP Cloud SQL, verify that the firewall/security groups allow incoming connections from the app's IP address.