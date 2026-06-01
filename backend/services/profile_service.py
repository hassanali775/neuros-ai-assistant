import os
import json
from typing import Dict, Any

class ProfileService:
    def __init__(self):
        # Establish a permanent storage point inside the user profile context
        self.user_profile = os.environ.get("USERPROFILE", os.path.expanduser("~"))
        self.storage_dir = os.path.join(self.user_profile, ".neuros")
        self.profile_file = os.path.join(self.storage_dir, "professional_profile.json")
        
        # Ensure the background data directory exists hidden on the host system
        os.makedirs(self.storage_dir, exist_ok=True)

    def save_profile_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Saves user's professional background, target roles, and core experiences permanently.
        """
        try:
            # Read existing profile data to support partial updates
            existing_data = self.get_profile_data().get("data", {})
            
            # Deep merge updates safely
            updated_profile = {**existing_data, **data}
            
            with open(self.profile_file, "w", encoding="utf-8") as f:
                json.dump(updated_profile, f, indent=4, ensure_ascii=False)
                
            return {
                "success": True,
                "output": "Professional core updated successfully inside user profile matrix."
            }
        except Exception as e:
            return {
                "success": False,
                "output": f"Profile System Storage Failure: {str(e)}"
            }

    def get_profile_data(self) -> Dict[str, Any]:
        """
        Retrieves the saved user background profile for prompt injection layers.
        """
        try:
            if not os.path.exists(self.profile_file):
                return {"success": True, "data": {}}
                
            with open(self.profile_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            return {"success": True, "data": data}
        except Exception as e:
            return {"success": False, "data": {}, "error": str(e)}

def get_profile_service() -> ProfileService:
    return ProfileService()