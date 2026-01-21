#!/usr/bin/env node

/**
 * This script ensures Chrome is installed for Puppeteer.
 * It's run as part of the build process on render.com.
 */

import { install } from '@puppeteer/browsers';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function installChrome() {
  try {
    console.log('[Install Chrome] Starting Chrome installation...');
    
    // Use the same cache directory as configured in .puppeteerrc.cjs
    const cacheDir = join(__dirname, '.cache', 'puppeteer');
    
    console.log('[Install Chrome] Cache directory:', cacheDir);
    console.log('[Install Chrome] Installing Chrome...');
    
    const result = await install({
      browser: 'chrome',
      buildId: 'stable',
      cacheDir: cacheDir,
    });
    
    console.log('[Install Chrome] ✅ Chrome installed successfully!');
    console.log('[Install Chrome] Browser:', result.browser);
    console.log('[Install Chrome] Build ID:', result.buildId);
    console.log('[Install Chrome] Path:', result.executablePath);
    
  } catch (error) {
    console.error('[Install Chrome] ❌ Failed to install Chrome:', error.message);
    console.error('[Install Chrome] Full error:', error);
    process.exit(1);
  }
}

installChrome();
