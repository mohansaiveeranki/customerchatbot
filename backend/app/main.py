import os
import asyncio
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict
from .database import engine, Base, get_db
from .models import Ticket, Message, KBArticle
from .schemas import (
    TicketResponse, TicketCreate, TicketUpdate, 
    MessageResponse, MessageCreate, KBArticleResponse,
    DashboardStatsResponse, WeeklyTrendItem, ChannelDistributionItem, ActivityFeedItem
)
from .agent import agent_service
from .vector_store import kb_indexer

Base.metadata.create_all(bind=engine)

app = FastAPI(title="OmniSupport API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        articles = db.query(KBArticle).all()
        articles_list = [
            {"id": a.id, "title": a.title, "summary": a.summary, "content": a.content, "category": a.category}
            for a in articles
        ]
        kb_indexer.index_articles(articles_list)
    finally:
        db.close()

@app.get("/api/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    active_count = db.query(Ticket).filter(Ticket.status != "closed").count()
    resolved_count = db.query(Ticket).filter(Ticket.status == "closed").count()
    
    weekly_trend = [
        WeeklyTrendItem(day="Mon", count=12),
        WeeklyTrendItem(day="Tue", count=19),
        WeeklyTrendItem(day="Wed", count=15),
        WeeklyTrendItem(day="Thu", count=28),
        WeeklyTrendItem(day="Fri", count=22),
        WeeklyTrendItem(day="Sat", count=8),
        WeeklyTrendItem(day="Sun", count=10)
    ]
    
    channels = [
        ChannelDistributionItem(name="Live Chat", value=45),
        ChannelDistributionItem(name="Email", value=35),
        ChannelDistributionItem(name="API Tickets", value=20)
    ]
    
    recent_tickets = db.query(Ticket).order_by(Ticket.created_at.desc()).limit(4).all()
    activities = []
    for idx, t in enumerate(recent_tickets):
        activities.append(
            ActivityFeedItem(
                id=idx + 1,
                type="ticket_created",
                text=f"{t.customer_name} opened {t.priority} priority ticket {t.id}",
                time="Just now"
            )
        )
        
    if not activities:
        activities = [
            ActivityFeedItem(id=1, type="kb_updated", text="Knowledge Base was initialized", time="1h ago")
        ]
        
    return DashboardStatsResponse(
        activeTickets=active_count,
        avgResponseTime="12m",
        csat=94.6,
        resolvedCount=resolved_count,
        weeklyTrend=weekly_trend,
        channels=channels,
        activities=activities
    )

@app.get("/api/tickets", response_model=List[TicketResponse])
def read_tickets(db: Session = Depends(get_db)):
    tickets = db.query(Ticket).order_by(Ticket.created_at.desc()).all()
    response = []
    for t in tickets:
        response.append({
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "priority": t.priority,
            "category": t.category,
            "customer": {
                "name": t.customer_name,
                "email": t.customer_email,
                "company": t.customer_company
            },
            "created_at": t.created_at,
            "messages": [
                {"id": m.id, "sender": m.sender, "content": m.content, "timestamp": m.timestamp}
                for m in t.messages
            ]
        })
    return response

@app.post("/api/tickets", response_model=TicketResponse)
def create_ticket(ticket_in: TicketCreate, db: Session = Depends(get_db)):
    import uuid
    ticket_id = f"TKT-{uuid.uuid4().hex[:4].upper()}"
    ticket = Ticket(
        id=ticket_id,
        title=ticket_in.title,
        status="open",
        priority=ticket_in.priority,
        category=ticket_in.category,
        customer_name=ticket_in.customer.name,
        customer_email=ticket_in.customer.email,
        customer_company=ticket_in.customer.company
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    return {
        "id": ticket.id,
        "title": ticket.title,
        "status": ticket.status,
        "priority": ticket.priority,
        "category": ticket.category,
        "customer": {
            "name": ticket.customer_name,
            "email": ticket.customer_email,
            "company": ticket.customer_company
        },
        "created_at": ticket.created_at,
        "messages": []
    }

@app.put("/api/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: str, ticket_in: TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if ticket_in.status is not None:
        ticket.status = ticket_in.status
    if ticket_in.priority is not None:
        ticket.priority = ticket_in.priority
        
    db.commit()
    db.refresh(ticket)
    
    return {
        "id": ticket.id,
        "title": ticket.title,
        "status": ticket.status,
        "priority": ticket.priority,
        "category": ticket.category,
        "customer": {
            "name": ticket.customer_name,
            "email": ticket.customer_email,
            "company": ticket.customer_company
        },
        "created_at": ticket.created_at,
        "messages": [
            {"id": m.id, "sender": m.sender, "content": m.content, "timestamp": m.timestamp}
            for m in ticket.messages
        ]
    }

@app.post("/api/tickets/{ticket_id}/messages", response_model=MessageResponse)
def add_ticket_message(ticket_id: str, msg_in: MessageCreate, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    message = Message(
        ticket_id=ticket_id,
        sender=msg_in.sender,
        content=msg_in.content
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    if msg_in.sender == "agent":
        asyncio.create_task(run_agent_auto_response(ticket_id, msg_in.content))
        
    return {
        "id": message.id,
        "sender": message.sender,
        "content": message.content,
        "timestamp": message.timestamp
    }

async def run_agent_auto_response(ticket_id: str, agent_msg: str):
    await asyncio.sleep(2)
    db = next(get_db())
    try:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if not ticket:
            return
            
        history = [
            {"sender": m.sender, "content": m.content}
            for m in ticket.messages
        ]
        
        import json
        result = agent_service.process_message(agent_msg, history[:-1])
        reply = result.get("response", "")
        
        reply_message = Message(
            ticket_id=ticket_id,
            sender="customer",
            content=reply
        )
        db.add(reply_message)
        
        if result.get("escalate"):
            ticket.status = "escalated"
            handoff_str = json.dumps(result["handoff_summary"], indent=2)
            sys_msg = Message(
                ticket_id=ticket_id,
                sender="system",
                content=f"Ticket escalated. Handoff Summary:\n{handoff_str}"
            )
            db.add(sys_msg)
            
        db.commit()
    finally:
        db.close()

@app.get("/api/chat")
def get_live_chats(db: Session = Depends(get_db)):
    tickets = db.query(Ticket).filter(Ticket.category == "Technical").limit(3).all()
    sessions = []
    for t in tickets:
        sessions.append({
            "id": f"CHAT-{t.id.split('-')[1]}",
            "customer": {
                "name": t.customer_name,
                "email": t.customer_email,
                "status": "online",
                "location": "Dallas, USA",
                "browser": "Chrome (Windows)",
                "ip": "172.16.54.12"
            },
            "messages": [
                {"sender": m.sender, "content": m.content, "timestamp": m.timestamp}
                for m in t.messages
            ]
        })
    if not sessions:
        return [
            {
                "id": "CHAT-MOCK1",
                "customer": {
                    "name": "Jane Miller",
                    "email": "jane@gmail.com",
                    "status": "online",
                    "location": "Boston, USA",
                    "browser": "Firefox (Linux)",
                    "ip": "198.51.100.4"
                },
                "messages": [
                    {"sender": "customer", "content": "Hello support, I need help setting up webhook endpoints.", "timestamp": "2026-06-19T06:00:00Z"}
                ]
            }
        ]
    return sessions

@app.get("/api/kb", response_model=List[KBArticleResponse])
def get_kb_articles(db: Session = Depends(get_db)):
    articles = db.query(KBArticle).all()
    return articles

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, chat_id: str, websocket: WebSocket):
        await websocket.accept()
        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = []
        self.active_connections[chat_id].append(websocket)

    def disconnect(self, chat_id: str, websocket: WebSocket):
        if chat_id in self.active_connections:
            self.active_connections[chat_id].remove(websocket)

    async def broadcast(self, chat_id: str, message: dict):
        if chat_id in self.active_connections:
            for connection in self.active_connections[chat_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/chat/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: str):
    await manager.connect(chat_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            sender = data.get("sender")
            content = data.get("content")
            
            payload = {
                "sender": sender,
                "content": content,
                "timestamp": data.get("timestamp")
            }
            await manager.broadcast(chat_id, payload)
            
            if sender == "agent":
                await asyncio.sleep(1.5)
                result = agent_service.process_message(content)
                reply = result.get("response", "")
                reply_payload = {
                    "sender": "customer",
                    "content": reply,
                    "timestamp": data.get("timestamp")
                }
                await manager.broadcast(chat_id, reply_payload)
    except WebSocketDisconnect:
        manager.disconnect(chat_id, websocket)
