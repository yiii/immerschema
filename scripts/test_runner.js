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

const Ajv = require('ajv').default;
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

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

async function validateJson(schemaDir, dataOrPath, schemaPath, isDataObject = false) {
  // Create new AJV instance for each validation
  const ajv = new Ajv({ 
    strict: false, 
    allErrors: true,
    verbose: true,
    validateFormats: false
  });
  addFormats(ajv);

  // Load core schemas
  const coreSchema = JSON.parse(fs.readFileSync(path.join(schemaDir, 'schemas/core.schema.json'), 'utf8'));
  const projectSchema = JSON.parse(fs.readFileSync(path.join(schemaDir, 'schemas/project.schema.json'), 'utf8'));

  // Load all enum and extension schemas
  const enumSchemas = [
    'schemas/enum/technique.enum.json',
    'schemas/enum/screenzone.enum.json',
    'schemas/enum/riskflag.enum.json',
    'schemas/enum/role.enum.json',
    'schemas/enum/software.enum.json',
    'schemas/ext/debug.schema.json'
  ];
  const loadedEnumSchemas = enumSchemas.map(p => JSON.parse(fs.readFileSync(path.join(schemaDir, p), 'utf8')));

  ajv.addSchema([coreSchema, projectSchema, ...loadedEnumSchemas]);

  // Load and validate data
  let data;
  if (isDataObject) {
    data = dataOrPath;
  } else {
    data = JSON.parse(fs.readFileSync(dataOrPath, 'utf8'));
  }
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  
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
    { file: 'examples/simple_project.json', schema: 'schemas/project.schema.json' },
    { file: 'examples/comprehensive_project.json', schema: 'schemas/project.schema.json' },
    { file: 'examples/ai_generated_shot.json', schema: 'schemas/core.schema.json' },
    { file: 'examples/live_action_shot.json', schema: 'schemas/core.schema.json' },
    { file: 'examples/audio_reactive_shot.json', schema: 'schemas/core.schema.json' }
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
  
  const testData = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));
  if (!testData || !testData.tests) {
    log(colors.red, `❌ Invalid test file format`);
    return { passed: 0, failed: 0 };
  }
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testData.tests) {
    const schemaPath = `schemas/${test.schema}`;
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
    'test/edge_cases.json'
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