import os
import time
from typing import List, Tuple

def get_directory_size(directory: str) -> int:
    total_size = 0
    for dirpath, _, filenames in os.walk(directory):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            total_size += os.path.getsize(filepath)
    return total_size

def get_files_info(directory: str) -> List[Tuple[str, float, int]]:
    """Returns list of (filepath, modification_time, size) tuples"""
    files_info = []
    for dirpath, _, filenames in os.walk(directory):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            mtime = os.path.getmtime(filepath)
            size = os.path.getsize(filepath)
            files_info.append((filepath, mtime, size))
    return files_info

def cleanup_old_files(directory: str, max_size: int):
    """Delete oldest files when directory size exceeds max_size"""
    current_size = get_directory_size(directory)
    if current_size <= max_size:
        return

    # Get list of files with their info
    files_info = get_files_info(directory)
    # Sort by modification time (oldest first)
    files_info.sort(key=lambda x: x[1])

    # Delete oldest files until we're under the limit
    for filepath, _, size in files_info:
        if current_size <= max_size:
            break
        try:
            os.remove(filepath)
            current_size -= size
        except OSError:
            continue
