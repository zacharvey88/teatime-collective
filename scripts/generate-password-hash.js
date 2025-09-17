#!/usr/bin/env node

/**
 * Password Hash Generator
 * 
 * Usage: node scripts/generate-password-hash.js <password>
 * 
 * This script generates a bcrypt hash for a given password using 12 rounds.
 * Use this when adding new admin users or when you need to manually update passwords.
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/generate-password-hash.js <password>');
  console.log('Example: node scripts/generate-password-hash.js mynewpassword');
  process.exit(1);
}

if (password.length < 6) {
  console.log('Error: Password must be at least 6 characters long');
  process.exit(1);
}

try {
  const hash = bcrypt.hashSync(password, 12);
  console.log(`\nPassword: ${password}`);
  console.log(`Hash: ${hash}\n`);
  console.log('Copy the hash above and paste it into the ADMIN_USERS array in app/api/auth/[...nextauth]/route.ts');
} catch (error) {
  console.error('Error generating hash:', error.message);
  process.exit(1);
}
