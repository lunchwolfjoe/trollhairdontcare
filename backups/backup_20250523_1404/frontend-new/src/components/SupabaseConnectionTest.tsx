import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, Typography, Paper } from '@mui/material';

export const SupabaseConnectionTest: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [queryBuilderTest, setQueryBuilderTest] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Basic connection
        console.log('Supabase client:', supabase);
        
        // Test 2: Try to create a query builder
        const queryBuilder = supabase.from('festivals');
        console.log('Query builder:', queryBuilder);
        
        // Test 3: Try a simple query
        const { data, error: queryError } = await supabase
          .from('festivals')
          .select('*')
          .limit(1);
          
        if (queryError) throw queryError;
        
        console.log('Query result:', data);
        setQueryBuilderTest('Query builder working correctly');
      } catch (err: any) {
        console.error('Connection test error:', err);
        setError(err.message);
      }
    };

    testConnection();
  }, []);

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6">Supabase Connection Test</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography>
          URL: {import.meta.env.VITE_SUPABASE_URL || 'Not found'}
        </Typography>
        <Typography>
          Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Not found'}
        </Typography>
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            Error: {error}
          </Typography>
        )}
        {queryBuilderTest && (
          <Typography color="success.main" sx={{ mt: 1 }}>
            {queryBuilderTest}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}; 
