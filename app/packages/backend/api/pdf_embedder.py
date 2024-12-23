import pypdf
import openai
import tiktoken
import os

class PDFEmbedder:
    def __init__(self, pdf_path):
        # Set up OpenAI API
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # Extract text from PDF
        self.pdf_text = self._extract_pdf_text(pdf_path)
        
        # Initial system message with PDF context
        self.messages = [
            {
                "role": "system", 
                "content": f"You are an assistant specialized in analyzing the following PDF document. Document content: {self.pdf_text[:4000]}"
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

    def _manage_context(self, max_tokens=4000):
        """Manage conversation context to stay within token limits"""
        total_tokens = len(self.tokenizer.encode(self.messages[0]["content"]))
        
        for msg in self.messages[1:]:
            total_tokens += len(self.tokenizer.encode(msg["content"]))
        
        # If over token limit, remove older messages
        while total_tokens > max_tokens:
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
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=self.messages
        )
        
        # Extract assistant's response
        assistant_response = response.choices[0].message.content
        
        # Add response to messages
        self.messages.append({
            "role": "assistant", 
            "content": assistant_response
        })
        
        return assistant_response

# Usage example
def main():
    pdf_embedder = PDFEmbedder(
        pdf_path="your_document.pdf", 
        openai_api_key="your_openai_api_key"
    )
    
    # First query about the PDF
    print(pdf_embedder.query("What is the main topic of this document?"))
    
    # Subsequent queries will have context
    print(pdf_embedder.query("Can you elaborate on the key points?"))

if __name__ == "__main__":
    main()