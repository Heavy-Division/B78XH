const fs = require('fs');
const path = require('path');

// Copies the localization files to the simulator package
function copyLocPakFiles(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir);

  files.forEach((file) => {
    if (file.endsWith('.locPak')) {
      const srcFile = path.join(srcDir, file);
      console.log(`copying ${file}`)
      const destFile = path.join(destDir, file);
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

const srcDirectory = 'src/localization/msfs';
const destDirectory = 'src/base/hd-aircraft-b78x';

copyLocPakFiles(srcDirectory, destDirectory);
console.log(`Copied .locPak files from ${srcDirectory} to ${destDirectory}`);
