import re
from typing import Iterable, Optional

# Small-model tiers, most preferred first. Add a new tier name here to make it eligible.
TIER_PREFERENCE = ["nano", "mini", "luna"]

# Undated chat-model aliases only, e.g. "gpt-5-nano" or "gpt-5.6-luna".
# Excludes dated snapshots ("gpt-5-nano-2025-08-07") and special-purpose
# variants ("gpt-4o-mini-tts", "gpt-4o-mini-realtime-preview").
CHAT_MODEL_PATTERN = re.compile(rf"gpt-(\d+)(?:\.(\d+))?-({'|'.join(TIER_PREFERENCE)})")

def select_cheapest_chat_model(model_ids: Iterable[str]) -> Optional[str]:
    """
    Pick the model most likely to be cheapest, from the IDs the API reports as available.

    OpenAI's models endpoint does not return prices, so this is a heuristic:
    prefer tiers in TIER_PREFERENCE order, then the newest major generation (older generations
    have not been cheaper), then that generation's lowest point release (point
    releases have been priced higher than the base model).
    """
    candidates = []
    for model_id in model_ids:
        match = CHAT_MODEL_PATTERN.fullmatch(model_id)
        if match:
            major, minor, tier = match.groups()
            candidates.append((TIER_PREFERENCE.index(tier), -int(major), int(minor or 0), model_id))

    if not candidates:
        return None

    return min(candidates)[-1]

def fetch_cheapest_chat_model(client) -> str:
    """Ask the API which models exist and pick the cheapest. Raises when none qualify."""
    model_id = select_cheapest_chat_model(model.id for model in client.models.list())
    if model_id is None:
        raise RuntimeError(f"No available OpenAI model matches {CHAT_MODEL_PATTERN.pattern}")
    return model_id
