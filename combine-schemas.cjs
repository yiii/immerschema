const fs = require('fs');
const path = require('path');

class SchemaCombiner {
  constructor(schemasDir) {
    this.schemasDir = schemasDir;
    this.schemas = new Map();
    this.combinedSchema = {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "$id": "immerschema/combined-schema.json",
      "title": "Combined Immerschema - All Schemas",
      "description": "Complete schema combining all slices, enums, profiles, and project schemas",
      "definitions": {}
    };
  }

  // Recursively find all JSON schema files
  findSchemaFiles(dir = this.schemasDir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.findSchemaFiles(fullPath));
      } else if (item.endsWith('.json') && (item.includes('schema.json') || item.includes('.enum.json') || item.includes('.taxonomy.json'))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Load and parse a schema file
  loadSchema(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const schema = JSON.parse(content);
      const relativePath = path.relative(this.schemasDir, filePath).replace(/\\/g, '/');
      
      return {
        filePath,
        relativePath,
        schema,
        id: schema.$id || relativePath
      };
    } catch (error) {
      console.error(`Error loading schema ${filePath}:`, error.message);
      return null;
    }
  }

  // Convert file path to definition key
  pathToDefinitionKey(filePath) {
    return filePath
      .replace(/\\/g, '/')
      .replace(/\.schema\.json$|\.enum\.json$|\.taxonomy\.json$|\.json$/, '')
      .replace(/[^a-zA-Z0-9]/g, '_');
  }

  // Resolve $ref references within the combined schema
  resolveRefs(obj, basePath = '') {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveRefs(item, basePath));
    }

    const resolved = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$ref' && typeof value === 'string') {
        // Convert relative reference to definition reference
        let refPath = value;
        if (refPath.startsWith('../') || refPath.startsWith('./')) {
          // Resolve relative path
          const resolvedPath = path.posix.resolve(path.posix.dirname(basePath), refPath);
          const defKey = this.pathToDefinitionKey(resolvedPath);
          resolved[key] = `#/definitions/${defKey}`;
        } else if (refPath.includes('#/')) {
          // Handle fragment references
          const [filePart, fragment] = refPath.split('#/');
          if (filePart) {
            const defKey = this.pathToDefinitionKey(filePart);
            resolved[key] = `#/definitions/${defKey}/${fragment}`;
          } else {
            resolved[key] = `#/${fragment}`;
          }
        } else {
          // Direct file reference
          const defKey = this.pathToDefinitionKey(refPath);
          resolved[key] = `#/definitions/${defKey}`;
        }
      } else {
        resolved[key] = this.resolveRefs(value, basePath);
      }
    }
    return resolved;
  }

  // Combine all schemas
  combine() {
    console.log('Finding schema files...');
    const schemaFiles = this.findSchemaFiles();
    console.log(`Found ${schemaFiles.length} schema files`);

    // Load all schemas
    const loadedSchemas = [];
    for (const filePath of schemaFiles) {
      const schemaData = this.loadSchema(filePath);
      if (schemaData) {
        loadedSchemas.push(schemaData);
        this.schemas.set(schemaData.relativePath, schemaData.schema);
      }
    }

    console.log(`Loaded ${loadedSchemas.length} schemas`);

    // Add each schema to definitions
    for (const { relativePath, schema } of loadedSchemas) {
      const defKey = this.pathToDefinitionKey(relativePath);
      
      // Create a clean copy of the schema without $id for definitions
      const cleanSchema = { ...schema };
      delete cleanSchema.$id;
      
      // Resolve references
      const resolvedSchema = this.resolveRefs(cleanSchema, relativePath);
      
      this.combinedSchema.definitions[defKey] = resolvedSchema;
      
      console.log(`Added definition: ${defKey} (from ${relativePath})`);
    }

    // Add main project schemas as top-level properties
    const projectSchemas = loadedSchemas.filter(s => s.relativePath.startsWith('project.'));
    if (projectSchemas.length > 0) {
      this.combinedSchema.properties = {};
      for (const { relativePath, schema } of projectSchemas) {
        const propName = path.basename(relativePath, '.schema.json').replace('project.', '');
        const defKey = this.pathToDefinitionKey(relativePath);
        this.combinedSchema.properties[propName] = { "$ref": `#/definitions/${defKey}` };
      }
    }

    // Add helpful oneOf for main project types
    if (projectSchemas.length > 0) {
      this.combinedSchema.oneOf = projectSchemas.map(({ relativePath }) => {
        const defKey = this.pathToDefinitionKey(relativePath);
        return { "$ref": `#/definitions/${defKey}` };
      });
    }

    return this.combinedSchema;
  }

  // Save combined schema to file
  saveToFile(outputPath) {
    const combined = this.combine();
    const output = JSON.stringify(combined, null, 2);
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`\nCombined schema saved to: ${outputPath}`);
    console.log(`Total definitions: ${Object.keys(combined.definitions).length}`);
    
    // Print summary
    const categories = {};
    for (const key of Object.keys(combined.definitions)) {
      const category = key.split('_')[0];
      categories[category] = (categories[category] || 0) + 1;
    }
    
    console.log('\nSchema categories:');
    for (const [category, count] of Object.entries(categories)) {
      console.log(`  ${category}: ${count} schemas`);
    }
  }
}

// Main execution
if (require.main === module) {
  const schemasDir = path.join(__dirname, 'schemas');
  const outputPath = path.join(__dirname, 'combined-schema.json');
  
  if (!fs.existsSync(schemasDir)) {
    console.error(`Schemas directory not found: ${schemasDir}`);
    process.exit(1);
  }
  
  const combiner = new SchemaCombiner(schemasDir);
  combiner.saveToFile(outputPath);
}

module.exports = SchemaCombiner; 