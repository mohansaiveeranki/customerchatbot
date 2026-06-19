import os
import math
import re
from typing import List, Dict, Any

USE_SEMANTIC = False
if os.getenv("FORCE_KEYWORD_SEARCH") != "true":
    try:
        import faiss
        from sentence_transformers import SentenceTransformer
        import numpy as np
        import pypdf
        USE_SEMANTIC = True
    except ImportError:
        pass

class FileRAGPipeline:
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.index = None
        self.model = None
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
        if not os.path.exists(self.data_dir):
            fallback_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
            if os.path.exists(fallback_dir):
                self.data_dir = fallback_dir
        
        if USE_SEMANTIC:
            try:
                # Load a lightweight, high-performance semantic embedding model
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception as e:
                print(f"Warning: Failed to load SentenceTransformer. Falling back to keyword search. Error: {e}")

    def load_and_index_files(self):
        self.chunks = []
        if not os.path.exists(self.data_dir):
            print(f"Data directory {self.data_dir} does not exist.")
            return

        for filename in os.listdir(self.data_dir):
            filepath = os.path.join(self.data_dir, filename)
            if filename.endswith(".pdf"):
                self._load_pdf(filepath, filename)
            elif filename.endswith(".md") or filename.endswith(".txt"):
                self._load_markdown(filepath, filename)
                
        print(f"Loaded {len(self.chunks)} document chunks from {self.data_dir}")
        self._build_index()

    def index_articles(self, articles_list: List[Dict]):
        # Load the files from data directory first
        self.load_and_index_files()
        
        # Append the DB-seeded articles as chunks
        for art in articles_list:
            exists = any(c.get("source") == f"db_article_{art['id']}" for c in self.chunks)
            if not exists:
                self.chunks.append({
                    "content": f"# {art['title']}\nCategory: {art['category']}\n\n{art['content']}",
                    "source": f"db_article_{art['id']}",
                    "location": f"Database: {art['category']}",
                    "title": art['title']
                })
        
        print(f"Combined database articles. Total chunks indexed: {len(self.chunks)}")
        self._build_index()

    def _build_index(self):
        if self.chunks and self.model is not None:
            try:
                import faiss
                import numpy as np
                texts = [c["content"] for c in self.chunks]
                embeddings = self.model.encode(texts, show_progress_bar=False)
                embeddings_np = np.array(embeddings).astype('float32')
                
                dimension = embeddings_np.shape[1]
                self.index = faiss.IndexFlatL2(dimension)
                self.index.add(embeddings_np)
                print("FAISS semantic vector store successfully built.")
            except Exception as e:
                print(f"Warning: Failed to construct FAISS index. Error: {e}")
                self.index = None

    def _load_pdf(self, filepath: str, filename: str):
        try:
            import pypdf
            reader = pypdf.PdfReader(filepath)
            for page_idx, page in enumerate(reader.pages):
                text = page.extract_text()
                if not text or not text.strip():
                    continue
                
                # Split page text into smaller chunks if it's too long, or index by page
                # Since pages in support docs are usually short, we chunk page-by-page
                # or split by paragraph if length > 800
                paragraphs = text.split("\n\n")
                current_chunk = []
                current_len = 0
                sub_page_idx = 1
                
                for para in paragraphs:
                    para = para.strip()
                    if not para:
                        continue
                    current_chunk.append(para)
                    current_len += len(para)
                    if current_len > 600:
                        content_str = "\n\n".join(current_chunk)
                        self.chunks.append({
                            "content": content_str,
                            "source": filename,
                            "location": f"Page {page_idx + 1} (Section {sub_page_idx})",
                            "title": f"{filename} - Page {page_idx + 1}"
                        })
                        current_chunk = []
                        current_len = 0
                        sub_page_idx += 1
                
                if current_chunk:
                    content_str = "\n\n".join(current_chunk)
                    self.chunks.append({
                        "content": content_str,
                        "source": filename,
                        "location": f"Page {page_idx + 1}",
                        "title": f"{filename} - Page {page_idx + 1}"
                    })
        except Exception as e:
            print(f"Error loading PDF {filename}: {e}")

    def _load_markdown(self, filepath: str, filename: str):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Simple Markdown chunker based on headers
            sections = content.split("\n#")
            for sec in sections:
                sec = sec.strip()
                if not sec:
                    continue
                
                # Re-add header marker except for first section if it wasn't there
                lines = sec.split("\n")
                title = lines[0].replace("#", "").strip()
                body = "\n".join(lines[1:]).strip()
                
                # Extract Section metadata from the content if available (e.g. "Section: Technical Support")
                location = "Introduction"
                for line in lines[1:5]:
                    if "section:" in line.lower():
                        location = line.split(":", 1)[1].strip()
                        break
                
                self.chunks.append({
                    "content": f"# {title}\n\n{body}",
                    "source": filename,
                    "location": f"Section: {location}",
                    "title": title
                })
        except Exception as e:
            print(f"Error loading Markdown/TXT {filename}: {e}")

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.chunks:
            # Try to build index if empty
            self.load_and_index_files()
            if not self.chunks:
                return []

        if self.index is not None and self.model is not None:
            try:
                query_vector = self.model.encode([query])
                query_vector_np = np.array(query_vector).astype('float32')
                distances, indices = self.index.search(query_vector_np, top_k)
                
                results = []
                for idx in indices[0]:
                    if idx != -1 and idx < len(self.chunks):
                        results.append(self.chunks[idx])
                return results
            except Exception as e:
                print(f"Warning: Semantic search failed, falling back to keyword search. Error: {e}")

        return self._keyword_search(query, top_k)

    def _keyword_search(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        query_words = [w.lower() for w in re.findall(r'\w+', query) if len(w) > 2]
        if not query_words:
            query_words = [w.lower() for w in re.findall(r'\w+', query)]
            if not query_words:
                return self.chunks[:top_k]

        scored_chunks = []
        for chunk in self.chunks:
            score = 0
            content_lower = chunk['content'].lower()
            title_lower = chunk['title'].lower()

            for word in query_words:
                if word in title_lower:
                    score += 15
                if word in content_lower:
                    score += chunk['content'].lower().count(word) * 2

            if score > 0:
                scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [chunk for _, chunk in scored_chunks[:top_k]]

kb_indexer = FileRAGPipeline()
# Load files on startup
kb_indexer.load_and_index_files()
