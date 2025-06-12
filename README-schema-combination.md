# Schema Combination Scripts

This repository contains scripts to combine all JSON schema files into a single comprehensive schema file.

## Scripts Available

### 1. Node.js Script (`combine-schemas.cjs`)
A CommonJS Node.js script that combines all schemas.

**Usage:**
```bash
node combine-schemas.cjs
```

### 2. PowerShell Script (`combine-schemas.ps1`)
A PowerShell script for Windows environments.

**Usage:**
```powershell
.\combine-schemas.ps1
```

**With custom paths:**
```powershell
.\combine-schemas.ps1 -SchemasPath ".\schemas" -OutputPath ".\my-combined-schema.json"
```

## What It Does

The scripts will:

1. **Recursively scan** the `schemas/` directory for all JSON schema files:
   - `*.schema.json` files
   - `*.enum.json` files  
   - `*.taxonomy.json` files

2. **Combine schemas** into a single file with:
   - All schemas moved to a `definitions` section
   - `$ref` references resolved to point to the combined definitions
   - Main project schemas exposed as top-level properties

3. **Generate output** showing:
   - Total number of schemas found and processed
   - Schema categories breakdown
   - Any errors encountered

## Output Structure

The combined schema (`combined-schema.json`) contains:

- **`definitions`**: All individual schemas as reusable definitions
- **`properties`**: Main project schema types (draft, review, etc.)
- **`oneOf`**: Union of all project schema types

## Schema Categories Processed

Based on your current schema structure:

- **enum**: 5 schemas (roles, software, techniques, etc.)
- **ext**: 1 schema (debug extensions)
- **io**: 3 schemas (patches, envelopes)
- **profiles**: 5 schemas (draft, review, plan, lock, assign)
- **project**: 5 schemas (main project types)
- **slices**: 15 schemas (reusable schema fragments)
- **taxonomy**: 5 schemas (classification data)

## Example Usage

After running the script, you can reference any schema definition:

```json
{
  "$ref": "#/definitions/slices_screen_slice"
}
```

Or validate against a complete project schema:

```json
{
  "$ref": "#/definitions/project_draft"
}
```

## Requirements

- **Node.js**: For the `.cjs` script
- **PowerShell 5.0+**: For the `.ps1` script
- **File System Access**: Read access to `schemas/` directory, write access to output location

## Error Handling

Both scripts include error handling for:
- Missing schema directories
- Invalid JSON files
- File permission issues
- Reference resolution problems

Errors are logged to console with details about which files caused issues. 