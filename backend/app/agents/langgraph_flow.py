import json
from typing import Dict, Any, List, TypedDict
from langgraph.graph import StateGraph, END
from app.agents.extractor import extract_qms_fields
from app.agents.form_editor import process_nl_form_edit
from app.agents.rca_capa import generate_rca_and_capa
from app.agents.risk_analyzer import analyze_risk_and_summary
from app.agents.duplicate_finder import find_duplicate_complaints

# LangGraph State Definition
class QMSAgentState(TypedDict):
    input_text: str
    user_chat_message: str
    groq_api_key: str
    form_data: Dict[str, Any]
    changed_fields: List[str]
    ai_response: str
    completeness: Dict[str, Any]
    risk_analysis: Dict[str, Any]
    rca_capa: Dict[str, Any]
    duplicates: List[Dict[str, Any]]
    historical_db: List[Dict[str, Any]]

# Node 1: Document Extraction Node
def extract_node(state: QMSAgentState) -> QMSAgentState:
    text = state.get("input_text", "")
    key = state.get("groq_api_key")
    if text:
        extracted = extract_qms_fields(text, key)
        state["form_data"] = extracted
        state["changed_fields"] = list(extracted.keys())
        state["ai_response"] = "Extracted structured QMS complaint fields from document log."
    return state

# Node 2: Natural Language Form Editor Node
def nl_form_editor_node(state: QMSAgentState) -> QMSAgentState:
    msg = state.get("user_chat_message", "")
    curr_form = state.get("form_data", {})
    key = state.get("groq_api_key")
    if msg:
        updated_form, changed, reply = process_nl_form_edit(msg, curr_form, key)
        state["form_data"] = updated_form
        state["changed_fields"] = changed
        state["ai_response"] = reply
    return state

# Node 3: Full QMS Intelligence Analysis Node (RCA, CAPA, Risk, Completeness, Duplicates)
def analyze_node(state: QMSAgentState) -> QMSAgentState:
    form = state.get("form_data", {})
    key = state.get("groq_api_key")
    hist_db = state.get("historical_db", [])

    # 1. Risk & Executive Summary & Completeness
    risk_res = analyze_risk_and_summary(form, key)
    state["risk_analysis"] = risk_res
    state["completeness"] = risk_res.get("completeness", {})

    # 2. RCA & CAPA
    rca_res = generate_rca_and_capa(form, key)
    state["rca_capa"] = rca_res

    # 3. Duplicate Detection
    dups = find_duplicate_complaints(form, hist_db)
    state["duplicates"] = dups

    return state

# Construct LangGraph State Graph
def build_qms_langgraph():
    workflow = StateGraph(QMSAgentState)

    workflow.add_node("extract", extract_node)
    workflow.add_node("edit_form", nl_form_editor_node)
    workflow.add_node("analyze", analyze_node)

    # We set entry points dynamically depending on operation, or define graph flow
    workflow.set_entry_point("extract")
    workflow.add_edge("extract", "analyze")
    workflow.add_edge("analyze", END)

    return workflow.compile()

qms_graph = build_qms_langgraph()

def run_extraction_flow(text: str, groq_key: str = None, historical_db: list = None) -> QMSAgentState:
    initial_state: QMSAgentState = {
        "input_text": text,
        "user_chat_message": "",
        "groq_api_key": groq_key or "",
        "form_data": {},
        "changed_fields": [],
        "ai_response": "",
        "completeness": {},
        "risk_analysis": {},
        "rca_capa": {},
        "duplicates": [],
        "historical_db": historical_db or []
    }
    return qms_graph.invoke(initial_state)

def run_chat_edit_flow(chat_message: str, current_form: dict, groq_key: str = None, historical_db: list = None) -> QMSAgentState:
    # Dedicated sub-graph execution for NL Chat editing
    workflow = StateGraph(QMSAgentState)
    workflow.add_node("edit_form", nl_form_editor_node)
    workflow.add_node("analyze", analyze_node)
    workflow.set_entry_point("edit_form")
    workflow.add_edge("edit_form", "analyze")
    workflow.add_edge("analyze", END)
    chat_graph = workflow.compile()

    initial_state: QMSAgentState = {
        "input_text": "",
        "user_chat_message": chat_message,
        "groq_api_key": groq_key or "",
        "form_data": current_form,
        "changed_fields": [],
        "ai_response": "",
        "completeness": {},
        "risk_analysis": {},
        "rca_capa": {},
        "duplicates": [],
        "historical_db": historical_db or []
    }
    return chat_graph.invoke(initial_state)
