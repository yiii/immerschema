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
      const resolved = path.join(path.dirname(basePath), ref);
      console.log(`Resolved relative path to: ${resolved}`);
      return resolved;
    }
    
    // Handle absolute paths (from $id)
    if (ref.startsWith('immerschema/')) {
      const resolved = path.join(__dirname, ref.replace('immerschema/', ''));
      console.log(`Resolved immerschema path to: ${resolved}`);
      return resolved;
    }
    
    return null;
  }

  // Helper to register a schema and its dependencies recursively
  const registeredSchemas = new Set();
  
  function registerSchema(schemaPath) {
    // Avoid infinite recursion
    if (registeredSchemas.has(schemaPath)) {
      console.log(`Schema already registered: ${schemaPath}`);
      return;
    }
    
    try {
      const schema = loadSchema(schemaPath);
      registeredSchemas.add(schemaPath);
      
      // Register the schema itself
      ajv.addSchema(schema, schema.$id || schemaPath);
      console.log(`Registered schema: ${schema.$id || schemaPath}`);
      
      // Handle direct $ref
      if (schema.$ref) {
        const refPath = resolveSchemaRef(schemaPath, schema.$ref);
        if (refPath && fs.existsSync(refPath)) {
          registerSchema(refPath);
        } else if (refPath) {
          console.warn(`Reference not found: ${refPath}`);
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
              }
            }
          });
        }
      });

      // Handle properties that might contain $refs
      if (schema.properties) {
        Object.values(schema.properties).forEach(prop => {
          if (prop.$ref) {
            const refPath = resolveSchemaRef(schemaPath, prop.$ref);
            if (refPath && fs.existsSync(refPath)) {
              registerSchema(refPath);
            } else if (refPath) {
              console.warn(`Reference not found: ${refPath}`);
            }
          }
        });
      }
    } catch (e) {
      console.error(`Failed to register schema: ${schemaPath}`);
      console.error(e.message);
    }
  }

  // Register all base schemas first
  console.log('\nRegistering base schemas...');
  const baseSchemas = [
    'schemas/enum/technique.enum.json',
    'schemas/enum/riskflag.enum.json',
    'schemas/enum/screenzone.enum.json',
    'schemas/enum/software.enum.json',
    'schemas/enum/role.enum.json',
    'schemas/ext/debug.schema.json'
  ];
  
  baseSchemas.forEach(schemaPath => {
    registerSchema(schemaPath);
  });

  // Register slice schemas
  console.log('\nRegistering slice schemas...');
  const sliceSchemas = [
    'schemas/slices/id.schema.json',
    'schemas/slices/note.schema.json',
    'schemas/slices/timing.sec.schema.json',
    'schemas/slices/timing.frames.schema.json',
    'schemas/slices/technique.schema.json',
    'schemas/slices/software.schema.json',
    'schemas/slices/tasks.schema.json',
    'schemas/slices/crew.schema.json',
    'schemas/slices/safety.schema.json',
    'schemas/slices/voice.schema.json'
  ];
  
  sliceSchemas.forEach(schemaPath => {
    registerSchema(schemaPath);
  });

  // Register profile schemas FIRST (before core schema that references them)
  const profileSchemas = [
    'schemas/profiles/draft.schema.json',
    'schemas/profiles/review.schema.json',
    'schemas/profiles/plan.schema.json',
    'schemas/profiles/assign.schema.json',
    'schemas/profiles/lock.schema.json'
  ];
  
  console.log('\nRegistering profile schemas...');
  profileSchemas.forEach(schemaPath => {
    registerSchema(schemaPath);
  });

  // Load and register project schema (depends on profiles)
  console.log('\nRegistering project schema...');
  const projectSchema = loadSchema('schemas/project.schema.json');
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
      const validate = ajv.compile(schema);
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
    { file: 'test_shot.draft.json', profile: 'schemas/profiles/draft.schema.json', desc: 'Draft shot' },
    { file: 'test_shot.review.json', profile: 'schemas/profiles/review.schema.json', desc: 'Review shot' },
    { file: 'test_shot.plan.json', profile: 'schemas/profiles/plan.schema.json', desc: 'Plan shot' },
    { file: 'test_shot.assign.json', profile: 'schemas/profiles/assign.schema.json', desc: 'Assign shot' },
    { file: 'test_shot.lock.json', profile: 'schemas/profiles/lock.schema.json', desc: 'Lock shot' }
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
  const projectResult = validateFile('test_project.json', 'schemas/project.schema.json', 'Project');
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