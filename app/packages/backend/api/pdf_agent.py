import pypdf
import openai
import tiktoken
import os

class PDFAgent:
    def __init__(self, pdf_path, max_tokens = 4000):
        self.client = openai.OpenAI(
            api_key = os.getenv("OPENAI_API_KEY")
        )
        
        self.pdf_text = self._extract_pdf_text(pdf_path)

        self.max_tokens = max_tokens
        
        # Initial system message with PDF context
        self.messages = [
            {
                "role": "system", 
                "content": f"You are an industry expert specialized in analyzing the following PDF document. Document content: {self.pdf_text[:4000]}"
            }
        ]
        
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

    def _manage_context(self):
        """Manage conversation context to stay within token limits"""
        total_tokens = len(self.tokenizer.encode(self.messages[0]["content"]))
        
        for msg in self.messages[1:]:
            total_tokens += len(self.tokenizer.encode(msg["content"]))
        
        # If over token limit, remove older messages
        while total_tokens > self.max_tokens:
            if len(self.messages) > 1:
                removed_msg = self.messages.pop(1)
                total_tokens -= len(self.tokenizer.encode(removed_msg["content"]))
            else:
                break

    def query(self, user_query):
        """Send query with PDF context"""
        # Add user query to messages
        self.messages.append({
            "role": "user", 
            "content": user_query
        })
        
        # Manage context tokens
        self._manage_context()

        # Create embeddings for the messages
        self._create_embeddings()
        
        # Call OpenAI API
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=self.messages,
        )
        
        # Extract agent's response
        agent_response = response.choices[0].message.content
        
        # Add response to messages
        self.messages.append({
            "role": "agent", 
            "content": agent_response
        })
        
        return agent_response
    
    def _create_embeddings(self):
        """Create embeddings for the messages using the OpenAI API"""
        embeddings = []
        for message in self.messages:
            response = self.client.embeddings.create(
                input=message["content"],
                model="text-embedding-3-large"
            )
            embeddings.append(response.data[0].embedding)
        return embeddings

if __name__ == "__main__":
    pdf_agent = PDFAgent(
        pdf_path=os.getenv("CR_PDF_PATH"),
    )
    
    # First query about the PDF
    print(pdf_agent.query("What is the main topic of this document?"))
    
    # Subsequent queries will have context
    print(pdf_agent.query("Can you elaborate on the key points?"))