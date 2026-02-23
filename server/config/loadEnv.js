const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadFrom(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  dotenv.config({
    path: filePath,
    override: false,
    quiet: true
  });
}

const rootEnv = path.resolve(__dirname, '../../.env');
const serverEnv = path.resolve(__dirname, '../.env');
const cwdEnv = path.resolve(process.cwd(), '.env');
const cwdServerEnv = path.resolve(process.cwd(), 'server/.env');

// Load order: workspace root, server root, current cwd variants.
// Existing env vars from hosting platform keep priority (override=false).
loadFrom(rootEnv);
loadFrom(serverEnv);
loadFrom(cwdEnv);
loadFrom(cwdServerEnv);

