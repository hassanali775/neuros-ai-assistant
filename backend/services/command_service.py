import os
import subprocess
from typing import Dict, Any

class CommandService:
    def __init__(self):
        # Dynamically fetch user profile root (e.g., C:\Users\Hassan) safely across different systems
        self.user_profile = os.environ.get("USERPROFILE", os.path.expanduser("~"))
        
        # Detect true Desktop destination profile dynamically (OneDrive vs Standard)
        onedrive_desktop = os.path.join(self.user_profile, "OneDrive", "Desktop")
        standard_desktop = os.path.join(self.user_profile, "Desktop")
        
        if os.path.exists(onedrive_desktop):
            self.resolved_desktop = onedrive_desktop
        else:
            self.resolved_desktop = standard_desktop

    async def execute_local_command(self, command_str: str) -> Dict[str, Any]:
        """
        Safely executes an OS-level terminal command locally and returns stdout/stderr.
        """
        try:
            # Inject dynamic environment shortcuts into the incoming command string.
            # If the model passes %DESKTOP%, it replaces it with the machine's true verified path.
            processed_cmd = command_str.replace("%DESKTOP%", f'"{self.resolved_desktop}"')
            
            disallowed_tokens = ["rmdir /s /q c:", "del /f /s /q c:", "format", "mkfs"]
            clean_cmd = processed_cmd.lower().strip()
            
            if any(token in clean_cmd for token in disallowed_tokens):
                return {
                    "success": False,
                    "output": "Execution Blocked: Command contains destructive operating system tokens."
                }

            process = subprocess.Popen(
                processed_cmd,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=self.user_profile  # Starts safely at user home base folder
            )
            
            stdout, stderr = process.communicate(timeout=15)
            
            if process.returncode == 0:
                return {
                    "success": True,
                    "output": stdout if stdout.strip() else "Command executed successfully with zero return tokens."
                }
            else:
                return {
                    "success": False,
                    "output": f"Terminal Error (Code {process.returncode}): {stderr}"
                }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": "Execution Failed: Command execution timed out after 15 seconds."
            }
        except Exception as e:
            return {
                "success": False,
                "output": f"Execution Engine Exception: {str(e)}"
            }

def get_command_service() -> CommandService:
    return CommandService()