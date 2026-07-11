// Genera los iconos y el splash de Renew a partir de SVG.
// Uso: node scripts/generate-brand-assets.mjs
import sharp from 'sharp';

const INK = '#0f1714';
const LIME = '#d7ff4f';
const PAPER = '#fffdf6';

// Marca: franja lima + "R" serif. `scale` controla el tamaño dentro del lienzo
// (los iconos adaptativos de Android exigen que el contenido quepa en el 66% central).
function markSvg({ size, background, scale, color = PAPER }) {
  const fontSize = Math.round(size * 0.42 * scale);
  const barHeight = Math.round(fontSize * 1.0);
  const barWidth = Math.round(size * 0.055 * scale);
  const gap = Math.round(size * 0.065 * scale);

  const rWidth = fontSize * 0.72;
  const totalWidth = barWidth + gap + rWidth;
  const barX = Math.round((size - totalWidth) / 2);
  const centerY = size / 2;
  const barY = Math.round(centerY - barHeight / 2);
  const baseline = Math.round(centerY + fontSize * 0.355);

  const bg = background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '';

  return Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      ${bg}
      <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="${Math.round(barWidth / 2)}" fill="${LIME}"/>
      <text x="${barX + barWidth + gap}" y="${baseline}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" fill="${color}">R</text>
    </svg>
  `);
}

function solidSvg(size, color) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="${color}"/></svg>`
  );
}

const jobs = [
  ['assets/images/icon.png', markSvg({ size: 1024, background: INK, scale: 1.15 })],
  ['assets/images/android-icon-foreground.png', markSvg({ size: 1024, background: null, scale: 0.72 })],
  ['assets/images/android-icon-background.png', solidSvg(1024, INK)],
  ['assets/images/android-icon-monochrome.png', markSvg({ size: 1024, background: null, scale: 0.72, color: '#ffffff' })],
  ['assets/images/splash-icon.png', markSvg({ size: 512, background: null, scale: 1.0, color: INK })],
  ['assets/images/favicon.png', markSvg({ size: 48, background: INK, scale: 1.3 })],
];

for (const [path, svg] of jobs) {
  await sharp(svg).png().toFile(path);
  console.log('generado:', path);
}
