try {
  const Ajv2020 = require('ajv/dist/2020').default;
  const addFormats = require('ajv-formats');
  const fs = require('fs');
  const path = require('path');

  // Use Ajv2020 for draft-2020-12 support
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false
  });
  addFormats(ajv);

  // Helper to load a schema
  function loadSchema(relPath) {
    try {
      return JSON.parse(fs.readFileSync(path.join(__dirname, relPath), 'utf8'));
    } catch (e) {
      console.error(`Failed to load schema or data: ${relPath}`);
      throw e;
    }
  }

  // Register all referenced schemas
  const schemasToRegister = [
    'schemas/enum/technique.enum.json',
    'schemas/enum/riskflag.enum.json',
    'schemas/enum/screenzone.enum.json',
    'schemas/ext/debug.schema.json',
  ];
  schemasToRegister.forEach((schemaPath) => {
    const schema = loadSchema(schemaPath);
    ajv.addSchema(schema, schema.$id || schemaPath);
  });

  // Load main schemas
  const coreSchema = loadSchema('schemas/core.schema.json');
  const projectSchema = loadSchema('schemas/project.schema.json');

  // Load test data
  const testShot = loadSchema('test_shot.json');
  const testProject = loadSchema('test_project.json');

  // Validate shot
  try {
    console.log('Starting shot validation...');
    const validateShot = ajv.compile(coreSchema);
    const shotValid = validateShot(testShot);
    console.log('Shot validation:', shotValid ? 'PASSED' : 'FAILED');
    if (!shotValid) {
      console.log('Shot validation errors:', validateShot.errors);
    }
    console.log('Finished shot validation.');
  } catch (e) {
    console.error('Shot validation: ERROR', e);
  }

  // Validate project
  try {
    console.log('Starting project validation...');
    const validateProject = ajv.compile(projectSchema);
    const projectValid = validateProject(testProject);
    console.log('Project validation:', projectValid ? 'PASSED' : 'FAILED');
    if (!projectValid) {
      console.log('Project validation errors:', validateProject.errors);
    }
    console.log('Finished project validation.');
  } catch (e) {
    console.error('Project validation: ERROR', e);
  }

} catch (err) {
  console.error('Unexpected error:', err);
} 