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

// Fix nullish and nullable type mismatches across all generated files
console.log('Fixing nullish/nullable type mismatches...');
const generatedDir = path.join(__dirname, 'generated');
const generatedFiles = fs.readdirSync(generatedDir).filter(f => f.endsWith('.ts'));

for (const file of generatedFiles) {
    const filePath = path.join(generatedDir, file);
    let fileContent = fs.readFileSync(filePath, 'utf8');

    // Find all Zod schemas that use .nullish() or .nullable()
    // Pattern: field_name: SomeType.nullish() or SomeType.nullable()
    const nullishPattern = /(\w+):\s*([A-Z]\w+)\.(?:nullish|nullable)\(\)/g;
    const nullishFields = new Set();
    let match;
    
    while ((match = nullishPattern.exec(fileContent)) !== null) {
        nullishFields.add(match[1]); // field name
    }
    
    // Also find standalone .nullish()/.nullable() calls like z.string().nullish() or multi-line z.object().nullish()
    // Strategy: find all .nullish()/.nullable() and look backwards to find the field name
    const nullishCallPattern = /\.(?:nullish|nullable)\(\)/g;
    while ((match = nullishCallPattern.exec(fileContent)) !== null) {
        const nullishIndex = match.index;
        // Look backwards from .nullish()/.nullable() to find the field name
        // We're looking for: field_name: z... or field_name: SomeType...
        const beforeNullish = fileContent.substring(Math.max(0, nullishIndex - 1000), nullishIndex);
        // Get the indent level of the .nullish() line
        const lineStart = fileContent.lastIndexOf('\n', nullishIndex - 1) + 1;
        const lineBeforeNullish = fileContent.substring(lineStart, nullishIndex);
        const nullishIndent = (lineBeforeNullish.match(/^(\s*)/) || ['', ''])[1].length;
        
        // Find field definitions before .nullish()
        // Pattern matches: field_name: z (with newline and whitespace before a dot, or directly z.)
        // Handles both z\n      .object() and z.object() styles
        const fieldMatches = [...beforeNullish.matchAll(/(?:^|\n|,)(\s*)(\w+)\s*:\s*z\s*\n\s*\./g)];
        // Also match single-line z.field() patterns
        const singleLineMatches = [...beforeNullish.matchAll(/(?:^|\n|,)(\s*)(\w+)\s*:\s*z\./g)];
        fieldMatches.push(...singleLineMatches);
        
        if (fieldMatches.length > 0) {
            // Find the field at the object property level (same or less indent than .nullish())
            // Sort by index (most recent first) and find the one with indent <= nullishIndent
            fieldMatches.sort((a, b) => b.index - a.index); // Most recent first
            for (const fieldMatch of fieldMatches) {
                const fieldIndent = fieldMatch[1].replace(/\n/g, '').length; // Count spaces, ignore newline
                if (fieldIndent <= nullishIndent) {
                    nullishFields.add(fieldMatch[2]); // field name (index 2 because we capture indent in group 1)
                    break;
                }
            }
        }
    }
    
    if (nullishFields.size === 0) continue;
    
    // Now fix the TypeScript type definitions for these fields
    // We need to change: field_name?: Type | undefined
    // to: field_name?: (Type | null) | undefined
    // This also handles multi-line union types like:
    // field_name?:
    //   | Type1
    //   | Type2
    //   | undefined;
    // And fields inside Partial<{...}> like: field_name: Type;
    for (const fieldName of nullishFields) {
        // First, try to match single-line patterns: fieldName?: Type | undefined
        const singleLinePattern = new RegExp(
            `(\\s+${fieldName}\\?:\\s*)([^|\\n]+?)(\\s*\\|\\s*undefined)`,
            'g'
        );

        fileContent = fileContent.replace(singleLinePattern, (fullMatch, before, type, after) => {
            // Skip if already has null
            if (type.includes('| null') || type.includes('|null')) {
                return fullMatch;
            }
            // Skip if it's already wrapped in parentheses with null
            if (type.trim().startsWith('(') && type.includes('null')) {
                return fullMatch;
            }
            // Wrap the type and add null
            const trimmedType = type.trim();
            return `${before}(${trimmedType} | null)${after}`;
        });

        // Also handle fields inside Partial<{...}> that don't have explicit | undefined
        // Pattern: field_name: Type; (inside a Partial, so no ?)
        // We need to change: field_name: Type; to field_name: Type | null;
        const partialFieldPattern = new RegExp(
            `(\\s+${fieldName}:\\s*)([A-Z]\\w+)(\\s*;)`,
            'g'
        );

        fileContent = fileContent.replace(partialFieldPattern, (fullMatch, before, type, after) => {
            // Skip if already has null
            if (fullMatch.includes('| null') || fullMatch.includes('|null')) {
                return fullMatch;
            }
            return `${before}${type} | null${after}`;
        });
        
        // Now handle multi-line union types:
        // fieldName?:
        //   | Type1
        //   | Type2
        //   | undefined;
        // Simple approach: find fieldName?: followed by content ending with | undefined;
        // and insert | null before | undefined;
        const lines = fileContent.split('\n');
        const newLines = [];
        let i = 0;
        
        while (i < lines.length) {
            const line = lines[i];
            // Check if this line contains the field definition
            const fieldMatch = line.match(new RegExp(`^(\\s+)${fieldName}\\?:\\s*$`));
            
            if (fieldMatch) {
                // Found the field, now look ahead for | undefined;
                const fieldIndent = fieldMatch[1];
                newLines.push(line);
                i++;
                
                // Look ahead to find | undefined; that belongs to this field
                let foundUndefined = false;
                let j = i;
                let braceDepth = 0;
                
                while (j < lines.length && !foundUndefined) {
                    const nextLine = lines[j];
                    const nextIndent = nextLine.match(/^(\s*)/)[1];
                    
                    // Track brace depth
                    braceDepth += (nextLine.match(/\{/g) || []).length;
                    braceDepth -= (nextLine.match(/\}/g) || []).length;
                    
                    // Check if this is the | undefined; for our field
                    // It must be at the same object level (braceDepth == 0) and same or greater indent
                    if (nextLine.match(/\|\s*undefined\s*;/) && 
                        nextIndent.length >= fieldIndent.length &&
                        braceDepth === 0) {  // Must be back at object property level
                        // Check if null is already present on the same line or immediately before
                        // Only check the current line and the previous line to avoid false positives from nested fields
                        const prevLine = j > 0 ? lines[j - 1] : '';
                        const hasNull = nextLine.includes('| null') || nextLine.includes('|null') ||
                                       prevLine.includes('| null') || prevLine.includes('|null');
                        if (!hasNull) {
                            // Insert | null before | undefined;
                            newLines.push(nextIndent + '| null');
                        }
                        newLines.push(nextLine);
                        foundUndefined = true;
                        i = j + 1;
                        break;
                    }
                    
                    // If we've closed more braces than opened and we're back at field level, stop
                    if (braceDepth < 0 && nextIndent.length <= fieldIndent.length) {
                        newLines.push(nextLine);
                        i = j + 1;
                        break;
                    }
                    
                    newLines.push(nextLine);
                    j++;
                }
                
                if (!foundUndefined) {
                    i = j;
                }
            } else {
                newLines.push(line);
                i++;
            }
        }
        
        fileContent = newLines.join('\n');
    }
    
    fs.writeFileSync(filePath, fileContent);
}

console.log('Generation complete!'); 
