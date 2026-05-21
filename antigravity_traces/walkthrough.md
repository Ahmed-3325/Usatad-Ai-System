# Refactoring main.py into an Agentic Workflow

I have successfully refactored your `main.py` to use a complete LangGraph StateMachine.

## What Was Done

1. **Integrated LangGraph**:
   - Created an `AgentState` typed dictionary to act as the shared memory for the workflow: storing `user_request`, `parsed_intent`, `matched_provider`, `final_quote`, and `status`.
   - Defined three distinct agent nodes:
     - `node_parse_intent`: Extracts structured intent (currently mocking "AC Technician").
     - `node_match_provider`: Takes the parsed intent and uses the 6-factor algorithm to score and filter from `providers.json`.
     - `node_calculate_pricing`: Processes the matched provider and intent to generate dynamic pricing.
   - Compiled the `StateGraph` linking all nodes linearly (`START` -> `parse_intent` -> `match_provider` -> `calculate_pricing` -> `END`).

2. **Unified Endpoint `/orchestrate`**:
   - Created a new POST endpoint `/orchestrate` that takes a user message.
   - It invokes the compiled `orchestrator_agent` with the message.
   - The endpoint returns a response that includes the full workflow trace (useful for debugging and showing the agent's "thought process" during a demo) as well as the final booking confirmation payload.

3. **CORS and Existing Endpoints**:
   - Added `CORSMiddleware` to allow seamless connection from your React Native Expo app.
   - Retained the `/update-status` and `/raise-dispute` endpoints unmodified to preserve lifecycle and dispute logic.

## How to Test

You can start the server locally by running:

```bash
fastapi dev main.py
# OR
uvicorn main:app --reload
```

Then you can test the new workflow by hitting the endpoint:

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/orchestrate' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "message": "AC bilkul kaam nahi kar raha, kal subah G-13 mein technician chahiye, budget zyada nahi hai."
}'
```

You should see a detailed response containing the `trace` of the LangGraph execution and the `booking_confirmation` details.
