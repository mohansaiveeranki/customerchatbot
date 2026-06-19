import os
import json
import re
from typing import List, Dict, Any, Tuple
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import Ticket, Message
from .vector_store import kb_indexer

load_dotenv()

class PersonaSupportAgent:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.has_keys = bool(self.gemini_key or self.openai_key)

    def _get_db(self):
        return SessionLocal()

    def detect_persona_heuristic(self, message: str) -> str:
        text_lower = message.lower()
        
        # Technical Expert characteristics: API, logs, timeout, databases, config, auth, signatures, parameters
        tech_words = ["api", "authentication", "bearer", "webhook", "hmac", "sha256", "rate limit", "429", "smtp", "sso", "saml", "postgres", "mysql", "timeout", "port", "credentials"]
        # Frustrated User characteristics: angry, broken, nothing works, terrible, urgent, fix this, waste of time, disappointed
        frustrated_words = ["terrible", "worst", "nothing works", "broken", "tried everything", "useless", "disappointed", "urgent", "immediately", "angry", "failed", "error", "horrible", "help me"]
        # Business Executive characteristics: impact, operations, business, timeline, cost, pricing, roi, executive, commercial, manager, contract
        exec_words = ["impact", "operations", "business", "timeline", "when will", "cost", "revenue", "roi", "executive", "enterprise", "plan", "summary"]

        tech_score = sum(1 for w in tech_words if w in text_lower)
        frustrated_score = sum(1 for w in frustrated_words if w in text_lower)
        exec_score = sum(1 for w in exec_words if w in text_lower)

        # Tie-breaker: default to technical if tech words are present, otherwise standard support
        if tech_score > frustrated_score and tech_score > exec_score:
            return "Technical Expert"
        elif frustrated_score > tech_score and frustrated_score > exec_score:
            return "Frustrated User"
        elif exec_score > tech_score and exec_score > frustrated_score:
            return "Business Executive"
        
        # Look for punctuation hints (caps, exclamation points) for frustrated user
        if message.isupper() or message.count("!") > 1:
            return "Frustrated User"
            
        # Default fallback based on some keywords
        if any(w in text_lower for w in tech_words):
            return "Technical Expert"
        elif any(w in text_lower for w in exec_words):
            return "Business Executive"
            
        return "Frustrated User" # Default fallback for support

    def check_escalation_rules(self, message: str, retrieved_chunks: list, history: List[Dict[str, str]] = None) -> Tuple[bool, str]:
        text_lower = message.lower()
        
        # Trigger 1: Sensitive topics (Billing, refunds, invoices, legal, gdpr, password resets / accounts)
        sensitive_topics = ["billing", "refund", "invoice", "charge", "payment", "stripe", "legal", "gdpr", "privacy", "compliance", "password reset", "account lock"]
        for topic in sensitive_topics:
            if topic in text_lower:
                return True, f"Escalation triggered by sensitive topic: '{topic}'"
                
        # Trigger 2: Low confidence (no matching documents found in vector store)
        if not retrieved_chunks:
            return True, "Escalation triggered by low retrieval confidence: No documentation found."
            
        # Trigger 3: Repeated dissatisfaction in history
        if history:
            negative_count = 0
            neg_indicators = ["still not working", "unresolved", "useless", "same error", "didn't help", "frustrated", "manager", "human"]
            for h in history:
                if h.get("sender") == "customer":
                    cust_content = h.get("content", "").lower()
                    if any(ind in cust_content for ind in neg_indicators):
                        negative_count += 1
            if negative_count >= 2 or any(h in text_lower for h in ["human", "manager", "agent", "person", "escalate"]):
                return True, "Escalation triggered by user request or repeated dissatisfaction."
                
        return False, ""

    def process_message(self, message_text: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Process user message, detects persona, retrieves from RAG pipeline, 
        generates persona-adaptive response, checks for escalation, and returns structured result.
        """
        # 1. Retrieve Knowledge Base chunks
        retrieved = kb_indexer.search(message_text, top_k=2)
        
        # 2. Run LLM Agent if API keys are available
        if self.has_keys:
            result = self._run_llm_agent(message_text, retrieved, history)
            if result:
                return result
                
        # 3. Fallback to Local/Mock Persona Engine
        return self._run_mock_agent(message_text, retrieved, history)

    def _run_llm_agent(self, message_text: str, retrieved: List[Dict[str, Any]], history: List[Dict[str, str]]) -> Dict[str, Any]:
        try:
            # Format history & context
            hist_str = ""
            if history:
                for h in history:
                    hist_str += f"{h['sender']}: {h['content']}\n"
                    
            context_str = ""
            for idx, r in enumerate(retrieved):
                context_str += f"Source: {r['source']} | Location: {r['location']}\nContent:\n{r['content']}\n\n"

            system_instructions = f"""You are a Persona-Adaptive Customer Support Agent.
Your job is to analyze the customer's message, classify their persona, retrieve information from the knowledge base, formulate an appropriate response, check for human escalation, and provide a structured JSON output.

### Target Personas:
1. **Technical Expert**: Uses technical terms, wants detailed explanation, API/logs, config.
2. **Frustrated User**: Uses emotional/angry language, wants reassurance, urgent action.
3. **Business Executive**: Focuses on business impact/timeline, concise, no jargon.

### Response Style Guide:
- **Technical Expert**: Detailed, technical, root cause analysis, step-by-step instructions.
- **Frustrated User**: Highly empathetic, simple language, reassuring, action-oriented.
- **Business Executive**: Concise, impact-focused, minimal technical jargon, estimated resolution guidance.

### Escalation Criteria:
- No relevant information found in the context (retrieve confidence low).
- Billing, Stripe, payments, refunds, invoices, account security/MFA locks, or legal/GDPR requests.
- Customer expresses desire to speak with a human, or remains dissatisfied.

### Output JSON Format:
You MUST respond with a single valid JSON object containing exactly the following keys:
{{
  "detected_persona": "Technical Expert" | "Frustrated User" | "Business Executive",
  "confidence_score": 0.0 to 1.0 (float reflecting retrieval relevance),
  "response": "Your generated answer here",
  "escalate": true | false,
  "reason_for_escalation": "Reason text or empty if false",
  "handoff_summary": {{
    "persona": "Detected Persona",
    "issue": "Brief summary of user issue",
    "documents_used": ["List of source document names used"],
    "attempted_steps": ["Actions attempted or recommended to user"],
    "recommendation": "Actionable advice for the human agent"
  }} (only include/fill this if escalate is true, otherwise null)
}}
"""
            prompt = f"""{system_instructions}

### Knowledge Base Context:
{context_str or "No matching documentation found."}

### Conversation History:
{hist_str}

Customer Message: {message_text}

JSON Output:"""

            if self.gemini_key:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                model = genai.GenerativeModel('gemini-1.5-flash', generation_config={"response_mime_type": "application/json"})
                response = model.generate_content(prompt)
                return json.loads(response.text)
                
            elif self.openai_key:
                from langchain_openai import ChatOpenAI
                from langchain_core.messages import SystemMessage, HumanMessage
                chat = ChatOpenAI(openai_api_key=self.openai_key, model="gpt-4o-mini", response_format={"type": "json_object"})
                res = chat.invoke([
                    SystemMessage(content="You are a helpful customer support agent that replies strictly in JSON."),
                    HumanMessage(content=prompt)
                ])
                return json.loads(res.content)
        except Exception as e:
            print(f"Warning: LLM Agent failed. Falling back to local heuristic. Error: {e}")
            return None

    def _run_mock_agent(self, message_text: str, retrieved: List[Dict[str, Any]], history: List[Dict[str, str]]) -> Dict[str, Any]:
        # 1. Detect Persona
        persona = self.detect_persona_heuristic(message_text)
        
        # 2. Check Escalation
        escalate, reason = self.check_escalation_rules(message_text, retrieved, history)
        
        # 3. Generate Tone-Adapted Response
        docs_used = list(set([r["source"] for r in retrieved]))
        
        if not retrieved:
            response_content = "I apologize, but I could not find any official support documents in our knowledge base that address your specific issue. Let me route this to a human representative who can assist you directly."
        else:
            first_doc = retrieved[0]
            doc_title = first_doc["title"]
            doc_body = first_doc["content"]
            doc_location = first_doc["location"]
            doc_source = first_doc["source"]
            
            # Format text snippet
            clean_body = re.sub(r'#.*', '', doc_body).strip()
            # Clean double newlines
            clean_body = "\n".join([line for line in clean_body.split("\n") if line.strip()][:5])
            
            if persona == "Technical Expert":
                response_content = f"### Root Cause & Troubleshooting Analysis\n" \
                                   f"Based on documentation: **[{doc_source}]({doc_location})**:\n\n" \
                                   f"{doc_body}\n\n" \
                                   f"**Verification Step**: Check if connection parameters match configuration constraints and verify HTTP headers."
                                   
            elif persona == "Business Executive":
                response_content = f"Regarding your query, here is the high-level business impact update:\n\n" \
                                   f"* **Resolution Overview**: Resolved via guidelines in **{doc_title}**.\n" \
                                   f"* **Operational Impact**: Low risk. Actionable steps have been documented.\n" \
                                   f"* **Estimated Resolution**: Immediate once the standard setup is performed.\n\n" \
                                   f"For full configuration details, please consult your technical team."
                                   
            else: # Frustrated User
                response_content = f"I completely understand how frustrating this must be, and I am here to help you get this resolved quickly.\n\n" \
                                   f"According to our **{doc_title}** article:\n" \
                                   f"Please try the following step:\n" \
                                   f"1. {clean_body.split('.')[0] if '.' in clean_body else clean_body[:100]}.\n\n" \
                                   f"Don't worry, we will make sure this is taken care of! If it doesn't resolve it, I will escalate this to a specialist."
        
        # Calculate mock confidence score
        confidence = 0.90 if retrieved else 0.20
        
        # Create human handoff summary if escalated
        handoff = None
        if escalate:
            # Extract attempted actions
            attempted = ["Search Knowledge Base"]
            if "tried" in message_text.lower() or "cache" in message_text.lower():
                attempted.append("Clear browser cache / Local troubleshooting")
                
            recommendation = "Investigate system configurations or logs."
            if "billing" in message_text.lower() or "refund" in message_text.lower():
                recommendation = "Review stripe billing logs and invoice transactions."
            elif "gdpr" in message_text.lower() or "legal" in message_text.lower():
                recommendation = "Validate customer compliance status and GDPR database logs."
            elif "password" in message_text.lower() or "account" in message_text.lower():
                recommendation = "Verify account MFA setup and lock status."

            handoff = {
                "persona": persona,
                "issue": message_text[:100] + ("..." if len(message_text) > 100 else ""),
                "documents_used": docs_used,
                "attempted_steps": attempted,
                "recommendation": recommendation
            }

        return {
            "detected_persona": persona,
            "confidence_score": confidence,
            "response": response_content,
            "escalate": escalate,
            "reason_for_escalation": reason,
            "handoff_summary": handoff
        }

agent_service = PersonaSupportAgent()
