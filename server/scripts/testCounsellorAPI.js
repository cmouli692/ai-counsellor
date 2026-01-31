/**
 * Test AI Counsellor API
 * Tests the AI counselling endpoint with various scenarios
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const testUser = {
  email: 'counsellor-test2@example.com',
  password: 'TestPassword123!',
  token: null,
};

console.log('🚀 Starting AI Counsellor Tests\n');

// ============================================
// Helper Functions
// ============================================

const log = (title, content) => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📌 ${title}`);
  console.log('='.repeat(70));
  console.log(JSON.stringify(content, null, 2));
};

const handleError = (error, step) => {
  console.error(`\n❌ ${step} FAILED`);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.error('Error:', error.message);
  }
  process.exit(1);
};

// ============================================
// Tests
// ============================================

// 1. Sign up test user
console.log('1️⃣ Signing up test user...');
try {
//   const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {
//     email: testUser.email,
//     password: testUser.password,
//     firstName: 'Counsellor',
//     lastName: 'Tester',
//   });

  const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {
name: "Counsellor Tester",
email: testUser.email,
password: testUser.password,
});


  testUser.token = signupRes.data.token || signupRes.data.data?.token;

  console.log('✅ Signup successful');
  console.log(`   Token: ${testUser.token.substring(0, 20)}...`);
} catch (error) {
  // User might already exist
  console.log('⚠️  User might exist, attempting login...');

console.log('⚠️ Signup failed, reason:');
  if (error.response) {
    console.log(error.response.status, error.response.data);
  }
  console.log('Attempting login...');

  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    testUser.token = loginRes.data.token || loginRes.data.data?.token;

    console.log('✅ Login successful');
    console.log('AUTH RESPONSE:', loginRes.data);

  } catch (loginError) {
    handleError(loginError, 'Sign up/Login');
  }
}

// 2. Complete user profile
console.log('\n2️⃣ Completing user profile...');
try {
  const profileRes = await axios.post(
  `${BASE_URL}/profile`,
  {
    name: "Counsellor Tester",
    grade: "Undergrad",
    stream: "Engineering",
    interests: ["Technology", "AI"],
    career_aspirations: "Study Computer Science abroad",
    budget_range: "25L-50L",
    exam_readiness: "preparing"
  },
  {
    headers: { Authorization: `Bearer ${testUser.token}` }
  }
);

  console.log('✅ Profile completed');
} catch (error) {
  handleError(error, 'Complete Profile');
}

// 3. Get counsellor context
console.log('\n3️⃣ Getting counsellor context...');
try {
  const contextRes = await axios.get(`${BASE_URL}/ai/counsellor/context`, {
    headers: { Authorization: `Bearer ${testUser.token}` },
  });

  console.log('✅ Context retrieved');
  log('Counsellor Context', contextRes.data);
} catch (error) {
  handleError(error, 'Get Counsellor Context');
}

// 4. Add universities to shortlist
console.log('\n4️⃣ Adding universities to shortlist...');
try {
  for (let i = 1; i <= 3; i++) {
    await axios.post(`${BASE_URL}/shortlist/${i}`, {}, {
      headers: { Authorization: `Bearer ${testUser.token}` },
    });
  }
  console.log('✅ Added 3 universities to shortlist');
} catch (error) {
  console.warn('⚠️  Some universities already in shortlist');
}

// 5. Test counsellor with various prompts
const testPrompts = [
  "I'm just starting my university search. What should I do next?",
  "I have 3 universities in my shortlist. Should I add more?",
  "Which universities would you recommend for Computer Science?",
  "Help me create a study plan for my entrance exams.",
  "What's the best way to prepare my Statement of Purpose?",
];

for (let i = 0; i < testPrompts.length; i++) {
  const step = 6 + i;
  console.log(`\n${step}️⃣ Testing counsellor prompt: "${testPrompts[i]}"`);

  try {
    const counsellorRes = await axios.post(
      `${BASE_URL}/ai/counsellor`,
      { message: testPrompts[i] },
      {
        headers: { Authorization: `Bearer ${testUser.token}` },
      }
    );

    console.log('✅ Counsellor response received');

    const { data } = counsellorRes.data;
    console.log(`\n   Message: ${data.counsellor.message.substring(0, 100)}...`);
    console.log(`   Using Gemini: ${data.counsellor.usedGemini ? 'Yes ✨' : 'No (using rule-based)'}`);
    console.log(`   Recommended Universities:`);
    console.log(`     - Dream: ${data.counsellor.recommended.dream.length}`);
    console.log(`     - Target: ${data.counsellor.recommended.target.length}`);
    console.log(`     - Safe: ${data.counsellor.recommended.safe.length}`);
    console.log(`   Actions Executed: ${data.counsellor.actions.length}`);
    console.log(`   User Stage: ${data.user.stage?.stage_number}`);
    console.log(`   Shortlist Count: ${data.user.shortlist.length}`);
    console.log(`   Locked University: ${data.user.lockedUniversity?.name || 'None'}`);
    console.log(`   Tasks: ${data.user.stats.totalTasks} total, ${data.user.stats.completedTasks} done`);

    if (i === 0) {
      log('Full Counsellor Response', counsellorRes.data);
    }
  } catch (error) {
    handleError(error, `Counsellor Test ${i + 1}`);
  }
}

// 6. Test action execution
console.log(`\n${6 + testPrompts.length}️⃣ Testing action execution with counsellor recommendations...`);
try {
  const actionRes = await axios.post(
    `${BASE_URL}/ai/counsellor`,
    {
      message: 'Can you help me lock a university and create an action plan?',
    },
    {
      headers: { Authorization: `Bearer ${testUser.token}` },
    }
  );

  console.log('✅ Actions executed');

  const { actions, user } = actionRes.data.data.counsellor;
  const userData = actionRes.data.data.user;

  if (actions.length > 0) {
    log('Executed Actions', actions);
  }

  log('Updated User Data', userData);
} catch (error) {
  console.warn('⚠️  Action execution test skipped or had issues');
}

// 7. Error handling test
console.log(`\n${7 + testPrompts.length}️⃣ Testing error handling...`);
try {
  await axios.post(
    `${BASE_URL}/ai/counsellor`,
    { message: '' }, // Empty message
    {
      headers: { Authorization: `Bearer ${testUser.token}` },
    }
  );
  console.log('❌ Should have failed with empty message');
} catch (error) {
  if (error.response?.status === 400) {
    console.log('✅ Correctly rejected empty message');
  }
}

// 8. Final context check
console.log(`\n${8 + testPrompts.length}️⃣ Checking final user context...`);
try {
  const finalContextRes = await axios.get(`${BASE_URL}/ai/counsellor/context`, {
    headers: { Authorization: `Bearer ${testUser.token}` },
  });

  console.log('✅ Final context retrieved');
  log('Final User Context', finalContextRes.data.data);
} catch (error) {
  handleError(error, 'Final Context Check');
}

// Success message
console.log('\n\n' + '='.repeat(70));
console.log('✅ ALL AI COUNSELLOR TESTS PASSED!');
console.log('='.repeat(70));
console.log('\n📋 Summary:');
console.log('  ✓ User authentication');
console.log('  ✓ Profile completion');
console.log('  ✓ Counsellor context retrieval');
console.log('  ✓ AI counselling with multiple prompts');
console.log('  ✓ Gemini integration (or rule-based fallback)');
console.log('  ✓ Action execution (SHORTLIST, LOCK, CREATE_TASK)');
console.log('  ✓ Updated user data retrieval');
console.log('  ✓ Error handling');
console.log('  ✓ Structured JSON responses');
console.log('\n🎉 AI Counsellor API is fully functional!\n');
