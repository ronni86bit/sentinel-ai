import os
os.environ['GROQ_API_KEY'] = 'dummy'  # will cause error but we will not actually call model because verification will likely fail
# Instead we will test verification only; for generation we need to avoid actual API call.
# Let's just test verification integration by monkeypatching the model to avoid call.
from generation import GeminiGenerator
from verification import verify_evidence

class DummyChunk:
    def __init__(self, text, section_id):
        self.text = text
        self.metadata = {"section_id": section_id}

# Test case where verification should pass (good score, section, coverage)
chunks = [
    (DummyChunk("Before monsoon, clean storm drains and check embankments.", "FLOOD-2"), 0.9),
    (DummyChunk("Evacuate when water level exceeds danger mark.", "FLOOD-3"), 0.8),
]
query = "What should be done before monsoon to reduce flood risk?"
print("Verification result:", verify_evidence(chunks, query))

# Test case where verification should fail (low score)
chunks_low = [
    (DummyChunk("Irrelevant text.", "OTHER-1"), 0.05),
]
print("Verification low score:", verify_evidence(chunks_low, query))

# Test generation class instantiation (won't call API because we will not call gen)
try:
    gen = GeminiGenerator(api_key="dummy")
    print("GeminiGenerator created ( Groq wrapper )")
except Exception as e:
    print("Expected error on init due to missing real API:", e)