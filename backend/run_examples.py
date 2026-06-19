import sys
import os
import json

# Ensure app package is importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.agent import agent_service
from app.vector_store import kb_indexer

def run_test():
    print("=" * 70)
    print("      Running OmniSupport Persona-Adaptive Agent Test Suite       ")
    print("=" * 70)
    
    # Ingest docs
    print("Ingesting knowledge base files...")
    kb_indexer.load_and_index_files()
    print("Vector database built.\n")
    
    queries = [
        # 1. Technical Expert Query
        ("Technical Expert Query", "Can you explain the API authentication failure and provide error details?"),
        
        # 2. Frustrated User Query
        ("Frustrated User Query", "I've tried everything and nothing works! The dashboard statistics are completely spinning and won't load! help me now!"),
        
        # 3. Business Executive Query
        ("Business Executive Query", "How does this database connection timeout issue impact operations and when will it be resolved?"),
        
        # 4. Sensitive Escalation Query (Billing/Refund)
        ("Sensitive Billing Escalation Query", "I need a refund for my subscription invoice. I was charged twice in June and want this money back immediately!"),
        
        # 5. Low Confidence / Unknown Query (Escalation)
        ("Unknown Info Escalation Query", "How do I configure active directory SSO syncing with custom user LDAP attributes in Okta?")
    ]
    
    for label, query_text in queries:
        print("\n" + "#" * 60)
        print(f" TEST CASE: {label}")
        print("#" * 60)
        print(f"Customer Query: '{query_text}'")
        
        # Process query
        result = agent_service.process_message(query_text)
        
        print(f"\n[1] Detected Persona: {result['detected_persona']}")
        
        # Retrieved documents
        retrieved = kb_indexer.search(query_text, top_k=2)
        print("\n[2] Retrieved Knowledge Base Sources:")
        if retrieved:
            for idx, r in enumerate(retrieved):
                print(f"    - Source: {r['source']} | Location: {r['location']} | Title: {r['title']}")
        else:
            print("    - None (Confidence below threshold)")
            
        print("\n[3] Generated Tone-Adapted Response:")
        print(result['response'])
        
        print(f"\n[4] Escalation Status: {'[ESCALATED]' if result['escalate'] else '[RESOLVED]'}")
        if result['escalate']:
            print(f"    Reason: {result['reason_for_escalation']}")
            print("    Handoff Summary:")
            print(json.dumps(result['handoff_summary'], indent=2))
        print("#" * 60 + "\n")

if __name__ == "__main__":
    run_test()
