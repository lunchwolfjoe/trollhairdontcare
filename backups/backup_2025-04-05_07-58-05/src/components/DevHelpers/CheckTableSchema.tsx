import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, CircularProgress, Divider, Alert } from '@mui/material';
import { crewService } from '../../lib/services';
import { supabase } from '../../lib/supabaseClient';

// ... existing code ... 