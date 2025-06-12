import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const schemasDir = join(rootDir, 'schemas');
const distDir = join(rootDir, 'dist', 'schemas');

// Create dist directory if it doesn't exist
mkdirSync(distDir, { recursive: true });

// Copy all schema files
function copySchemas(dir) {
    const files = readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
        const sourcePath = join(dir, file.name);
        const targetPath = join(distDir, file.name);
        
        if (file.isDirectory()) {
            mkdirSync(targetPath, { recursive: true });
            copySchemas(sourcePath);
        } else if (file.name.endsWith('.json')) {
            copyFileSync(sourcePath, targetPath);
        }
    }
}

copySchemas(schemasDir);
console.log('Build completed successfully!'); 