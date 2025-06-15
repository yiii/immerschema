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

  // Get schema category and priority for sorting
  getSchemaPriority(schemaPath) {
    const categories = {
      'slices': 1,    // Slices first (base components)
      'enum': 2,      // Then enums (base data types)
      'profiles': 3,  // Then profiles (workflow stages)
      'project': 4,   // Then project schemas (top-level)
      'taxonomy': 5,  // Then taxonomies (UI helpers)
      'io': 6,        // Then I/O schemas (communication)
      'ext': 7        // Extensions last (utility)
    };

    // Extract category from path
    const category = Object.keys(categories).find(cat => 
      schemaPath.toLowerCase().includes(`/${cat}/`) || 
      schemaPath.toLowerCase().startsWith(`${cat}.`)
    );

    return {
      category: category || 'other',
      priority: categories[category] || 999,
      name: path.basename(schemaPath, '.json')
    };
  }

  // Get slice priority based on dependencies
  getSlicePriority(sliceName) {
    const sliceOrder = {
      'id_slice': 1,           // Base identifier
      'note_slice': 2,         // Basic notes
      'timing_slice': 3,       // Base timing
      'timing_seconds_slice': 4, // Timing details
      'timing_frames_slice': 5,  // Frame timing
      'meta_scene_slice': 6,    // Scene metadata
      'technique_slice': 7,     // Technique info
      'tech_group_slice': 8,    // Tech grouping
      'screen_slice': 9,        // Screen zones
      'software_slice': 10,     // Software pipeline
      'tasks_slice': 11,        // Task tracking
      'crew_slice': 12,         // Team assignments
      'risk_slice': 13,         // Risk flags
      'voice_slice': 14,        // Voice-over
      'audio_slice': 15,        // Audio assets
      'assets_slice': 16,       // Asset management
      'description_slice': 17   // Shot descriptions
    };

    return sliceOrder[sliceName] || 999;
  }

  // Get profile priority based on workflow
  getProfilePriority(profileName) {
    const profileOrder = {
      'draft': 1,    // Initial creative
      'review': 2,   // Director review
      'plan': 3,     // Technical planning
      'assign': 4,   // Team setup
      'lock': 5      // Production ready
    };

    return profileOrder[profileName] || 999;
  }

  // Get project priority based on workflow
  getProjectPriority(projectName) {
    const projectOrder = {
      'draft': 1,    // Initial creative
      'review': 2,   // Director review
      'plan': 3,     // Technical planning
      'assign': 4,   // Team setup
      'lock': 5      // Production ready
    };

    return projectOrder[projectName] || 999;
  }

  // Sort definitions in a logical order
  sortDefinitions(definitions) {
    const sortedEntries = Object.entries(definitions).sort(([keyA, schemaA], [keyB, schemaB]) => {
      // Use the full key for category extraction
      const priorityA = this.getSchemaPriority(keyA);
      const priorityB = this.getSchemaPriority(keyB);

      // First sort by category priority
      if (priorityA.priority !== priorityB.priority) {
        return priorityA.priority - priorityB.priority;
      }

      // Then sort within category based on specific rules
      if (priorityA.category === 'slices') {
        const slicePriorityA = this.getSlicePriority(keyA.replace('slices_', '').replace('_slice', ''));
        const slicePriorityB = this.getSlicePriority(keyB.replace('slices_', '').replace('_slice', ''));
        if (slicePriorityA !== slicePriorityB) {
          return slicePriorityA - slicePriorityB;
        }
      }
      else if (priorityA.category === 'profiles') {
        const profilePriorityA = this.getProfilePriority(keyA.replace('profiles_', ''));
        const profilePriorityB = this.getProfilePriority(keyB.replace('profiles_', ''));
        if (profilePriorityA !== profilePriorityB) {
          return profilePriorityA - profilePriorityB;
        }
      }
      else if (priorityA.category === 'project') {
        const projectPriorityA = this.getProjectPriority(keyA.replace('project_', ''));
        const projectPriorityB = this.getProjectPriority(keyB.replace('project_', ''));
        if (projectPriorityA !== projectPriorityB) {
          return projectPriorityA - projectPriorityB;
        }
      }

      // Finally sort alphabetically within same priority
      return keyA.localeCompare(keyB);
    });

    // Create new object with sorted entries
    return Object.fromEntries(sortedEntries);
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
      let relativePath = path.relative(this.schemasDir, filePath).replace(/\\/g, '/');
      
      // Ensure relative path doesn't start with ../
      if (relativePath.startsWith('../')) {
        relativePath = path.basename(filePath);
      }
      
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
    // Ensure we're working with a clean relative path
    let cleanPath = filePath;
    
    // If it's an absolute path, make it relative to schemas directory
    if (path.isAbsolute(cleanPath)) {
      cleanPath = path.relative(this.schemasDir, cleanPath);
    }
    
    // Normalize path separators and create clean definition key
    return cleanPath
      .replace(/\\/g, '/')
      .replace(/^schemas\//, '') // Remove leading schemas/ if present
      .replace(/\.schema\.json$|\.enum\.json$|\.taxonomy\.json$|\.json$/, '')
      .replace(/\.slice$/, '_slice') // Handle .slice in filename
      .replace(/[\/\-\.]/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .replace(/_+/g, '_'); // Collapse multiple underscores
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

    // Sort definitions
    this.combinedSchema.definitions = this.sortDefinitions(this.combinedSchema.definitions);

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