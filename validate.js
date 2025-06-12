import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {

  // Use Ajv2020 for draft-2020-12 support
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    verbose: true
  });
  addFormats(ajv);

  // Helper to load a schema
  function loadSchema(relPath) {
    try {
      const fullPath = path.join(__dirname, relPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const schema = JSON.parse(content);
      console.log(`Loaded schema: ${relPath}`);
      return schema;
    } catch (e) {
      console.error(`Failed to load schema: ${relPath}`);
      console.error(e.message);
      throw e;
    }
  }

  // Helper to resolve schema references
  function resolveSchemaRef(basePath, ref) {
    if (!ref) return null;
    
    console.log(`Resolving reference: ${ref} from ${basePath}`);
    
    // Handle relative paths
    if (ref.startsWith('./') || ref.startsWith('../')) {
      // Always use the __dirname as base and the basePath directory
      const baseDir = path.join(__dirname, path.dirname(basePath));
      const resolved = path.resolve(baseDir, ref);
      console.log(`Resolved relative path to: ${resolved}`);
      return path.relative(__dirname, resolved); // Return relative to project root
    }
    
    // Handle absolute paths (from $id)
    if (ref.startsWith('immerschema/')) {
      const resolved = ref.replace('immerschema/', '');
      console.log(`Resolved immerschema path to: ${resolved}`);
      return resolved;
    }
    
    // Handle direct file references
    if (ref.endsWith('.json')) {
      console.log(`Resolved direct file reference to: ${ref}`);
      return ref;
    }
    
    return null;
  }

  // Helper to register a schema and its dependencies recursively
  const registeredSchemas = new Set();
  
  function registerSchema(schemaPath) {
    // Avoid infinite recursion and duplicate registrations
    if (registeredSchemas.has(schemaPath)) {
      console.log(`Schema already registered: ${schemaPath}`);
      return;
    }
    
    try {
      const schema = loadSchema(schemaPath);
      registeredSchemas.add(schemaPath);
      
      // Register the schema itself
      try {
        ajv.addSchema(schema, schema.$id || schemaPath);
        console.log(`Registered schema: ${schema.$id || schemaPath}`);
      } catch (e) {
        if (e.message.includes('already exists')) {
          console.log(`Schema already registered: ${schema.$id || schemaPath}`);
        } else {
          throw e;
        }
      }
      
      // Handle direct $ref
      if (schema.$ref) {
        const refPath = resolveSchemaRef(schemaPath, schema.$ref);
        if (refPath && fs.existsSync(refPath)) {
          registerSchema(refPath);
        } else if (refPath) {
          console.warn(`Reference not found: ${refPath}`);
          console.warn(`  Referenced from: ${schemaPath}`);
          console.warn(`  Reference: ${schema.$ref}`);
        }
      }
      
      // Handle allOf, anyOf, oneOf arrays
      ['allOf', 'anyOf', 'oneOf'].forEach(key => {
        if (Array.isArray(schema[key])) {
          schema[key].forEach(subSchema => {
            if (subSchema.$ref) {
              const refPath = resolveSchemaRef(schemaPath, subSchema.$ref);
              if (refPath && fs.existsSync(refPath)) {
                registerSchema(refPath);
              } else if (refPath) {
                console.warn(`Reference not found: ${refPath}`);
                console.warn(`  Referenced from: ${schemaPath}`);
                console.warn(`  Reference: ${subSchema.$ref}`);
              }
            }
          });
        }
      });

      // Handle properties that might contain $refs
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([propName, prop]) => {
          if (prop.$ref) {
            const refPath = resolveSchemaRef(schemaPath, prop.$ref);
            if (refPath && fs.existsSync(refPath)) {
              registerSchema(refPath);
            } else if (refPath) {
              console.warn(`Reference not found: ${refPath}`);
              console.warn(`  Referenced from: ${schemaPath}`);
              console.warn(`  Property: ${propName}`);
              console.warn(`  Reference: ${prop.$ref}`);
            }
          }
        });
      }
    } catch (e) {
      console.error(`Failed to register schema: ${schemaPath}`);
      console.error(`Error details: ${e.message}`);
      if (e.stack) {
        console.error(`Stack trace: ${e.stack}`);
      }
    }
  }

  // Register all base schemas first
  console.log('\nRegistering base schemas...');
  const baseSchemas = [
    'node_modules/immerschema/schemas/enum/technique.enum.json',
    'node_modules/immerschema/schemas/enum/riskflag.enum.json',
    'node_modules/immerschema/schemas/enum/screenzone.enum.json',
    'node_modules/immerschema/schemas/enum/software.enum.json',
    'node_modules/immerschema/schemas/enum/role.enum.json',
    'node_modules/immerschema/schemas/ext/debug.schema.json'
  ];
  
  baseSchemas.forEach(schemaPath => {
    registerSchema(schemaPath);
  });

  // Register slice schemas
  console.log('\nRegistering slice schemas...');
  const sliceSchemas = [
    'node_modules/immerschema/schemas/slices/id.slice.schema.json',
    'node_modules/immerschema/schemas/slices/note.slice.schema.json',
    'node_modules/immerschema/schemas/slices/timing-seconds.slice.schema.json',
    'node_modules/immerschema/schemas/slices/timing-frames.slice.schema.json',
    'node_modules/immerschema/schemas/slices/timing.slice.schema.json',
    'node_modules/immerschema/schemas/slices/tech-group.slice.schema.json',
    'node_modules/immerschema/schemas/slices/technique.slice.schema.json',
    'node_modules/immerschema/schemas/slices/software.slice.schema.json',
    'node_modules/immerschema/schemas/slices/tasks.slice.schema.json',
    'node_modules/immerschema/schemas/slices/crew.slice.schema.json',
    'node_modules/immerschema/schemas/slices/risk.slice.json',
    'node_modules/immerschema/schemas/slices/voice.slice.schema.json',
    'node_modules/immerschema/schemas/slices/meta-scene.slice.schema.json',
    'node_modules/immerschema/schemas/slices/screen.slice.schema.json',
    'node_modules/immerschema/schemas/slices/assets.slice.schema.json',
    'node_modules/immerschema/schemas/slices/description.slice.schema.json',
    'node_modules/immerschema/schemas/slices/workload.slice.json',
    'node_modules/immerschema/schemas/slices/bottleneck.slice.json',
    'node_modules/immerschema/schemas/slices/audio.slice.schema.json'
  ];
  
  sliceSchemas.forEach(schemaPath => {
    registerSchema(schemaPath);
  });

  // Register profile schemas FIRST (before core schema that references them)
  const profileSchemas = [
    'node_modules/immerschema/schemas/profiles/draft.schema.json',
    'node_modules/immerschema/schemas/profiles/review.schema.json',
    'node_modules/immerschema/schemas/profiles/plan.schema.json',
    'node_modules/immerschema/schemas/profiles/assign.schema.json',
    'node_modules/immerschema/schemas/profiles/lock.schema.json'
  ];
  
  console.log('\nRegistering profile schemas...');
  profileSchemas.forEach(schemaPath => {
    registerSchema(schemaPath);
  });

  // Load and register project schema (depends on profiles)
  console.log('\nRegistering project schema...');
  const projectSchema = loadSchema('node_modules/immerschema/schemas/project.draft.schema.json');
  ajv.addSchema(projectSchema, projectSchema.$id);

  // Helper to validate a file against a schema
  function validateFile(filePath, schemaPath, description) {
    try {
      console.log(`\nValidating ${description}...`);
      
      // Check if test file exists
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Test file not found: ${filePath} - SKIPPING`);
        return null; // Return null to indicate skipped
      }
      
      const data = loadSchema(filePath);
      const schema = loadSchema(schemaPath);
      // Use already-registered schema by $id or path
      const validate = ajv.getSchema(schema.$id || schemaPath);
      if (!validate) {
        console.error(`❌ No validator found for schema: ${schema.$id || schemaPath}`);
        return false;
      }
      const valid = validate(data);
      
      if (valid) {
        console.log(`✅ ${description} validation: PASSED`);
      } else {
        console.log(`❌ ${description} validation: FAILED`);
        console.log('Validation errors:', JSON.stringify(validate.errors, null, 2));
      }
      return valid;
    } catch (e) {
      console.error(`❌ ${description} validation: ERROR`);
      console.error(e.message);
      return false;
    }
  }

  // Validate test files
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0
  };

  // Validate shots against different profiles
  const shotFiles = [
    { file: 'test_shot.draft.json', profile: 'node_modules/immerschema/schemas/profiles/draft.schema.json', desc: 'Draft shot' },
    { file: 'test_shot.review.json', profile: 'node_modules/immerschema/schemas/profiles/review.schema.json', desc: 'Review shot' },
    { file: 'test_shot.plan.json', profile: 'node_modules/immerschema/schemas/profiles/plan.schema.json', desc: 'Plan shot' },
    { file: 'test_shot.assign.json', profile: 'node_modules/immerschema/schemas/profiles/assign.schema.json', desc: 'Assign shot' },
    { file: 'test_shot.lock.json', profile: 'node_modules/immerschema/schemas/profiles/lock.schema.json', desc: 'Lock shot' }
  ];

  shotFiles.forEach(({ file, profile, desc }) => {
    results.total++;
    const result = validateFile(file, profile, desc);
    if (result === null) {
      results.skipped++;
    } else if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
  });

  // Validate project
  results.total++;
  const projectResult = validateFile('test_project.json', 'node_modules/immerschema/schemas/project.draft.schema.json', 'Project');
  if (projectResult === null) {
    results.skipped++;
  } else if (projectResult) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Print summary
  console.log('\n📊 Final Results');
  console.log('=================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Skipped: ${results.skipped}`);
  console.log(`📈 Total: ${results.total}`);

} catch (err) {
  console.error('Unexpected error:', err);
  process.exit(1);
} 