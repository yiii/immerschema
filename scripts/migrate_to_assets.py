#!/usr/bin/env python3
import json
import sys
from pathlib import Path

def migrate_shot(shot):
    """Migrate a single shot from imageFiles to assets structure."""
    if "imageFiles" in shot:
        shot["assets"] = [
            {"path": p, "kind": "image", "role": "reference"}
            for p in shot.pop("imageFiles")
        ]
    return shot

def migrate_file(file_path):
    """Migrate all shots in a JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if isinstance(data, list):
        # Handle array of shots
        data = [migrate_shot(shot) for shot in data]
    elif isinstance(data, dict):
        # Handle single shot
        data = migrate_shot(data)
    
    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def main():
    if len(sys.argv) < 2:
        print("Usage: python migrate_to_assets.py <path_to_json_file>")
        sys.exit(1)
    
    file_path = Path(sys.argv[1])
    if not file_path.exists():
        print(f"Error: File {file_path} does not exist")
        sys.exit(1)
    
    try:
        migrate_file(file_path)
        print(f"Successfully migrated {file_path}")
    except Exception as e:
        print(f"Error migrating {file_path}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 