import os
import sys
import subprocess
from typing import Dict, Any

class SandboxService:
    def __init__(self):
        self.user_profile = os.environ.get("USERPROFILE", os.path.expanduser("~"))
        onedrive_desktop = os.path.join(self.user_profile, "OneDrive", "Desktop")
        standard_desktop = os.path.join(self.user_profile, "Desktop")
        
        if os.path.exists(onedrive_desktop):
            self.desktop_path = onedrive_desktop
        else:
            self.desktop_path = standard_desktop

    def execute_python_script(self, filename: str) -> Dict[str, Any]:
        """
        Executes a local Python script directly from the Desktop workspace and intercepts output.
        """
        try:
            target_path = os.path.join(self.desktop_path, filename)
            
            if not os.path.exists(target_path):
                return {
                    "success": False,
                    "output": f"Sandbox Runtime Error: Target file `{filename}` does not exist on the desktop matrix."
                }

            # Use the active running Python executable interpreter environment dynamically
            python_exe = sys.executable

            process = subprocess.Popen(
                [python_exe, target_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=self.desktop_path
            )
            
            stdout, stderr = process.communicate(timeout=10)
            
            if process.returncode == 0:
                return {
                    "success": True,
                    "output": stdout if stdout.strip() else "Script finished execution with return code 0 but yielded no print tokens."
                }
            else:
                return {
                    "success": False,
                    "output": f"Script Runtime Exception (Code {process.returncode}):\n{stderr}"
                }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": "Sandbox Runtime Timeout: Script execution killed after exceeding 10 seconds limit."
            }
        except Exception as e:
            return {
                "success": False,
                "output": f"Sandbox Execution Failure: {str(e)}"
            }

def get_sandbox_service() -> SandboxService:
    return SandboxService()