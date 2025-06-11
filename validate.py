
import json
import os
import time
from jsonschema import validate
import copy

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
schemas_dir = os.path.join(current_dir, 'schemas')

def load_json_file(filename):
    try:
        with open(os.path.join(current_dir, filename), 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {filename}: {str(e)}")
        return None

def load_schema_file(relative_path):
    """Load a schema file from the schemas directory"""
    try:
        filepath = os.path.join(schemas_dir, relative_path)
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading schema {relative_path}: {str(e)}")
        return None

def resolve_schema_refs(schema):
    """Recursively resolve $ref references in a schema by replacing them with actual content"""
    
    # Load all enum schemas into a cache
    enum_cache = {}
    enum_files = ['screenzone.enum.json', 'technique.enum.json', 'software.enum.json', 
                  'role.enum.json', 'riskflag.enum.json']
    for enum_file in enum_files:
        content = load_schema_file(f'enum/{enum_file}')
        if content:
            enum_cache[f"./enum/{enum_file}"] = content
    
    # Load ext schemas
    ext_cache = {}
    ext_files = ['debug.schema.json']
    for ext_file in ext_files:
        content = load_schema_file(f'ext/{ext_file}')
        if content:
            ext_cache[f"./ext/{ext_file}"] = content
    
    # Load core schema
    core_cache = {}
    core_content = load_schema_file('core.schema.json')
    if core_content:
        # Pre-resolve references in the core schema itself
        resolved_core = resolve_refs_in_schema(core_content, enum_cache, ext_cache, {})
        core_cache["./core.schema.json"] = resolved_core
    
    def resolve_refs_recursive(obj):
        if isinstance(obj, dict):
            if '$ref' in obj:
                ref_path = obj['$ref']
                # Handle local file references
                if ref_path in enum_cache:
                    return enum_cache[ref_path]
                elif ref_path in ext_cache:
                    return ext_cache[ref_path]
                elif ref_path in core_cache:
                    return core_cache[ref_path]
                elif ref_path.startswith('./ext/debug.schema.json#/properties/debug'):
                    # Handle specific property reference in debug schema
                    if './ext/debug.schema.json' in ext_cache:
                        return ext_cache['./ext/debug.schema.json']['properties']['debug']
                elif ref_path.startswith('#/'):
                    # Handle internal references (leave as is for now)
                    return obj
                else:
                    print(f"Warning: Unresolved reference: {ref_path}")
                    return obj
            else:
                # Recursively process all values in the dictionary
                resolved = {}
                for key, value in obj.items():
                    resolved[key] = resolve_refs_recursive(value)
                return resolved
        elif isinstance(obj, list):
            # Recursively process all items in the list
            return [resolve_refs_recursive(item) for item in obj]
        else:
            # Return primitive values as is
            return obj
    
    return resolve_refs_recursive(copy.deepcopy(schema))

def resolve_refs_in_schema(schema, enum_cache, ext_cache, core_cache):
    """Helper function to resolve references within a schema"""
    
    def resolve_refs_recursive(obj):
        if isinstance(obj, dict):
            if '$ref' in obj:
                ref_path = obj['$ref']
                # Handle local file references
                if ref_path in enum_cache:
                    return enum_cache[ref_path]
                elif ref_path in ext_cache:
                    return ext_cache[ref_path]
                elif ref_path.startswith('./ext/debug.schema.json#/properties/debug'):
                    # Handle specific property reference in debug schema
                    if './ext/debug.schema.json' in ext_cache:
                        return ext_cache['./ext/debug.schema.json']['properties']['debug']
                elif ref_path.startswith('#/'):
                    # Handle internal references (leave as is for now)
                    return obj
                else:
                    return obj
            else:
                # Recursively process all values in the dictionary
                resolved = {}
                for key, value in obj.items():
                    resolved[key] = resolve_refs_recursive(value)
                return resolved
        elif isinstance(obj, list):
            # Recursively process all items in the list
            return [resolve_refs_recursive(item) for item in obj]
        else:
            # Return primitive values as is
            return obj
    
    return resolve_refs_recursive(copy.deepcopy(schema))

# Load schemas
core_schema = load_json_file('schemas/core.schema.json')
project_schema = load_json_file('schemas/project.schema.json')

# Load test data
test_shot = load_json_file('test_shot.json')
test_project = load_json_file('test_project.json')

if all([core_schema, project_schema, test_shot, test_project]):
    # Resolve references in schemas
    resolved_core_schema = resolve_schema_refs(core_schema)
    resolved_project_schema = resolve_schema_refs(project_schema)
    
    # Validate shot
    try:
        validate(instance=test_shot, schema=resolved_core_schema)
        print("Shot validation: PASSED")
    except Exception as e:
        print("Shot validation: FAILED")
        print("Error:", str(e))

    # Add a small delay to ensure output is visible
    time.sleep(0.1)

    # Validate project
    try:
        validate(instance=test_project, schema=resolved_project_schema)
        print("Project validation: PASSED")
    except Exception as e:
        print("Project validation: FAILED")
        print("Error:", str(e))
else:
    print("Failed to load one or more required files") 