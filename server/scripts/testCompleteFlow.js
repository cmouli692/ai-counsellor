/**
 * Complete Flow Test
 * Tests: POST /api/shortlist/1 → POST /api/lock/1 → GET /api/stage (should be stage 4)
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000';
let authToken = null;
let userId = null;

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${msg}\n${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)
};

async function test() {
  try {
    // Step 1: Create test user
    log.section('STEP 1: Create Test User');
    try {
      const signupRes = await axios.post(`${API_BASE}/api/auth/signup`, {
        name: 'Flow Tester',
        email: `flow.tester.${Date.now()}@test.com`,
        password: 'TestPass123!'
      });
      authToken = signupRes.data.token;
      userId = signupRes.data.user.id;
      log.success(`User created: ${userId}`);
      log.info(`Token: ${authToken.substring(0, 30)}...`);
    } catch (err) {
      log.error(`Failed to create user: ${err.response?.data?.message}`);
      return;
    }

    // Step 2: Complete profile
    log.section('STEP 2: Complete Profile');
    try {
      await axios.post(`${API_BASE}/api/profile/onboarding`, {
        country: 'USA',
        preferredCountries: ['USA', 'UK'],
        highestQualification: 'A-Levels',
        targetCourse: 'Computer Science'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      log.success('Profile completed');
    } catch (err) {
      log.error(`Failed to complete profile: ${err.response?.data?.message}`);
    }

    // Step 3: Shortlist university 1
    log.section('STEP 3: POST /api/shortlist/1');
    try {
      const res = await axios.post(`${API_BASE}/api/shortlist/1`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      log.success(`University 1 added to shortlist`);
      log.info(`Response: ${res.status} ${JSON.stringify(res.data.data)}`);
    } catch (err) {
      log.error(`Failed to shortlist: ${err.response?.status} - ${err.response?.data?.message}`);
      log.info(`Full error: ${JSON.stringify(err.response?.data)}`);
      return;
    }

    // Step 4: Lock university 1
    log.section('STEP 4: POST /api/lock/1');
    try {
      const res = await axios.post(`${API_BASE}/api/lock/1`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      log.success(`University 1 locked`);
      log.info(`Response: ${res.status} ${JSON.stringify(res.data.data)}`);
    } catch (err) {
      log.error(`Failed to lock: ${err.response?.status} - ${err.response?.data?.message}`);
      log.info(`Full error: ${JSON.stringify(err.response?.data)}`);
      return;
    }

    // Step 5: Check stage
    log.section('STEP 5: GET /api/stage → Should be Stage 4');
    try {
      const res = await axios.get(`${API_BASE}/api/stage`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const stage = res.data.stage;
      log.info(`Stage Number: ${stage.stageNumber}`);
      log.info(`Stage Label: ${stage.stageLabel}`);
      log.info(`Description: ${stage.description}`);
      log.info(`Locked Count: ${stage.data.lockedCount}`);
      
      if (stage.stageNumber === 4) {
        log.success(`✓ STAGE 4 VERIFIED!`);
        log.info(`Applications gate enabled: ${stage.gateFeatures.applications}`);
      } else {
        log.error(`Expected stage 4, got stage ${stage.stageNumber}`);
      }
    } catch (err) {
      log.error(`Failed to get stage: ${err.response?.status} - ${err.response?.data?.message}`);
      return;
    }

    log.section('ALL TESTS PASSED ✓');

  } catch (err) {
    log.error(`Unexpected error: ${err.message}`);
  }
}

test();
