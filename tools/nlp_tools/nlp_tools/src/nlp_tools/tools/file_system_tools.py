from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
import os

class ListDirectoryToolInput(BaseModel):
    """Input schema for ListDirectoryTool."""
    path: str = Field(..., description="The path of the directory to list.")

class ListDirectoryTool(BaseTool):
    name: str = "List Directory"
    description: str = (
        "Useful for listing the contents (files and subdirectories) of a specified directory."
        "This helps in identifying new or unprocessed data files."
    )
    args_schema: Type[BaseModel] = ListDirectoryToolInput

    def _run(self, path: str) -> str:
        try:
            contents = os.listdir(path)
            if not contents:
                return f"Directory '{path}' is empty."
            return f"Contents of '{path}': {', '.join(contents)}"
        except FileNotFoundError:
            return f"Error: Directory '{path}' not found."
        except Exception as e:
            return f"Error listing directory '{path}': {e}"


# You can define more file system related tools here, e.g., to read file content, check file existence, etc. 