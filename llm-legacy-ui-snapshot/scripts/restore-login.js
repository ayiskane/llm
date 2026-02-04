#!/usr/bin/env node

/**
 * RESTORE LOGIN MIDDLEWARE
 * 
 * Run this script to re-enable the login system:
 * 
 *   GITHUB_TOKEN=your_token node restore-login.js
 * 
 * Or set the token in your environment first:
 *   export GITHUB_TOKEN=your_token
 *   node restore-login.js
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'ayiskane/llm';

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  console.error('\nUsage:');
  console.error('  GITHUB_TOKEN=your_token node restore-login.js');
  process.exit(1);
}

async function restore() {
  console.log('🔐 Restoring login middleware...\n');

  // 1. Get the backup file content
  const backupRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/middleware.auth.ts`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
  );
  const backupData = await backupRes.json();
  
  if (!backupData.content) {
    console.error('❌ Failed to fetch backup file');
    console.error(backupData);
    process.exit(1);
  }

  // 2. Get current middleware SHA
  const currentRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/middleware.ts`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
  );
  const currentData = await currentRes.json();
  
  if (!currentData.sha) {
    console.error('❌ Failed to get current middleware SHA');
    console.error(currentData);
    process.exit(1);
  }

  // 3. Update middleware.ts with backup content
  const updateRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/middleware.ts`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'feat: Re-enable login authentication',
        content: backupData.content.replace(/\n/g, ''),
        sha: currentData.sha,
      }),
    }
  );
  
  const result = await updateRes.json();
  
  if (result.commit?.sha) {
    console.log(`✅ Login restored! Commit: ${result.commit.sha.slice(0, 7)}`);
    console.log('⏳ Wait for Vercel to redeploy (1-2 minutes)...');
  } else {
    console.error('❌ Failed to restore');
    console.error(result);
    process.exit(1);
  }
}

restore().catch(console.error);
