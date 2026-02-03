const fs = require('fs');
const path = require('path');

const root = __dirname;
const assetsDir = path.join(root, 'public', 'animations');
const downloadsDir = process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'Downloads') : path.join(root, 'downloads');

// Ensure assets folder exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Copy a file from Downloads or root into public/animations (by filename)
function copyToAssets(filename) {
  const dest = path.join(assetsDir, filename);
  const fromDownloads = path.join(downloadsDir, filename);
  const fromRoot = path.join(root, filename);
  if (fs.existsSync(fromDownloads)) {
    fs.copyFileSync(fromDownloads, dest);
  } else if (fs.existsSync(fromRoot)) {
    fs.copyFileSync(fromRoot, dest);
  }
}

// Resolve path to read: assets first, then root
function getReadPath(filename) {
  const inAssets = path.join(assetsDir, filename);
  if (fs.existsSync(inAssets)) return inAssets;
  const inRoot = path.join(root, filename);
  if (fs.existsSync(inRoot)) return inRoot;
  return null;
}

// Fallback cycle when a source is missing (use Animation 1, 2, Isometric from root)
const fallbackCycle = [
  path.join(root, 'Animation (1).json'),
  path.join(root, 'Animation (2).json'),
  path.join(root, 'Isometric.json')
].filter(function (p) { return fs.existsSync(p); });

// Hero animation (stays in public root)
const heroJson = fs.readFileSync(path.join(__dirname, 'public', 'service-hero-animation.json'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'public', 'service-hero-inline.js'), 'window.HERO_ANIMATION_DATA = ' + heroJson + ';\n');

// Service profile animations: copy from Downloads (or root) to public/animations, then read from there
// Order: 0 AI, 1 CRM, 2 Web3, 3 Mobile, 4 Cloud, 5 Consultancy, 6 SEO
const serviceFilenames = [
  'Technology isometric ai robot brain.json',  // 0: AI & Machine Learning
  'Web Development.json',          // 1: CRM & Automation
  'Technology Network.json',        // 2: Web2 & Web3 & Blockchain
  'Social Media Marketing.json',   // 3: Mobile App Development
  'Rocket research.json',          // 4: Cloud Development
  'Animation (1).json',            // 5: Consultancy
  'Seo isometric composition with human characters.json',  // 6: SEO & Digital Marketing
];

serviceFilenames.forEach(copyToAssets);

const serviceSources = serviceFilenames.map(function (filename, index) {
  const p = getReadPath(filename);
  if (p) return p;
  return fallbackCycle[index % fallbackCycle.length];
});
const serviceData = serviceSources.map(function (p) {
  return fs.readFileSync(p, 'utf8');
});
const serviceOut = path.join(__dirname, 'public', 'service-animations-inline.js');
fs.writeFileSync(serviceOut, 'window.SERVICE_ANIMATIONS = [' + serviceData.map(function (j) { return j; }).join(',') + '];\n');
