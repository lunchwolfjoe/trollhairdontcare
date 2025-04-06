import { useState } from 'react';
import { Button, Box, Typography, Paper, Alert } from '@mui/material';
import { testDatabaseConnection } from '../../utils/testConnection';

const ConnectionTester = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setLoading(true);
    try {
      const testResult = await testDatabaseConnection();
      setResult(testResult);
      console.log('Database test results:', testResult);
    } catch (error) {
      console.error('Error running test:', error);
      setResult({
        success: false,
        message: 'Test failed with an unexpected error',
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Database Connection Tester
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={runTest}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Running Tests...' : 'Test Database Connection'}
      </Button>
      
      {result && (
        <Box mt={2}>
          <Alert severity={result.success ? 'success' : 'error'}>
            {result.message}
          </Alert>
          
          {result.details && (
            <Box mt={2} p={2} sx={{ 
              bgcolor: '#f5f5f5', 
              borderRadius: 1,
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(result.details, null, 2)}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ConnectionTester; 