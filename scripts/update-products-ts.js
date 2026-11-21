import fs from 'fs';

const filePath = 'E:/lavanya-natural-care/src/data/products.ts';
let code = fs.readFileSync(filePath, 'utf8');

const map = {
  'neem-tulsi-soap': { mrp: 149, discountPrice: 99 },
  'kesuda-palash-soap': { mrp: 149, discountPrice: 99 },
  'hibiscus-soap': { mrp: 149, discountPrice: 99 },
  'ubtan-soap': { mrp: 149, discountPrice: 99 },
  'charcoal-rice-soap': { mrp: 149, discountPrice: 99 },
  'aparajita-body-lotion': { mrp: 399, discountPrice: 299 },
  'lavender-body-lotion': { mrp: 399, discountPrice: 299 },
  'honey-almond-body-lotion': { mrp: 399, discountPrice: 299 },
  'kesuda-body-lotion': { mrp: 399, discountPrice: 299 },
  'aparajita-body-cream': { mrp: 349, discountPrice: 249 },
  'kesuda-palash-body-cream': { mrp: 349, discountPrice: 249 },
  'honey-almond-body-cream': { mrp: 349, discountPrice: 249 },
  'face-body-wash-neem-tulsi': { mrp: 349, discountPrice: 249 },
  'face-body-wash-kesuda': { mrp: 349, discountPrice: 249 },
  'hand-wash-lemon': { mrp: 199, discountPrice: 149 },
  'rice-aloe-face-cream': { mrp: 349, discountPrice: 249 },
  'lip-balm': { mrp: 129, discountPrice: 89 }
};

for (const [id, vals] of Object.entries(map)) {
  const reg = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?mrp:\\s*)\\d+(?:,\\s*discountPrice:\\s*\\d+)?`, 'm');
  code = code.replace(reg, (match, prefix) => {
    return `${prefix}${vals.mrp},\n    discountPrice: ${vals.discountPrice}`;
  });
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated src/data/products.ts');
