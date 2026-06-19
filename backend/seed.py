from datetime import datetime, timedelta
from app.database import SessionLocal, Base, engine
from app.models import Ticket, Message, KBArticle

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    try:
        articles = [
            KBArticle(
                id="KB-301",
                title="How to Configure Webhooks",
                category="Technical",
                summary="Step-by-step instructions on setting up and securing webhook endpoints.",
                content="To configure webhooks:\n1. Go to Settings > Webhooks in your developer portal.\n2. Click 'Add Endpoint' and enter your destination URL.\n3. Select the events you want to listen to (e.g., payment.success, ticket.created).\n4. Copy the Webhook Secret key and use it to verify the cryptographic signatures in your application handler.\n\nVerify webhook payloads using HMAC SHA256 signatures to ensure authenticity."
            ),
            KBArticle(
                id="KB-302",
                title="Understanding Subscription Invoices",
                category="Billing",
                summary="Guide to reading subscription charges, refunds, and mid-cycle tier updates.",
                content="Our invoices detail charges, refunds, and proration calculations. If you update your tier mid-cycle, we compute a credit for the remaining time on the old tier and debit for the new tier, showing a combined prorated item on your next billing date. Refunds usually process within 5 to 10 business days."
            ),
            KBArticle(
                id="KB-303",
                title="Increasing API Rate Limits",
                category="Account",
                summary="Requirements and procedures for requesting custom API threshold allocations.",
                content="API limits prevent abuse and maintain performance. Default limits are 50,000 requests/day. If your enterprise workspace requires an exemption:\n- Ensure your request details the application concurrency models and cache optimizations.\n- Contact account managers or open a ticket under Category: 'Account' with your estimated query volume."
            )
        ]
        for a in articles:
            db.add(a)
        db.commit()

        t1 = Ticket(
            id="TKT-1001",
            title="Cannot connect database from web app console",
            status="open",
            priority="high",
            category="Technical",
            customer_name="Alex Rivera",
            customer_email="alex.rivera@enterprise.com",
            customer_company="Rivera Tech LLC",
            created_at=datetime.utcnow() - timedelta(hours=2)
        )
        db.add(t1)
        db.commit()
        db.refresh(t1)

        m1 = Message(
            ticket_id=t1.id,
            sender="customer",
            content="Hi, I am trying to connect to my PostgreSQL database from the web console but keep getting a timeout error.",
            timestamp=datetime.utcnow() - timedelta(hours=2)
        )
        db.add(m1)
        db.commit()

        t2 = Ticket(
            id="TKT-1002",
            title="Billing issue - double charge in June invoice",
            status="pending",
            priority="medium",
            category="Billing",
            customer_name="Sarah Jenkins",
            customer_email="sarah.j@startup.io",
            customer_company="Velo Labs",
            created_at=datetime.utcnow() - timedelta(days=1)
        )
        db.add(t2)
        db.commit()
        db.refresh(t2)

        m2_1 = Message(
            ticket_id=t2.id,
            sender="customer",
            content="Hello support, my credit card was charged twice for the June subscription cycle. Can you please check?",
            timestamp=datetime.utcnow() - timedelta(days=1)
        )
        m2_2 = Message(
            ticket_id=t2.id,
            sender="agent",
            content="Hello Sarah, I see the duplicate transaction in our stripe log. I am forwarding this to the finance team for refund processing.",
            timestamp=datetime.utcnow() - timedelta(hours=23)
        )
        db.add(m2_1)
        db.add(m2_2)
        db.commit()

        t3 = Ticket(
            id="TKT-1003",
            title="Request for API limit increase",
            status="closed",
            priority="low",
            category="Account",
            customer_name="Marcus Vance",
            customer_email="mvance@devflow.org",
            customer_company="DevFlow Org",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(t3)
        db.commit()
        db.refresh(t3)

        m3_1 = Message(
            ticket_id=t3.id,
            sender="customer",
            content="We are scaling our sync engine and need our API rate limits doubled from 50k to 100k requests/day.",
            timestamp=datetime.utcnow() - timedelta(days=2)
        )
        m3_2 = Message(
            ticket_id=t3.id,
            sender="agent",
            content="Sure, Marcus. I have reviewed your usage patterns and approved the increase. It is now active.",
            timestamp=datetime.utcnow() - timedelta(days=1, hours=22)
        )
        m3_3 = Message(
            ticket_id=t3.id,
            sender="customer",
            content="Thank you so much! Working perfectly.",
            timestamp=datetime.utcnow() - timedelta(days=1, hours=21)
        )
        db.add(m3_1)
        db.add(m3_2)
        db.add(m3_3)
        db.commit()

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
