import fs from 'fs';
import path from 'path';

export function removeFile(dirname, fileName) {
  const fullPath = path.join(dirname, fileName);

  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('File was deleted');
    }
  } catch (error) {
    console.log(error);
  }
}

export function makeDir(dirname, fileName) {
  const fullPath = path.join(dirname, fileName);

  fs.mkdir(fullPath, { recursive: true }, (e) => {
    if (e) {
      console.error(e);
    } else {
      console.log('Directory created');
    }
  });
}
