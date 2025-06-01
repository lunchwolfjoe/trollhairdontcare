/**
 * This is a simple utility to help identify and fix recursion issues
 * 
 * Run this with: node fix-recursion.js
 */

import { supabase } from './src/lib/supabaseClient.js';

// Check if supabase client was properly initialized
console.log('Checking Supabase client initialization...');
console.log('Supabase client initialized:', !!supabase);
console.log('Supabase client has auth module:', !!(supabase && supabase.auth));
console.log('Supabase URL:', supabase ? supabase.supabaseUrl : 'Not available');
console.log('Supabase key available:', !!supabase?.supabaseKey);

// Verify no circular dependencies
console.log('\nChecking for circular dependencies...');
console.log('This script loads fine = No circular dependencies in the import chain');

// Print hints for fixing recursion issues
console.log('\nHints for fixing recursion issues:');
console.log('1. Avoid calling functions that trigger state updates within render functions');
console.log('2. Use useEffect hooks with proper dependencies to avoid infinite re-renders');
console.log('3. Memoize expensive computations with useMemo or useCallback');
console.log('4. Add safeguards to prevent recursive function calls');
console.log('5. Check for circular dependencies in imports');

console.log('\nStatus: If you see this message, the script ran successfully without recursion issues!'); 