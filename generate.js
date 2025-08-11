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
execSync('npx -y openapi-zod-client spec/spec/openapi.json --group-strategy=tag-file -o generated --export-schemas=true --export-types=true --base-url=https://api.cloudglue.dev/v1 --strict-objects', { stdio: 'inherit' });

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

// Create new imports section while preserving other ./common imports
// We will:
// - Collect any named imports from ./common
// - Remove the `File` specifier from them
// - Reconstruct the imports, adding `import { File as CloudglueFile } from "./common";`
// - Preserve separation of value vs type-only imports
const importLines = importSection.split('\n');
const preservedImportLines = [];
const valueSpecifiersFromCommon = new Set();
const typeSpecifiersFromCommon = new Set();

for (const line of importLines) {
    const trimmed = line.trim();
    if (!trimmed) continue; // drop empty lines

    const isFromCommon = /from\s+["']\.\/common["']\s*;?$/.test(trimmed);
    if (!isFromCommon) {
        preservedImportLines.push(line);
        continue;
    }

    // Parse specifiers inside braces
    const isTypeOnly = /^\s*import\s+type\b/.test(line);
    const matchBraces = line.match(/\{([^}]*)\}/);
    if (!matchBraces) {
        // No named specifiers; nothing to collect
        continue;
    }
    const rawSpecifiers = matchBraces[1]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    for (const spec of rawSpecifiers) {
        // Capture left side of `as` to identify the imported name
        const [importedNameRaw] = spec.split(/\s+as\s+/);
        const importedName = importedNameRaw.trim();

        // Drop any specifier that imports `File` (we will re-add as alias)
        if (importedName === 'File') {
            continue;
        }

        if (isTypeOnly) {
            typeSpecifiersFromCommon.add(spec);
        } else {
            valueSpecifiersFromCommon.add(spec);
        }
    }
}

// Reconstruct imports
let newImports = preservedImportLines.join('\n');
if (newImports && !newImports.endsWith('\n')) newImports += '\n';

// Always add our CloudglueFile alias import
newImports += 'import { File as CloudglueFile } from "./common";\n';

// Add back remaining value and type-only specifiers from ./common
if (valueSpecifiersFromCommon.size > 0) {
    newImports += `import { ${Array.from(valueSpecifiersFromCommon).join(', ')} } from "./common";\n`;
}
if (typeSpecifiersFromCommon.size > 0) {
    newImports += `import type { ${Array.from(typeSpecifiersFromCommon).join(', ')} } from "./common";\n`;
}

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

// Combine the sections
content = newImports + '\n' + transformedRest.trimStart();

// Write the transformed content back
fs.writeFileSync(filesPath, content);

console.log('Generation complete!'); 
