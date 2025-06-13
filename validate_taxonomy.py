import json, pathlib, itertools as it, sys

base = pathlib.Path("schemas")
for enum_file in base.glob("enum/*.enum.json"):
    print(f"Processing {enum_file}")
    tax_file = base / "taxonomy" / enum_file.name.replace("enum", "taxonomy")
    if not tax_file.exists():
        sys.exit(f"❌ taxonomy missing for {enum_file.name}")
    try:
        with enum_file.open() as f:
            content = f.read()
            print(f"Enum file content:\n{content}")
            enum = json.loads(content)["enum"]
    except json.JSONDecodeError as e:
        print(f"Error in {enum_file}: {str(e)}")
        print(f"Error location: line {e.lineno}, column {e.colno}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error with {enum_file}: {str(e)}")
        sys.exit(1)
    try:
        tax = json.load(tax_file.open())
    except Exception as e:
        print(f"Error loading taxonomy file {tax_file}: {str(e)}")
        sys.exit(1)
    # Get all enum values from the taxonomy's properties correctly
    flat = []
    for prop in tax["properties"].values():
        # Handle nested structure: items.enum instead of just enum
        if "items" in prop and "enum" in prop["items"]:
            flat.extend(prop["items"]["enum"])
        elif "enum" in prop:
            flat.extend(prop["enum"])
    miss  = set(enum) - set(flat)
    extra = set(flat) - set(enum)
    if miss or extra:
        sys.exit(f"❌ {enum_file.name} mismatch → miss:{miss} extra:{extra}")
print("✅ enums ↔ taxonomies all in sync") 