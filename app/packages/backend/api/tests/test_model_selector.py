import unittest
from types import SimpleNamespace

from utils.model_selector import fetch_cheapest_chat_model, select_cheapest_chat_model

# Shape of OpenAI's model list, including the variants the selector must skip
AVAILABLE_MODELS = [
    "gpt-4o-mini",
    "gpt-4o-mini-2024-07-18",
    "gpt-4o-mini-tts",
    "gpt-4o-mini-realtime-preview",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "gpt-4.1-nano-2025-04-14",
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-5-nano-2025-08-07",
    "gpt-5.4-mini",
    "gpt-5.4-nano",
    "gpt-5.6-luna",
    "gpt-luna-latest",
    "text-embedding-3-large",
]

class SelectCheapestChatModelTest(unittest.TestCase):
    def test_picks_base_nano_of_newest_generation(self):
        self.assertEqual(select_cheapest_chat_model(AVAILABLE_MODELS), "gpt-5-nano")

    def test_falls_to_next_point_release_when_base_is_retired(self):
        remaining = [m for m in AVAILABLE_MODELS if not m.startswith("gpt-5-nano")]
        self.assertEqual(select_cheapest_chat_model(remaining), "gpt-5.4-nano")

    def test_prefers_any_nano_over_a_newer_mini(self):
        self.assertEqual(select_cheapest_chat_model(["gpt-6-mini", "gpt-4.1-nano"]), "gpt-4.1-nano")

    def test_falls_back_to_mini_when_no_nano_exists(self):
        self.assertEqual(select_cheapest_chat_model(["gpt-4o-mini", "gpt-5-mini", "gpt-5.4-mini"]), "gpt-5-mini")

    def test_falls_back_to_luna_when_no_nano_or_mini_exists(self):
        self.assertEqual(select_cheapest_chat_model(["gpt-5.6-luna", "gpt-luna-latest", "gpt-5"]), "gpt-5.6-luna")

    def test_prefers_mini_over_luna(self):
        self.assertEqual(select_cheapest_chat_model(["gpt-6-luna", "gpt-5-mini"]), "gpt-5-mini")

    def test_moves_to_a_new_generation(self):
        self.assertEqual(select_cheapest_chat_model(AVAILABLE_MODELS + ["gpt-6-nano"]), "gpt-6-nano")

    def test_compares_versions_numerically_not_lexically(self):
        self.assertEqual(select_cheapest_chat_model(["gpt-9-nano", "gpt-10-nano"]), "gpt-10-nano")
        self.assertEqual(select_cheapest_chat_model(["gpt-5.10-nano", "gpt-5.9-nano"]), "gpt-5.9-nano")

    def test_ignores_snapshots_and_special_purpose_variants(self):
        ids = ["gpt-5-nano-2025-08-07", "gpt-4o-mini-tts", "gpt-4o-mini-realtime-preview", "gpt-4o-mini"]
        self.assertIsNone(select_cheapest_chat_model(ids))

    def test_returns_none_for_empty_list(self):
        self.assertIsNone(select_cheapest_chat_model([]))

class FetchCheapestChatModelTest(unittest.TestCase):
    def _client(self, ids):
        return SimpleNamespace(models=SimpleNamespace(list=lambda: [SimpleNamespace(id=i) for i in ids]))

    def test_reads_ids_from_the_models_endpoint(self):
        self.assertEqual(fetch_cheapest_chat_model(self._client(AVAILABLE_MODELS)), "gpt-5-nano")

    def test_raises_when_nothing_qualifies(self):
        with self.assertRaises(RuntimeError):
            fetch_cheapest_chat_model(self._client(["text-embedding-3-large"]))

if __name__ == "__main__":
    unittest.main()
