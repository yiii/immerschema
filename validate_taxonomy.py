import json, pathlib, itertools as it, sys

base = pathlib.Path("schemas")
for enum_file in base.glob("enum/*.enum.json"):
    tax_file = base / "taxonomy" / enum_file.name.replace("enum", "taxonomy")
    if not tax_file.exists():
        sys.exit(f"❌ taxonomy missing for {enum_file.name}")
    enum  = json.load(enum_file.open())["enum"]
    tax   = json.load(tax_file.open())
    # Get all enum values from the taxonomy's properties correctly
    flat = []
    for prop in tax["properties"].values():
        if "enum" in prop:
            flat.extend(prop["enum"])
    miss  = set(enum) - set(flat)
    extra = set(flat) - set(enum)
    if miss or extra:
        sys.exit(f"❌ {enum_file.name} mismatch → miss:{miss} extra:{extra}")
print("✅ enums ↔ taxonomies all in sync") 