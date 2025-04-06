import React, { useState } from 'react';
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
} from '@mui/icons-material';

// Mock data for assets
const mockAssets = [
  {
    id: '1',
    name: 'Generator A',
    type: 'Equipment',
    status: 'Available',
    location: 'Storage Room 1',
    lastMaintenance: '2024-03-15',
    nextMaintenance: '2024-04-15',
    condition: 'Good',
    assignedTo: null,
  },
  {
    id: '2',
    name: 'Tent Set 1',
    type: 'Structure',
    status: 'In Use',
    location: 'Main Stage Area',
    lastMaintenance: '2024-03-10',
    nextMaintenance: '2024-04-10',
    condition: 'Good',
    assignedTo: 'Stage Team',
  },
  {
    id: '3',
    name: 'Sound System B',
    type: 'Equipment',
    status: 'Maintenance',
    location: 'Storage Room 2',
    lastMaintenance: '2024-03-01',
    nextMaintenance: '2024-04-01',
    condition: 'Needs Repair',
    assignedTo: null,
  },
];

const AssetManagement: React.FC = () => {
  const [assets, setAssets] = useState(mockAssets);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: '',
    location: '',
    condition: 'Good',
  });

  const handleDialogOpen = (asset = null) => {
    if (asset) {
      setSelectedAsset(asset);
      setNewAsset(asset);
    } else {
      setSelectedAsset(null);
      setNewAsset({
        name: '',
        type: '',
        location: '',
        condition: 'Good',
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAsset(null);
    setNewAsset({
      name: '',
      type: '',
      location: '',
      condition: 'Good',
    });
  };

  const handleSaveAsset = () => {
    if (selectedAsset) {
      // Update existing asset
      setAssets(
        assets.map((asset) =>
          asset.id === selectedAsset.id ? { ...asset, ...newAsset } : asset
        )
      );
    } else {
      // Add new asset
      const newAssetWithId = {
        ...newAsset,
        id: `${Date.now()}`,
        status: 'Available',
        lastMaintenance: new Date().toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        assignedTo: null,
      };
      setAssets([...assets, newAssetWithId]);
    }
    handleDialogClose();
  };

  const handleDeleteAsset = (assetId) => {
    setAssets(assets.filter((asset) => asset.id !== assetId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'In Use':
        return 'info';
      case 'Maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Good':
        return 'success';
      case 'Fair':
        return 'warning';
      case 'Needs Repair':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Asset Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen()}
        >
          Add Asset
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Asset Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Total Assets</Typography>
              </Box>
              <Typography variant="h4">{assets.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Available</Typography>
              </Box>
              <Typography variant="h4">
                {assets.filter((asset) => asset.status === 'Available').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BuildIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Maintenance</Typography>
              </Box>
              <Typography variant="h4">
                {assets.filter((asset) => asset.status === 'Maintenance').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6">Needs Repair</Typography>
              </Box>
              <Typography variant="h4">
                {assets.filter((asset) => asset.condition === 'Needs Repair').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Assets Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Last Maintenance</TableCell>
                    <TableCell>Next Maintenance</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{asset.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={asset.status}
                          color={getStatusColor(asset.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                          {asset.location}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={asset.condition}
                          color={getConditionColor(asset.condition)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{asset.lastMaintenance}</TableCell>
                      <TableCell>{asset.nextMaintenance}</TableCell>
                      <TableCell>{asset.assignedTo || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleDialogOpen(asset)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAsset(asset.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Asset Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAsset ? 'Edit Asset' : 'Add New Asset'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Asset Name"
            value={newAsset.name}
            onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Type"
            value={newAsset.type}
            onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            value={newAsset.location}
            onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
            margin="normal"
          />
          <TextField
            select
            fullWidth
            label="Condition"
            value={newAsset.condition}
            onChange={(e) => setNewAsset({ ...newAsset, condition: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Needs Repair">Needs Repair</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSaveAsset}
            variant="contained"
            color="primary"
            disabled={!newAsset.name || !newAsset.type || !newAsset.location}
          >
            {selectedAsset ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssetManagement; 