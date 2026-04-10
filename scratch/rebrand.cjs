const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../client/src');

// Map of Soft Terrain hues to Pure Palette bases
// We match on the hue component roughly, or the exact string.
// Teal base: 0.60 0.12 175 -> Map to Orange
const colorMap = {
  // Teal -> Pure Orange
  "0.60 0.12 175": "var(--color-pure-orange)",
  "0.90 0.05 175": "var(--color-pure-orange)", 
  "0.45 0.12 175": "var(--color-pure-orange)",
  
  // Violet -> Mint Green
  "0.58 0.16 290": "var(--color-mint-green)",
  "0.90 0.06 290": "var(--color-mint-green)",
  "0.42 0.16 290": "var(--color-mint-green)",
  
  // Rose -> Cinnamon Brown
  "0.62 0.19 15": "var(--color-cinnamon-brown)",
  "0.92 0.04 15": "var(--color-cinnamon-brown)",
  "0.55 0.19 15": "var(--color-cinnamon-brown)",
  "0.40 0.15 15": "var(--color-cinnamon-brown)",
  
  // Amber -> Moss Green
  "0.75 0.14 75": "var(--color-moss-green)",
  "0.93 0.05 75": "var(--color-moss-green)",
  "0.58 0.14 75": "var(--color-moss-green)",
  "0.50 0.14 75": "var(--color-moss-green)",
  
  // Greens -> Basil / Moss
  "0.65 0.10 145": "var(--color-basil-green)",
  "0.55 0.14 160": "var(--color-basil-green)",
  "0.50 0.14 160": "var(--color-basil-green)",
  "0.45 0.14 160": "var(--color-basil-green)",
  
  // Neutral Light -> Cloud White
  "0.99 0.003 85": "var(--color-cloud-white)",
  "0.975 0.008 85": "var(--color-cloud-white)",
  "0.97 0.005 85": "var(--color-cloud-white)",
  "0.95 0.008 85": "var(--color-cloud-white)",
  
  // Neutral Mid -> Stone Gray
  "0.94 0.008 85": "var(--color-stone-gray)",
  "0.93 0.008 85": "var(--color-stone-gray)",
  "0.93 0.01 85": "var(--color-stone-gray)",
  "0.92 0.01 85": "var(--color-stone-gray)",
  "0.91 0.01 85": "var(--color-stone-gray)",
  "0.90 0.01 85": "var(--color-stone-gray)",
  "0.80 0.01 85": "var(--color-stone-gray)",
  "0.70 0.01 85": "var(--color-stone-gray)",
  "0.70 0.02 85": "var(--color-stone-gray)",
  "0.70 0.02 60": "var(--color-stone-gray)",
  
  // Neutral Dark -> Walnut / Ash Grays
  "0.60 0.02 55": "var(--color-walnut-brown)",
  "0.55 0.02 55": "var(--color-walnut-brown)",
  "0.45 0.02 55": "var(--color-walnut-brown)",
  "0.35 0.03 55": "var(--color-ash-gray)",
  "0.25 0.02 55": "var(--color-ash-gray)",
};

// Also apply a regex for any unmapped
function getReplacement(baseStr, opacityStr) {
  let mapped = colorMap[baseStr.trim()];
  if (!mapped) {
    // Attempt fallback heuristic by hue
    const parts = baseStr.trim().split(' ');
    if (parts.length === 3) {
      const h = parseFloat(parts[2]);
      if (h > 150 && h < 200) mapped = "var(--color-pure-orange)";
      else if (h > 250 && h < 320) mapped = "var(--color-mint-green)";
      else if (h > 0 && h < 40) mapped = "var(--color-cinnamon-brown)";
      else if (h > 50 && h < 100) {
        if (parseFloat(parts[1]) > 0.05) mapped = "var(--color-moss-green)";
        else mapped = "var(--color-stone-gray)"; // low saturation yellow = gray
      }
      else mapped = "var(--color-ash-gray)";
    } else {
      mapped = "var(--color-pure-orange)";
    }
  }
  
  if (opacityStr) {
    // If it's 0.12, use color-mix to apply opacity!
    // Since var(--color-pure-orange) resolves to hex, color-mix is the CSS standards way:
    // color-mix(in srgb, var(--color-pure-orange) OPACITY%, transparent)
    const opacityPct = Math.round(parseFloat(opacityStr) * 100);
    return `color-mix(in srgb, ${mapped} ${opacityPct}%, transparent)`;
  }
  return mapped;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      // Don't modify the index.css since it has mapping logic, but it's not js anyway
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Regex to find "oklch( 0.60 0.12 175 / 0.12 )" or `oklch(A B C)`
      const regex = /oklch\(\s*([\d.]+\s+[\d.]+\s+[\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)/g;
      
      let changed = false;
      const newContent = content.replace(regex, (match, base, opacity) => {
        changed = true;
        return getReplacement(base, opacity);
      });
      
      if (changed) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated: ${fullPath.replace(srcDir, '')}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log("Done rebranding!");
