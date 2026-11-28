import asyncio
import os
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient
from google.genai import types

from app.config import Settings
from app.main import app
from app.schemas import ChatMessage
from app.services import gemini_service


def make_transport_exception(module_name, class_name):
    exception_type = type(class_name, (Exception,), {'__module__': module_name})
    return exception_type('synthetic transport failure')


class ChatApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_endpoint(self):
        response = self.client.get('/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': 'ok'})

    def test_chat_returns_successful_gemini_reply(self):
        generate = AsyncMock(return_value='Jaison is studying for an MCA.')
        with patch('app.main.generate_reply', generate):
            response = self.client.post('/api/chat', json={'message': 'Tell me about his education'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'reply': 'Jaison is studying for an MCA.'})
        generate.assert_awaited_once()

    def test_gemini_sdk_receives_history_and_returns_reply(self):
        captured = {}

        class FakeModels:
            def generate_content(self, *, model, contents, config):
                captured.update(model=model, contents=contents, config=config)
                return type('Response', (), {'text': "Jaison's project used Django."})()

        class FakeClient:
            def __init__(self, *, api_key):
                if api_key != 'test-key':
                    raise AssertionError('Unexpected test API key')
                self.models = FakeModels()

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        history = [
            ChatMessage(role='user', content='Tell me about his project.'),
            ChatMessage(role='assistant', content='The portfolio lists a hostel system.'),
        ]
        with patch.object(gemini_service.genai, 'Client', FakeClient):
            reply = asyncio.run(gemini_service.generate_reply(
                'What framework?', history, Settings(gemini_api_key='test-key')
            ))

        self.assertEqual(reply, "Jaison's project used Django.")
        self.assertEqual(captured['model'], 'gemini-4-hydrogen')
        self.assertEqual([turn.role for turn in captured['contents']], ['user', 'model', 'user'])
        self.assertEqual(captured['contents'][-1].parts[0].text, 'What framework?')
        self.assertIn('Do not invent', captured['config'].system_instruction)
        self.assertEqual(captured['config'].http_options.timeout, gemini_service.GEMINI_TIMEOUT_MS)
        self.assertEqual(captured['config'].max_output_tokens, gemini_service.MAX_OUTPUT_TOKENS)
        self.assertEqual(captured['config'].thinking_config.thinking_level, types.ThinkingLevel.LOW)

    def test_primary_model_success_does_not_call_fallback(self):
        calls = []

        class FakeModels:
            def generate_content(self, *, model, contents, config):
                calls.append((model, contents, config))
                return type('Response', (), {'text': 'Primary answer.'})()

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = FakeModels()

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        settings = Settings(
            gemini_api_key='test-key',
            gemini_model='primary-model',
            gemini_fallback_model='fallback-model',
        )
        with patch.object(gemini_service.genai, 'Client', FakeClient):
            reply = asyncio.run(gemini_service.generate_reply('Hello', [], settings))

        self.assertEqual(reply, 'Primary answer.')
        self.assertEqual([call[0] for call in calls], ['primary-model'])

    def test_primary_503_uses_fallback_once_with_same_prompt_and_history(self):
        from google.genai.errors import ServerError

        calls = []

        class FakeModels:
            def generate_content(self, *, model, contents, config):
                calls.append((model, contents, config))
                if model == 'primary-model':
                    raise ServerError(503, {'error': {'message': 'high demand'}})
                return type('Response', (), {'text': 'Fallback answer.'})()

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = FakeModels()

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        history = [ChatMessage(role='user', content='Earlier question')]
        settings = Settings(
            gemini_api_key='test-key',
            gemini_model='primary-model',
            gemini_fallback_model='fallback-model',
        )
        with patch.object(gemini_service.genai, 'Client', FakeClient), patch.object(
            gemini_service.time, 'sleep'
        ):
            reply = asyncio.run(gemini_service.generate_reply('Follow-up', history, settings))

        self.assertEqual(reply, 'Fallback answer.')
        self.assertEqual([call[0] for call in calls], [
            'primary-model', 'primary-model', 'primary-model', 'fallback-model',
        ])
        self.assertEqual(calls[-1][1], calls[0][1])
        self.assertEqual(calls[-1][2].system_instruction, calls[0][2].system_instruction)
        self.assertEqual(calls[-1][1][0].parts[0].text, 'Earlier question')

    def test_primary_503_then_httpx2_timeout_retries_then_uses_fallback(self):
        from google.genai.errors import ServerError

        calls = []
        primary_errors = [
            ServerError(503, {'error': {'message': 'temporary'}}),
            make_transport_exception('httpx2', 'ReadTimeout'),
            make_transport_exception('httpx2', 'ReadTimeout'),
        ]

        class FakeModels:
            def generate_content(self, *, model, **_kwargs):
                calls.append(model)
                if model == 'primary-model':
                    raise primary_errors.pop(0)
                return type('Response', (), {'text': 'Recovered through fallback.'})()

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = FakeModels()

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        settings = Settings(
            gemini_api_key='test-key',
            gemini_model='primary-model',
            gemini_fallback_model='fallback-model',
        )
        with patch.object(gemini_service.genai, 'Client', FakeClient), patch.object(
            gemini_service.time, 'sleep'
        ), self.assertLogs('app.services.gemini_service', level='INFO') as captured:
            reply = asyncio.run(gemini_service.generate_reply('Hello', [], settings))

        self.assertEqual(reply, 'Recovered through fallback.')
        self.assertEqual(calls, [
            'primary-model', 'primary-model', 'primary-model', 'fallback-model',
        ])
        logs = '\n'.join(captured.output)
        self.assertIn('Primary Gemini model exhausted retries', logs)
        self.assertIn('Starting fallback Gemini model: model=fallback-model', logs)
        self.assertIn('Fallback Gemini model succeeded: model=fallback-model', logs)

    def test_primary_httpx_timeout_exhaustion_uses_fallback_success(self):
        calls = []

        class FakeModels:
            def generate_content(self, *, model, **_kwargs):
                calls.append(model)
                if model == 'primary-model':
                    raise make_transport_exception('httpx', 'ReadTimeout')
                return type('Response', (), {'text': 'Recovered after timeout.'})()

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = FakeModels()

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        settings = Settings(
            gemini_api_key='test-key',
            gemini_model='primary-model',
            gemini_fallback_model='fallback-model',
        )
        with patch.object(gemini_service.genai, 'Client', FakeClient), patch.object(
            gemini_service.time, 'sleep'
        ):
            reply = asyncio.run(gemini_service.generate_reply('Hello', [], settings))

        self.assertEqual(reply, 'Recovered after timeout.')
        self.assertEqual(calls, [
            'primary-model', 'primary-model', 'primary-model', 'fallback-model',
        ])

    def test_httpx2_connection_errors_are_transient(self):
        for module_name in ('httpx', 'httpx2'):
            for class_name in ('ConnectError', 'NetworkError'):
                with self.subTest(module=module_name, class_name=class_name):
                    error = make_transport_exception(module_name, class_name)
                    self.assertTrue(gemini_service._is_retryable_provider_error(error, None))

    def test_primary_and_fallback_failure_raises_service_error(self):
        from google.genai.errors import ServerError

        calls = []

        class FakeModels:
            def generate_content(self, *, model, **_kwargs):
                calls.append(model)
                raise ServerError(503, {'error': {'message': 'high demand'}})

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = FakeModels()

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        settings = Settings(
            gemini_api_key='test-key',
            gemini_model='primary-model',
            gemini_fallback_model='fallback-model',
        )
        with patch.object(gemini_service.genai, 'Client', FakeClient), patch.object(
            gemini_service.time, 'sleep'
        ), self.assertLogs('app.services.gemini_service', level='ERROR') as captured:
            with self.assertRaises(gemini_service.GeminiServiceError):
                asyncio.run(gemini_service.generate_reply('Hello', [], settings))

        self.assertEqual(calls, [
            'primary-model', 'primary-model', 'primary-model', 'fallback-model',
        ])
        self.assertIn('Fallback Gemini model failed', '\n'.join(captured.output))
        self.assertIn('request failed', '\n'.join(captured.output))

    def test_empty_gemini_response_retries_once_then_returns_fallback(self):
        class FakeModels:
            calls = 0

            def generate_content(self, **_kwargs):
                self.calls += 1
                return type('Response', (), {'text': None, 'candidates': []})()

        models = FakeModels()

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = models

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        with patch.object(gemini_service.genai, 'Client', FakeClient):
            reply = asyncio.run(gemini_service.generate_reply(
                'Hello', [], Settings(gemini_api_key='test-key')
            ))

        self.assertEqual(models.calls, 2)
        self.assertEqual(reply, gemini_service.EMPTY_RESPONSE_FALLBACK)

    def test_blocked_gemini_response_returns_safe_fallback_without_retry(self):
        from google.genai import types

        class FakeModels:
            calls = 0

            def generate_content(self, **_kwargs):
                self.calls += 1
                return type('Response', (), {
                    'text': None,
                    'candidates': [],
                    'prompt_feedback': type('PromptFeedback', (), {
                        'block_reason': types.BlockedReason.SAFETY,
                    })(),
                })()
        models = FakeModels()

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = models

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        with patch.object(gemini_service.genai, 'Client', FakeClient):
            reply = asyncio.run(gemini_service.generate_reply(
                'Hello', [], Settings(gemini_api_key='test-key')
            ))

        self.assertEqual(models.calls, 1)
        self.assertEqual(reply, gemini_service.BLOCKED_RESPONSE_FALLBACK)

    def test_max_token_response_returns_concise_fallback(self):
        from google.genai import types

        class FakeModels:
            def generate_content(self, **_kwargs):
                candidate = type('Candidate', (), {'finish_reason': types.FinishReason.MAX_TOKENS})()
                return type('Response', (), {
                    'text': 'Partial answer',
                    'candidates': [candidate],
                    'prompt_feedback': None,
                })()

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = FakeModels()

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        with patch.object(gemini_service.genai, 'Client', FakeClient):
            reply = asyncio.run(gemini_service.generate_reply(
                'Hello', [], Settings(gemini_api_key='test-key')
            ))
        self.assertEqual(reply, gemini_service.MAX_TOKENS_FALLBACK)

    def test_primary_max_tokens_uses_fallback_with_same_context(self):
        from google.genai import types

        calls = []

        class FakeModels:
            def generate_content(self, *, model, contents, config):
                calls.append((model, contents, config))
                if model == 'primary-model':
                    candidate = type('Candidate', (), {
                        'finish_reason': types.FinishReason.MAX_TOKENS,
                    })()
                    usage = type('Usage', (), {
                        'thoughts_token_count': 1190,
                        'candidates_token_count': 10,
                    })()
                    return type('Response', (), {
                        'text': 'Do not return this partial response.',
                        'candidates': [candidate],
                        'usage_metadata': usage,
                    })()
                return type('Response', (), {'text': 'Jaison is a Python Django Developer.'})()

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = FakeModels()

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        history = [ChatMessage(role='user', content='What is his current role?')]
        settings = Settings(
            gemini_api_key='test-key',
            gemini_model='primary-model',
            gemini_fallback_model='fallback-model',
        )
        with patch.object(gemini_service.genai, 'Client', FakeClient), self.assertLogs(
            'app.services.gemini_service', level='WARNING'
        ) as captured:
            reply = asyncio.run(gemini_service.generate_reply('What does Jaison do?', history, settings))

        self.assertEqual(reply, 'Jaison is a Python Django Developer.')
        self.assertNotIn('partial response', reply)
        self.assertEqual([call[0] for call in calls], ['primary-model', 'fallback-model'])
        self.assertEqual(calls[0][1], calls[1][1])
        self.assertEqual(calls[0][1][0].parts[0].text, history[0].content)
        self.assertEqual(calls[0][2].system_instruction, calls[1][2].system_instruction)
        logs = '\n'.join(captured.output)
        self.assertIn('model=primary-model', logs)
        self.assertIn('candidate_count=1', logs)
        self.assertIn("finish_reasons=['MAX_TOKENS']", logs)
        self.assertIn(f'max_output_tokens={gemini_service.MAX_OUTPUT_TOKENS}', logs)
        self.assertIn('thoughts_tokens=1190', logs)

    def test_both_models_max_tokens_return_safe_fallback(self):
        from google.genai import types

        calls = []

        class FakeModels:
            def generate_content(self, *, model, **_kwargs):
                calls.append(model)
                candidate = type('Candidate', (), {
                    'finish_reason': types.FinishReason.MAX_TOKENS,
                })()
                return type('Response', (), {
                    'text': 'Truncated and must not be returned.',
                    'candidates': [candidate],
                })()

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = FakeModels()

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        settings = Settings(
            gemini_api_key='test-key',
            gemini_model='primary-model',
            gemini_fallback_model='fallback-model',
        )
        with patch.object(gemini_service.genai, 'Client', FakeClient), self.assertLogs(
            'app.services.gemini_service', level='ERROR'
        ) as captured:
            reply = asyncio.run(gemini_service.generate_reply('What does Jaison do?', [], settings))

        self.assertEqual(reply, gemini_service.MAX_TOKENS_FALLBACK)
        self.assertNotIn('Truncated', reply)
        self.assertEqual(calls, ['primary-model', 'fallback-model'])
        self.assertIn('Both Gemini models reached MAX_TOKENS', '\n'.join(captured.output))

    def test_transient_503_recovers_with_exponential_backoff(self):
        from google.genai.errors import ServerError

        class FakeModels:
            calls = 0

            def generate_content(self, **_kwargs):
                self.calls += 1
                if self.calls < 3:
                    raise ServerError(503, {'error': {'message': 'high demand'}})
                return type('Response', (), {'text': 'Jaison is studying computer science.'})()

        models = FakeModels()

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = models

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        with patch.object(gemini_service.genai, 'Client', FakeClient), patch.object(
            gemini_service.time, 'sleep'
        ) as sleep:
            reply = asyncio.run(gemini_service.generate_reply(
                'Tell me about his education', [], Settings(gemini_api_key='test-key')
            ))

        self.assertEqual(reply, 'Jaison is studying computer science.')
        self.assertEqual(models.calls, 3)
        self.assertEqual([call.args[0] for call in sleep.call_args_list], [0.5, 1.0])

    def test_transient_503_exhausts_bounded_retries(self):
        from google.genai.errors import ServerError

        class FakeModels:
            calls = 0

            def generate_content(self, **_kwargs):
                self.calls += 1
                raise ServerError(503, {'error': {'message': 'high demand'}})

        models = FakeModels()

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = models

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        with patch.object(gemini_service.genai, 'Client', FakeClient), patch.object(
            gemini_service.time, 'sleep'
        ) as sleep:
            with self.assertRaises(gemini_service.GeminiServiceError):
                asyncio.run(gemini_service.generate_reply(
                    'Hello', [], Settings(gemini_api_key='test-key', gemini_fallback_model=None)
                ))

        self.assertEqual(models.calls, gemini_service.MAX_PROVIDER_ATTEMPTS)
        self.assertEqual([call.args[0] for call in sleep.call_args_list], [0.5, 1.0])

    def test_permanent_gemini_client_error_is_not_retried(self):
        from google.genai.errors import ClientError

        class FakeModels:
            calls = 0

            def generate_content(self, **_kwargs):
                self.calls += 1
                raise ClientError(400, {'error': {'message': 'invalid request'}})

        models = FakeModels()

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = models

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        with patch.object(gemini_service.genai, 'Client', FakeClient), patch.object(
            gemini_service.time, 'sleep'
        ) as sleep:
            with self.assertRaises(gemini_service.GeminiServiceError):
                asyncio.run(gemini_service.generate_reply(
                    'Hello', [], Settings(gemini_api_key='test-key')
                ))
        self.assertEqual(models.calls, 1)
        sleep.assert_not_called()

    def test_provider_error_returns_safe_502_detail(self):
        async def provider_failed(*_args, **_kwargs):
            raise gemini_service.GeminiServiceError

        with patch('app.main.generate_reply', provider_failed):
            response = self.client.post('/api/chat', json={'message': 'Hello'})
        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.json()['detail'], 'The AI assistant is temporarily unavailable. Please try again shortly.')
        self.assertNotIn('API key', response.text)

    def test_sdk_error_diagnostics_omit_api_key_and_provider_message(self):
        test_key = 'test-only-dummy-gemini-key'

        class FakeAPIError(Exception):
            code = 403
            status_code = 403
            message = f'Permission denied for key={test_key}'

        class FakeModels:
            def generate_content(self, **_kwargs):
                raise FakeAPIError()

        class FakeClient:
            def __init__(self, **_kwargs):
                self.models = FakeModels()

            def __enter__(self):
                return self

            def __exit__(self, *_args):
                return False

        with patch.object(gemini_service.genai, 'Client', FakeClient):
            with self.assertLogs('app.services.gemini_service', level='ERROR') as captured:
                with self.assertRaises(gemini_service.GeminiServiceError):
                    asyncio.run(gemini_service.generate_reply(
                        'Hello', [], Settings(gemini_api_key=test_key)
                    ))

        diagnostic = '\n'.join(captured.output)
        self.assertIn('FakeAPIError', diagnostic)
        self.assertIn('provider_code=403', diagnostic)
        self.assertNotIn('Permission denied', diagnostic)
        self.assertNotIn(test_key, diagnostic)

    def test_follow_up_passes_recent_history_to_gemini(self):
        generate = AsyncMock(return_value='The resume lists SQLite for that project.')
        history = [
            {'role': 'user', 'content': 'Tell me about the loan project.'},
            {'role': 'assistant', 'content': 'It is a Django loan tracking project.'},
        ]
        with patch('app.main.generate_reply', generate):
            response = self.client.post('/api/chat', json={'message': 'Which database?', 'history': history})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(generate.await_args.args[1][0].content, history[0]['content'])
        self.assertEqual(generate.await_args.args[1][1].role, 'assistant')

    def test_missing_api_key_returns_503(self):
        async def missing_key(*_args, **_kwargs):
            raise gemini_service.MissingGeminiAPIKey

        with patch('app.main.generate_reply', missing_key):
            response = self.client.post('/api/chat', json={'message': 'Hello'})
        self.assertEqual(response.status_code, 503)
        self.assertIn('GEMINI_API_KEY', response.json()['detail'])

    def test_gemini_service_rejects_missing_api_key(self):
        with self.assertRaises(gemini_service.MissingGeminiAPIKey):
            asyncio.run(gemini_service.generate_reply('Hello', [], Settings(gemini_api_key=None)))

    def test_empty_message_is_rejected(self):
        for message in ('', '   '):
            with self.subTest(message=message):
                response = self.client.post('/api/chat', json={'message': message})
                self.assertEqual(response.status_code, 422)

    def test_message_and_history_limits_are_enforced(self):
        long_message = self.client.post('/api/chat', json={'message': 'x' * 2001})
        too_much_history = self.client.post('/api/chat', json={
            'message': 'Follow up',
            'history': [{'role': 'user', 'content': f'Turn {i}'} for i in range(13)],
        })
        self.assertEqual(long_message.status_code, 422)
        self.assertEqual(too_much_history.status_code, 422)

    def test_gemini_failure_returns_helpful_502(self):
        async def failed(*_args, **_kwargs):
            raise gemini_service.GeminiServiceError

        with patch('app.main.generate_reply', failed):
            response = self.client.post('/api/chat', json={'message': 'Hello'})
        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.json()['detail'], 'The AI assistant is temporarily unavailable. Please try again shortly.')
        self.assertNotIn('Traceback', response.text)

    def test_unsupported_personal_questions_return_200_without_gemini(self):
        questions = (
            "What is Jaison's current salary?",
            "What is his notice period?",
            "What is Jaison's date of birth?",
        )
        expected = gemini_service.UNDOCUMENTED_PERSONAL_INFO_REPLY
        for question in questions:
            with self.subTest(question=question):
                with patch.object(gemini_service.genai, 'Client') as gemini_client:
                    response = self.client.post('/api/chat', json={'message': question})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()['reply'], expected)
                gemini_client.assert_not_called()

    def test_valid_gemini_missing_information_reply_returns_200(self):
        reply = "That information is not currently provided in Jaison's portfolio."
        with patch('app.main.generate_reply', AsyncMock(return_value=reply)):
            response = self.client.post('/api/chat', json={'message': 'What is his hobby?'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['reply'], reply)

    def test_cors_allows_local_and_production_origins(self):
        for origin in ('http://localhost:5500', 'https://jaisongeorge04.github.io'):
            with self.subTest(origin=origin):
                response = self.client.options('/api/chat', headers={
                    'Origin': origin,
                    'Access-Control-Request-Method': 'POST',
                })
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.headers['access-control-allow-origin'], origin)

        denied = self.client.options('/api/chat', headers={
            'Origin': 'https://example.com',
            'Access-Control-Request-Method': 'POST',
        })
        self.assertNotIn('access-control-allow-origin', denied.headers)


    def test_proxy_diagnostic_omits_proxy_credentials(self):
        with patch.dict(os.environ, {
            'HTTPS_PROXY': 'http://proxy-user:proxy-password@127.0.0.1:8765',
        }, clear=True):
            diagnostic = gemini_service._proxy_diagnostic()

        self.assertEqual(diagnostic, 'proxy_route=loopback:8765')
        self.assertNotIn('proxy-password', diagnostic)
if __name__ == '__main__':
    unittest.main()
