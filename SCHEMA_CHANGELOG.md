# Schema Change Log and Migration Plan

## Overview
This document tracks the recent changes made to the immerschema project schemas and provides a comprehensive migration plan for consumers of the schema.

## Changes Made

### 🆕 New Enum Schemas Added
**Date:** Current working directory changes  
**Impact:** ⚠️ **BREAKING** - New required structure

#### Added Files:
- `schemas/enum/dept.enum.json` - Department enumeration with 14 pipeline departments
- `schemas/enum/assetkind.enum.json` - Asset kind enumeration (image, video, audio, 3d, pdf, other)
- `schemas/enum/assetrole.enum.json` - Asset role enumeration (reference, plate, texture, hdr, preview, storyboard, animatic, legal, other)

### 🔧 Modified Schemas

#### 1. `schemas/slices/crew.slice.schema.json`
**Change Type:** 🔥 **BREAKING CHANGE**

**Before:**
```json
{
  "type": "object",
  "properties": {
    "people": {
      "type": "array",
      "items": { ... }
    }
  }
}
```

**After:**
```json
{
  "type": "array",
  "items": { ... },
  "default": []
}
```

**Impact:** 
- Structure changed from object with `people` property to direct array
- Added `additionalProperties: false` for stricter validation
- Added conditional validation for `customRole` when `role` is "other"
- Removed `note` from required fields, moved to optional

#### 2. `schemas/slices/assets.slice.schema.json`
**Change Type:** 🔥 **BREAKING CHANGE**

**Major Changes:**
- Simplified from complex nested structure to direct array
- Now uses enum references for `kind` and `role` properties
- Added `additionalProperties: false` for stricter validation
- Cleaner property definitions with better descriptions

**New Structure:**
```json
{
  "type": "array",
  "items": {
    "required": ["path", "kind", "role"],
    "properties": {
      "path": { "type": "string", "pattern": "^(https?://|/|\\./).+" },
      "kind": { "$ref": "../enum/assetkind.enum.json" },
      "role": { "$ref": "../enum/assetrole.enum.json" },
      // ... other properties
    }
  }
}
```

#### 3. `schemas/slices/tasks.slice.schema.json`
**Change Type:** 🔥 **BREAKING CHANGE**

**Key Changes:**
- Changed from object wrapper to direct array
- Updated `id` type from `integer` to `string`
- Renamed `owner` to `assignedTo`
- Added `dept` enum reference to `../enum/dept.enum.json`
- Added `additionalProperties: false`
- Enhanced descriptions for all properties
- Added `note` as optional field

#### 4. `schemas/profiles/assign.schema.json`
**Change Type:** ⚠️ **MINOR BREAKING**

**Change:**
- Updated required field from `"people"` to `"crew"` to match new crew slice structure

### 📝 Additional Modified Files
- `schemas/slices/risk.slice.json`
- `schemas/slices/technique.slice.schema.json`
- `schemas/slices/voice.slice.schema.json`

## Migration Plan

### Phase 1: Preparation (Before Migration)
**Estimated Time:** 1-2 days

1. **Backup Current Data**
   ```powershell
   # Create backup of current data files
   Copy-Item -Recurse data/ data_backup_$(Get-Date -Format "yyyyMMdd")/
   ```

2. **Identify Affected Systems**
   - Applications consuming crew data
   - Asset management systems
   - Task tracking systems
   - Profile assignment workflows

3. **Update Schema Validation**
   - Update schema references in applications
   - Test schema validation with new enum constraints

### Phase 2: Data Structure Migration (Critical)
**Estimated Time:** 2-3 days

#### 2.1 Crew Data Migration
**BREAKING:** Structure change from `{people: [...]}` to `[...]`

```javascript
// Migration script example
function migrateCrew(oldCrewData) {
  // Old format: { people: [crew members] }
  // New format: [crew members]
  
  if (oldCrewData && oldCrewData.people) {
    return oldCrewData.people.map(person => ({
      ...person,
      // Ensure customRole is present when role is "other"
      ...(person.role === "other" && !person.customRole ? 
          { customRole: person.role } : {})
    }));
  }
  return [];
}
```

#### 2.2 Assets Data Migration
**BREAKING:** Complete restructure required

```javascript
function migrateAssets(oldAssetsData) {
  // Old format: { assets: { ... complex nested structure } }
  // New format: [{ path, kind, role, ... }]
  
  const newAssets = [];
  
  // Map old asset structure to new simplified array format
  if (oldAssetsData && oldAssetsData.assets) {
    // Convert old nested structure to flat array
    // This will require custom logic based on your old structure
    Object.values(oldAssetsData.assets).forEach(asset => {
      newAssets.push({
        path: asset.path,
        kind: mapToAssetKind(asset.type), // Map to new enum
        role: mapToAssetRole(asset.purpose), // Map to new enum
        // ... other properties
      });
    });
  }
  
  return newAssets;
}

function mapToAssetKind(oldType) {
  const mapping = {
    'img': 'image',
    'vid': 'video',
    'snd': 'audio',
    'model': '3d',
    'doc': 'pdf'
    // Add your specific mappings
  };
  return mapping[oldType] || 'other';
}
```

#### 2.3 Tasks Data Migration
**BREAKING:** Multiple field changes

```javascript
function migrateTasks(oldTasksData) {
  // Old format: { tasks: [{ id: number, owner: string, ... }] }
  // New format: [{ id: string, assignedTo: string, dept: enum, ... }]
  
  if (oldTasksData && oldTasksData.tasks) {
    return oldTasksData.tasks.map(task => ({
      id: String(task.id), // Convert number to string
      task: task.task,
      dept: mapToDeptEnum(task.dept),
      prio: task.prio,
      assignedTo: task.owner, // Rename field
      status: task.status,
      note: task.note || "" // Add if missing
    }));
  }
  return [];
}

function mapToDeptEnum(oldDept) {
  const deptMapping = {
    'direction': 'DIR',
    'production': 'PROD',
    'cg': 'CG',
    'effects': 'FX',
    '2d': '2D',
    'general': 'GEN',
    'ai': 'AI',
    'capture': 'CAM',
    'audio': 'AUDIO',
    'editing': 'EDIT',
    'compositing': 'COMP',
    'pipeline': 'PIPE',
    'support': 'SUPPORT'
  };
  return deptMapping[oldDept?.toLowerCase()] || 'OTHER';
}
```

### Phase 3: Application Updates (High Priority)
**Estimated Time:** 3-5 days

#### 3.1 Update Schema References
1. **Update import paths** in applications that reference schemas
2. **Update validation logic** to handle new enum constraints
3. **Update form components** that create/edit crew, assets, and tasks

#### 3.2 Update API Endpoints
```javascript
// Example API endpoint updates
app.get('/api/crew', (req, res) => {
  // OLD: res.json({ people: crew })
  // NEW: res.json(crew) // Direct array
});

app.post('/api/tasks', (req, res) => {
  const task = req.body;
  // Validate against new schema requirements
  // Ensure dept matches enum values
  // Ensure assignedTo is present (renamed from owner)
});
```

#### 3.3 Update UI Components
- **Crew Management:** Update components expecting `people` property
- **Asset Upload:** Update forms to use new `kind` and `role` enums
- **Task Creation:** Update forms with new field names and enum constraints

### Phase 4: Testing & Validation (Essential)
**Estimated Time:** 2-3 days

1. **Schema Validation Testing**
   ```powershell
   # Test new schemas with sample data
   npm run validate-schemas
   ```

2. **Data Migration Testing**
   - Test migration scripts with sample data
   - Verify all data fields are properly mapped
   - Validate enum constraint compliance

3. **Integration Testing**
   - Test API endpoints with new data structures
   - Verify UI components work with migrated data
   - Test schema validation in applications

### Phase 5: Deployment & Rollback Plan
**Estimated Time:** 1 day

#### Deployment Steps:
1. **Deploy schema updates** to staging environment
2. **Run data migration scripts** on staging data
3. **Deploy application updates** that consume new schema
4. **Verify functionality** in staging
5. **Deploy to production** with monitoring

#### Rollback Plan:
1. **Immediate rollback:** Revert to previous schema version
2. **Data rollback:** Restore from backup created in Phase 1
3. **Application rollback:** Deploy previous application version
4. **Verify rollback:** Ensure all systems operational

## Risk Assessment

### 🔴 High Risk
- **Data Loss:** Improper migration could lose crew/asset/task data
- **System Downtime:** Applications may fail with new schema structure
- **Enum Violations:** Existing data may not match new enum constraints

### 🟡 Medium Risk
- **Performance Impact:** Schema validation might be slower with stricter rules
- **User Training:** UI changes may require user retraining

### 🟢 Low Risk
- **New enum files:** Additive changes with low breaking potential

## Validation Checklist

### Pre-Migration
- [ ] All data backed up
- [ ] Migration scripts tested on sample data
- [ ] Staging environment prepared
- [ ] Team notified of breaking changes

### Post-Migration
- [ ] All crew data accessible as direct array
- [ ] All assets have valid `kind` and `role` enum values
- [ ] All tasks have `assignedTo` instead of `owner`
- [ ] All task IDs are strings, not numbers
- [ ] All dept fields use new enum values
- [ ] Schema validation passes for all migrated data
- [ ] UI components work with new data structure
- [ ] API endpoints return correct data format

## Timeline Summary

| Phase | Duration | Priority | Risk Level |
|-------|----------|----------|------------|
| Preparation | 1-2 days | High | Low |
| Data Migration | 2-3 days | Critical | High |
| Application Updates | 3-5 days | High | Medium |
| Testing | 2-3 days | Essential | Medium |
| Deployment | 1 day | Critical | High |
| **Total** | **9-14 days** | | |

## Support Contacts

For migration support and questions:
- **Schema Changes:** Development Team
- **Data Migration:** Data Engineering Team  
- **Application Updates:** Frontend/Backend Teams
- **Deployment:** DevOps Team

---
*Last Updated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")* 