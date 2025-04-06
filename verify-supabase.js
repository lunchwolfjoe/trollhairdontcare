/**
 * Supabase Connection Verification Script
 * 
 * This script tests the connection to your Supabase project and verifies:
 * 1. Basic connection
 * 2. Authentication functionality
 * 3. Database query functionality
 * 
 * Instructions:
 * 1. Make sure your .env.local file has the correct Supabase credentials
 * 2. Run this script with: node verify-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local file');
  console.log('Please add your Supabase URL and anon key to .env.local');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test variables
const TEST_EMAIL = 'test-user@example.com';
const TEST_PASSWORD = 'ComplexPassword123!';

async function verifySupabaseConnection() {
  console.log('🔍 Verifying Supabase connection...');
  
  try {
    // Test 1: Basic connection by querying a system table
    console.log('\n📋 Test 1: Checking basic connection...');
    const { data, error } = await supabase.from('roles').select('*').limit(1);
    
    if (error) throw error;
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`Found ${data.length} roles in the database.`);
    
    // Test 2: Authentication - Sign up a test user
    console.log('\n📋 Test 2: Testing authentication flow...');
    console.log(`Creating test user with email: ${TEST_EMAIL}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('ℹ️ Test user already exists, proceeding with sign in test.');
      } else {
        throw signUpError;
      }
    } else {
      console.log('✅ Test user created successfully!');
      console.log(`User ID: ${signUpData.user.id}`);
    }
    
    // Test 3: Authentication - Sign in with test user
    console.log('\n📋 Test 3: Testing sign in functionality...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (signInError) throw signInError;
    
    console.log('✅ Sign in successful!');
    console.log(`Session expires at: ${new Date(signInData.session.expires_at * 1000).toLocaleString()}`);
    
    // Test 4: Query the database with authenticated user
    console.log('\n📋 Test 4: Testing database query as authenticated user...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single();
    
    if (profileError) throw profileError;
    
    console.log('✅ Successfully queried profile data!');
    console.log('Profile data:', profileData);
    
    // Test 5: Check user role
    console.log('\n📋 Test 5: Checking user roles...');
    
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', signInData.user.id);
    
    if (roleError) throw roleError;
    
    if (roleData && roleData.length > 0) {
      console.log('✅ User has the following roles:');
      roleData.forEach(role => {
        console.log(`- ${role.roles.name}`);
      });
    } else {
      console.log('ℹ️ User has no roles assigned yet.');
      console.log('You can assign roles using SQL in the Supabase dashboard.');
    }
    
    // Test 6: Assign volunteer role if not assigned
    console.log('\n📋 Test 6: Assigning volunteer role if not already assigned...');
    
    // First, get the volunteer role ID
    const { data: volunteerRole, error: volunteerRoleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'volunteer')
      .single();
    
    if (volunteerRoleError) throw volunteerRoleError;
    
    // Check if user already has volunteer role
    const hasVolunteerRole = roleData.some(role => role.roles.name === 'volunteer');
    
    if (!hasVolunteerRole) {
      // Assign volunteer role
      const { error: assignRoleError } = await supabase
        .from('user_roles')
        .insert([
          { user_id: signInData.user.id, role_id: volunteerRole.id }
        ]);
      
      if (assignRoleError) throw assignRoleError;
      
      console.log('✅ Volunteer role assigned successfully!');
    } else {
      console.log('ℹ️ User already has volunteer role.');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('Your Supabase integration is working properly.');
    
  } catch (error) {
    console.error('\n❌ Error during verification:', error.message);
    console.error(error);
    process.exit(1);
  }
}

verifySupabaseConnection(); 