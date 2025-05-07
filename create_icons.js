import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconFiles = [
  'src-tauri/icons/32x32.png',
  'src-tauri/icons/128x128.png',
  'src-tauri/icons/128x128@2x.png',
  'src-tauri/icons/icon.icns',
  'src-tauri/icons/icon.ico'
];

// Ensure directory exists
const iconDir = path.join(__dirname, 'src-tauri/icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Create empty icon files
iconFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  fs.writeFileSync(filePath, Buffer.from([0]));
  console.log(`Created: ${file}`);
}); 