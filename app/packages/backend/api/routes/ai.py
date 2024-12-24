from fastapi import APIRouter
import os
from pdf_agent import PDFAgent

router = APIRouter()

@router.get("/cr-summary", response_model=str)
async def get_crsummary():
    # Because the GPT API lacks internet access, we can't ask GPT to retrieve the PDF from the internet.
    # Instead, we must embed it.
    pdf_agent = PDFAgent(
        pdf_path=os.getenv("CR_PDF_PATH"),
        max_tokens=30000, # This PDF has ≈24k words, which corresponds to ≈30k tokens.
    )

    prompt = """
    You are an expert on federal law, federal agencies, Congress, and the Constitution.
    Analyze the following Continuing Resolution (CR, otherwise known as the federal budget)
    that was signed into law on 12/21/2024 by President Joe Biden.
    Summarize the CR in layman's terms. Minimize jargon, and use simple language.
    If you really have to use jargon to get a point across, include a parenthetical explanation or definition.
    Do not include an introduction that reads along the lines of "This document...".
    Instead, dive right into the content.

    Structure your answer in the following way:
    - One concise paragraph describing the overaraching purpose of the CR
    - A bullet-pointed list of the key provisions of the CR.
    To delimit each bullet point, its text should begin with the string ">>"
    (don't include a hyphen or other different delimiter).
    Don't begin the sentence with "The CR..." or "The bill" or something similar.
    Instead, please jump right into the content.
    E.g., "Allocates..." or "Provides..." or something similar.
    """

    return pdf_agent.query(prompt)