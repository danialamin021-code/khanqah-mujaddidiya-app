/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generates placeholder PNG assets for the mobile app.
 * Run: node scripts/generate-placeholder-assets.js
 * Requires: npm install pngjs
 */

const fs = require("fs");
const path = require("path");

// Minimal valid PNG (1x1 green pixel) - we'll use this as fallback
const MINIMAL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const assetsDir = path.join(__dirname, "..", "assets");
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Copy minimal PNG to all required asset files (only if missing)
const assets = ["icon.png", "splash-icon.png", "adaptive-icon.png", "favicon.png", "notification-icon.png"];
let created = 0;
for (const name of assets) {
  const dest = path.join(assetsDir, name);
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, MINIMAL_PNG);
    console.log("Created:", name);
    created++;
  }
}

if (created > 0) {
  console.log("\nPlaceholder assets created. Replace with proper 1024x1024 (icon), 1284x2778 (splash) assets for production.");
}
