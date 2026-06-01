import json
from typing import Dict, Any, List

class AgentOrchestrator:
    def __init__(self):
        # Bulletproof directory mapping with fallback schemas
        self.sub_agents = {
            "kernel_engineer": {
                "name": "NEUROS Kernel System Engineer",
                "focus": "Host automation, terminal execution, safety constraints, sandboxing, and file structure integrity.",
                "system_instructions": "You are a low-level systems engineer. Focus purely on technical accuracy, script safety, pathing normalization, and hardware constraints."
            },
            "rag_analyst": {
                "name": "NEUROS Vector Research Analyst",
                "focus": "ChromaDB memory lookups, document text chunk analysis, indexing strategies, and historical context retrieval.",
                "system_instructions": "You are a data retrieval specialist. Focus on knowledge matching, semantic relevance, context precision, and eliminating hallucinations."
            },
            "brand_strategist": {
                "name": "NEUROS Portfolio Brand Strategist",
                "focus": "LinkedIn copy, high-converting resume bullet points, portfolio positioning, and high-impact readability optimizations.",
                "system_instructions": "You are a professional growth copywriter. Focus on strong psychological hooks, crisp formatting, readability, and impactful engineering stories."
            }
        }

    def determine_routing(self, user_content: str) -> List[str]:
        """
        Dynamically routes the prompt to the required sub-agents safely.
        """
        assigned_agents = []
        if not user_content:
            return ["kernel_engineer", "brand_strategist"]
            
        content_lower = str(user_content).lower()

        # Route matching patterns
        if any(w in content_lower for w in ["run", "execute", "sandbox", "terminal", "script", "file", "write", "test_agents.py"]):
            assigned_agents.append("kernel_engineer")
            
        if any(w in content_lower for w in ["remember", "memory", "analyze", "document", "pdf", "context", "rag"]):
            assigned_agents.append("rag_analyst")
            
        if any(w in content_lower for w in ["linkedin", "post", "draft", "portfolio", "resume", "internship"]):
            assigned_agents.append("brand_strategist")

        # Robust default fallback
        if not assigned_agents:
            assigned_agents = ["kernel_engineer", "brand_strategist"]

        return assigned_agents

    def compile_multi_agent_prompt(self, user_content: str, active_agents: List[str]) -> str:
        """
        Safely generates the structural string injection layer.
        """
        if not active_agents:
            return ""
            
        try:
            mesh_context = "\n\n[AGENTIC MESH COMPOSITION ACTIVE]\n"
            mesh_context += "The following specialized sub-agents have processed this prompt and their parameters are merged into your current runtime container:\n"
            
            for agent_key in active_agents:
                if agent_key in self.sub_agents:
                    agent = self.sub_agents[agent_key]
                    mesh_context += f"- **{agent['name']}** (Focus: {agent['focus']})\n  Directive: {agent['system_instructions']}\n"
                
            mesh_context += "\n[CRITICAL DIRECTIVE]: Synthesize the technical precision of the Kernel Engineer, the data validation of the RAG Analyst, and the high-readability layout of the Brand Strategist into a singular unified response. Do not break character."
            return mesh_context
        except Exception:
            return ""

# Globally safe generator dependency instance
_orchestrator_instance = AgentOrchestrator()

def get_agent_orchestrator() -> AgentOrchestrator:
    return _orchestrator_instance