from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
import os
import shutil

class RenameMoveFileInput(BaseModel):
    """Input schema for RenameMoveFileTool."""
    source_path: str = Field(..., description="The current path of the file to be renamed and moved.")
    destination_dir: str = Field(..., description="The target directory where the file should be moved.")
    new_name: str = Field(..., description="The new filename for the file (e.g., 'processed_data_001.json').")

class RenameMoveFileTool(BaseTool):
    name: str = "Rename and Move File"
    description: str = (
        "Useful for renaming a file and moving it to a specified destination directory."
        "This is particularly useful for storing approved processed data with sequential naming."
    )
    args_schema: Type[BaseModel] = RenameMoveFileInput

    def _run(self, source_path: str, destination_dir: str, new_name: str) -> str:
        try:
            os.makedirs(destination_dir, exist_ok=True)
            destination_path = os.path.join(destination_dir, new_name)
            shutil.move(source_path, destination_path)
            return f"Successfully moved and renamed '{source_path}' to '{destination_path}'"
        except FileNotFoundError:
            return f"Error: Source file '{source_path}' not found or destination directory '{destination_dir}' does not exist."
        except Exception as e:
            return f"Error moving/renaming file: {e}" 