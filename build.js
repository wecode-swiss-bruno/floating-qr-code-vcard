const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Plugin details
const pluginName = 'floating-qr-code-vcard';

// Read current version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
let version = packageJson.version;

// Increment minor version
const versionParts = version.split('.');
const newVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2]) + 1}`;

// Update package.json with new version
packageJson.version = newVersion;
fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(packageJson, null, 2));
version = newVersion;

// Create build directory if it doesn't exist
const buildDir = path.join(__dirname, '../');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(buildDir, `${pluginName}-${version}.zip`));
const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
    console.log(`Archive created successfully! (${archive.pointer()} total bytes)`);
});

// Handle warnings and errors
archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
        console.warn('Warning:', err);
    } else {
        throw err;
    }
});

archive.on('error', function(err) {
    throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Function to check if a file/directory should be excluded
function shouldExclude(name) {
    const excludeList = [
        '.git',
        '.gitignore',
        'node_modules',
        'build.js',
        'package.json',
        'package-lock.json',
        '.DS_Store',
        '._.DS_Store',
        '__MACOSX',
        'README.md'
    ];
    return excludeList.some(excluded => name.includes(excluded));
}

// Add files recursively
function addFiles(dirPath, baseDir = '') {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        if (shouldExclude(file)) return;
        
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            addFiles(filePath, path.join(baseDir, file));
        } else {
            archive.file(filePath, { name: path.join(pluginName, baseDir, file) });
            console.log(`Added: ${path.join(baseDir, file)}`);
        }
    });
}

// Add all plugin files
addFiles(__dirname);

// Finalize the archive
archive.finalize(); 