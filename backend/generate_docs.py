import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def create_markdown_docs(data_dir):
    docs = {
        "api_authentication.md": """# API Authentication Guide
Section: Technical Support

To authenticate requests to the OmniSupport API, you must include a Bearer token in your HTTP headers.
Format:
`Authorization: Bearer <YOUR_API_KEY>`

### Troubleshooting Authentication Failures:
1. **Expired Token**: Regenerate the API token in your Settings > Developer Console.
2. **Malformed Header**: Ensure the word 'Bearer' is followed by a space and that the token has no leading/trailing spaces.
3. **Invalid Scope**: Verify that your API key has the correct read/write permissions for the endpoints you are calling.
""",
        "webhook_setup.md": """# Setting Up Webhooks
Section: Developer Integration

Webhooks allow you to receive real-time notifications about events in your workspace.

### Configuration Steps:
1. Go to Settings > Webhooks in your developer portal.
2. Click 'Add Endpoint' and enter your destination URL (must be HTTPS in production).
3. Select the events you want to listen to (e.g., `ticket.created`, `ticket.updated`, `message.sent`).
4. Copy the Webhook Signing Secret.

### Verifying Webhook Signatures:
OmniSupport includes a signature header `X-OmniSupport-Signature` generated using HMAC SHA256. To prevent spoofing, verify this signature using your signing secret before processing the payload.
""",
        "rate_limits.md": """# API Rate Limits Policy
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
""",
        "refund_policy.md": """# Customer Refund Policy
Section: Billing and Finance

Our goal is to ensure you are fully satisfied with OmniSupport.

### Standard Terms:
1. **14-Day Money-Back Guarantee**: You can request a full refund within 14 days of your initial subscription purchase.
2. **Monthly Subscriptions**: Monthly charges are non-refundable after the 14-day window. Downgrades take effect at the end of the billing cycle.
3. **Annual Subscriptions**: Annual subscriptions can be refunded prorated if cancelled within the first 30 days.

### Processing Times:
Once approved by our billing team, refunds are processed immediately. However, it may take 5 to 10 business days for the funds to appear on your credit card statement depending on your bank.
""",
        "account_security.md": """# Securing Your User Account
Section: Account Security

To protect your support console, we recommend configuring Multi-Factor Authentication (MFA).

### How to Enable MFA:
1. Navigate to Settings > Account Security.
2. Click 'Enable MFA' and scan the QR code using an authenticator app (Google Authenticator, Duo, or Authy).
3. Save the emergency backup codes in a secure location.
4. Enter the 6-digit code from your app to complete setup.

If you lose access to your MFA device, contact your workspace administrator to reset it, or escalate to OmniSupport Support.
""",
        "sso_configuration.md": """# Single Sign-On (SSO) Configuration
Section: Enterprise Features

Enterprise workspaces can configure SAML 2.0 Single Sign-On (SSO) for centralized user management.

### Supported Providers:
* Okta
* Microsoft Entra ID (Azure AD)
* Google Workspace
* Ping Identity

### Metadata Parameters:
* **Entity ID**: `https://api.omnisupport.com/auth/sso/saml/metadata`
* **Assertion Consumer Service (ACS) URL**: `https://api.omnisupport.com/auth/sso/saml/acs`
* **NameID Format**: EmailAddress
""",
        "database_connections.md": """# Troubleshooting Database Connections
Section: Infrastructure & Tech

If your backend is failing to connect to the database (PostgreSQL/MySQL), check the following common issues:

1. **Connection Timeout**: Ensure that the database server is running and accessible from the network where the app is hosted.
2. **Credentials Error**: Double-check that your `DATABASE_URL` matches the format: `dialect+driver://username:password@host:port/database`.
3. **Firewall Rules**: If database hosting is on a platform like AWS RDS or GCP Cloud SQL, verify that the firewall/security groups allow incoming connections from the app's IP address.
""",
        "email_notifications.md": """# Configuring Email Notifications
Section: General Settings

OmniSupport sends notifications for ticket assignments, customer replies, and system alerts.

### Setting Up Custom SMTP:
1. Go to Settings > General Settings > Email.
2. Enable 'Use Custom SMTP Server'.
3. Enter your SMTP server host, port (usually 587 for TLS, or 465 for SSL), username, and password.
4. Click 'Send Test Email' to verify connection.
""",
        "data_export.md": """# Exporting Workspace Data
Section: Data Management

Workspace administrators can export tickets, messages, and knowledge base logs in JSON or CSV formats.

### How to Export:
1. Go to Settings > Data & Export.
2. Choose the export scope (All Tickets, KB Articles, or Full Workspace).
3. Select your format (CSV or JSON).
4. Click 'Generate Export'. Large exports may take several minutes to compile and will be sent via an email download link.
""",
        "gdpr_compliance.md": """# GDPR and Data Privacy Compliance
Section: Legal & Compliance

OmniSupport is committed to complying with the General Data Protection Regulation (GDPR).

### Right to be Forgotten (Data Erasure):
Under GDPR, customers can request that their personal data be permanently deleted.
To execute a data erasure request:
1. Navigate to the customer's profile in the Admin dashboard.
2. Click 'Anonymize Profile' or 'Hard Delete'.
3. Hard deleting will permanently purge ticket history and customer records. This action is irreversible.
""",
        "troubleshooting_dashboard.md": """# Troubleshooting Dashboard Loading Issues
Section: UI & Console Support

If the dashboard statistics are not loading or show spinning icons:
1. **Network Connectivity**: Check if your browser console shows network errors (press F12, look at the Console or Network tab).
2. **API Status**: Make sure the backend server is running and port 8000 is accessible.
3. **Browser Cache**: Try hard refreshing (Ctrl + F5 or Cmd + Shift + R) or clearing browser cache and cookies.
"""
    }

    for filename, content in docs.items():
        filepath = os.path.join(data_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content.strip())
        print(f"Created Markdown document: {filename}")


def create_pdf_doc(data_dir):
    filename = "billing_and_invoicing_policy.pdf"
    filepath = os.path.join(data_dir, filename)
    
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter
    
    # Page 1
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, height - 80, "OmniSupport Billing & Invoicing Policy")
    
    c.setFont("Helvetica", 10)
    c.drawString(50, height - 100, "Document ID: POL-BILL-001 | Version: 2.1 | Section: Billing and Payments")
    c.drawString(50, height - 115, "Last Updated: June 15, 2026")
    
    c.setLineWidth(1)
    c.line(50, height - 130, width - 50, height - 130)
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 160, "1. Subscription Billing Cycle")
    
    c.setFont("Helvetica", 11)
    text_lines = [
        "All paid plans (Pro, Enterprise) are billed on a recurring basis, either monthly or annually.",
        "Monthly cycles are billed on the calendar date corresponding to the commencement of the subscription.",
        "Annual subscriptions are billed upfront in full and renew automatically on the anniversary date.",
        "If a payment fails, the system will automatically retry charging the card on file up to 3 times",
        "over a period of 12 days before the workspace is marked as delinquent and access is restricted."
    ]
    y = height - 180
    for line in text_lines:
        c.drawString(50, y, line)
        y -= 18
        
    y -= 15
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "2. Proration for Plan Upgrades and Downgrades")
    y -= 20
    
    c.setFont("Helvetica", 11)
    prorate_lines = [
        "Plan upgrades are processed immediately. The system calculates the unused time on the current tier",
        "and applies it as a credit, billing the user only for the difference for the remainder of the cycle.",
        "Downgrades take effect at the end of the current billing cycle. No partial refunds are provided",
        "for mid-cycle downgrades. The workspace remains on the higher tier until the end of the billing period."
    ]
    for line in prorate_lines:
        c.drawString(50, y, line)
        y -= 18
        
    c.setFont("Helvetica", 9)
    c.drawString(width/2 - 20, 30, "Page 1 of 2")
    c.showPage()
    
    # Page 2
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 80, "3. Disputing Charges and Invoicing Errors")
    y = height - 100
    
    c.setFont("Helvetica", 11)
    dispute_lines = [
        "If you believe there is an error on your invoice (e.g., duplicate charges or incorrect seat counts),",
        "you must submit a support request under the 'Billing' category within 30 days of the invoice date.",
        "Our billing team will review the Stripe logs and invoice records within 2 business days.",
        "If a correction is warranted, a billing credit or direct refund will be issued.",
        "Direct credit card refunds may take 5-10 business days to reflect in your bank account."
    ]
    for line in dispute_lines:
        c.drawString(50, y, line)
        y -= 18
        
    y -= 15
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "4. Tax Invoicing and VAT")
    y -= 20
    
    c.setFont("Helvetica", 11)
    tax_lines = [
        "All subscription prices are exclusive of VAT or local sales tax.",
        "Users can input their corporate Tax ID / VAT Registration Number in Settings > Billing settings.",
        "Once verified, the Tax ID will be printed on all future invoices, and VAT exemptions will be applied",
        "where legally applicable according to European Union or local tax regulations."
    ]
    for line in tax_lines:
        c.drawString(50, y, line)
        y -= 18
        
    c.setFont("Helvetica", 9)
    c.drawString(width/2 - 20, 30, "Page 2 of 2")
    
    c.save()
    print(f"Created PDF document: {filename}")


if __name__ == "__main__":
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(project_root, "data")
    os.makedirs(data_dir, exist_ok=True)
    print(f"Data directory: {data_dir}")
    create_markdown_docs(data_dir)
    create_pdf_doc(data_dir)
    print("Done generating documents!")
