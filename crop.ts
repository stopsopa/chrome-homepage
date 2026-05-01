import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function processIcons() {
  const configPath = path.join(process.cwd(), 'crop.json');
  const srcDir = path.join(process.cwd(), 'icons');
  const destDir = path.join(process.cwd(), 'extension', 'icons');

  if (!fs.existsSync(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    return;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const { width, height } = config;

  if (!width || !height) {
    console.error('Invalid config: width and height are required.');
    return;
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir);

  for (const file of files) {
    const filePath = path.join(srcDir, file);
    
    // Skip directories
    if (fs.statSync(filePath).isDirectory()) {
      continue;
    }

    const ext = path.extname(file).toLowerCase();
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.gif'];
    
    // Skip non-image files like README.md
    if (!supportedExtensions.includes(ext)) {
      console.log(`Skipping non-image file: ${file}`);
      continue;
    }

    const inputPath = filePath;
    const basename = path.basename(file, ext);
    const outputPath = path.join(destDir, `${basename}.png`);

    try {
      console.log(`Processing: ${file} -> ${basename}.png`);
      await sharp(inputPath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(outputPath);
      console.log(`Successfully processed: ${file}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

processIcons().catch(err => {
  console.error('An error occurred during icon processing:', err);
});
