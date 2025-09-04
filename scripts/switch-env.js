#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const environment = args[0];

if (!environment || !['dev', 'prod', 'development', 'production'].includes(environment)) {
  console.log('Usage: node scripts/switch-env.js <dev|prod>');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/switch-env.js dev    # Switch to development (testnet)');
  console.log('  node scripts/switch-env.js prod   # Switch to production (mainnet)');
  process.exit(1);
}

const isProduction = environment === 'prod' || environment === 'production';

// Read the appropriate environment file
const sourceFile = isProduction ? 'env.production' : 'env.example';
const targetFile = '.env.local';

try {
  // Read source file
  const sourceContent = fs.readFileSync(sourceFile, 'utf8');
  
  // Write to .env.local
  fs.writeFileSync(targetFile, sourceContent);
  
  console.log(`✅ Environment switched to ${isProduction ? 'production (mainnet)' : 'development (testnet)'}`);
  console.log(`📁 Updated ${targetFile}`);
  
  if (isProduction) {
    console.log('⚠️  Remember to update your WalletConnect Project ID in .env.local');
  }
  
} catch (error) {
  console.error('❌ Error switching environment:', error.message);
  process.exit(1);
} 