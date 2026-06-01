import os
from typing import Dict, Any

class FileSystemService:
    def __init__(self):
        # Dynamically grab the portable desktop location from the environment
        self.user_profile = os.environ.get("USERPROFILE", os.path.expanduser("~"))
        onedrive_desktop = os.path.join(self.user_profile, "OneDrive", "Desktop")
        standard_desktop = os.path.join(self.user_profile, "Desktop")
        
        if os.path.exists(onedrive_desktop):
            self.desktop_path = onedrive_desktop
        else:
            self.desktop_path = standard_desktop

    def write_local_file(self, filename: str, content: str) -> Dict[str, Any]:
        """
        Safely drops a raw text file or code script directly onto the user's Desktop.
        """
        try:
            # Ensure safe execution by resolving the exact absolute target path
            target_path = os.path.join(self.desktop_path, filename)
            
            # Write out the contents cleanly (overwrites if existing)
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(content)
                
            return {
                "success": True,
                "output": f"File successfully written to system workspace matrix: {target_path}"
            }
        except Exception as e:
            return {
                "success": False,
                "output": f"File System Engine Write Exception: {str(e)}"
            }

def get_file_system_service() -> FileSystemService:
    return FileSystemService()