import importlib
import sys
import types
import unittest
from types import SimpleNamespace
from unittest import mock

class FakeAPIError(Exception):
    def __init__(self, message="", param=None):
        super().__init__(message)
        self.param = param

class FakeNotFoundError(FakeAPIError):
    pass

class FakeBadRequestError(FakeAPIError):
    pass

def load_pdf_agent_module():
    """Import utils.pdf_agent against stub dependencies, so the tests need no installed packages"""
    stubs = {
        "openai": SimpleNamespace(NotFoundError=FakeNotFoundError, BadRequestError=FakeBadRequestError, OpenAI=None),
        "pypdf": types.ModuleType("pypdf"),
        "tiktoken": types.ModuleType("tiktoken"),
    }
    with mock.patch.dict(sys.modules, stubs):
        sys.modules.pop("utils.pdf_agent", None)
        return importlib.import_module("utils.pdf_agent")

pdf_agent_module = load_pdf_agent_module()

def make_response(content):
    return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=content))])

class FakeClient:
    """Models list results and chat outcomes are consumed in order; an exception outcome is raised"""

    def __init__(self, model_lists, outcomes, can_embed=True):
        self.model_lists = list(model_lists)
        self.outcomes = list(outcomes)
        self.list_calls = 0
        self.create_calls = []
        self.models = SimpleNamespace(list=self._list_models)
        self.chat = SimpleNamespace(completions=SimpleNamespace(create=self._create))
        self.embeddings = SimpleNamespace(create=self._embed if can_embed else self._fail_to_embed)

    def _embed(self, **_):
        return SimpleNamespace(data=[SimpleNamespace(embedding=[1.0])])

    def _fail_to_embed(self, **_):
        raise RuntimeError("embeddings unavailable")

    def _list_models(self):
        self.list_calls += 1
        ids = self.model_lists.pop(0) if len(self.model_lists) > 1 else self.model_lists[0]
        return [SimpleNamespace(id=model_id) for model_id in ids]

    def _create(self, **kwargs):
        self.create_calls.append(kwargs)
        outcome = self.outcomes.pop(0)
        if isinstance(outcome, Exception):
            raise outcome
        return outcome

SYSTEM_EMBEDDING = [0.0]

def make_agent(client):
    agent = pdf_agent_module.PDFAgent.__new__(pdf_agent_module.PDFAgent)
    agent.client = client
    agent.chat_model = None
    agent.can_set_reasoning_effort = True
    agent.max_tokens = 10**6
    agent.tokenizer = SimpleNamespace(encode=lambda text: text.split())
    agent.messages = [{"role": "system", "content": "system prompt"}]
    agent.embeddings = [SYSTEM_EMBEDDING]
    return agent

class PDFAgentQueryTest(unittest.TestCase):
    def assert_history_restored(self, agent):
        self.assertEqual(agent.messages, [{"role": "system", "content": "system prompt"}])
        self.assertEqual(agent.embeddings, [SYSTEM_EMBEDDING])
        self.assertIs(agent.embeddings[0], SYSTEM_EMBEDDING)

    def test_selects_once_and_reuses_the_model(self):
        client = FakeClient([["gpt-5-nano", "gpt-5.4-nano"]], [make_response("one"), make_response("two")])
        agent = make_agent(client)

        self.assertEqual(agent.query("first"), "one")
        self.assertEqual(agent.query("second"), "two")

        self.assertEqual(client.list_calls, 1)
        self.assertEqual([call["model"] for call in client.create_calls], ["gpt-5-nano", "gpt-5-nano"])
        self.assertEqual(client.create_calls[0]["reasoning_effort"], pdf_agent_module.REASONING_EFFORT)
        self.assert_history_restored(agent)

    def test_reselects_once_when_the_model_is_retired(self):
        client = FakeClient(
            [["gpt-5-nano", "gpt-5.4-nano"], ["gpt-5.4-nano"]],
            [FakeNotFoundError("model_not_found"), make_response("answer")],
        )
        agent = make_agent(client)

        self.assertEqual(agent.query("question"), "answer")
        self.assertEqual(client.list_calls, 2)
        self.assertEqual([call["model"] for call in client.create_calls], ["gpt-5-nano", "gpt-5.4-nano"])
        self.assertEqual(agent.chat_model, "gpt-5.4-nano")

    def test_gives_up_after_one_retry(self):
        client = FakeClient([["gpt-5-nano"]], [FakeNotFoundError(), FakeNotFoundError()])
        agent = make_agent(client)

        self.assertIsNone(agent.query("question"))
        self.assertEqual(len(client.create_calls), 2)
        self.assert_history_restored(agent)

    def test_failed_selection_returns_failure_and_retries_next_query(self):
        client = FakeClient([["text-embedding-3-large"], ["gpt-5-nano"]], [make_response("answer")])
        agent = make_agent(client)

        self.assertIsNone(agent.query("question"))
        self.assertIsNone(agent.chat_model)
        self.assertEqual(client.create_calls, [])
        self.assert_history_restored(agent)

        self.assertEqual(agent.query("question"), "answer")
        self.assertEqual(client.list_calls, 2)

    def test_drops_reasoning_effort_when_the_model_rejects_it(self):
        client = FakeClient(
            [["gpt-4.1-nano"]],
            [FakeBadRequestError("unsupported_parameter", param="reasoning_effort"), make_response("one"), make_response("two")],
        )
        agent = make_agent(client)

        self.assertEqual(agent.query("first"), "one")
        self.assertEqual(agent.query("second"), "two")

        self.assertIn("reasoning_effort", client.create_calls[0])
        self.assertNotIn("reasoning_effort", client.create_calls[1])
        self.assertNotIn("reasoning_effort", client.create_calls[2])

    def test_does_not_retry_other_bad_requests(self):
        client = FakeClient([["gpt-5-nano"]], [FakeBadRequestError("context_length_exceeded", param="messages")])
        agent = make_agent(client)

        self.assertIsNone(agent.query("question"))
        self.assertEqual(len(client.create_calls), 1)
        self.assertTrue(agent.can_set_reasoning_effort)
        self.assert_history_restored(agent)

    def test_reselecting_restores_reasoning_effort(self):
        client = FakeClient(
            [["gpt-4.1-nano"], ["gpt-5-nano"]],
            [
                FakeBadRequestError(param="reasoning_effort"),
                FakeNotFoundError(),
                make_response("answer"),
            ],
        )
        agent = make_agent(client)

        self.assertEqual(agent.query("question"), "answer")
        self.assertEqual(client.create_calls[-1]["model"], "gpt-5-nano")
        self.assertIn("reasoning_effort", client.create_calls[-1])

    def test_failed_embedding_keeps_the_system_embedding(self):
        client = FakeClient([["gpt-5-nano"]], [make_response("answer")], can_embed=False)
        agent = make_agent(client)

        self.assertEqual(agent.query("question"), "answer")
        self.assert_history_restored(agent)

    def test_empty_answer_counts_as_failure(self):
        client = FakeClient([["gpt-5-nano"]], [make_response(None), make_response("")])
        agent = make_agent(client)

        self.assertIsNone(agent.query("first"))
        self.assertIsNone(agent.query("second"))
        self.assert_history_restored(agent)

    def test_recognizes_reasoning_effort_rejection_without_param(self):
        client = FakeClient(
            [["gpt-4.1-nano"]],
            [FakeBadRequestError("Unsupported parameter: 'reasoning_effort'"), make_response("answer")],
        )
        agent = make_agent(client)

        self.assertEqual(agent.query("question"), "answer")
        self.assertFalse(agent.can_set_reasoning_effort)

    def test_context_trimming_does_not_remove_the_system_message(self):
        client = FakeClient([["gpt-5-nano"]], [make_response("answer")])
        agent = make_agent(client)
        agent.max_tokens = 3  # "system prompt" is 2 tokens, so adding the query forces trimming

        self.assertEqual(agent.query("a long question"), "answer")
        self.assert_history_restored(agent)

if __name__ == "__main__":
    unittest.main()
