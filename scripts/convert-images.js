import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceDir = 'C:\\Users\\nidha\\Downloads\\Main Image';
const targetDir = 'E:\\lavanya-natural-care\\public\\images\\products';

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const mappings = [
  // Soaps
  {
    src: path.join(sourceDir, 'Soap', 'Hibiscus Soap Box Product Showcase.png'),
    dest: 'hibiscus-soap.webp'
  },
  {
    src: path.join(sourceDir, 'Soap', 'Neem & Tulsi Soap Packaging.png'),
    dest: 'neem-tulsi-soap.webp'
  },
  {
    src: path.join(sourceDir, 'Soap', 'Photorealistic Ubtan Soap Box Product Shot.png'),
    dest: 'ubtan-soap.webp'
  },
  {
    src: path.join(sourceDir, 'Soap', 'OnZ Kesuda Palash Soap Box.png'),
    dest: 'kesuda-palash-soap.webp'
  },
  {
    src: path.join(sourceDir, 'Soap', 'OnZ Charcoal Rice Soap Box.png'),
    dest: 'charcoal-rice-soap.webp'
  },
  // Body Lotions
  {
    src: path.join(sourceDir, 'Body Lotion', '3.png'),
    dest: 'aparajita-body-lotion.webp'
  },
  {
    src: path.join(sourceDir, 'Body Lotion', '4.png'),
    dest: 'lavender-body-lotion.webp'
  },
  {
    src: path.join(sourceDir, 'Body Lotion', '5.png'),
    dest: 'honey-almond-body-lotion.webp'
  },
  {
    src: path.join(sourceDir, 'Body Lotion', '6.png'),
    dest: 'kesuda-body-lotion.webp'
  },
  // Body Creams
  {
    src: path.join(sourceDir, 'Body Cream', '1.png'),
    dest: 'aparajita-body-cream.webp'
  },
  {
    src: path.join(sourceDir, 'Body Cream', '2.png'),
    dest: 'kesuda-palash-body-cream.webp'
  },
  {
    src: path.join(sourceDir, 'Body Cream', '3.png'),
    dest: 'honey-almond-body-cream.webp'
  },
  // Face & Body Washes
  {
    src: path.join(sourceDir, 'Body Wash', '3.png'),
    dest: 'neem-tulsi-face-body-wash.webp'
  },
  {
    src: path.join(sourceDir, 'Body Wash', '2.png'),
    dest: 'kesuda-face-body-wash.webp'
  },
  // Hand Wash
  {
    src: path.join(sourceDir, 'Body Wash', '1.png'),
    dest: 'lemon-hand-wash.webp'
  },
  // Face Cream
  {
    src: path.join(sourceDir, 'Face Cream', '1.png'),
    dest: 'rice-aloe-face-cream.webp'
  }
];

async function run() {
  console.log('Starting product image conversion to WebP...');
  for (const item of mappings) {
    if (!fs.existsSync(item.src)) {
      console.warn(`Source file missing: ${item.src}`);
      continue;
    }
    const outputPath = path.join(targetDir, item.dest);
    try {
      // Resize to a maximum of 1200x1200 maintaining aspect ratio, with 85% webp quality
      await sharp(item.src)
        .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85, effort: 6 })
        .toFile(outputPath);
      const stat = fs.statSync(outputPath);
      console.log(`✓ Processed ${item.dest} (${Math.round(stat.size / 1024)} KB)`);

      // If kesuda-palash-soap.webp, also create kesuda-soap.webp for backward compatibility
      if (item.dest === 'kesuda-palash-soap.webp') {
        const altPath = path.join(targetDir, 'kesuda-soap.webp');
        fs.copyFileSync(outputPath, altPath);
      }
      // If kesuda-palash-body-cream.webp, also create body-cream-kesuda.webp
      if (item.dest === 'kesuda-palash-body-cream.webp') {
        const altPath = path.join(targetDir, 'body-cream-kesuda.webp');
        fs.copyFileSync(outputPath, altPath);
      }
    } catch (err) {
      console.error(`Error processing ${item.dest}:`, err);
    }
  }
  console.log('All product images converted successfully!');
}

run();
