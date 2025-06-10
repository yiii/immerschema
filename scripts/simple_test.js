#!/usr/bin/env node

/**
 * Simple Test Runner for Fulldome Schema Suite
 * Uses a simpler approach to avoid schema loading conflicts
 */

const { execSync } = require('child_process');
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

function runAjvValidation(schemaPath, dataPath) {
  try {
    // Use ajv-cli for validation to avoid schema loading issues
    const command = `npx ajv-cli validate -s "${schemaPath}" -d "${dataPath}"`;
    execSync(command, { stdio: 'pipe' });
    return { success: true, valid: true };
  } catch (error) {
    return { 
      success: false, 
      valid: false, 
      error: error.stdout ? error.stdout.toString() : error.message 
    };
  }
}

function validateExamples() {
  log(colors.blue, '\n📋 Validating example files');
  
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
    if (!fs.existsSync(example.file)) {
      log(colors.yellow, `\n  Skipping: ${example.file} (file not found)`);
      continue;
    }
    
    log(colors.yellow, `\n  Validating: ${example.file}`);
    
    const result = runAjvValidation(example.schema, example.file);
    
    if (result.success && result.valid) {
      log(colors.green, `    ✅ VALID`);
      passed++;
    } else {
      log(colors.red, `    ❌ INVALID`);
      if (result.error) {
        // Only show first few lines of error to keep output clean
        const errorLines = result.error.split('\n').slice(0, 3);
        for (const line of errorLines) {
          if (line.trim()) {
            log(colors.red, `       ${line.trim()}`);
          }
        }
      }
      failed++;
    }
  }
  
  return { passed, failed };
}

function validateLegacyTests() {
  log(colors.blue, '\n🔧 Validating legacy test files');
  
  const tests = [
    { file: 'test/test_project.json', schema: 'schemas/project.schema.json' },
    { file: 'test/test_shot.json', schema: 'schemas/core.schema.json' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    if (!fs.existsSync(test.file)) {
      log(colors.yellow, `\n  Skipping: ${test.file} (file not found)`);
      continue;
    }
    
    log(colors.yellow, `\n  Validating: ${test.file}`);
    
    const result = runAjvValidation(test.schema, test.file);
    
    if (result.success && result.valid) {
      log(colors.green, `    ✅ VALID`);
      passed++;
    } else {
      log(colors.red, `    ❌ INVALID`);
      if (result.error) {
        const errorLines = result.error.split('\n').slice(0, 3);
        for (const line of errorLines) {
          if (line.trim()) {
            log(colors.red, `       ${line.trim()}`);
          }
        }
      }
      failed++;
    }
  }
  
  return { passed, failed };
}

function main() {
  log(colors.bold, '🚀 Fulldome Schema Suite - Simple Test Runner');
  log(colors.reset, '===============================================');
  
  // Check if ajv-cli is available
  try {
    execSync('npx ajv-cli --version', { stdio: 'pipe' });
  } catch (error) {
    log(colors.red, '❌ ajv-cli not found. Please install with: npm install -g ajv-cli');
    process.exit(1);
  }
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  // Run example validations
  const exampleResults = validateExamples();
  totalPassed += exampleResults.passed;
  totalFailed += exampleResults.failed;
  
  // Run legacy tests
  const legacyResults = validateLegacyTests();
  totalPassed += legacyResults.passed;
  totalFailed += legacyResults.failed;
  
  // Final results
  log(colors.bold, '\n📊 Final Results');
  log(colors.reset, '=================');
  log(colors.green, `✅ Passed: ${totalPassed}`);
  log(colors.red, `❌ Failed: ${totalFailed}`);
  log(colors.yellow, `📈 Total: ${totalPassed + totalFailed}`);
  
  if (totalFailed === 0) {
    log(colors.green, '\n🎉 All tests passed!');
    process.exit(0);
  } else {
    log(colors.red, `\n💥 ${totalFailed} test(s) failed!`);
    log(colors.yellow, '\nNote: Some failures may be due to schema reference issues.');
    log(colors.yellow, 'Try installing ajv-cli globally: npm install -g ajv-cli');
    process.exit(1);
  }
}

main(); 