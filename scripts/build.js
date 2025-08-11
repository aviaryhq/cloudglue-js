/**
 * Use to do a build time replacement of the SDK version in the client.js and client.d.ts files
 */

const fs = require('fs');
const path = require('path');

// Read package.json to get the version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

console.log(`Building with SDK version: ${version}`);

// Function to replace version placeholder in a file
function replaceVersionInFile(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/__SDK_VERSION__/g, version);
    fs.writeFileSync(filePath, content);
    console.log(`Updated version in: ${filePath}`);
  }
}

// Replace version in the built JavaScript file
const jsFilePath = path.join(__dirname, '..', 'dist', 'src', 'client.js');
replaceVersionInFile(jsFilePath);

// Also replace in the TypeScript declaration file if it exists
const dtsFilePath = path.join(__dirname, '..', 'dist', 'src', 'client.d.ts');
replaceVersionInFile(dtsFilePath);

console.log('Version replacement complete!');
