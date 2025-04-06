import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper, Divider } from '@mui/material';
import { checkUserExists, testLogin } from '../../utils/authTester';

const AuthDebugger = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckUser = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const checkResult = await checkUserExists(email);
      setResult(checkResult);
    } catch (error) {
      setResult({
        exists: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        error
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    if (!email || !password) return;
    
    setLoading(true);
    try {
      const loginResult = await testLogin(email, password);
      setResult(loginResult);
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Authentication Debugger
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="outlined" 
          onClick={handleCheckUser}
          disabled={loading || !email}
        >
          Check User Exists
        </Button>
        <Button 
          variant="contained" 
          onClick={handleTestLogin}
          disabled={loading || !email || !password}
        >
          Test Login
        </Button>
      </Box>
      
      {result && (
        <Box sx={{ mt: 2 }}>
          <Alert severity={result.success || result.exists ? 'success' : 'error'}>
            {result.message}
          </Alert>
          
          {result.details && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, maxHeight: '300px', overflow: 'auto' }}>
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

export default AuthDebugger; 