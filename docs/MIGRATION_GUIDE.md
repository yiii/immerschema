# Migration Guide: Immerschema 1.4.0

This guide will help you migrate your existing Immerschema projects to version 1.4.0, which introduces Agile hierarchy fields and optional Gantt-chart overlays.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Major Changes](#major-changes)
3. [Migration Steps](#migration-steps)
4. [Schema Updates](#schema-updates)
5. [Testing Your Migration](#testing-your-migration)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting the migration, ensure you have:

- Node.js 14.x or later
- PowerShell 5.0+ (for Windows users)
- Git (for version control)
- Your existing Immerschema project files

## Major Changes

### 1. Schema Organization
- New `.slice.schema.json` extension for all slice schemas
- Reorganized directory structure
- New schema combination system
- Enhanced reference resolution

### 2. New Features
- Bottleneck tracking
- Risk management system
- Workload monitoring
- Enhanced audio support
- Improved validation system

### 3. Testing Infrastructure
- New test states (draft, review, plan, assign, lock)
- Enhanced validation pipeline
- Better error reporting

## Migration Steps

### 1. Backup Your Project
```powershell
# Create a backup of your current project
Copy-Item -Path "your-project" -Destination "your-project-backup" -Recurse
```

### 2. Update Dependencies
```powershell
# Update package.json dependencies
npm install immerschema@1.4.0 --save
```

### 3. Schema File Migration

#### a. Rename Schema Files
```powershell
# PowerShell script to rename schema files
Get-ChildItem -Path "schemas/slices" -Filter "*.schema.json" | ForEach-Object {
    $newName = $_.Name -replace "\.schema\.json$", ".slice.schema.json"
    Rename-Item -Path $_.FullName -NewName $newName
}
```

#### b. Update Schema References
1. Open each schema file
2. Update `$id` references to match new naming convention
3. Update any internal references to use new file names

Example:
```json
{
  "$id": "immerschema/schemas/slices/screen.slice.schema.json",
  // ... rest of schema
}
```

### 4. Update Project Files

#### a. Add New Required Fields
For each project file, add the new required fields:

```json
{
  // ... existing fields ...
  "bottlenecks": {
    "bottlenecks": []
  },
  "riskFlags": {
    "riskFlags": [],
    "riskMitigation": []
  },
  "workload": {
    // ... workload fields
  }
}
```

#### b. Update State Files
Ensure your state files follow the new structure:

1. Draft state (minimal requirements)
2. Review state (additional validations)
3. Plan state (resource allocation)
4. Assign state (team assignments)
5. Lock state (final validation)

### 5. Split a Joined Project File
Projects created prior to 1.4 often stored all scenes, tasks and crew in a single
`project.json`. Version 1.4 favors a modular layout so that tasks and crew can be
reused across scenes. To migrate:

1. **Create folders** under your project root:
   ```text
   <project>/
   ├─ project.json
   ├─ features.json      # can start as []
   ├─ scenes/
   ├─ stories/
   ├─ tasks/
   └─ crew/
   ```
2. **Move scene objects** from the `shots` array into `scenes/<scene-id>.json`.
   Keep the `id`, `scene`, `index`, `screen`, `technique`, `voice`, and `timing`
   fields. Replace embedded `tasks` and `crew` arrays with `taskIds`/`crewIds`.
3. **Extract tasks** from each scene into individual files in `tasks/` using their
   existing `id` values (e.g. `tasks/t-002.json`). Remove them from the scene
   file and list the IDs in the scene's `taskIds` array.
4. **Extract crew** in the same manner into `crew/<name-or-id>.json` and list the
   IDs in `crewIds`.
5. **Create a story per scene** in `stories/<scene-id>.json` referencing the
   `taskIds` you just extracted. When multiple scenes share the same story you
   can move tasks under that story and list its `id` in each scene's `storyIds`.
6. **Update project.json** so `shots` only contains lightweight scene references
   (e.g. `{ "id": "sc-01" }`). Include `projectTasks` or `projectCrew` only for
   truly global items. Bump `schemaVersion` to `1.4.0` and add optional Agile
   fields such as `themeId`, `initiativeId` and `epicIds`.

The `examples/project-split` folder demonstrates the target layout.

## Schema Updates

### 1. Slice Schema Updates
Update your slice schemas to match the new format:

```json
{
  "$id": "immerschema/schemas/slices/your-slice.slice.schema.json",
  "title": "Your Slice Title",
  "type": "object",
  "properties": {
    // ... properties
  },
  "additionalProperties": true
}
```

### 2. Enum Updates
Update enum files to use the new format:

```json
{
  "$id": "immerschema/schemas/enum/your-enum.enum.json",
  "type": "string",
  "enum": [
    // ... enum values
  ]
}
```

### 3. Taxonomy Updates
Update taxonomy files:

```json
{
  "$id": "immerschema/schemas/taxonomy/your-taxonomy.taxonomy.json",
  "type": "object",
  "properties": {
    // ... taxonomy properties
  }
}
```

## Testing Your Migration

### 1. Run Schema Validation
```powershell
# Run the test suite
node scripts/test_runner.js
```

### 2. Validate Project Files
```powershell
# Validate your project files
node validate.js your-project.json
```

### 3. Check Schema Combination
```powershell
# Generate combined schema
node combine-schemas.cjs
```

## Troubleshooting

### Common Issues

1. **Reference Resolution Errors**
   - Check all `$ref` paths in your schemas
   - Ensure file names match the new convention
   - Verify directory structure

2. **Validation Failures**
   - Check for missing required fields
   - Verify enum values match new definitions
   - Ensure proper state transitions

3. **Schema Combination Issues**
   - Verify all schema files are properly formatted
   - Check for circular references
   - Ensure proper `$id` values

### Getting Help

If you encounter issues:

1. Check the error messages in the console
2. Review the schema documentation
3. Check the test suite for examples
4. Open an issue on the project repository

## Post-Migration Checklist

- [ ] All schema files renamed to new convention
- [ ] All references updated
- [ ] New required fields added
- [ ] Test suite passes
- [ ] Project files validate
- [ ] Schema combination works
- [ ] Documentation updated

## Additional Resources

- [Schema Documentation](docs/README.md)
- [Naming Conventions](docs/NAMING_Conventions.md)
- [Release Process](docs/RELEASE_PROCESS.md)
- [Test Examples](test/) 