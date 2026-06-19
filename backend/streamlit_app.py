import streamlit as st
import os
import sys
import json

# Add current directory to path to enable imports from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.agent import agent_service
from app.vector_store import kb_indexer

# Set page configurations
st.set_page_config(
    page_title="OmniSupport AI Agent Console",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# App Title & Custom Styling
st.markdown("""
<style>
    .persona-badge-tech {
        background-color: #1e3a8a;
        color: #93c5fd;
        padding: 4px 10px;
        border-radius: 12px;
        font-weight: bold;
        font-size: 0.85em;
    }
    .persona-badge-frustrated {
        background-color: #7f1d1d;
        color: #fca5a5;
        padding: 4px 10px;
        border-radius: 12px;
        font-weight: bold;
        font-size: 0.85em;
    }
    .persona-badge-exec {
        background-color: #064e3b;
        color: #6ee7b7;
        padding: 4px 10px;
        border-radius: 12px;
        font-weight: bold;
        font-size: 0.85em;
    }
</style>
""", unsafe_content_allowed=True)

st.title("🤖 OmniSupport: Persona-Adaptive Customer Support Agent")
st.caption("AI Intern Assignment - Persona-Aware Support Agent with RAG & Human Escalation")

# Sidebar
with st.sidebar:
    st.header("⚙️ Configuration & Controls")
    
    # Toggle search mode
    search_mode = st.radio(
        "Search Mode",
        options=["Fast Keyword Search", "Semantic Search (all-MiniLM-L6-v2)"],
        index=0,
        help="Semantic search requires downloading a ~90MB sentence-transformer model on the first load."
    )
    
    if search_mode == "Fast Keyword Search":
        os.environ["FORCE_KEYWORD_SEARCH"] = "true"
    else:
        os.environ["FORCE_KEYWORD_SEARCH"] = "false"
        
    st.subheader("🔑 API Configuration (Optional)")
    gemini_key = st.text_input("Google Gemini API Key", type="password", value=os.getenv("GEMINI_API_KEY", ""))
    openai_key = st.text_input("OpenAI API Key", type="password", value=os.getenv("OPENAI_API_KEY", ""))
    
    if gemini_key:
        os.environ["GEMINI_API_KEY"] = gemini_key
        agent_service.gemini_key = gemini_key
        agent_service.has_keys = True
    if openai_key:
        os.environ["OPENAI_API_KEY"] = openai_key
        agent_service.openai_key = openai_key
        agent_service.has_keys = True
        
    st.divider()
    st.markdown("### 📚 Knowledge Base Info")
    st.info(f"Loaded **{len(kb_indexer.chunks)}** document chunks from the `/data` directory, including a policy PDF.")
    
    # Show active articles
    if st.checkbox("Show files indexed"):
        files = list(set([c["source"] for c in kb_indexer.chunks]))
        for f in files:
            st.text(f"📄 {f}")

# Main Chat Interface
if "messages" not in st.session_state:
    st.session_state.messages = []
if "history" not in st.session_state:
    st.session_state.history = []

# Display conversation history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])
        
        # Display metadata details for assistant replies
        if msg["role"] == "assistant" and "metadata" in msg:
            meta = msg["metadata"]
            
            # 1. Persona Badge
            persona = meta["detected_persona"]
            if persona == "Technical Expert":
                badge = '<span class="persona-badge-tech">🔧 Technical Expert</span>'
            elif persona == "Business Executive":
                badge = '<span class="persona-badge-exec">💼 Business Executive</span>'
            else:
                badge = '<span class="persona-badge-frustrated">⚠️ Frustrated User</span>'
            st.markdown(f"**Detected Persona**: {badge}", unsafe_content_allowed=True)
            
            # 2. Retrieved Sources Accordion
            if meta.get("sources"):
                with st.expander("📚 Retrieved Knowledge Base Sources"):
                    for idx, src in enumerate(meta["sources"]):
                        st.markdown(f"**[{idx+1}] {src['source']}** — *{src['location']}*")
                        st.caption(src["content"][:200] + "...")
            else:
                st.caption("No knowledge base chunks retrieved (Confidence low).")
                
            # 3. Escalation Status
            if meta["escalate"]:
                st.error("🚨 **Escalated to Human Representative**")
                st.markdown("**Reason**: " + meta["reason_for_escalation"])
                st.json(meta["handoff_summary"])
            else:
                st.success("✅ **Resolved by AI**")

# Chat input
if user_query := st.chat_input("Ask a support question (e.g., 'explain API auth' or 'how do I request a refund?')"):
    # 1. Show user message
    with st.chat_message("user"):
        st.write(user_query)
    st.session_state.messages.append({"role": "user", "content": user_query})
    
    # 2. Process message
    with st.spinner("Analyzing query, searching documentation, and drafting reply..."):
        # Format history in correct schema
        history_formatted = []
        for h in st.session_state.history:
            history_formatted.append(h)
            
        result = agent_service.process_message(user_query, history_formatted)
        
        # Retrieve references for UI display
        sources = kb_indexer.search(user_query, top_k=2)
        
        metadata = {
            "detected_persona": result["detected_persona"],
            "escalate": result["escalate"],
            "reason_for_escalation": result.get("reason_for_escalation", ""),
            "handoff_summary": result.get("handoff_summary"),
            "sources": sources
        }
        
    # 3. Show assistant reply
    with st.chat_message("assistant"):
        st.write(result["response"])
        
        # Render metadata badges
        persona = result["detected_persona"]
        if persona == "Technical Expert":
            badge = '<span class="persona-badge-tech">🔧 Technical Expert</span>'
        elif persona == "Business Executive":
            badge = '<span class="persona-badge-exec">💼 Business Executive</span>'
        else:
            badge = '<span class="persona-badge-frustrated">⚠️ Frustrated User</span>'
        st.markdown(f"**Detected Persona**: {badge}", unsafe_content_allowed=True)
        
        if sources:
            with st.expander("📚 Retrieved Knowledge Base Sources"):
                for idx, src in enumerate(sources):
                    st.markdown(f"**[{idx+1}] {src['source']}** — *{src['location']}*")
                    st.caption(src["content"][:200] + "...")
                    
        if result["escalate"]:
            st.error("🚨 **Escalated to Human Representative**")
            st.markdown("**Reason**: " + result["reason_for_escalation"])
            st.json(result["handoff_summary"])
        else:
            st.success("✅ **Resolved by AI**")
            
    # Save message and history
    st.session_state.messages.append({
        "role": "assistant",
        "content": result["response"],
        "metadata": metadata
    })
    st.session_state.history.append({"sender": "customer", "content": user_query})
    st.session_state.history.append({"sender": "agent", "content": result["response"]})
