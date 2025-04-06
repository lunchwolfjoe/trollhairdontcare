import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  AlertTitle,
  Divider,
  CircularProgress,
  Snackbar,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { AssetService } from '../../lib/services/assetService';
import { festivalService } from '../../lib/services';
import { Asset, AssetCategory, Festival } from '../../lib/types/models';
import { supabase } from '../../lib/supabaseClient';
import SupabaseConnectionTest from '../../components/DevHelpers/SupabaseConnectionTest';

const assetService = new AssetService();

const AssetManagement: React.FC = () => {
  const { festivalId } = useParams<{ festivalId: string }>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<Partial<Asset>>({
    name: '',
    category_id: '',
    status: 'available',
    current_location_id: '',
    condition: 'good',
    location_type: 'fixed',
  });
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<{name: string, description: string}>({
    name: '',
    description: ''
  });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // New state for festival awareness
  const [availableFestivals, setAvailableFestivals] = useState<Festival[]>([]);
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setLoading(true);
        const { data, error } = await festivalService.getActiveFestivals();
        
        if (error) {
          throw new Error(`Failed to fetch festivals: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          setError('No active festivals found. Please create a festival first.');
          setLoading(false);
          return;
        }
        
        setAvailableFestivals(data);
        
        // If festivalId is in URL, use that, otherwise use the first festival
        const targetFestivalId = festivalId || data[0].id;
        const festival = data.find(f => f.id === targetFestivalId);
        
        if (festival) {
          setCurrentFestival(festival);
          // Store current festival ID for use in asset creation/updates
          localStorage.setItem('currentFestivalId', festival.id);
          
          // Now fetch assets for this festival
          await checkTables();
          await fetchAssetsForFestival(festival.id);
          await fetchCategories();
        } else {
          setError(`Festival with ID ${targetFestivalId} not found.`);
        }
      } catch (err: any) {
        console.error('Error fetching festivals:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFestivals();
  }, [festivalId]);

  const fetchAssetsForFestival = async (festivalId: string) => {
    try {
      setLoading(true);
      console.log(`Fetching assets for festival ${festivalId}...`);
      
      // In a real implementation, you'd add a filter by festival_id
      const response = await assetService.getAssets({ festival_id: festivalId });
      
      if (response.data) {
        setAssets(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch assets');
      }
    } catch (err) {
      setError('An error occurred while fetching assets');
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFestivalChange = async (festivalId: string) => {
    const festival = availableFestivals.find(f => f.id === festivalId);
    if (festival) {
      setCurrentFestival(festival);
      localStorage.setItem('currentFestivalId', festival.id);
      await fetchAssetsForFestival(festival.id);
    }
  };

  const checkTables = async () => {
    try {
      console.log('Checking if asset tables exist by trying to fetch data...');
      
      // Try to get one category - this will tell us if the table exists
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('asset_categories')
        .select('*')
        .limit(1);
      
      console.log('Categories check:', { data: categoriesData, error: categoriesError });
      
      // Try to get one asset - this will tell us if the table exists
      const { data: assetsData, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .limit(1);
      
      console.log('Assets check:', { data: assetsData, error: assetsError });
      
      // If we get a PGRST204 error or 404 Not Found, the tables don't exist
      if (
        (categoriesError && (categoriesError.code === 'PGRST204' || categoriesError.message.includes('Not Found'))) ||
        (assetsError && (assetsError.code === 'PGRST204' || assetsError.message.includes('Not Found')))
      ) {
        setSnackbar({
          open: true,
          message: 'Asset tables not found in the database. Please run the setup script.',
          severity: 'warning'
        });
      }
    } catch (err) {
      console.error('Error checking tables:', err);
    }
  };

  const fetchAssets = async () => {
    if (currentFestival) {
      await fetchAssetsForFestival(currentFestival.id);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await assetService.getAssetCategories();
      console.log('Categories response:', response);
      
      if (response.data) {
        // Remove duplicates by using a Map with category ID as the key
        const uniqueCategories = [...new Map(
          response.data.map(item => [item.id, item])
        ).values()];
        setCategories(uniqueCategories);
      } else if (response.error) {
        console.error('Failed to fetch categories:', response.error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch categories: ' + response.error.message,
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error in fetchCategories:', err);
    }
  };

  const handleDialogOpen = (asset: Asset | null = null) => {
    if (asset) {
      setSelectedAsset(asset);
      setFormData(asset);
    } else {
      setSelectedAsset(null);
      setFormData({
        name: '',
        category_id: '',
        status: 'available',
        current_location_id: '',
        condition: 'good',
        location_type: 'fixed',
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAsset(null);
    setFormData({
      name: '',
      category_id: '',
      status: 'available',
      current_location_id: '',
      condition: 'good',
      location_type: 'fixed',
    });
  };

  const handleSaveAsset = async () => {
    if (!formData.name) {
      setError('Asset name is required');
      return;
    }

    try {
      setSaveLoading(true);
      
      // Validate UUID format for ID fields
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      // Use currentFestival.id instead of localStorage
      const festivalId = currentFestival?.id;
      
      // Add festival_id to the form data - ensure it's a valid UUID or null (not an empty string)
      const assetData: Partial<Asset> = {
        ...formData,
        // Set festival_id to currentFestival.id if available
        festival_id: festivalId || null
      };
      
      // Clean up any empty strings that should be null
      if (assetData.category_id === '') {
        assetData.category_id = null;
      }
      
      if (assetData.current_location_id === '') {
        assetData.current_location_id = null;
      }
      
      // Validate category_id if present (not empty string and not null)
      if (assetData.category_id && !uuidPattern.test(assetData.category_id)) {
        setSnackbar({
          open: true,
          message: 'Invalid category ID format',
          severity: 'error'
        });
        return;
      }
      
      // Log the data being sent
      console.log('Saving asset with data:', assetData);
      
      let response;
      if (selectedAsset) {
        response = await assetService.updateAsset(selectedAsset.id, assetData);
      } else {
        response = await assetService.createAsset(assetData);
      }
      
      if (response.data) {
        await fetchAssets();
        handleDialogClose();
        setSnackbar({
          open: true,
          message: `Asset ${selectedAsset ? 'updated' : 'created'} successfully`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.error?.message || `Failed to ${selectedAsset ? 'update' : 'create'} asset`,
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error saving asset:', err);
      setSnackbar({
        open: true,
        message: `Error ${selectedAsset ? 'updating' : 'creating'} asset: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        setLoading(true);
        const response = await assetService.deleteAsset(assetId);
        if (response.data !== null) {
          await fetchAssets();
          setSnackbar({
            open: true,
            message: 'Asset deleted successfully',
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: response.error?.message || 'Failed to delete asset',
            severity: 'error'
          });
        }
      } catch (err) {
        console.error('Error deleting asset:', err);
        setSnackbar({
          open: true,
          message: `Error deleting asset: ${err instanceof Error ? err.message : 'Unknown error'}`,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'in-use':
        return 'info';
      case 'maintenance':
        return 'warning';
      case 'lost':
      case 'retired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good':
        return 'success';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      setSnackbar({
        open: true,
        message: 'Category name is required',
        severity: 'error'
      });
      return;
    }
    
    try {
      setCategoryLoading(true);
      const response = await assetService.createAssetCategory(newCategory);
      
      if (response.data) {
        // Add the new category to the local state
        setCategories([...categories, response.data]);
        
        // Select the new category
        setFormData({
          ...formData,
          category_id: response.data.id
        });
        
        setSnackbar({
          open: true,
          message: 'Category created successfully',
          severity: 'success'
        });
        
        // Close the dialog
        handleCategoryDialogClose();
      } else {
        setSnackbar({
          open: true,
          message: response.error?.message || 'Failed to create category',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setSnackbar({
        open: true,
        message: `Error creating category: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setCategoryLoading(false);
    }
  };
  
  const handleCategoryDialogOpen = () => {
    setCategoryDialogOpen(true);
  };
  
  const handleCategoryDialogClose = () => {
    setCategoryDialogOpen(false);
    setNewCategory({
      name: '',
      description: ''
    });
  };

  if (loading && assets.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        {typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg">
      <SupabaseConnectionTest />
      
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1">
              Asset Management
            </Typography>
            {currentFestival && (
              <Typography variant="subtitle1" color="text.secondary">
                Festival: {currentFestival.name} ({new Date(currentFestival.start_date).toLocaleDateString()} - {new Date(currentFestival.end_date).toLocaleDateString()})
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {availableFestivals.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Festival</InputLabel>
                <Select
                  value={currentFestival?.id || ''}
                  label="Festival"
                  onChange={(e) => handleFestivalChange(e.target.value)}
                >
                  {availableFestivals.map(festival => (
                    <MenuItem key={festival.id} value={festival.id}>
                      {festival.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleDialogOpen()}
            >
              Add Asset
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Location Type</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No assets found. Click "Add Asset" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>
                          {asset.category?.name || categories.find(cat => cat.id === asset.category_id)?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={asset.status}
                            color={getStatusColor(asset.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {asset.location_type ? (
                            asset.location_type.charAt(0).toUpperCase() + asset.location_type.slice(1)
                          ) : 'Fixed'}
                        </TableCell>
                        <TableCell>
                          {asset.current_location_id || 
                            (asset.location_type === 'mobile' ? 'Deployed' : 'Not specified')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={asset.condition}
                            color={getConditionColor(asset.condition)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleDialogOpen(asset)} disabled={loading}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteAsset(asset.id)} disabled={loading}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>

      <Dialog 
        open={dialogOpen} 
        onClose={() => !saveLoading && handleDialogClose()} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          component: 'form',
          onSubmit: (e) => {
            e.preventDefault();
            handleSaveAsset();
          }
        }}
      >
        <DialogTitle>
          {selectedAsset ? 'Edit Asset' : 'Add New Asset'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              required
              fullWidth
              label="Asset Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              disabled={saveLoading}
              error={!formData.name && formData.name !== undefined}
              helperText={!formData.name && formData.name !== undefined ? 'Name is required' : ''}
              autoFocus
            />
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                margin="normal"
                SelectProps={{
                  native: true,
                }}
                disabled={saveLoading}
                error={categories.length === 0}
                helperText={categories.length === 0 ? 'No categories found. Please create categories first.' : ''}
                sx={{ flexGrow: 1, mr: 1 }}
              >
                <option value="">Select a category</option>
                {categories.length === 0 ? (
                  <option value="" disabled>Loading categories...</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </TextField>
              <Button
                variant="outlined"
                startIcon={<CategoryIcon />}
                onClick={handleCategoryDialogOpen}
                disabled={saveLoading}
                sx={{ mt: 2, minWidth: '130px', height: '56px' }}
              >
                New Category
              </Button>
            </Box>
            <TextField
              fullWidth
              select
              label="Location Type"
              value={formData.location_type || 'fixed'}
              onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
              margin="normal"
              SelectProps={{
                native: true,
              }}
              disabled={saveLoading}
            >
              <option value="fixed">Fixed Location</option>
              <option value="mobile">Mobile/Deployed</option>
              <option value="storage">In Storage</option>
            </TextField>

            {formData.location_type === 'fixed' ? (
              <TextField
                fullWidth
                label="Location Name/ID"
                value={formData.current_location_id || ''}
                onChange={(e) => setFormData({ ...formData, current_location_id: e.target.value })}
                margin="normal"
                disabled={saveLoading}
                placeholder="Enter location name or ID"
              />
            ) : formData.location_type === 'storage' ? (
              <TextField
                fullWidth
                label="Storage Location"
                value={formData.current_location_id || ''}
                onChange={(e) => setFormData({ ...formData, current_location_id: e.target.value })}
                margin="normal"
                disabled={saveLoading}
                placeholder="Enter storage location"
              />
            ) : (
              <TextField
                fullWidth
                label="Current Assignment"
                value={formData.current_location_id || ''}
                onChange={(e) => setFormData({ ...formData, current_location_id: e.target.value })}
                margin="normal"
                disabled={saveLoading}
                placeholder="Enter current assignment or leave blank if deployed"
                helperText="For mobile/deployed assets, enter current assignment or leave blank"
              />
            )}

            {formData.location_type === 'fixed' && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Latitude"
                  value={formData.location_lat || ''}
                  onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
                  margin="normal"
                  disabled={saveLoading}
                  placeholder="e.g. 51.5074"
                  type="number"
                  inputProps={{ step: "0.000001" }}
                />
                <TextField
                  fullWidth
                  label="Longitude"
                  value={formData.location_long || ''}
                  onChange={(e) => setFormData({ ...formData, location_long: e.target.value })}
                  margin="normal"
                  disabled={saveLoading}
                  placeholder="e.g. -0.1278"
                  type="number"
                  inputProps={{ step: "0.000001" }}
                />
              </Box>
            )}

            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status || 'available'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              margin="normal"
              SelectProps={{
                native: true,
              }}
              disabled={saveLoading}
            >
              <option value="available">Available</option>
              <option value="in-use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="lost">Lost</option>
              <option value="retired">Retired</option>
            </TextField>

            <TextField
              fullWidth
              select
              label="Condition"
              value={formData.condition || 'good'}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              margin="normal"
              SelectProps={{
                native: true,
              }}
              disabled={saveLoading}
            >
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDialogClose} 
            disabled={saveLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained" 
            color="primary"
            disabled={saveLoading || !formData.name}
          >
            {saveLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Saving...
              </Box>
            ) : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Creation Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onClose={() => !categoryLoading && handleCategoryDialogClose()}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          component: 'form',
          onSubmit: (e) => {
            e.preventDefault();
            handleCreateCategory();
          }
        }}
      >
        <DialogTitle>Create New Category</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              required
              fullWidth
              label="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              margin="normal"
              disabled={categoryLoading}
              error={!newCategory.name && newCategory.name !== undefined}
              helperText={!newCategory.name && newCategory.name !== undefined ? 'Name is required' : ''}
              autoFocus
            />
            <TextField
              fullWidth
              label="Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              margin="normal"
              disabled={categoryLoading}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCategoryDialogClose}
            disabled={categoryLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={categoryLoading || !newCategory.name}
          >
            {categoryLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Creating...
              </Box>
            ) : 'Create Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export { AssetManagement }; 
