from fastapi import APIRouter
from pydantic import BaseModel
import os
from utils.pdf_agent import PDFAgent

router = APIRouter()

class GetBudgetSummariesRequest(BaseModel):
    us_state: str

# Because the GPT API lacks internet access, we can't ask GPT to retrieve the PDF from the internet.
# Instead, we must embed it.
print('Embedding budget PDF: ', os.getenv("BUDGET_PDF_PATH"))
pdf_agent = PDFAgent(
    pdf_path=os.getenv("BUDGET_PDF_PATH"),
    max_tokens=30000, # This PDF has ≈24k words, which corresponds to ≈30k tokens.
)

@router.post("/budget-summaries", response_model=str)
async def get_budget_summaries(request: GetBudgetSummariesRequest):
    print("Getting budget summaries" + ('' if request.us_state == "-" else f" for {request.us_state}"))

    prompt_header = """
        You are an expert on federal law, federal agencies, Congress, and the Constitution.
        Analyze the following federal budget
        that was signed into law on 12/21/2024 by President Joe Biden.
        Summarize the budget in layman's terms. Minimize jargon, and use simple language.
        If you really have to use jargon to get a point across, include a parenthetical explanation or definition.
        Do not include an introduction that reads along the lines of "This document...".
        Instead, dive right into the content.
    """

    prompt_state = "" if request.us_state == "-" else f"""
        Focus as much as possible on the items and impacts specific to
        the state of {request.us_state} and its residents. Be as concrete as possible.
        Deprioritize items that are general, abstract, or not state-specific.
    """

    prompt_footer = """
        Structure your answer in the following way:
        A bullet-pointed list of the 5 most salient provisions of the budget.
        To delimit each bullet point, its text should begin with the string ">>"
        (don't include a hyphen or other different delimiter).
        Don't begin the sentence with "The budget..." or "The bill" or something similar.
        Instead, please jump right into the content.
        E.g., "Allocates..." or "Provides..." or something similar.
    """

    return pdf_agent.query(f"{prompt_header}{prompt_state}{prompt_footer}")