import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from exa_py import Exa
from cerebras.cloud.sdk import Cerebras

# Load environment variables from .env file
load_dotenv()

# Get API keys from environment variables
EXA_API_KEY = os.getenv("EXA_API_KEY")
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")

# Check if API keys are set
if not EXA_API_KEY or not CEREBRAS_API_KEY:
    raise RuntimeError("API keys for Exa and Cerebras must be set in a .env file.")

# Initialize clients
exa = Exa(api_key=EXA_API_KEY)
client = Cerebras(api_key=CEREBRAS_API_KEY)

app = FastAPI(
    title="Mathematiks Research API",
    description="AI-powered research API with multi-agent capabilities",
    version="1.0.0",
    openapi_tags=[
        {
            "name": "research",
            "description": "Research endpoints with varying depth and strategies"
        }
    ]
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class ResearchRequest(BaseModel):
    query: str = Field(..., description="Research query or question", min_length=3)

class ResearchResponse(BaseModel):
    query: str
    sources: int
    response: str

class MultiAgentResearchResponse(BaseModel):
    query: str
    subagents: int
    total_sources: int
    synthesis: str

# Web Search Function
def search_web(query: str, num_results: int = 5):
    """Search the web using Exa's auto search"""
    try:
        result = exa.search_and_contents(
            query,
            type="auto",
            num_results=num_results,
            text={"max_characters": 1000}
        )
        return result.results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exa API error: {e}")

# AI Analysis Function
def ask_ai(prompt: str):
    """Get AI response from Cerebras"""
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-4-scout-17b-16e-instruct",
            max_tokens=600,
            temperature=0.2
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cerebras API error: {e}")

# Research Function
@app.post("/research", response_model=ResearchResponse, tags=["research"])
def research_topic(request: ResearchRequest):
    """
    Basic research with AI synthesis

    - Searches 5 web sources
    - Returns 2-3 sentence summary
    - Provides 3 key insights
    """
    query = request.query
    print(f"🔍 Researching: {query}")

    # Search for sources
    results = search_web(query, 5)
    print(f"📊 Found {len(results)} sources")

    # Get content from sources
    sources = []
    for result in results:
        content = result.text
        title = result.title
        if content and len(content) > 200:
            sources.append({
                "title": title,
                "content": content
            })

    print(f"📄 Scraped {len(sources)} sources")

    if not sources:
        return {"summary": "No sources found", "insights": []}

    # Create context for AI analysis
    context = f"Research query: {query}\n\nSources:\n"
    for i, source in enumerate(sources[:4], 1):
        context += f"{i}. {source['title']}: {source['content'][:400]}...\n\n"
        

    # Ask AI to analyze and synthesize
    prompt = f"""{context}

Based on these sources, provide:
1. A comprehensive summary (2-3 sentences)
2. Three key insights as bullet points

Format your response exactly like this:
SUMMARY: [your summary here]

INSIGHTS:
- [insight 1]
- [insight 2]
- [insight 3]"""

    response = ask_ai(prompt)
    print("🧠 Analysis complete")

    return {"query": query, "sources": len(sources), "response": response}

# Deeper Research Function
@app.post("/deep-research", response_model=ResearchResponse, tags=["research"])
def deeper_research_topic(request: ResearchRequest):
    """
    Two-layer research for better depth

    - Layer 1: Initial search (6 sources)
    - AI identifies follow-up question
    - Layer 2: Follow-up search (4 sources)
    - Final synthesis with depth analysis
    """
    query = request.query
    print(f"🔍 Researching: {query}")

    # Layer 1: Initial search
    results = search_web(query, 6)
    sources = []
    for result in results:
        if result.text and len(result.text) > 200:
            sources.append({"title": result.title, "content": result.text})

    print(f"Layer 1: Found {len(sources)} sources")

    if not sources:
        return {"summary": "No sources found", "insights": []}

    # Get initial analysis and identify follow-up topic
    context1 = f"Research query: {query}\n\nSources:\n"
    for i, source in enumerate(sources[:4], 1):
        context1 += f"{i}. {source['title']}: {source['content'][:300]}...\n\n"

    follow_up_prompt = f"""{context1}

Based on these sources, what's the most important follow-up question that would deepen our understanding of \"{query}\"?

Respond with just a specific search query (no explanation):"""

    follow_up_query = ask_ai(follow_up_prompt).strip().strip('"')

    # Layer 2: Follow-up search
    print(f"Layer 2: Investigating '{follow_up_query}'")
    follow_results = search_web(follow_up_query, 4)

    for result in follow_results:
        if result.text and len(result.text) > 200:
            sources.append({"title": f"[Follow-up] {result.title}", "content": result.text})

    print(f"Total sources: {len(sources)}")

    # Final synthesis
    all_context = f"Research query: {query}\nFollow-up: {follow_up_query}\n\nAll Sources:\n"
    for i, source in enumerate(sources[:7], 1):
        all_context += f"{i}. {source['title']}: {source['content'][:300]}...\n\n"

    final_prompt = f"""{all_context}

Provide a comprehensive analysis:

SUMMARY: [3-4 sentences covering key findings from both research layers]

INSIGHTS:
- [insight 1]
- [insight 2]
- [insight 3]
- [insight 4]

DEPTH GAINED: [1 sentence on how the follow-up search enhanced understanding]"""

    response = ask_ai(final_prompt)
    return {"query": query, "sources": len(sources), "response": response}

# Multi-Agent Research Function
@app.post("/multi-agent-research", response_model=MultiAgentResearchResponse, tags=["research"])
def anthropic_multiagent_research(request: ResearchRequest):
    """
    Multi-agent research with parallel execution

    - Lead agent decomposes query into 3 subtasks
    - 3 specialized subagents work in parallel
    - Each subagent searches 2 sources
    - Lead agent synthesizes all findings
    - Returns executive summary and integrated insights
    """
    query = request.query
    print(f"🤖 Anthropic Multi-Agent Research: {query}")
    print("-" * 50)

    # Step 1: Lead Agent - Task Decomposition & Delegation
    print("👨‍💼 LEAD AGENT: Planning and delegating...")

    delegation_prompt = f"""You are a Lead Research Agent. Break down this complex query into 3 specialized subtasks for parallel execution: \"{query}\"\n
For each subtask, provide:
- Clear objective
- Specific search focus
- Expected output

SUBTASK 1: [Core/foundational aspects]
SUBTASK 2: [Recent developments/trends]
SUBTASK 3: [Applications/implications]\n
Make each subtask distinct to avoid overlap."""

    plan = ask_ai(delegation_prompt)
    print("  ✓ Subtasks defined and delegated")

    # Step 2: Simulate Parallel Subagents (simplified for demo)
    print("\n🔍 SUBAGENTS: Working in parallel...")

    # Extract subtasks and create targeted searches
    subtask_searches = [
        f"{query} fundamentals principles",  # Core aspects
        f"{query} latest developments",  # Recent trends
        f"{query} applications real world"    # Implementation
    ]

    subagent_results = []
    for i, search_term in enumerate(subtask_searches, 1):
        print(f"  🤖 Subagent {i}: Researching {search_term}")
        results = search_web(search_term, 2)

        sources = []
        for result in results:
            if result.text and len(result.text) > 200:
                sources.append({
                    "title": result.title,
                    "content": result.text[:300]
                })

        subagent_results.append({
            "subtask": i,
            "search_focus": search_term,
            "sources": sources
        })

    total_sources = sum(len(r["sources"]) for r in subagent_results)
    print(f"  📊 Combined: {total_sources} sources from {len(subagent_results)} agents")

    # Step 3: Lead Agent - Synthesis
    print("\n👨‍💼 LEAD AGENT: Synthesizing parallel findings...")

    # Combine all subagent findings
    synthesis_context = f"ORIGINAL QUERY: {query}\n\nSUBAGENT FINDINGS:\n"
    for result in subagent_results:
        synthesis_context += f"\nSubagent {result['subtask']} ({result['search_focus']}):\n"
        for source in result['sources'][:2]:  # Limit for brevity
            synthesis_context += f"- {source['title']}: {source['content']}...\n"

    synthesis_prompt = f"""{synthesis_context}

As the Lead Agent, synthesize these parallel findings into a comprehensive report:

EXECUTIVE SUMMARY:
[2-3 sentences covering the most important insights across all subagents]

INTEGRATED FINDINGS:
• [Key finding from foundational research]
• [Key finding from recent developments]
• [Key finding from applications research]
• [Cross-cutting insight that emerged]

RESEARCH QUALITY:
- Sources analyzed: {total_sources} across {len(subagent_results)} specialized agents
- Coverage: [How well the subtasks covered the topic]"""

    final_synthesis = ask_ai(synthesis_prompt)

    print("\n" + "=" * 50)
    print("🎯 MULTI-AGENT RESEARCH COMPLETE")
    print("=" * 50)
    print(final_synthesis)

    return {
        "query": query,
        "subagents": len(subagent_results),
        "total_sources": total_sources,
        "synthesis": final_synthesis
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)