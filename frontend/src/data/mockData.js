export const mockTickets = [
  {
    id: "TKT-1001",
    title: "Cannot connect database from web app console",
    status: "open",
    priority: "high",
    category: "Technical",
    customer: {
      name: "Alex Rivera",
      email: "alex.rivera@enterprise.com",
      company: "Rivera Tech LLC"
    },
    created_at: "2026-06-19T06:00:00Z",
    messages: [
      { sender: "customer", content: "Hi, I am trying to connect to my PostgreSQL database from the web console but keep getting a timeout error.", timestamp: "2026-06-19T06:00:00Z" }
    ]
  },
  {
    id: "TKT-1002",
    title: "Billing issue - double charge in June invoice",
    status: "pending",
    priority: "medium",
    category: "Billing",
    customer: {
      name: "Sarah Jenkins",
      email: "sarah.j@startup.io",
      company: "Velo Labs"
    },
    created_at: "2026-06-18T14:22:00Z",
    messages: [
      { sender: "customer", content: "Hello support, my credit card was charged twice for the June subscription cycle. Can you please check?", timestamp: "2026-06-18T14:22:00Z" },
      { sender: "agent", content: "Hello Sarah, I see the duplicate transaction in our stripe log. I am forwarding this to the finance team for refund processing.", timestamp: "2026-06-18T14:35:00Z" }
    ]
  },
  {
    id: "TKT-1003",
    title: "Request for API limit increase",
    status: "closed",
    priority: "low",
    category: "Account",
    customer: {
      name: "Marcus Vance",
      email: "mvance@devflow.org",
      company: "DevFlow Org"
    },
    created_at: "2026-06-17T09:15:00Z",
    messages: [
      { sender: "customer", content: "We are scaling our sync engine and need our API rate limits doubled from 50k to 100k requests/day.", timestamp: "2026-06-17T09:15:00Z" },
      { sender: "agent", content: "Sure, Marcus. I have reviewed your usage patterns and approved the increase. It is now active.", timestamp: "2026-06-17T11:40:00Z" },
      { sender: "customer", content: "Thank you so much! Working perfectly.", timestamp: "2026-06-17T12:00:00Z" }
    ]
  }
];

export const mockChatSessions = [
  {
    id: "CHAT-201",
    customer: {
      name: "Michael Chen",
      email: "mchen@gmail.com",
      status: "online",
      location: "San Francisco, USA",
      browser: "Chrome (Mac)",
      ip: "192.168.1.45"
    },
    messages: [
      { sender: "customer", content: "Hey, I need help setting up the webhook endpoint.", timestamp: "2026-06-19T07:45:00Z" },
      { sender: "agent", content: "Sure! What framework are you using to receive the webhooks?", timestamp: "2026-06-19T07:46:12Z" },
      { sender: "customer", content: "I'm using Node.js with Express.", timestamp: "2026-06-19T07:47:00Z" }
    ]
  },
  {
    id: "CHAT-202",
    customer: {
      name: "Emily Watson",
      email: "emily.w@designcorp.co",
      status: "offline",
      location: "London, UK",
      browser: "Safari (iOS)",
      ip: "82.44.152.12"
    },
    messages: [
      { sender: "customer", content: "Do you offer a discount for annual subscriptions?", timestamp: "2026-06-19T07:22:00Z" },
      { sender: "agent", content: "Yes we do! Annual subscriptions receive a 20% discount compared to monthly plans.", timestamp: "2026-06-19T07:23:45Z" }
    ]
  }
];

export const mockKbArticles = [
  {
    id: "KB-301",
    title: "How to Configure Webhooks",
    category: "Technical",
    summary: "Step-by-step instructions on setting up and securing webhook endpoints.",
    content: "To configure webhooks:\n1. Go to Settings > Webhooks in your developer portal.\n2. Click 'Add Endpoint' and enter your destination URL.\n3. Select the events you want to listen to (e.g., payment.success, ticket.created).\n4. Copy the Webhook Secret key and use it to verify the cryptographic signatures in your application handler.\n\nVerify webhook payloads using HMAC SHA256 signatures to ensure authenticity."
  },
  {
    id: "KB-302",
    title: "Understanding Subscription Invoices",
    category: "Billing",
    summary: "Guide to reading subscription charges, refunds, and mid-cycle tier updates.",
    content: "Our invoices detail charges, refunds, and proration calculations. If you update your tier mid-cycle, we compute a credit for the remaining time on the old tier and debit for the new tier, showing a combined prorated item on your next billing date. Refunds usually process within 5 to 10 business days."
  },
  {
    id: "KB-303",
    title: "Increasing API Rate Limits",
    category: "Account",
    summary: "Requirements and procedures for requesting custom API threshold allocations.",
    content: "API limits prevent abuse and maintain performance. Default limits are 50,000 requests/day. If your enterprise workspace requires an exemption:\n- Ensure your request details the application concurrency models and cache optimizations.\n- Contact account managers or open a ticket under Category: 'Account' with your estimated query volume."
  }
];

export const mockDashboardStats = {
  activeTickets: 8,
  avgResponseTime: "12m",
  csat: 94.6,
  resolvedCount: 42,
  weeklyTrend: [
    { day: "Mon", count: 12 },
    { day: "Tue", count: 19 },
    { day: "Wed", count: 15 },
    { day: "Thu", count: 28 },
    { day: "Fri", count: 22 },
    { day: "Sat", count: 8 },
    { day: "Sun", count: 10 }
  ],
  channels: [
    { name: "Live Chat", value: 45 },
    { name: "Email", value: 35 },
    { name: "API Tickets", value: 20 }
  ],
  activities: [
    { id: 1, type: "ticket_created", text: "Alex Rivera opened high priority ticket TKT-1001", time: "5m ago" },
    { id: 2, type: "chat_closed", text: "Agent closed live chat CHAT-202 with Emily Watson", time: "15m ago" },
    { id: 3, type: "ticket_resolved", text: "Marcus Vance resolved ticket TKT-1003", time: "40m ago" },
    { id: 4, type: "kb_updated", text: "Knowledge Base article 'How to Configure Webhooks' was updated", time: "2h ago" }
  ]
};
