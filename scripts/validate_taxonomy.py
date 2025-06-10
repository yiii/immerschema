#!/usr/bin/env python3
import json
import pathlib
import itertools as it
import sys

def validate_taxonomy_pairs():
    base = pathlib.Path("schemas")
    for enum_file in base.glob("enum/*.enum.json"):
        tax_file = base / "taxonomy" / enum_file.name.replace("enum", "taxonomy")
        if not tax_file.exists():
            sys.exit(f"❌ taxonomy missing for {enum_file.name}")
        
        enum = json.load(enum_file.open())["enum"]
        tax = json.load(tax_file.open())
        flat = list(it.chain.from_iterable(tax.values()))
        miss = set(enum) - set(flat)
        extra = set(flat) - set(enum)
        
        if miss or extra:
            sys.exit(f"❌ {enum_file.name} mismatch → miss:{miss} extra:{extra}")
    
    print("✅ enums ↔ taxonomies all in sync")

if __name__ == "__main__":
    validate_taxonomy_pairs() 