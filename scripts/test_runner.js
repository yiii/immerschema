#!/usr/bin/env node

/**
 * Test Runner for Fulldome Schema Suite
 * 
 * This script validates all examples and test files against their respective schemas.
 * It uses AJV (Another JSON Schema Validator) to perform the validation.
 * 
 * Usage:
 *   node scripts/test_runner.js
 * 
 * Requirements:
 *   npm install ajv ajv-formats
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// Global AJV instance
let globalAjv = null;

function setupAjv() {
  if (globalAjv) return globalAjv;
  
  globalAjv = new Ajv({ 
    strict: false, 
    allErrors: true,
    verbose: true,
    validateFormats: false
  });
  addFormats(globalAjv);

  // Load all schemas first
  const enumSchemas = [
    'schemas/enum/technique.enum.json',
    'schemas/enum/screenzone.enum.json', 
    'schemas/enum/riskflag.enum.json',
    'schemas/enum/role.enum.json',
    'schemas/enum/software.enum.json',
    'schemas/enum/assetkind.enum.json',
    'schemas/enum/assetrole.enum.json',
    'schemas/enum/dept.enum.json'
  ];
  
  const extSchemas = [
    'schemas/ext/debug.schema.json'
  ];
  
  const sliceSchemas = [
    'schemas/slices/id.slice.schema.json',
    'schemas/slices/note.slice.schema.json',
    'schemas/slices/timing-seconds.slice.schema.json',
    'schemas/slices/timing-frames.slice.schema.json',
    'schemas/slices/timing.slice.schema.json',
    'schemas/slices/tech-group.slice.schema.json',
    'schemas/slices/technique.slice.schema.json',
    'schemas/slices/software.slice.schema.json',
    'schemas/slices/tasks.slice.schema.json',
    'schemas/slices/crew.slice.schema.json',
    'schemas/slices/risk.slice.json',
    'schemas/slices/voice.slice.schema.json',
    'schemas/slices/meta-scene.slice.schema.json',
    'schemas/slices/screen.slice.schema.json',
    'schemas/slices/additional-screens.slice.schema.json',
    'schemas/slices/assets.slice.schema.json',
    'schemas/slices/description.slice.schema.json',
    'schemas/slices/workload.slice.json',
    'schemas/slices/bottleneck.slice.json',
    'schemas/slices/audio.slice.schema.json'
  ];
  
  const profileSchemas = [
    'schemas/profiles/draft.schema.json',
    'schemas/profiles/review.schema.json',
    'schemas/profiles/plan.schema.json',
    'schemas/profiles/assign.schema.json',
    'schemas/profiles/lock.schema.json'
  ];
  
  const projectSchemas = [
    'schemas/project.draft.schema.json',
    'schemas/project.review.schema.json',
    'schemas/project.plan.schema.json',
    'schemas/project.assign.schema.json',
    'schemas/project.lock.schema.json'
  ];

  // Register enum schemas first  
  enumSchemas.forEach(path => {
    try {
      const schema = JSON.parse(readFileSync(join('.', path), 'utf8'));
      globalAjv.addSchema(schema, schema.$id);
    } catch (e) {
      console.warn(`Warning: Could not load schema ${path}: ${e.message}`);
    }
  });
  
  // Register extension schemas
  extSchemas.forEach(path => {
    try {
      const schema = JSON.parse(readFileSync(join('.', path), 'utf8'));
      globalAjv.addSchema(schema, schema.$id);
    } catch (e) {
      console.warn(`Warning: Could not load schema ${path}: ${e.message}`);
    }
  });
  
  // Register slice schemas
  sliceSchemas.forEach(path => {
    try {
      const schema = JSON.parse(readFileSync(join('.', path), 'utf8'));
      globalAjv.addSchema(schema, schema.$id);
    } catch (e) {
      console.warn(`Warning: Could not load schema ${path}: ${e.message}`);
    }
  });
  
  // Register profile schemas
  profileSchemas.forEach(path => {
    try {
      const schema = JSON.parse(readFileSync(join('.', path), 'utf8'));
      globalAjv.addSchema(schema, schema.$id);
    } catch (e) {
      console.warn(`Warning: Could not load schema ${path}: ${e.message}`);
    }
  });
  
  // Register project schemas last
  projectSchemas.forEach(path => {
    try {
      const schema = JSON.parse(readFileSync(join('.', path), 'utf8'));
      globalAjv.addSchema(schema, schema.$id);
    } catch (e) {
      console.warn(`Warning: Could not load schema ${path}: ${e.message}`);
    }
  });
  
  return globalAjv;
}

async function validateJson(schemaDir, dataOrPath, schemaPath, isDataObject = false) {
  const ajv = setupAjv();

  // Load and validate data
  let data;
  if (isDataObject) {
    data = dataOrPath;
  } else {
    data = JSON.parse(readFileSync(dataOrPath, 'utf8'));
  }
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
  
  const validate = ajv.getSchema(schema.$id) ?? ajv.compile(schema);
  const valid = validate(data);
  
  return { 
    success: valid,
    errors: validate.errors
  };
}

async function runExampleValidation() {
  log(colors.blue, `\n📋 Validating example files`);
  
  const examples = [
    { file: 'examples/simple_project.json', schema: 'schemas/project.draft.schema.json' },
    { file: 'examples/comprehensive_project.json', schema: 'schemas/project.lock.schema.json' },
    { file: 'examples/ai_generated_shot.json', schema: 'schemas/profiles/draft.schema.json' },
    { file: 'examples/live_action_shot.json', schema: 'schemas/profiles/draft.schema.json' },
    { file: 'examples/audio_reactive_shot.json', schema: 'schemas/profiles/draft.schema.json' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const example of examples) {
    log(colors.yellow, `\n  Validating: ${example.file}`);
    
    try {
      const result = await validateJson('.', example.file, example.schema);
      
      if (result.success) {
        log(colors.green, `    ✅ VALID`);
        passed++;
      } else {
        log(colors.red, `    ❌ INVALID`);
        if (result.errors) {
          log(colors.red, `       Errors: ${JSON.stringify(result.errors, null, 2)}`);
        }
        failed++;
      }
    } catch (error) {
      log(colors.red, `    ❌ ERROR: ${error.message}`);
      failed++;
    }
  }
  
  return { passed, failed };
}

async function runTestSuite(testFilePath) {
  log(colors.blue, `\n🧪 Running test suite: ${testFilePath}`);
  
  const testData = JSON.parse(readFileSync(testFilePath, 'utf8'));
  if (!testData || !testData.tests) {
    log(colors.red, `❌ Invalid test file format`);
    return { passed: 0, failed: 0 };
  }
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testData.tests) {
    const schemaPath = test.schema;
    const expectedValid = test.expected === 'valid';
    
    log(colors.yellow, `\n  Testing: ${test.name}`);
    log(colors.reset, `    ${test.description}`);
    
    try {
      const result = await validateJson('.', test.data, schemaPath, true);
      
      if (result.success === expectedValid) {
        log(colors.green, `    ✅ PASS`);
        passed++;
      } else {
        log(colors.red, `    ❌ FAIL`);
        log(colors.red, `       Expected: ${expectedValid ? 'valid' : 'invalid'}`);
        log(colors.red, `       Got: ${result.success ? 'valid' : 'invalid'}`);
        if (result.errors) {
          log(colors.red, `       Errors: ${JSON.stringify(result.errors, null, 2)}`);
        }
        failed++;
      }
    } catch (error) {
      log(colors.red, `    ❌ ERROR: ${error.message}`);
      failed++;
    }
  }
  
  return { passed, failed };
}

async function main() {
  log(colors.blue, `\n🚀 Fulldome Schema Suite Test Runner`);
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  // Run example validations
  const exampleResults = await runExampleValidation();
  totalPassed += exampleResults.passed;
  totalFailed += exampleResults.failed;
  
  // Run test suites
  const testSuites = [
    'test/validation_tests.json',
    'test/edge_cases.json',
    'test/split_example_tests.json'
  ];
  
  for (const suite of testSuites) {
    const results = await runTestSuite(suite);
    totalPassed += results.passed;
    totalFailed += results.failed;
  }
  
  // Print final results
  log(colors.blue, `\n📊 Final Results`);
  log(colors.blue, `=================`);
  log(colors.green, `✅ Passed: ${totalPassed}`);
  log(colors.red, `❌ Failed: ${totalFailed}`);
  log(colors.blue, `📈 Total: ${totalPassed + totalFailed}`);
  
  if (totalFailed > 0) {
    log(colors.red, `\n💥 ${totalFailed} test(s) failed!`);
    process.exit(1);
  } else {
    log(colors.green, `\n🎉 All tests passed!`);
  }
}

main().catch(error => {
  log(colors.red, `\n💥 Fatal error: ${error.message}`);
  process.exit(1);
}); 