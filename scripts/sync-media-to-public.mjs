import fs from 'fs';
import path from 'path';

const srcDir = './media';
const destPublicMedia = './public/media';
const destPublicApiMedia = './public/api/media/file';

if (fs.existsSync(srcDir)) {
  fs.mkdirSync(destPublicMedia, { recursive: true });
  fs.mkdirSync(destPublicApiMedia, { recursive: true });

  const files = fs.readdirSync(srcDir);
  console.log(`Copying ${files.length} media files to public/media and public/api/media/file...`);

  for (const file of files) {
    const srcFile = path.join(srcDir, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, path.join(destPublicMedia, file));
      fs.copyFileSync(srcFile, path.join(destPublicApiMedia, file));
    }
  }
  console.log('✅ Synced all media files to public directory successfully!');
}
