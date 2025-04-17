// This script generates the Cloudglue API client from the OpenAPI spec
// It runs the openapi-zod-client command to generate the client code, 
// then runs some custom transforms to make the generated code work with
// the Cloudglue API.

// The transforms are:
// - Uses a renamed alias for File called CloudglueFile in the Files.ts file for instances where it
//  should be CloudglueFile vs the global File type, due to naming conflicts.


const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run the openapi-zod-client command
console.log('Generating API client...');
execSync('openapi-zod-client spec/spec/openapi.json --group-strategy=tag-file -o generated --export-schemas=true --export-types=true --base-url=https://api.cloudglue.dev/v1 --strict-objects', { stdio: 'inherit' });

// Transform the Files.ts content
console.log('Transforming generated files...');
const filesPath = path.join(__dirname, 'generated', 'Files.ts');
let content = fs.readFileSync(filesPath, 'utf8');

// Get the content after any imports
const match = content.match(/^((?:import [^;]+;[\s]*)+)([\s\S]+)$/);
if (!match) {
    console.error('Could not find import section');
    process.exit(1);
}

const [, importSection, restOfFile] = match;

// Create new imports section
const newImports = importSection
    .split('\n')
    .filter(line => !line.includes('./common') && line.trim()) // Remove any imports from ./common and empty lines
    .join('\n');

// Replace File with CloudglueFile in specific contexts in the rest of the file
// We'll do this by splitting the content around z.instanceof(File)
const parts = restOfFile.split('z.instanceof(File)');
const transformedRest = parts.map((part, index) => {
    // Don't process the last part if it's empty
    if (part === '' && index === parts.length - 1) return part;
    
    // Replace File in type contexts:
    // - Array<File>
    // - type definitions
    // - z.array(File)
    // - response: File
    return part.replace(/\bFile\b(?=\s*[,;}\]]|$|\s+extends|\s*\||(?:\s+as\s+)|(?=\s*>)|(?=\s*\)(?:\s*,|\s*\)|$)))/g, 'CloudglueFile');
}).join('z.instanceof(File)');

// Combine the sections with our import
content = newImports + '\nimport { File as CloudglueFile } from "./common";\n\n' + transformedRest.trimStart();

// Write the transformed content back
fs.writeFileSync(filesPath, content);

console.log('Generation complete!'); 
