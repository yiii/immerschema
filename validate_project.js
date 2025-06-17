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
  
  // Add the 2020-12 meta-schema
  const metaSchema = {
    $schema: "http://json-schema.org/draft/2020-12/schema",
    $id: "http://json-schema.org/draft/2020-12/schema",
    type: "object"
  };
  ajv.addMetaSchema(metaSchema);

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
      console.log(`📋 Schema already registered: ${schemaPath}`);
      return;
    }
    
    try {
      console.log(`\n📥 Loading schema: ${schemaPath}`);
      const schema = loadSchema(schemaPath);
      registeredSchemas.add(schemaPath);
      
      // Register the schema itself
      try {
        ajv.addSchema(schema, schema.$id || schemaPath);
        console.log(`✅ Registered schema: ${schema.$id || schemaPath}`);
        if (schema.title) {
          console.log(`   Title: ${schema.title}`);
        }
        if (schema.description) {
          console.log(`   Description: ${schema.description}`);
        }
      } catch (e) {
        if (e.message.includes('already exists')) {
          console.log(`📋 Schema already registered: ${schema.$id || schemaPath}`);
        } else {
          throw e;
        }
      }
      
      // Handle direct $ref
      if (schema.$ref) {
        const refPath = resolveSchemaRef(schemaPath, schema.$ref);
        if (refPath && fs.existsSync(refPath)) {
          console.log(`   Referencing: ${refPath}`);
          registerSchema(refPath);
        } else if (refPath) {
          console.warn(`⚠️  Reference not found: ${refPath}`);
          console.warn(`   Referenced from: ${schemaPath}`);
          console.warn(`   Reference: ${schema.$ref}`);
        }
      }
      
      // Handle allOf, anyOf, oneOf arrays
      ['allOf', 'anyOf', 'oneOf'].forEach(key => {
        if (Array.isArray(schema[key])) {
          schema[key].forEach(subSchema => {
            if (subSchema.$ref) {
              const refPath = resolveSchemaRef(schemaPath, subSchema.$ref);
              if (refPath && fs.existsSync(refPath)) {
                console.log(`   ${key} referencing: ${refPath}`);
                registerSchema(refPath);
              } else if (refPath) {
                console.warn(`⚠️  ${key} reference not found: ${refPath}`);
                console.warn(`   Referenced from: ${schemaPath}`);
                console.warn(`   Reference: ${subSchema.$ref}`);
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
              console.log(`   Property '${propName}' referencing: ${refPath}`);
              registerSchema(refPath);
            } else if (refPath) {
              console.warn(`⚠️  Property '${propName}' reference not found: ${refPath}`);
              console.warn(`   Referenced from: ${schemaPath}`);
              console.warn(`   Reference: ${prop.$ref}`);
            }
          }
        });
      }
    } catch (e) {
      console.error(`❌ Failed to register schema: ${schemaPath}`);
      console.error(`   Error details: ${e.message}`);
      if (e.stack) {
        console.error(`   Stack trace: ${e.stack}`);
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
    'node_modules/immerschema/schemas/enum/assetkind.enum.json',
    'node_modules/immerschema/schemas/enum/assetrole.enum.json',
    'node_modules/immerschema/schemas/enum/dept.enum.json',
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
    'node_modules/immerschema/schemas/slices/crew.slice.schema.json',
    'node_modules/immerschema/schemas/slices/tasks.slice.schema.json',
    'node_modules/immerschema/schemas/slices/risk.slice.json',
    'node_modules/immerschema/schemas/slices/voice.slice.schema.json',
    'node_modules/immerschema/schemas/slices/meta-scene.slice.schema.json',
    'node_modules/immerschema/schemas/slices/screen.slice.schema.json',
    'node_modules/immerschema/schemas/slices/assets.slice.schema.json',
    'node_modules/immerschema/schemas/slices/description.slice.schema.json',
    'node_modules/immerschema/schemas/slices/workload.slice.json',
    'node_modules/immerschema/schemas/slices/bottleneck.slice.json',
    'node_modules/immerschema/schemas/slices/audio.slice.schema.json',
    // Add the new property wrapper slices
    'schemas/slices/assets.prop.slice.json',
    'schemas/slices/tasks.prop.slice.json',
    'schemas/slices/crew.prop.slice.json',
    'schemas/slices/risks.prop.slice.json'
  ];
  
  sliceSchemas.forEach(schemaPath => {
    registerSchema(schemaPath);
  });

  // Register profile schemas
  console.log('\nRegistering profile schemas...');
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
  const projectSchema = loadSchema('schemas/project.draft.schema.json');
  ajv.addSchema(projectSchema, projectSchema.$id);

  // Helper to validate a file against a schema
  function validateFile(filePath, schemaPath, description) {
    try {
      console.log(`\n🔍 Validating ${description}...`);
      console.log(`📄 Schema: ${schemaPath}`);
      
      // Check if test file exists
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Test file not found: ${filePath} - SKIPPING`);
        return null; // Return null to indicate skipped
      }
      
      const data = loadSchema(filePath);
      const schema = loadSchema(schemaPath);
      
      console.log(`🔎 Looking for validator with ID: ${schema.$id || schemaPath}`);
      console.log(`🔎 Schema type from file: ${schema.type}`);
      
      // Use already-registered schema by $id or path
      const validate = ajv.getSchema(schema.$id || schemaPath);
      if (!validate) {
        console.error(`❌ No validator found for schema: ${schema.$id || schemaPath}`);
        return false;
      }
      
      console.log(`✅ Found validator for: ${schema.$id || schemaPath}`);
      console.log(`🔎 Validator schema type: ${validate.schema?.type || 'unknown'}`);
      console.log(`🔎 Validator schema title: ${validate.schema?.title || 'unknown'}`);
      
      // Ensure we're using the right schema
      if (validate.schema?.type !== schema.type) {
        console.error(`⚠️  Schema type mismatch!`);
        console.error(`  Expected: ${schema.type}`);
        console.error(`  Got: ${validate.schema?.type}`);
        console.error(`  This suggests a schema ID conflict!`);
      }
      
      const valid = validate(data);
      
      if (valid) {
        console.log(`✅ ${description} validation: PASSED`);
      } else {
        console.error(`❌ ${description} validation: FAILED`);
        console.log('\nValidation Errors:');
        
        // Group errors by type for better readability
        const errorsByType = {};
        validate.errors.forEach(error => {
          const errorType = error.keyword.toUpperCase();
          if (!errorsByType[errorType]) {
            errorsByType[errorType] = [];
          }
          errorsByType[errorType].push(error);
        });
        
        Object.keys(errorsByType).forEach(errorType => {
          console.log(`\n${errorType} Errors:`);
          errorsByType[errorType].forEach(error => {
            console.log(`  Path: ${error.instancePath || '/'}`);
            console.log(`  Message: ${error.message}`);
            if (error.params) {
              console.log(`  Details: ${JSON.stringify(error.params)}`);
            }
            // Show which schema this error comes from
            if (error.schemaPath) {
              console.log(`  Schema path: ${error.schemaPath}`);
            }
          });
        });
      }
      return valid;
    } catch (e) {
      console.error(`❌ ${description} validation: ERROR`);
      console.error('Error details:', e.message);
      if (e.stack) {
        console.error('Stack trace:', e.stack);
      }
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

  // Test the review file against all profiles to see compatibility
  const reviewFile = 'test/test_shot.json';
  const testProjectFile = 'test/test_project.json';
  const profileTests = [
    { profile: 'node_modules/immerschema/schemas/profiles/draft.schema.json', desc: 'Review file vs Draft profile' },
    { profile: 'node_modules/immerschema/schemas/profiles/review.schema.json', desc: 'Review file vs Review profile' },
    { profile: 'node_modules/immerschema/schemas/profiles/plan.schema.json', desc: 'Review file vs Plan profile' },
    { profile: 'node_modules/immerschema/schemas/profiles/assign.schema.json', desc: 'Review file vs Assign profile' },
    { profile: 'node_modules/immerschema/schemas/profiles/lock.schema.json', desc: 'Review file vs Lock profile' }
  ];

  // Validate review file against all profiles
  profileTests.forEach(({ profile, desc }) => {
    results.total++;
    const result = validateFile(reviewFile, profile, desc);
    if (result === null) {
      results.skipped++;
    } else if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
  });

  // Validate test_project.json against project schema (not shot profiles)
  results.total++;
  const projectResult = validateFile(testProjectFile, 'schemas/project.draft.schema.json', 'Test Project file vs Project Draft schema');
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
  console.log('Validated test/test_shot.json against shot profile schemas and test/test_project.json against project schema.');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Skipped: ${results.skipped}`);
  console.log(`📈 Total: ${results.total}`);

} catch (err) {
  console.error('Unexpected error:', err);
  process.exit(1);
} 