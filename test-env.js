// Simple environment test script
import { readFileSync } from 'fs';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log('🔍 Environment Check\n');

// Check if .env file exists
const envExists = existsSync('.env');
console.log(`📄 .env file: ${envExists ? '✅ Found' : '❌ Missing'}`);

if (envExists) {
  try {
    const envContent = readFileSync('.env', 'utf8');
    console.log('\n📋 .env contents:');
    console.log(envContent);
  } catch (error) {
    console.log('❌ Error reading .env file:', error.message);
  }
}

// Check environment variables
console.log('\n🔧 Environment Variables:');
console.log(`REPLICATE_API_TOKEN: ${process.env.REPLICATE_API_TOKEN ? '✅ Set' : '❌ Missing'}`);
console.log(`MODEL_ID: ${process.env.MODEL_ID || '❌ Not set'}`);
console.log(`PROMPT_TEMPLATE: ${process.env.PROMPT_TEMPLATE ? '✅ Set' : '❌ Missing'}`);

console.log('\n📦 Node.js version:', process.version);
console.log('📁 Current directory:', process.cwd());
