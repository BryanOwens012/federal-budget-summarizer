from fastapi import APIRouter
from pydantic import BaseModel
import os
from utils.pdf_agent import PDFAgent
from datetime import datetime
import re

router = APIRouter()

class GetBudgetSummariesRequest(BaseModel):
    us_state: str

class GetBudgetElaborationRequest(BaseModel):
    summary: str

emptyUSState = "-"
mostLikelyUSStates = ["California", "Washington", "New York", "New Jersey", "Texas", "Florida", "Illinois", "Pennsylvania", "Virginia", "Maryland", "Massachusetts"]

# TODO: Replace with Redis cache
summaries_by_us_state_cache = dict[str, str]()
elaboration_by_summary_cache = dict[str, str]()

# Because the GPT API lacks internet access, we can't ask GPT to retrieve the PDF from the internet.
# Instead, we must parse and embed it.
print(f"{datetime.now()} Embedding budget PDF: ", os.getenv("BUDGET_PDF_PATH"))
pdf_agent = PDFAgent(
    pdf_path=os.getenv("BUDGET_PDF_PATH"),
    max_tokens=30000, # This PDF has ≈24k words, which corresponds to ≈30k tokens.
)

async def init_summaries_by_state_cache():
    for us_state in mostLikelyUSStates:
        print(f"{datetime.now()} Pre-caching budget summaries for {us_state}")
        summaries_by_us_state_cache[us_state] = await get_budget_summaries(GetBudgetSummariesRequest(us_state=us_state))

async def init_elaboration_by_summary_cache():
    for us_state, summary in summaries_by_us_state_cache.items():
        print(f"{datetime.now()} Pre-caching budget elaboration for {us_state}")
        elaboration_by_summary_cache[summary] = await get_budget_elaboration(GetBudgetElaborationRequest(summary=summary))

async def init_caches():
    await init_summaries_by_state_cache()
    await init_elaboration_by_summary_cache()

def clean_result(result: str) -> str:
    """
    Sometimes, the response will include an extraneous \ character somewhere,
    so we need to remove it.
    """
    pattern = r"\\(?!n)"
    return re.sub(pattern, '', result)

@router.post("/budget-summaries", response_model=str)
async def get_budget_summaries(request: GetBudgetSummariesRequest):
    print(f"{datetime.now()} Getting budget summaries" + ('' if request.us_state == emptyUSState else f" for {request.us_state}"))

    if request.us_state in summaries_by_us_state_cache:
        print(f"{datetime.now()} Found budget summaries for {request.us_state} in cache")
        return summaries_by_us_state_cache[request.us_state]

    prompt_header = """
        You are an expert on federal law, federal agencies, Congress, and the Constitution.
        You are also highly skilled in writing, particularly in writing concise, informative summaries for the public.
        Analyze the following federal budget
        that was signed into law on 12/21/2024 by President Joe Biden.
        Summarize the budget in layman's terms. Minimize jargon, and use simple language.
        If you really have to use jargon to get a point across, include a parenthetical explanation or definition.
        Do not include an introduction that reads along the lines of "This document...".
        Instead, please jump right into the content.
    """

    prompt_state = "" if request.us_state == emptyUSState else f"""
        Focus as much as possible on the items and impacts specific to
        the state of {request.us_state} and its residents. Be as concrete as possible.
        For example, try to use numbers, percentages, dollars, and the names of cities,
        organizations, and people (such as politicians) of that state.
        Make sure that the numbers are correct as applicable to the state.
        For example, if the budget allocates $1 billion to a program to fund changes on a national scale (not state-specific),
        it would not be accurate to claim that the budget allocates $1 billion to the state of {request.us_state}.
        Deprioritize items that are general, abstract, or not state-specific.
    """

    prompt_footer = """
        Structure your answer in the following way:
        A bullet-pointed list of the 5 most salient provisions of the budget, in order of importance.

        To delimit each bullet point, its text should begin with the string ">>"
        (but without the quotation marks that I added there; don't include a hyphen or other different delimiter).
        Don't begin the sentence with "The budget..." or "The bill" or something similar.
        Instead, please jump right into the content.
        E.g., "Allocates..." or "Provides..." or something similar.

        Split into paragraphs if necessary. Make a line break between each paragraph using exactly one occurence of the usual backslash-n string.
        Don't add too much space or newlines between paragraphs.
    """

    result = clean_result(pdf_agent.query(f"{prompt_header}{prompt_state}{prompt_footer}"))
    summaries_by_us_state_cache[request.us_state] = result

    print(f"{datetime.now()} Got budget summaries" + ('' if request.us_state == emptyUSState else f" for {request.us_state}"))

    return result

@router.post("/budget-elaboration", response_model=str)
async def get_budget_elaboration(request: GetBudgetElaborationRequest):
    summary_preview = request.summary[:20]
    print(f"{datetime.now()} Getting budget elaboration for \"{summary_preview}...\"")

    if request.summary in elaboration_by_summary_cache:
        print(f"{datetime.now()} Found budget elaboration for \"{summary_preview}\" in cache")
        return elaboration_by_summary_cache[request.summary]

    prompt_header = """
        You are an expert on federal law, federal agencies, Congress, and the Constitution.
        You are also highly skilled in writing, particularly in writing concise, informative summaries for the public.
        I previously asked you to summarize the following federal budget
        that was signed into law on 12/21/2024 by President Joe Biden.
    """

    prompt_summary = f"""
        You gave me with the following summary of the budget:
        Begin-summary>>{request.summary}<<End-summary
        """

    prompt_footer = f"""
        Now, please give me a long-form (7-10 sentences) elaboration of that summary.
        Including its motivations, causes, implications, supporters (names of organizations and people), and future projected changes.
        Be as specific as possible, based on your knowledge of this budget and what you can find in your knowledge base and training data.

        Use layman's terms. Minimize jargon, and use simple language.
        If you really have to use jargon to get a point across, include a parenthetical explanation or definition.
    
        Do not include an introduction that reads along the lines of "This document...", "This summary...", "This budget...", etc.
        Instead, please jump right into the content.

        Split into paragraphs if necessary. Make a line break between each paragraph using exactly one occurence of the usual backslash-n string.
        Don't add too much space or newlines between paragraphs.
    """

    result = clean_result(pdf_agent.query(f"{prompt_header}{prompt_summary}{prompt_footer}"))
    elaboration_by_summary_cache[request.summary] = result

    print(f"{datetime.now()} Got budget elaboration for \"{summary_preview}...\"")

    return result   