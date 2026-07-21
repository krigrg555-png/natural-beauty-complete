/**
 * generate-manifests.js
 * Run automatically by Netlify build: "node generate-manifests.js"
 * Creates _manifest.json in every content subfolder so cms-loader.js
 * knows which files exist — this is what makes CMS edits appear on site.
 */
const fs   = require('fs');
const path = require('path');

const CONTENT = path.join(__dirname, 'content');

function makeManifest(dir) {
  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json') && f !== '_manifest.json')
      .sort();
    fs.writeFileSync(
      path.join(dir, '_manifest.json'),
      JSON.stringify({ files, generated: new Date().toISOString() }, null, 2)
    );
    console.log('✅', path.relative(__dirname, dir), '→', files.length, 'files');
  } catch(e) {
    console.warn('⚠️ ', dir, e.message);
  }
}

// Top-level content folders
fs.readdirSync(CONTENT, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .forEach(d => makeManifest(path.join(CONTENT, d.name)));

console.log('\n🎉 Manifests ready — CMS content will now load on the website.');
