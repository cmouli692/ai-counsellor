/**
 * Lock API Test Suite
 * 
 * Comprehensive tests for university locking system
 * Tests:
 * 1. Lock a university (from shortlist)
 * 2. Prevent locking university not in shortlist
 * 3. Prevent locking non-existent university
 * 4. Replace existing lock with new lock
 * 5. Get lock status
 * 6. Validate applications access
 * 7. Unlock with warning
 * 8. Prevent unlocking when no lock exists
 * 9. Error handling (400, 403, 404, 500)
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000';
let authToken = null;
let testUserId = null;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${msg}\n${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

/**
 * Test 1: Login to get auth token
 */
async function testLogin() {
  log.section('TEST 1: Login & Get Auth Token');

  try {
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'testuser@example.com',
      password: 'TestPass123!'
    });

    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      testUserId = response.data.user.id;
      log.success(`Logged in successfully. User ID: ${testUserId}`);
      log.success(`Auth token received: ${authToken.substring(0, 20)}...`);
      return true;
    }

    log.error('Login failed - no token received');
    return false;
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 2: Add universities to shortlist (prerequisite for locking)
 */
async function testShortlistSetup() {
  log.section('TEST 2: Add Universities to Shortlist');

  try {
    // Get universities first
    const uniResponse = await axios.get(`${API_BASE}/api/universities`);
    const universities = uniResponse.data.data;

    if (universities.length < 2) {
      log.error('Not enough universities in database');
      return [];
    }

    const univsToShortlist = universities.slice(0, 3);
    const shortlistedIds = [];

    for (const uni of univsToShortlist) {
      try {
        await axios.post(`${API_BASE}/api/shortlist/${uni.id}`, {}, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        shortlistedIds.push(uni.id);
        log.success(`Added university ${uni.id} (${uni.name}) to shortlist`);
      } catch (err) {
        log.warning(`Could not shortlist university ${uni.id}: ${err.response?.data?.error}`);
      }
    }

    return shortlistedIds;
  } catch (error) {
    log.error(`Shortlist setup failed: ${error.message}`);
    return [];
  }
}

/**
 * Test 3: Lock a university from shortlist
 */
async function testLockUniversity(universityId) {
  log.section('TEST 3: Lock University from Shortlist');

  try {
    const response = await axios.post(`${API_BASE}/api/lock/${universityId}`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.status === 200 && response.data.success) {
      log.success(`University ${universityId} locked successfully`);
      log.info(`Locked at: ${response.data.data.lockedAt}`);
      return true;
    }

    log.error('Lock failed - unexpected response');
    return false;
  } catch (error) {
    log.error(`Lock failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 4: Try to lock university NOT in shortlist (should fail)
 */
async function testLockNotInShortlist() {
  log.section('TEST 4: Prevent Locking University Not in Shortlist');

  try {
    // Try to lock a university that wasn't shortlisted
    const response = await axios.post(`${API_BASE}/api/lock/999`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    log.error('Lock succeeded when it should have failed');
    return false;
  } catch (error) {
    if (error.response?.status === 404) {
      log.success(`Correctly prevented locking: ${error.response.data.message}`);
      return true;
    }

    log.error(`Unexpected error: ${error.message}`);
    return false;
  }
}

/**
 * Test 5: Get lock status
 */
async function testGetLockStatus() {
  log.section('TEST 5: Get Lock Status');

  try {
    const response = await axios.get(`${API_BASE}/api/lock/status`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.status === 200 && response.data.success) {
      log.success('Lock status retrieved');
      log.info(`Is Locked: ${response.data.data.isLocked}`);
      
      if (response.data.data.lockedUniversity) {
        log.info(`Locked University: ${response.data.data.lockedUniversity.name}`);
      }

      return true;
    }

    log.error('Failed to get lock status');
    return false;
  } catch (error) {
    log.error(`Get lock status failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: Replace lock (lock different university)
 */
async function testReplaceLock(newUniversityId) {
  log.section('TEST 6: Replace Existing Lock with New University');

  try {
    const response = await axios.post(`${API_BASE}/api/lock/${newUniversityId}`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.status === 200 && response.data.success) {
      log.success(`Lock replaced with university ${newUniversityId}`);
      return true;
    }

    log.error('Lock replacement failed');
    return false;
  } catch (error) {
    log.error(`Lock replacement failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 7: Validate applications access (should allow)
 */
async function testValidateApplicationsAccess() {
  log.section('TEST 7: Validate Applications Access (with lock)');

  try {
    const response = await axios.get(`${API_BASE}/api/lock/validate-applications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.status === 200 && response.data.data.canAccessApplications) {
      log.success('User can access applications stage');
      log.info(`Locked Universities: ${response.data.data.lockedUniversities}`);
      return true;
    }

    log.error('Applications access validation failed');
    return false;
  } catch (error) {
    log.error(`Validation failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 8: Unlock university with warning
 */
async function testUnlock() {
  log.section('TEST 8: Unlock University with Warning');

  try {
    const response = await axios.post(`${API_BASE}/api/lock/unlock`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.status === 200 && response.data.success) {
      log.success('University unlocked successfully');
      log.warning(`Warning: ${response.data.warning}`);
      log.info(`Previously locked: ${response.data.data.previouslyLockedUniversity.name}`);
      return true;
    }

    log.error('Unlock failed');
    return false;
  } catch (error) {
    log.error(`Unlock failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test 9: Validate applications access after unlock (should block)
 */
async function testValidateApplicationsAccessBlocked() {
  log.section('TEST 9: Validate Applications Access (without lock)');

  try {
    const response = await axios.get(`${API_BASE}/api/lock/validate-applications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    log.error('Applications access succeeded when it should be blocked');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      log.success(`Correctly blocked applications access: ${error.response.data.message}`);
      log.info(`Current locked universities: ${error.response.data.data.currentLockedUniversities}`);
      return true;
    }

    log.error(`Unexpected error: ${error.message}`);
    return false;
  }
}

/**
 * Test 10: Try to unlock when nothing is locked (should fail)
 */
async function testUnlockWhenNotLocked() {
  log.section('TEST 10: Prevent Unlocking When No Lock Exists');

  try {
    const response = await axios.post(`${API_BASE}/api/lock/unlock`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    log.error('Unlock succeeded when nothing was locked');
    return false;
  } catch (error) {
    if (error.response?.status === 404) {
      log.success(`Correctly prevented unlock: ${error.response.data.message}`);
      return true;
    }

    log.error(`Unexpected error: ${error.message}`);
    return false;
  }
}

/**
 * Test 11: Error handling - Invalid university ID
 */
async function testInvalidUniversityId() {
  log.section('TEST 11: Error Handling - Invalid University ID');

  try {
    const response = await axios.post(`${API_BASE}/api/lock/invalid-id`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    log.error('Request succeeded with invalid ID');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      log.success(`Correctly rejected invalid ID: ${error.response.data.message}`);
      return true;
    }

    log.error(`Unexpected error: ${error.message}`);
    return false;
  }
}

/**
 * Test 12: Error handling - Missing auth token
 */
async function testMissingAuthToken() {
  log.section('TEST 12: Error Handling - Missing Auth Token');

  try {
    const response = await axios.post(`${API_BASE}/api/lock/1`, {});

    log.error('Request succeeded without auth token');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      log.success(`Correctly rejected request: ${error.response.data.message}`);
      return true;
    }

    log.error(`Unexpected error: ${error.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.clear();
  log.section('LOCK API TEST SUITE');
  log.info('Testing university locking system\n');

  const results = [];

  try {
    // Test 1: Login
    if (!await testLogin()) {
      log.error('Login failed - cannot continue tests');
      return;
    }

    // Test 2: Setup shortlist
    const shortlistedIds = await testShortlistSetup();
    if (shortlistedIds.length < 2) {
      log.error('Could not setup shortlist - need at least 2 universities');
      return;
    }

    // Test 3: Lock a university
    results.push(['Lock university', await testLockUniversity(shortlistedIds[0])]);

    // Test 4: Try lock not in shortlist
    results.push(['Prevent lock (not in shortlist)', await testLockNotInShortlist()]);

    // Test 5: Get lock status
    results.push(['Get lock status', await testGetLockStatus()]);

    // Test 6: Replace lock
    results.push(['Replace lock', await testReplaceLock(shortlistedIds[1])]);

    // Test 7: Validate applications with lock
    results.push(['Validate applications (with lock)', await testValidateApplicationsAccess()]);

    // Test 8: Unlock
    results.push(['Unlock university', await testUnlock()]);

    // Test 9: Validate applications without lock
    results.push(['Validate applications (no lock)', await testValidateApplicationsAccessBlocked()]);

    // Test 10: Unlock when nothing locked
    results.push(['Prevent unlock (not locked)', await testUnlockWhenNotLocked()]);

    // Test 11: Invalid university ID
    results.push(['Error: Invalid university ID', await testInvalidUniversityId()]);

    // Test 12: Missing auth
    results.push(['Error: Missing auth token', await testMissingAuthToken()]);

  } catch (error) {
    log.error(`Test suite error: ${error.message}`);
  }

  // Print summary
  log.section('TEST SUMMARY');
  
  let passCount = 0;
  let failCount = 0;

  results.forEach(([testName, passed]) => {
    if (passed) {
      passCount++;
      log.success(testName);
    } else {
      failCount++;
      log.error(testName);
    }
  });

  console.log('\n');
  log.info(`Total Tests: ${results.length}`);
  log.success(`Passed: ${passCount}`);
  if (failCount > 0) log.error(`Failed: ${failCount}`);

  const percentage = Math.round((passCount / results.length) * 100);
  log.info(`Success Rate: ${percentage}%\n`);

  if (failCount === 0) {
    log.success('All tests passed! 🎉');
  } else {
    log.warning(`${failCount} test(s) failed. Review the output above.`);
  }
}

// Run tests
runAllTests();
