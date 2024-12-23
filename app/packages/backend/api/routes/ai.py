from fastapi import APIRouter
from openai import OpenAI
import os

router = APIRouter()

client = OpenAI(
  api_key = os.getenv("OPENAI_API_KEY")
)

@router.get("/cr-summary", response_model=str)
async def get_crsummary():
    completion = client.chat.completions.create(
        model = "gpt-4o",
        store = True,
        messages = [
            {"role": "user", "content": "Summarize the latest version of the 2024 Continuing Resolution bill. Search the Internet to get the latest info."}
        ]
    )
    return completion.choices[0].message.content