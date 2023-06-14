const fs = require('fs');
const path = require('path');
let main = '';

function searchProjectForKey(directoryPath) {
  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (searchProjectForKey(filePath)) {
        return true;
      }
    } else {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = `${filePath}\n\n${fileContent}\n----------------------------------\n`;
      main += data;
    }
  }
}

searchProjectForKey('./src/')
fs.writeFileSync('data.txt', main);