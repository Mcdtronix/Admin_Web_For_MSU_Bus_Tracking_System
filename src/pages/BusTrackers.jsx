import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getTrackers, addTracker, updateTracker, deleteTracker } from '../api/trackers';
import { getBuses } from '../api/buses';

const BusTrackers = () => {
  const [trackers, setTrackers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState({ trackers: true, buses: true });
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [form, setForm] = useState({
    device_id: '',
    bus: '',
    is_active: true
  });

  // Fetch all trackers
  const fetchTrackers = async () => {
    try {
      setLoading(prev => ({ ...prev, trackers: true }));
      const response = await getTrackers();
      const trackersData = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setTrackers(trackersData);
    } catch (err) {
      setError('Failed to fetch trackers');
      console.error('Error fetching trackers:', err);
    } finally {
      setLoading(prev => ({ ...prev, trackers: false }));
    }
  };

  // Fetch all buses for the dropdown
  const fetchBuses = async () => {
    try {
      setLoading(prev => ({ ...prev, buses: true }));
      const response = await getBuses();
      const busesData = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setBuses(busesData);
    } catch (err) {
      console.error('Error fetching buses:', err);
      setError('Failed to load bus list. Please try again later.');
      setBuses([]);
    } finally {
      setLoading(prev => ({ ...prev, buses: false }));
    }
  };

  useEffect(() => {
    fetchTrackers();
    fetchBuses();
  }, []);

  const handleOpen = (tracker = null) => {
    if (tracker) {
      setEditing(tracker.id);
      setForm({
        device_id: tracker.device_id,
        bus: tracker.bus || '',
        is_active: tracker.is_active
      });
    } else {
      setEditing(null);
      setForm({
        device_id: '',
        bus: '',
        is_active: true
      });
    }
    setOpen(true);
    
    // Refresh the bus list when opening the form
    fetchBuses();
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        device_id: form.device_id,
        bus: form.bus || null,
        is_active: form.is_active
      };

      if (editing) {
        await updateTracker(editing, payload);
        setSnackbar({ open: true, message: 'Tracker updated successfully', severity: 'success' });
      } else {
        await addTracker(payload);
        setSnackbar({ open: true, message: 'Tracker added successfully', severity: 'success' });
      }
      
      fetchTrackers();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      console.error('Error saving bus tracker:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tracker?')) {
      try {
        await deleteTracker(id);
        setSnackbar({ open: true, message: 'Tracker deleted successfully', severity: 'success' });
        fetchTrackers();
      } catch (err) {
        setError('Failed to delete tracker. Make sure it is not in use.');
        console.error('Error deleting tracker:', err);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading.trackers || loading.buses) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Bus Trackers</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Tracker
        </Button>
      </Box>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Device ID</TableCell>
                <TableCell>Assigned Bus</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trackers.length > 0 ? (
                trackers.map((tracker) => (
                  <TableRow key={tracker.id}>
                    <TableCell>{tracker.device_id}</TableCell>
                    <TableCell>{tracker.bus?.plate_number || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: tracker.is_active ? 'success.main' : 'error.main',
                          mr: 1
                        }}
                      />
                      {tracker.is_active ? 'Active' : 'Inactive'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpen(tracker)} color="primary" disabled={!tracker.bus}>
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(tracker.id)} 
                        color="error"
                        disabled={!tracker.bus}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No trackers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Tracker' : 'Add New Tracker'}</DialogTitle>
        <Divider />
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Device ID"
              name="device_id"
              value={form.device_id}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              disabled={!!editing}
            />
                        <FormControl fullWidth margin="normal" required>
                <InputLabel id="bus-select-label">Select Bus</InputLabel>
                <Select
                  labelId="bus-select-label"
                  id="bus-select"
                  name="bus"
                  value={form.bus || ''}
                  onChange={handleChange}
                  label="Select Bus"
                  required
                  disabled={loading.buses}
                >
                  <MenuItem value="">
                    <em>-- Select a bus --</em>
                  </MenuItem>
                  {buses.length > 0 ? (
                    buses.map((bus) => (
                      <MenuItem key={bus.id} value={bus.id}>
                        <Box display="flex" flexDirection="column">
                          <Box fontWeight="bold">
                            {bus.plate_number || `Bus ${bus.id}`} 
                            {bus.name ? ` - ${bus.name}` : ''}
                          </Box>
                          {bus.driver && (
                            <Box fontSize="0.8rem" color="text.secondary">
                              Driver: {bus.driver.full_name || bus.driver.username}
                            </Box>
                          )}
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      {loading.buses ? 'Loading buses...' : 'No buses available'}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  name="is_active"
                />
              }
              label="Active"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BusTrackers;
