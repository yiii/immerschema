import json
import os
import time
from jsonschema import validate
import copy
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
schemas_dir = os.path.join(current_dir, 'schemas')
test_dir = os.path.join(current_dir, 'test')

def load_json_file(filename):
    """Load a JSON file from the test directory"""
    try:
        filepath = os.path.join(test_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading {filename}: {str(e)}")
        return None

def load_schema_file(relative_path):
    """Load a schema file from the schemas directory"""
    try:
        filepath = os.path.join(schemas_dir, relative_path)
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading schema {relative_path}: {str(e)}")
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
                    logger.warning(f"Unresolved reference: {ref_path}")
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

def validate_file(data, schema, description):
    """Validate data against a schema"""
    try:
        validate(instance=data, schema=schema)
        logger.info(f"✅ {description} validation: PASSED")
        return True
    except Exception as e:
        logger.error(f"❌ {description} validation: FAILED")
        logger.error(f"Error: {str(e)}")
        return False

def main():
    # Load test data
    test_shot = load_json_file('test_shot.json')
    test_project = load_json_file('test_project.json')
    validation_tests = load_json_file('validation_tests.json')
    edge_cases = load_json_file('edge_cases.json')

    # Load schemas
    core_schema = load_schema_file('core.schema.json')
    project_schema = load_schema_file('project.schema.json')

    if not all([core_schema, project_schema]):
        logger.error("Failed to load required schema files")
        return

    # Resolve references in schemas
    resolved_core_schema = resolve_schema_refs(core_schema)
    resolved_project_schema = resolve_schema_refs(project_schema)

    # Initialize results
    results = {
        'passed': 0,
        'failed': 0,
        'total': 0
    }

    # Validate test files
    if test_shot:
        results['total'] += 1
        if validate_file(test_shot, resolved_core_schema, "Shot"):
            results['passed'] += 1
        else:
            results['failed'] += 1

    if test_project:
        results['total'] += 1
        if validate_file(test_project, resolved_project_schema, "Project"):
            results['passed'] += 1
        else:
            results['failed'] += 1

    # Print summary
    logger.info("\n📊 Final Results")
    logger.info("=================")
    logger.info(f"✅ Passed: {results['passed']}")
    logger.info(f"❌ Failed: {results['failed']}")
    logger.info(f"📈 Total: {results['total']}")

if __name__ == "__main__":
    main() 