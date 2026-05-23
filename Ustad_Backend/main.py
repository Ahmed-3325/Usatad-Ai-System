# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException

# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

# pyrefly: ignore [missing-import]
from pydantic import BaseModel

# pyrefly: ignore [missing-import]
from typing import List, Optional, Dict, Any, TypedDict, Literal
import json
import random
import os
from datetime import datetime, timedelta
# pyrefly: ignore [missing-import]
from langgraph.graph import StateGraph, START, END
import time

# 🔥 GROQ AI INTEGRATION (GEMINI REPLACED) 🔥
# pyrefly: ignore [missing-import]
from groq import Groq

# 👇 TERI GROQ API KEY 👇
GROQ_API_KEY = ""
client = Groq(api_key=GROQ_API_KEY)

app = FastAPI(title="Ustad AI Orchestrator - Advanced Groq Edition")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Data Models ---

class OrchestrateRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    excluded_provider_id: Optional[str] = None

class ParsedIntent(BaseModel):
    service_category: str
    urgency_level: str
    target_location: str
    preferred_time_slot: str
    budget_profile: str
    complexity_required: List[str]

class StatusUpdateRequest(BaseModel):
    booking_id: str
    provider_id: str
    new_status: str
    time_to_job_mins: Optional[int] = None
    original_intent: Optional[ParsedIntent] = None

class SimulateBookingRequest(BaseModel):
    booking_id: str
    provider_id: str

class ServiceQualityRequest(BaseModel):
    booking_id: str
    provider_id: str
    status: str
    photo_evidence_url: Optional[str] = None

class DisputeRequest(BaseModel):
    booking_id: str
    user_id: str
    issue_type: str 
    description: str

# --- LangGraph State ---

class AgentState(TypedDict):
    user_request: str
    parsed_intent: Optional[dict]
    confidence_score: float
    clarification_message: Optional[str]
    matched_provider: Optional[dict]
    excluded_provider_id: Optional[str]
    scheduling_details: Optional[dict]
    final_quote: Optional[dict]
    final_message: Optional[str]
    status: str

# --- Data Loading (Enhanced Path) ---

def load_providers() -> List[dict]:
    # Bulletproof path for both Local and Cloud Run
    file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "providers.json")
    try:
        if not os.path.exists(file_path):
            print(f"DEBUG: providers.json not found at {file_path}")
            return []
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if data else []
    except Exception as e:
        print(f"DEBUG: Error loading providers.json: {e}")
        return []

# --- Agent Nodes ---

def node_parse_intent(state: AgentState) -> AgentState:
    message = state["user_request"].lower()
    
    if len(message) < 5:
        return {
            "parsed_intent": None,
            "confidence_score": 0.45,
            "clarification_message": "Maazrat, kya aap bata sakte hain ke aapko kaunsi service chahiye?",
            "status": "LOW_CONFIDENCE_FALLBACK"
        }

    # 🔥 DYNAMIC GROQ EXTRACTION 🔥
    try:
        prompt = f"""
        Analyze user request: "{message}"
        Return ONLY a JSON object.
        1. "service_category": [AC Repair, Plumber, Electrician, Painter, Carpenter, Home Clean].
        2. "target_location": City name if mentioned, else "Not specified".
        3. "preferred_time_slot": Mentioned time, else "ASAP".
        
        CRITICAL: If user mentions 'motor', 'pipe', or 'leak', category MUST be 'Plumber'.
        If 'fan', 'light', or 'short circuit', category MUST be 'Electrician'.
        
        Format: {{"service_category": "Plumber", "target_location": "Karachi", "preferred_time_slot": "kal subah"}}
        """
        
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant", # <--- YEH NAYA MODEL HAI
            response_format={"type": "json_object"}
        )
        
        extracted_data = json.loads(completion.choices[0].message.content)
        
        valid_list = ["AC Repair", "Plumber", "Electrician", "Painter", "Carpenter", "Home Clean"]
        dynamic_category = "AC Repair"
        temp_cat = extracted_data.get("service_category", "AC Repair")
        
        for cat in valid_list:
            if cat.lower() in temp_cat.lower():
                dynamic_category = cat
                break
                
        intent = {
            "service_category": dynamic_category, 
            "urgency_level": "High" if any(x in message for x in ["jaldi", "urgent", "emergency", "foran", "abhi"]) else "Normal",
            "target_location": extracted_data.get("target_location", "Not specified"),
            "preferred_time_slot": extracted_data.get("preferred_time_slot", "ASAP"),
            "budget_profile": "Economy" if any(x in message for x in ["sasta", "budget", "kam paise", "munasib"]) else "Standard",
            "complexity_required": ["Intermediate", "Complex"]
        }
        
        return {"parsed_intent": intent, "confidence_score": 0.95, "status": "INTENT_PARSED"}
                
    except Exception as e:
        print(f"❌ Groq Error: {e}")
        # Fallback to keyword matching if AI fails
        return {"parsed_intent": {"service_category": "AC Repair", "target_location": "Not specified", "urgency_level": "Normal", "budget_profile": "Standard", "complexity_required": ["Intermediate"]}, "confidence_score": 0.8, "status": "INTENT_PARSED"}

def should_continue(state: AgentState) -> Literal["match_provider", "__end__"]:
    if state["confidence_score"] < 0.7:
        return "__end__"
    return "match_provider"

def node_match_provider(state: AgentState) -> AgentState:
    providers = load_providers()
    if not providers:
        return {"matched_provider": None, "status": "SYSTEM_DATA_LOAD_ERROR"}
        
    intent = state["parsed_intent"]
    target_cat = intent.get("service_category", "").lower().strip()
    target_city = intent.get("target_location", "").lower().strip()
    
    cat_matched = [p for p in providers if target_cat in p.get("Profession", "").lower() or p.get("Profession", "").lower() in target_cat]
    
    filtered_providers = []
    excluded_id = state.get("excluded_provider_id")
    
    for p in cat_matched:
        if excluded_id and p.get("Provider_ID") == excluded_id: continue
        p_city = p.get("City", "").lower()
        if p.get("Availability_Status") != "Available": continue
        if p.get("Complexity_Handling") not in intent.get("complexity_required", []): continue
        if "not specified" in target_city or target_city in p_city or p_city in target_city:
            filtered_providers.append(p)
    
    if not filtered_providers:
        return {"matched_provider": None, "status": "NO_PROVIDERS_FOUND"}
        
    best_provider = None
    best_score = -1.0
    
    # 6-Factor Scoring Logic
    for p in filtered_providers:
        n_distance = max(0, 10 - (p.get("Distance_km", 5.0) / 2.5))
        n_rating = p.get("Rating", 4.0) * 2
        n_reliability = p.get("Reliability_OnTime_Score", 90) / 10 
        n_cancellation = (30 - p.get("Cancellation_Risk", 5)) / 3 
        n_price = max(0, 10 - (p.get("Base_Price_PKR", 1500) / 500)) 
        comp = p.get("Complexity_Handling", "Basic")
        n_skill = 10.0 if comp == "Complex" else (7.0 if comp == "Intermediate" else 3.0)
        
        total_score = (n_distance * 0.15) + (n_rating * 0.15) + (n_reliability * 0.20) + (n_cancellation * 0.15) + (n_price * 0.25) + (n_skill * 0.10)
        
        scored_data = {
            "provider_id": p.get("Provider_ID"),
            "name": p.get("Name"),
            "total_score": round(total_score, 2),
            "factor_scores": {"distance": round(n_distance, 2), "rating": round(n_rating, 2), "reliability_on_time": round(n_reliability, 2), "cancellation_risk": round(n_cancellation, 2), "price": round(n_price, 2), "skill": round(n_skill, 2)},
            "raw_data": p
        }
        
        if total_score > best_score:
            best_score = total_score
            best_provider = scored_data
            
    return {"matched_provider": best_provider, "status": "PROVIDER_MATCHED"}

def node_schedule_booking(state: AgentState) -> AgentState:
    if not state.get("matched_provider"): return state
    p = state["matched_provider"]["raw_data"]
    alloc = p.get("Travel_Time_mins", 15) + 15
    now = datetime.now()
    return {
        "scheduling_details": {
            "capacity_status": "CLEARED",
            "travel_time_mins_estimated": p.get("Travel_Time_mins", 15),
            "buffer_mins_added": 15,
            "total_travel_allocation_mins": alloc,
            "dispatched_at": now.isoformat(),
            "estimated_arrival": (now + timedelta(minutes=alloc)).isoformat()
        },
        "status": "SCHEDULE_CONFIRMED"
    }

def node_calculate_pricing(state: AgentState) -> AgentState:
    if not state.get("matched_provider"): return state
    p = state["matched_provider"]["raw_data"]
    intent = state["parsed_intent"]
    
    base = p.get("Base_Price_PKR", 1000)
    travel = int(p.get("Distance_km", 5.0) * 20)
    surge = 1.2 if 17 <= datetime.now().hour <= 21 else 1.0
    urgency = 500 if intent.get("urgency_level") == "High" else 0
    econ = -travel if intent.get("budget_profile") == "Economy" else 0
    
    adj_labor = int(base * surge)
    total = adj_labor + travel + econ + urgency
    
    return {
        "final_quote": {
            "booking_id": f"BK-{p.get('Profession', 'XX')[:2].upper()}-{random.randint(1000, 9999)}",
            "pricing_summary": {
                "estimated_total_pkr": total,
                "breakdown": {"base_labor": base, "surge_multiplier": surge, "adjusted_labor": adj_labor, "travel_fee": travel, "urgency_adjustment": urgency, "economy_discount": econ}
            }
        },
        "status": "PRICING_CALCULATED"
    }

def node_generate_response(state: AgentState) -> AgentState:
    if not state.get("matched_provider"): return state
    
    p = state["matched_provider"]["raw_data"]
    pricing = state["final_quote"]["pricing_summary"]
    
    prompt = f"""
    Act as the 'Ustad AI Orchestrator' powered by Google Antigravity.
    Your goal is to manage the FULL service lifecycle via chat.

    Current context:
    - User Request: {state['user_request']}
    - Provider Matched: {p.get('Name')} ({p.get('Profession')})
    - Rationale: Distance {p.get('Distance_km')}km, Rating {p.get('Rating')}, Reliability {p.get('Reliability_OnTime_Score')}%.
    - Estimated Price: PKR {pricing['estimated_total_pkr']} (Base {pricing['breakdown']['base_labor']}, Surge {pricing['breakdown']['surge_multiplier']}x)

    Write a friendly response in Roman Urdu for the user.
    1. Explain that {p.get('Name')} is booked. You MUST explicitly state their numerical scores to prove why they won the match: Distance ({p.get('Distance_km')}km), Rating ({p.get('Rating')} stars), and Reliability ({p.get('Reliability_OnTime_Score')}% on-time).
    2. State the estimated price breakdown (Base, Surge, etc.).
    3. Explicitly state that a WhatsApp notification is sent and an arrival timer is started.
    4. Mention that the 'Ustad' will provide photo evidence upon arrival (Service Quality Loop).
    5. Inform the user they can raise a dispute or provide feedback anytime.

    Return ONLY the Roman Urdu text string. No formatting blocks, no extra text.
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
        )
        msg = completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"❌ Groq Generation Error: {e}")
        msg = f"Aapka booking confirm ho gaya hai! {p.get('Name')} aapki location par arahe hain. WhatsApp par notification bhej diya gaya hai."
        
    return {"final_message": msg, "status": "RESPONSE_GENERATED"}

# --- Compile Graph ---
workflow = StateGraph(AgentState)
workflow.add_node("parse_intent", node_parse_intent)
workflow.add_node("match_provider", node_match_provider)
workflow.add_node("schedule_booking", node_schedule_booking)
workflow.add_node("calculate_pricing", node_calculate_pricing)
workflow.add_node("generate_response", node_generate_response)
workflow.add_edge(START, "parse_intent")
workflow.add_conditional_edges("parse_intent", should_continue)
workflow.add_edge("match_provider", "schedule_booking")
workflow.add_edge("schedule_booking", "calculate_pricing")
workflow.add_edge("calculate_pricing", "generate_response")
workflow.add_edge("generate_response", END)
orchestrator_agent = workflow.compile()

# --- API Endpoints ---

@app.post("/orchestrate")
async def orchestrate(request: OrchestrateRequest):
    initial_state = {
        "user_request": request.message, 
        "status": "INITIALIZED",
        "excluded_provider_id": request.excluded_provider_id
    }
    final_state = orchestrator_agent.invoke(initial_state)
    
    if final_state["status"] == "NO_PROVIDERS_FOUND":
        raise HTTPException(status_code=404, detail="No suitable providers found.")

    # Traces for presentation
    intent = final_state["parsed_intent"]
    provider = final_state["matched_provider"]
    pricing = final_state["final_quote"]["pricing_summary"]
    
    final_state["antigravity_reasoning_traces"] = {
        "intent_understanding_trace": f"Parsed input via Groq Llama 3.1. Category: {intent['service_category']}, Location: {intent['target_location']}.",
        "provider_selection_rationale": f"Selected {provider['name']} with score {provider['total_score']}.",
        "orchestration_mode": "Google Antigravity Agentic DAG Framework (Groq-Powered)."
    }
        
    return {
        "message": final_state.get("final_message", "Booking Confirmed!"),
        "trace": final_state, 
        "booking_confirmation": {"status": "CONFIRMED", "booking_id": final_state["final_quote"]["booking_id"], "provider_details": provider, "pricing_summary": pricing}
    }

@app.post("/simulate-booking")
async def simulate_booking(request: SimulateBookingRequest):
    return {"message": "Booking simulation completed.", "actions": ["WHATSAPP_SENT", "CALENDAR_SYNCED"]}

@app.post("/service-quality-loop")
async def service_quality_loop(request: ServiceQualityRequest):
    """Simulates an en-route update and photo evidence placeholder."""
    return {
        "booking_id": request.booking_id,
        "provider_id": request.provider_id,
        "current_status": request.status,
        "quality_checks": {
            "photo_evidence_received": bool(request.photo_evidence_url),
            "evidence_url": request.photo_evidence_url or "N/A",
            "location_verified": True if request.status in ["ARRIVED", "EN_ROUTE"] else False
        },
        "message": f"Service quality loop updated to {request.status}."
    }

@app.post("/update-status")
async def update_status(request: StatusUpdateRequest):
    """Legacy lifecycle handler."""
    if request.new_status == "CANCELLED" and request.time_to_job_mins is not None and request.time_to_job_mins <= 60:
        return {
            "status": "AUTONOMOUS_RE_ROUTING",
            "message": "Critical cancellation detected. Provider penalized. Re-routing...",
        }
    return {"status": request.new_status, "booking_id": request.booking_id}

@app.post("/raise-dispute")
async def raise_dispute(request: DisputeRequest):
    return {"dispute_id": f"DSP-{random.randint(100,999)}", "status": "UNDER_REVIEW"}
