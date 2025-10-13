#!/usr/bin/env node

/**
 * Utility Functions
 * Common utility functions for workspace automation
 */

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format date to ISO string
 */
function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Format currency in SAR
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR'
  }).format(amount);
}

/**
 * Calculate percentage
 */
function calculatePercentage(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Chunk array into smaller arrays
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Normalize Notion ID (add dashes if needed)
 */
function normalizeNotionId(id) {
  if (!id) return id;
  if (id.includes('-')) return id;
  
  const match = id.match(/^([a-f0-9]{8})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{12})$/i);
  if (!match) return id;
  
  return `${match[1]}-${match[2]}-${match[3]}-${match[4]}-${match[5]}`;
}

/**
 * Extract ID from Notion URL
 */
function extractIdFromUrl(url) {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    
    // Extract 32-character hex string
    const match = lastPart.match(/([a-f0-9]{32})/i);
    if (match) {
      return normalizeNotionId(match[1]);
    }
  } catch (error) {
    // Not a valid URL, check if it's an ID
    const match = url.match(/([a-f0-9]{32})/i);
    if (match) {
      return normalizeNotionId(match[1]);
    }
  }
  
  return null;
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    onRetry = null
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      const delay = Math.min(initialDelay * Math.pow(factor, attempt), maxDelay);
      
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, delay, error);
      } else {
        console.log(`   ⏳ Retry ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      }
      
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Parse command line arguments
 */
function parseArgs(argv) {
  const args = {};
  
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      
      if (key.includes('=')) {
        const [k, v] = key.split('=');
        args[k] = v;
      } else {
        const nextArg = argv[i + 1];
        if (nextArg && !nextArg.startsWith('--')) {
          args[key] = nextArg;
          i++;
        } else {
          args[key] = true;
        }
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      args[key] = true;
    }
  }
  
  return args;
}

/**
 * Validate required environment variables
 */
function validateEnv(requiredVars) {
  const missing = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
}

/**
 * Load environment variables from file
 */
function loadEnv(filePath = '.env') {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.resolve(process.cwd(), filePath);
  
  if (!fs.existsSync(envPath)) {
    return false;
  }
  
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      const index = trimmed.indexOf('=');
      if (index === -1) {
        continue;
      }
      
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to load ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Create progress bar
 */
function createProgressBar(current, total, width = 40) {
  const percentage = (current / total) * 100;
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${current}/${total} (${percentage.toFixed(1)}%)`;
}

/**
 * Format time duration
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Generate timestamp for filenames
 */
function generateTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
}

/**
 * Sanitize filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9_\-\.]/gi, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Deep merge objects
 */
function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

/**
 * Check if value is an object
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Group array by key
 */
function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

/**
 * Remove duplicates from array
 */
function unique(array, key = null) {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Sort array by multiple keys
 */
function sortBy(array, ...keys) {
  return array.sort((a, b) => {
    for (const key of keys) {
      let aVal, bVal;
      
      if (typeof key === 'function') {
        aVal = key(a);
        bVal = key(b);
      } else {
        aVal = a[key];
        bVal = b[key];
      }
      
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

/**
 * Truncate string
 */
function truncate(str, length = 50, suffix = '...') {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Log with timestamp
 */
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const levels = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    debug: '🔍'
  };
  
  const icon = levels[level] || '•';
  console.log(`[${timestamp}] ${icon} ${message}`);
}

module.exports = {
  sleep,
  formatDate,
  formatCurrency,
  calculatePercentage,
  chunkArray,
  normalizeNotionId,
  extractIdFromUrl,
  retryWithBackoff,
  parseArgs,
  validateEnv,
  loadEnv,
  createProgressBar,
  formatDuration,
  generateTimestamp,
  sanitizeFilename,
  deepMerge,
  isObject,
  groupBy,
  unique,
  sortBy,
  truncate,
  log
};

