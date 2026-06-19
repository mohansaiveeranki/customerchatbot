import sys
import os
import json

# Add current directory to path to resolve app package imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.agent import agent_service
from app.vector_store import kb_indexer

def main():
    print("=" * 60)
    print("      OmniSupport Persona-Adaptive Support Agent (CLI)       ")
    print("=" * 60)
    print("Type 'exit' or 'quit' to terminate the session.\n")
    
    # Initialize the file-based knowledge base indexer
    print("Ingesting and indexing knowledge base files from /data...")
    kb_indexer.load_and_index_files()
    print(f"Successfully indexed {len(kb_indexer.chunks)} chunks in the vector database.\n")
    
    history = []
    
    while True:
        try:
            user_msg = input("\nCustomer: ").strip()
            if not user_msg:
                continue
            if user_msg.lower() in ["exit", "quit"]:
                print("Exiting CLI session. Goodbye!")
                break
                
            # Process the message through the persona adaptive pipeline
            result = agent_service.process_message(user_msg, history)
            
            # Print the outputs required by section 4.6 of the assignment
            print("\n" + "=" * 50)
            print(f"USER MESSAGE:     {user_msg}")
            print(f"DETECTED PERSONA: {result['detected_persona']}")
            print("=" * 50)
            
            # Retrieved sources
            retrieved = kb_indexer.search(user_msg, top_k=2)
            if retrieved:
                print("RETRIEVED SOURCES:")
                for idx, r in enumerate(retrieved):
                    print(f"  [{idx + 1}] Source: {r['source']} | Location: {r['location']} | Title: {r['title']}")
            else:
                print("RETRIEVED SOURCES: None (Confidence Low)")
                
            print("\nGENERATED RESPONSE:")
            print(result['response'])
            print("-" * 50)
            
            # Escalation check and handoff details
            is_escalated = result['escalate']
            print(f"ESCALATION STATUS: {'[ESCALATED]' if is_escalated else '[RESOLVED]'}")
            if is_escalated:
                print(f"Reason: {result['reason_for_escalation']}")
                print("\nHUMAN HANDOFF SUMMARY:")
                print(json.dumps(result['handoff_summary'], indent=2))
            print("=" * 50 + "\n")
            
            # Keep history context
            history.append({"sender": "customer", "content": user_msg})
            history.append({"sender": "agent", "content": result['response']})
            
        except KeyboardInterrupt:
            print("\nSession interrupted. Exiting. Goodbye!")
            break
        except Exception as e:
            print(f"\nError running query: {e}")

if __name__ == "__main__":
    main()
