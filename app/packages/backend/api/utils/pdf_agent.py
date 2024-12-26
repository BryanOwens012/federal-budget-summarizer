import pypdf
import openai
import tiktoken
import os

class PDFAgent:
    def __init__(self, pdf_path, max_tokens=4000):
        self.client = openai.OpenAI(
            api_key = os.getenv("OPENAI_API_KEY")
        )
        
        self.pdf_text = self._extract_pdf_text(pdf_path)
        self.max_tokens = max_tokens
        
        # Store messages and their embeddings
        self.messages = []
        self.embeddings = []
        
        # Add initial system message and its embedding
        system_message = {
            "role": "system",
            "content": f"You are an industry expert specialized in analyzing the following PDF document. Document content: {self.pdf_text[:4000]}"
        }
        self.messages.append(system_message)
        self._add_embedding(system_message)
        
        # Initialize tokenizer for managing context
        self.tokenizer = tiktoken.get_encoding("cl100k_base")

    def _extract_pdf_text(self, pdf_path):
        """Extract text from PDF file"""
        with open(pdf_path, "rb") as file:
            reader = pypdf.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        return text

    def _add_embedding(self, message):
        """Create and store embedding for a single message"""
        try:
            response = self.client.embeddings.create(
                input=message["content"],
                model="text-embedding-3-large"
            )
            self.embeddings.append(response.data[0].embedding)
        except Exception as e:
            print(f"Error creating embedding: {e}")
            # Add a placeholder embedding if creation fails
            self.embeddings.append(np.zeros(3072))  # text-embedding-3-large dimensionality

    def _manage_context(self):
        """Manage conversation context to stay within token limits"""
        total_tokens = len(self.tokenizer.encode(self.messages[0]["content"]))
        
        for msg in self.messages[1:]:
            total_tokens += len(self.tokenizer.encode(msg["content"]))
        
        # If over token limit, remove older messages and their embeddings
        while total_tokens > self.max_tokens:
            if len(self.messages) > 1:
                self.messages.pop(1)
                self.embeddings.pop(1)  # Remove corresponding embedding
                total_tokens -= len(self.tokenizer.encode(msg["content"]))
            else:
                break

    def query(self, user_query):
        """Send query with PDF context"""
        # Add user query to messages and create its embedding
        user_message = {
            "role": "user",
            "content": user_query
        }
        self.messages.append(user_message)
        self._add_embedding(user_message)
        
        # Manage context tokens
        self._manage_context()
        
        # Call OpenAI API
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini-2024-07-18",
                messages=self.messages,
            )
            
            # Extract agent's response
            agent_response = response.choices[0].message.content
            
            # Add response to messages and create its embedding
            assistant_message = {
                "role": "assistant",
                "content": agent_response
            }
            self.messages.append(assistant_message)
            self._add_embedding(assistant_message)
            
            return agent_response
            
        except Exception as e:
            print(f"Error in API call: {e}")
            return "Failed to process query"
