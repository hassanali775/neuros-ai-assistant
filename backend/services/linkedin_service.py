import os
import json
from typing import Dict, Any

class LinkedInService:
    def __init__(self):
        self.user_profile = os.environ.get("USERPROFILE", os.path.expanduser("~"))
        self.profile_file = os.path.join(self.user_profile, ".neuros", "professional_profile.json")

    def load_cached_profile(self) -> Dict[str, Any]:
        """Loads the saved profile data to provide rich context to the AI generation prompt."""
        try:
            if os.path.exists(self.profile_file):
                with open(self.profile_file, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception:
            pass
        return {}

    def format_generation_prompt(self, post_topic: str) -> str:
        profile = self.load_cached_profile()
        
        # Guard cleanly against capital letter configurations saved by the LLM
        name = profile.get("Name", profile.get("name", "Hassan")).split("\\")[-1]
        role = profile.get("Target Role", profile.get("target_role", "Full-Stack AI Engineer Intern"))
        
        skills_list = profile.get("Core Tech Skills", profile.get("core_skills", []))
        skills = []
        if isinstance(skills_list, list):
            for s in skills_list:
                if isinstance(s, dict):
                    skills.append(s.get("Technology", s.get("tech", "")))
                elif isinstance(s, str):
                    skills.append(s)
                    
        skills_str = ", ".join([sk for sk in skills if sk])

        prompt_augmentation = f"""
[SYSTEM DATA LINKAGE - USER PROFESSIONAL IDENTITY]:
* Creator Name: {name}
* Professional Target: {role}
* Core Technical Stack: {skills_str}

[TASK]:
Write an engineering-focused, highly engaging LinkedIn post about: "{post_topic}".

[HOOK & STYLE RULES]:
1. Start with a striking hook (e.g., a hard lesson learned, an architectural realization, or a bold tech metric). Do NOT start with boring phrases like "I am excited to share...".
2. Use clear white spacing and concise, impactful sentences to optimize for readability on mobile and desktop feeds.
3. Break down the technical implementation cleanly using bullet points (mentioning specific design choices like FastAPI async processing, local sandboxes, or file system streaming).
4. End with an industry call-to-action (CTA) that invites feedback from senior engineers or founders.
5. Use highly relevant hashtags sparingly (e.g., #Python #AI #WebDevelopment #SoftwareEngineering).

Generate the LinkedIn post now:
"""
        return prompt_augmentation

def get_linkedin_service() -> LinkedInService:
    return LinkedInService()