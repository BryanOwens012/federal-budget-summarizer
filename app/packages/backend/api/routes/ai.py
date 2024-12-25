from fastapi import APIRouter
import os
from utils.pdf_agent import PDFAgent

router = APIRouter()

# Because the GPT API lacks internet access, we can't ask GPT to retrieve the PDF from the internet.
# Instead, we must embed it.
print('Embedding budget PDF: ', os.getenv("BUDGET_PDF_PATH"))
pdf_agent = PDFAgent(
    pdf_path=os.getenv("BUDGET_PDF_PATH"),
    max_tokens=30000, # This PDF has ≈24k words, which corresponds to ≈30k tokens.
)

@router.get("/budget-summaries", response_model=str)
async def get_crsummary():
    print("Getting budget summaries")

    prompt = """
    You are an expert on federal law, federal agencies, Congress, and the Constitution.
    Analyze the following federal budget
    that was signed into law on 12/21/2024 by President Joe Biden.
    Summarize the budget in layman's terms. Minimize jargon, and use simple language.
    If you really have to use jargon to get a point across, include a parenthetical explanation or definition.
    Do not include an introduction that reads along the lines of "This document...".
    Instead, dive right into the content.

    Structure your answer in the following way:
    A bullet-pointed list of the 5 most salient provisions of the budget.
    To delimit each bullet point, its text should begin with the string ">>"
    (don't include a hyphen or other different delimiter).
    Don't begin the sentence with "The budget..." or "The bill" or something similar.
    Instead, please jump right into the content.
    E.g., "Allocates..." or "Provides..." or something similar.
    """

    return pdf_agent.query(prompt)