const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Use a cache directory relative to the project root
  // This ensures Chrome is installed in a location that persists on render.com
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
