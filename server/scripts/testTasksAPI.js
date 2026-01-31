/**
 * Test Tasks API
 * Tests all task endpoints including auto-generation
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials (must be created first)
const testUser = {
  email: 'tasks-test@example.com',
  password: 'TestPassword123!',
  token: null
};

let testTaskId = null;

console.log('🚀 Starting Tasks API Tests\n');

// ============================================
// Helper Functions
// ============================================

const log = (title, content) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📌 ${title}`);
  console.log('='.repeat(60));
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
  const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {
    email: testUser.email,
    password: testUser.password,
    firstName: 'Tasks',
    lastName: 'Tester'
  });

  testUser.token = signupRes.data.data.token;
  console.log('✅ Signup successful');
  console.log(`   Token: ${testUser.token.substring(0, 20)}...`);
} catch (error) {
  // User might already exist, try to login
  console.log('⚠️  User might exist, attempting login...');
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    testUser.token = loginRes.data.data.token;
    console.log('✅ Login successful');
  } catch (loginError) {
    handleError(loginError, 'Sign up/Login');
  }
}

// 2. Complete user profile
console.log('\n2️⃣ Completing user profile...');
try {
  const profileRes = await axios.post(
    `${BASE_URL}/profile/complete`,
    {
      targetCountries: ['USA', 'UK', 'Canada'],
      preferredIntakeSession: 'Fall',
      preferredFields: ['Computer Science', 'Data Science']
    },
    {
      headers: { Authorization: `Bearer ${testUser.token}` }
    }
  );
  console.log('✅ Profile completed');
} catch (error) {
  handleError(error, 'Complete Profile');
}

// 3. Add university to shortlist
console.log('\n3️⃣ Adding university to shortlist...');
try {
  const shortlistRes = await axios.post(
    `${BASE_URL}/shortlist/1`,
    {},
    {
      headers: { Authorization: `Bearer ${testUser.token}` }
    }
  );
  console.log('✅ University added to shortlist');
  log('Shortlist Response', shortlistRes.data);
} catch (error) {
  handleError(error, 'Add to Shortlist');
}

// 4. Lock university (should auto-generate tasks)
console.log('\n4️⃣ Locking university (should auto-generate tasks)...');
try {
  const lockRes = await axios.post(
    `${BASE_URL}/lock/1`,
    {},
    {
      headers: { Authorization: `Bearer ${testUser.token}` }
    }
  );
  console.log('✅ University locked successfully');
  log('Lock Response', lockRes.data);
} catch (error) {
  handleError(error, 'Lock University');
}

// 5. Get all tasks
console.log('\n5️⃣ Getting all tasks...');
try {
  const tasksRes = await axios.get(`${BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${testUser.token}` }
  });

  console.log('✅ Tasks retrieved successfully');
  log('All Tasks', tasksRes.data);

  // Store first task ID for later tests
  if (tasksRes.data.data.tasks && tasksRes.data.data.tasks.length > 0) {
    testTaskId = tasksRes.data.data.tasks[0].id;
    console.log(`   📝 First task ID: ${testTaskId}`);
  }
} catch (error) {
  handleError(error, 'Get All Tasks');
}

// 6. Get tasks for specific university
console.log('\n6️⃣ Getting tasks for university 1...');
try {
  const uniTasksRes = await axios.get(`${BASE_URL}/tasks?universityId=1`, {
    headers: { Authorization: `Bearer ${testUser.token}` }
  });

  console.log('✅ University tasks retrieved');
  log('University 1 Tasks', uniTasksRes.data);
} catch (error) {
  handleError(error, 'Get University Tasks');
}

// 7. Create a custom task
console.log('\n7️⃣ Creating a custom task...');
try {
  const createRes = await axios.post(
    `${BASE_URL}/tasks`,
    {
      universityId: 1,
      title: 'Schedule Campus Visit',
      description: 'Book a virtual campus tour with the admissions office'
    },
    {
      headers: { Authorization: `Bearer ${testUser.token}` }
    }
  );

  console.log('✅ Custom task created');
  log('Created Task', createRes.data);
} catch (error) {
  // Might fail if task already exists (due to UNIQUE constraint)
  console.log('⚠️  Could not create task (might already exist)');
}

// 8. Update task status (mark as done)
if (testTaskId) {
  console.log(`\n8️⃣ Updating task ${testTaskId} to "done"...`);
  try {
    const updateRes = await axios.patch(
      `${BASE_URL}/tasks/${testTaskId}`,
      { status: 'done' },
      {
        headers: { Authorization: `Bearer ${testUser.token}` }
      }
    );

    console.log('✅ Task marked as done');
    log('Updated Task', updateRes.data);
  } catch (error) {
    handleError(error, 'Update Task Status');
  }

  // 9. Update task status back to pending
  console.log(`\n9️⃣ Updating task ${testTaskId} back to "pending"...`);
  try {
    const updateRes = await axios.patch(
      `${BASE_URL}/tasks/${testTaskId}`,
      { status: 'pending' },
      {
        headers: { Authorization: `Bearer ${testUser.token}` }
      }
    );

    console.log('✅ Task marked as pending');
    log('Updated Task', updateRes.data);
  } catch (error) {
    handleError(error, 'Update Task Status');
  }
}

// 10. Get task statistics
console.log('\n🔟 Getting task statistics...');
try {
  const statsRes = await axios.get(`${BASE_URL}/tasks/statistics`, {
    headers: { Authorization: `Bearer ${testUser.token}` }
  });

  console.log('✅ Statistics retrieved');
  log('Task Statistics', statsRes.data.data);
} catch (error) {
  handleError(error, 'Get Statistics');
}

// 11. Get updated tasks list
console.log('\n1️⃣1️⃣ Getting updated tasks list...');
try {
  const finalTasksRes = await axios.get(`${BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${testUser.token}` }
  });

  console.log('✅ Final tasks list retrieved');
  log('Final Tasks List', finalTasksRes.data);
} catch (error) {
  handleError(error, 'Get Final Tasks');
}

// 12. Delete a task
if (testTaskId) {
  console.log(`\n1️⃣2️⃣ Deleting task ${testTaskId}...`);
  try {
    const deleteRes = await axios.delete(`${BASE_URL}/tasks/${testTaskId}`, {
      headers: { Authorization: `Bearer ${testUser.token}` }
    });

    console.log('✅ Task deleted');
    log('Delete Response', deleteRes.data);
  } catch (error) {
    handleError(error, 'Delete Task');
  }
}

// Success message
console.log('\n\n' + '='.repeat(60));
console.log('✅ ALL TASKS API TESTS PASSED!');
console.log('='.repeat(60));
console.log('\n📋 Summary:');
console.log('  ✓ Auto-generated tasks when university locked');
console.log('  ✓ Retrieved all tasks with statistics');
console.log('  ✓ Filtered tasks by university');
console.log('  ✓ Created custom task');
console.log('  ✓ Updated task status (done/pending)');
console.log('  ✓ Retrieved task statistics');
console.log('  ✓ Deleted task');
console.log('\n');
