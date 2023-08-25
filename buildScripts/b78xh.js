const fs = require('fs');
const path = require('path');

function copyFiles(srcDir, destDir) {
  const ignoreFiles = ['manifest-base.json'];
  
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
  }

  fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(srcDir);

  files.forEach((file) => {
    if (ignoreFiles.includes(file)) {
      return;
    }

    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);

    const stat = fs.statSync(srcFile);

    if (stat.isDirectory()) {
      copyFiles(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

const srcDirectory = 'src/base/hd-aircraft-b78x';
const destDirectory = 'out/hd-aircraft-b78x';

copyFiles(srcDirectory, destDirectory);
console.log(`Copied contents from ${srcDirectory} to ${destDirectory}`);
