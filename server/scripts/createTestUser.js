/**
 * Create Test User
 * Quick script to create a test user for lock API testing
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000';

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const response = await axios.post(`${API_BASE}/api/auth/signup`, {
      name: 'Lock Tester',
      email: 'lock.tester@test.com',
      password: 'TestPass123!'
    });

    if (response.status === 201 && response.data.user) {
      console.log('✅ Test user created successfully');
      console.log(`User ID: ${response.data.user.id}`);
      console.log(`Email: ${response.data.user.email}`);
      console.log(`Token: ${response.data.token.substring(0, 30)}...`);
      return true;
    }

    console.log('❌ User creation failed');
    return false;

  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('already')) {
      console.log('✅ Test user already exists (this is fine)');
      return true;
    }
    console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

createTestUser();
