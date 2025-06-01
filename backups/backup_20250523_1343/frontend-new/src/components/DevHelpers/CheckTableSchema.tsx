import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, CircularProgress, Divider, Alert } from '@mui/material';
import { crewService } from '../../lib/services';
import { supabase } from '../../lib/supabaseClient';

const CheckTableSchema: React.FC = () => {
  const [schemaInfo, setSchemaInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initStatus, setInitStatus] = useState<{success?: boolean, message?: string} | null>(null);

  const fetchSchema = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await crewService.getTableSchema();
      if (response.error) {
        throw new Error(`Failed to get schema: ${response.error.message}`);
      }
      setSchemaInfo(response.data);
    } catch (err: any) {
      console.error('Error fetching schema:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeTable = async () => {
    setLoading(true);
    setInitStatus(null);
    setError(null);
    
    try {
      // SQL to create the crews table if it doesn't exist
      const tableDefinition = `
        CREATE TABLE IF NOT EXISTS crews (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          description TEXT,
          crew_type TEXT,
          required_skills JSONB DEFAULT '[]',
          min_headcount INTEGER DEFAULT 1,
          max_headcount INTEGER DEFAULT 1,
          shift_start_time TEXT DEFAULT '08:00',
          shift_end_time TEXT DEFAULT '16:00',
          shift_length_hours INTEGER DEFAULT 4,
          festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      // Execute the SQL through Supabase
      const { error } = await supabase.rpc('run_sql', { sql: tableDefinition });
      
      if (error) {
        console.error('Error creating crews table:', error);
        setInitStatus({
          success: false,
          message: `Failed to initialize table: ${error.message}`
        });
      } else {
        setInitStatus({
          success: true,
          message: 'Successfully initialized the crews table!'
        });
        
        // Refresh the schema info
        await fetchSchema();
      }
    } catch (err: any) {
      console.error('Error initializing table:', err);
      setInitStatus({
        success: false,
        message: `Error: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const rebuildTable = async () => {
    setLoading(true);
    setInitStatus(null);
    setError(null);
    
    try {
      // SQL to drop and recreate the crews table
      const tableDefinition = `
        DROP TABLE IF EXISTS crews CASCADE;
        
        CREATE TABLE crews (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          description TEXT,
          crew_type TEXT,
          required_skills JSONB DEFAULT '[]',
          min_headcount INTEGER DEFAULT 1,
          max_headcount INTEGER DEFAULT 1,
          shift_start_time TEXT DEFAULT '08:00',
          shift_end_time TEXT DEFAULT '16:00',
          shift_length_hours INTEGER DEFAULT 4,
          festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Allow read access to all authenticated users
        GRANT SELECT ON crews TO authenticated;
        
        -- Allow insert/update/delete for authenticated users
        GRANT INSERT, UPDATE, DELETE ON crews TO authenticated;
      `;
      
      // Execute the SQL through Supabase
      const { error } = await supabase.rpc('run_sql', { sql: tableDefinition });
      
      if (error) {
        console.error('Error rebuilding crews table:', error);
        setInitStatus({
          success: false,
          message: `Failed to rebuild table: ${error.message}`
        });
      } else {
        setInitStatus({
          success: true,
          message: 'Successfully rebuilt the crews table from scratch!'
        });
        
        // Refresh the schema info
        await fetchSchema();
      }
    } catch (err: any) {
      console.error('Error rebuilding table:', err);
      setInitStatus({
        success: false,
        message: `Error: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to directly inspect a raw crew in the database
  const inspectRawCrew = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Bypass the service and directly query the database
      const { data, error } = await supabase
        .from('crews')
        .select('*')
        .limit(1);
      
      if (error) {
        throw new Error(`Failed to inspect crews: ${error.message}`);
      }
      
      console.log('Raw crew from database:', data);
      
      setInitStatus({
        success: true,
        message: data?.length ? `Found ${data.length} crew(s). Check console for details.` : 'No crews found in database.'
      });
    } catch (err: any) {
      console.error('Error inspecting crews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to check the actual database columns directly using information_schema
  const checkDatabaseColumns = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authentication session found');
      }
      
      // Use direct fetch API to query the information_schema
      const apiUrl = 'https://ysljpqtpbpugekhrdocq.supabase.co/rest/v1/rpc/check_table_columns';
      
      const body = {
        table_name: 'crews'
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGpwcXRwYnB1Z2VraHJkb2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzOTYxMTQsImV4cCI6MjA1ODk3MjExNH0.Vm9ur1yoEIr_4Dc1IrDax5M_-5qASydr6inbf4VhP5c',
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(body)
      });
      
      // If the function doesn't exist, try a direct SQL query instead
      if (response.status === 404) {
        // Use a simple select query to list the columns directly
        const apiUrlDirect = 'https://ysljpqtpbpugekhrdocq.supabase.co/rest/v1/crews?limit=0';
        
        const directResponse = await fetch(apiUrlDirect, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGpwcXRwYnB1Z2VraHJkb2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzOTYxMTQsImV4cCI6MjA1ODk3MjExNH0.Vm9ur1yoEIr_4Dc1IrDax5M_-5qASydr6inbf4VhP5c',
            'Authorization': `Bearer ${session.access_token}`,
            'Prefer': 'return=representation'
          }
        });
        
        if (!directResponse.ok) {
          const errorData = await directResponse.json();
          throw new Error(`Failed to query database columns: ${errorData.message || directResponse.statusText}`);
        }
        
        // Check the response headers for column info
        const rangeHeader = directResponse.headers.get('Content-Range');
        const columnsHeader = directResponse.headers.get('X-Columns');
        
        setInitStatus({
          success: true,
          message: `Queried table directly. Found columns: ${columnsHeader || 'Unknown'}`
        });
        
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to check database columns: ${errorData.message || response.statusText}`);
      }
      
      const columnData = await response.json();
      
      setSchemaInfo({
        message: 'Successfully retrieved database columns',
        columns: columnData.columns || []
      });
      
      setInitStatus({
        success: true,
        message: `Found ${columnData.columns ? columnData.columns.length : 0} columns in the database table`
      });
    } catch (err: any) {
      console.error('Error checking database columns:', err);
      setError(err.message);
      
      // Fall back to a simple method
      try {
        const { data, error } = await supabase
          .from('crews')
          .select('*')
          .limit(1);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const columns = Object.keys(data[0]).map(column => ({
            column_name: column,
            data_type: typeof data[0][column]
          }));
          
          setSchemaInfo({
            message: 'Retrieved schema from sample row',
            columns
          });
          
          setInitStatus({
            success: true,
            message: `Found ${columns.length} columns in the first row of data`
          });
        } else {
          setInitStatus({
            success: false,
            message: 'No data returned from table'
          });
        }
      } catch (fallbackErr: any) {
        setError(`${err.message}\nFallback method also failed: ${fallbackErr.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Crews Table Schema Debugger
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={fetchSchema}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Check Schema'}
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={initializeTable}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Initialize Crews Table'}
        </Button>
        <Button 
          variant="contained" 
          color="secondary"
          onClick={rebuildTable}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Rebuild Crews Table'}
        </Button>
        <Button 
          variant="contained" 
          color="info"
          onClick={inspectRawCrew}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Inspect Raw Crew'}
        </Button>
        <Button 
          variant="contained" 
          color="info"
          onClick={checkDatabaseColumns}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Check Database Columns'}
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {initStatus && (
        <Alert severity={initStatus.success ? 'success' : 'error'} sx={{ mb: 2 }}>
          {initStatus.message}
        </Alert>
      )}

      {schemaInfo && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {schemaInfo.message}
          </Typography>
          <List>
            {schemaInfo.columns && Array.isArray(schemaInfo.columns) ? (
              schemaInfo.columns.map((column: any, index: number) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={column.column_name || column} 
                    secondary={column.data_type ? `Type: ${column.data_type}` : ''}
                  />
                </ListItem>
              ))
            ) : (
              <Typography>No column information available</Typography>
            )}
          </List>
          
          {schemaInfo.tableDefinition && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Table Definition
              </Typography>
              <Box component="pre" sx={{ 
                p: 2, 
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.8rem',
                maxHeight: '300px'
              }}>
                {schemaInfo.tableDefinition}
              </Box>
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default CheckTableSchema; 