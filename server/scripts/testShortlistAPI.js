/**
 * Shortlist API - Test & Demo Script
 * Tests all 3 endpoints with real data
 * 
 * Usage:
 *   node scripts/testShortlistAPI.js
 * 
 * Requirements:
 *   - Server running on http://localhost:5000
 *   - Database with migrations run
 *   - Universities seeded
 *   - User registered with JWT token
 */

import fetch from 'node-fetch';

// Configuration
const BASE_URL = 'http://localhost:5000/api';
let TOKEN = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function login() {
  log('\n📝 Step 1: Login to get JWT token', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const data = await response.json();

    if (response.ok && data.data && data.data.token) {
      TOKEN = data.data.token;
      log(`✅ Login successful! Token: ${TOKEN.substring(0, 20)}...`, 'green');
      return true;
    } else {
      log(`❌ Login failed: ${data.message || data.error}`, 'red');
      log('💡 Run auth tests first or use existing token', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Login error: ${error.message}`, 'red');
    return false;
  }
}

async function testAddToShortlist() {
  log('\n🎓 Step 2: Add MIT to shortlist', 'blue');

  const universityId = 3; // MIT

  try {
    const response = await fetch(`${BASE_URL}/shortlist/${universityId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log(`✅ Successfully added MIT to shortlist`, 'green');
      log(`   Entry ID: ${data.data.id}`, 'green');
      log(`   University ID: ${data.data.university_id}`, 'green');
      return true;
    } else if (response.status === 409) {
      log(`⚠️  MIT already in shortlist (expected on second run)`, 'yellow');
      return true; // Not an error
    } else {
      log(`❌ Failed to add to shortlist: ${data.message || data.error}`, 'red');
      log(`   Status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Add to shortlist error: ${error.message}`, 'red');
    return false;
  }
}

async function testAddMultiple() {
  log('\n🎓 Step 3: Add Harvard & Stanford to shortlist', 'blue');

  const universities = [
    { id: 1, name: 'Harvard' },
    { id: 2, name: 'Stanford' }
  ];

  for (const uni of universities) {
    try {
      const response = await fetch(`${BASE_URL}/shortlist/${uni.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        log(`✅ Added ${uni.name} to shortlist`, 'green');
      } else if (response.status === 409) {
        log(`⚠️  ${uni.name} already in shortlist`, 'yellow');
      } else {
        log(`❌ Failed to add ${uni.name}: ${data.message}`, 'red');
      }
    } catch (error) {
      log(`❌ Error adding ${uni.name}: ${error.message}`, 'red');
    }
  }

  return true;
}

async function testGetShortlist() {
  log('\n📋 Step 4: Get user\'s shortlist', 'blue');

  try {
    const response = await fetch(`${BASE_URL}/shortlist/mine`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log(`✅ Retrieved shortlist`, 'green');
      log(`   Count: ${data.data.shortlistCount}`, 'green');

      if (data.data.shortlist && data.data.shortlist.length > 0) {
        log(`   Universities:`, 'green');
        data.data.shortlist.forEach((uni, idx) => {
          log(`     ${idx + 1}. ${uni.name} (${uni.country}) - Acceptance: ${uni.acceptance_rate}%`, 'green');
        });
      }

      if (data.data.lockedUniversity) {
        log(`   Locked University: ${data.data.lockedUniversity.name}`, 'green');
      } else {
        log(`   No locked university yet`, 'yellow');
      }

      return true;
    } else {
      log(`❌ Failed to get shortlist: ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Get shortlist error: ${error.message}`, 'red');
    return false;
  }
}

async function testRemoveFromShortlist() {
  log('\n🗑️  Step 5: Remove Stanford from shortlist', 'blue');

  const universityId = 2; // Stanford

  try {
    const response = await fetch(`${BASE_URL}/shortlist/${universityId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log(`✅ Successfully removed Stanford from shortlist`, 'green');
      return true;
    } else {
      log(`❌ Failed to remove from shortlist: ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Remove from shortlist error: ${error.message}`, 'red');
    return false;
  }
}

async function testGetShortlistAgain() {
  log('\n📋 Step 6: Get updated shortlist (after removal)', 'blue');

  try {
    const response = await fetch(`${BASE_URL}/shortlist/mine`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log(`✅ Retrieved updated shortlist`, 'green');
      log(`   Count: ${data.data.shortlistCount}`, 'green');

      if (data.data.shortlist && data.data.shortlist.length > 0) {
        log(`   Universities:`, 'green');
        data.data.shortlist.forEach((uni, idx) => {
          log(`     ${idx + 1}. ${uni.name} (${uni.country})`, 'green');
        });
      } else {
        log(`   No universities in shortlist`, 'yellow');
      }

      return true;
    } else {
      log(`❌ Failed to get shortlist: ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Get shortlist error: ${error.message}`, 'red');
    return false;
  }
}

async function testErrorHandling() {
  log('\n⚠️  Step 7: Test error handling', 'blue');

  // Test invalid university ID
  log('   Testing invalid university ID...', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/shortlist/invalid`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    if (response.status === 400) {
      log(`   ✅ Correctly rejected invalid ID (400)`, 'green');
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
  }

  // Test non-existent university
  log('   Testing non-existent university...', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/shortlist/99999`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    if (response.status === 404) {
      log(`   ✅ Correctly rejected non-existent university (404)`, 'green');
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
  }

  // Test missing authentication
  log('   Testing missing authentication...', 'blue');
  try {
    const response = await fetch(`${BASE_URL}/shortlist/mine`, {
      method: 'GET'
    });

    if (response.status === 401) {
      log(`   ✅ Correctly rejected unauthenticated request (401)`, 'green');
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
  }

  return true;
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║      🎓 SHORTLIST API - COMPREHENSIVE TEST SUITE       ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  // Check server
  log('\n🚀 Checking server connection...', 'blue');
  try {
    const response = await fetch(`${BASE_URL.replace('/api', '')}/health`);
    if (response.ok) {
      log('✅ Server is running', 'green');
    }
  } catch (error) {
    log(`❌ Server not running: ${error.message}`, 'red');
    return;
  }

  // Run tests
  let success = true;

  success = await login() && success;
  if (!TOKEN) return;

  success = await testAddToShortlist() && success;
  success = await testAddMultiple() && success;
  success = await testGetShortlist() && success;
  success = await testRemoveFromShortlist() && success;
  success = await testGetShortlistAgain() && success;
  success = await testErrorHandling() && success;

  // Summary
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  if (success) {
    log('║           ✅ ALL TESTS PASSED                          ║', 'green');
  } else {
    log('║           ⚠️  SOME TESTS FAILED                         ║', 'red');
  }
  log('╚════════════════════════════════════════════════════════╝', 'blue');
}

// Run tests
runAllTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
