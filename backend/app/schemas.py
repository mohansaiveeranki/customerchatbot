from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class MessageCreate(BaseModel):
    sender: str
    content: str

class MessageResponse(BaseModel):
    id: int
    sender: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

class CustomerSchema(BaseModel):
    name: str
    email: str
    company: Optional[str] = None

class TicketCreate(BaseModel):
    title: str
    priority: str = "medium"
    category: str = "Technical"
    customer: CustomerSchema

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None

class TicketResponse(BaseModel):
    id: str
    title: str
    status: str
    priority: str
    category: str
    customer: CustomerSchema
    created_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

class KBArticleResponse(BaseModel):
    id: str
    title: str
    category: str
    summary: str
    content: str

    class Config:
        from_attributes = True

class WeeklyTrendItem(BaseModel):
    day: str
    count: int

class ChannelDistributionItem(BaseModel):
    name: str
    value: int

class ActivityFeedItem(BaseModel):
    id: int
    type: str
    text: str
    time: str

class DashboardStatsResponse(BaseModel):
    activeTickets: int
    avgResponseTime: str
    csat: float
    resolvedCount: int
    weeklyTrend: List[WeeklyTrendItem]
    channels: List[ChannelDistributionItem]
    activities: List[ActivityFeedItem]
