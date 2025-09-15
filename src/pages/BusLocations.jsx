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
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { getLocations, addLocation, updateLocation, deleteLocation } from '../api/locations';
import { getBuses } from '../api/buses';

const BusLocations = () => {
  const [locations, setLocations] = useState([]);
  const [buses, setBuses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState({ locations: true, buses: true });
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [form, setForm] = useState({
    bus: '',
    latitude: '',
    longitude: '',
    altitude: 0,
    speed: 0,
    heading: 0,
    accuracy: 0,
    satellites: 0,
    timestamp: new Date().toISOString().slice(0, 16), // Format for datetime-local input
  });

  // Fetch all locations
  const fetchLocations = async () => {
    try {
      setLoading(prev => ({ ...prev, locations: true }));
      const response = await getLocations();
      const locationsData = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setLocations(locationsData);
    } catch (err) {
      setError('Failed to fetch locations');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(prev => ({ ...prev, locations: false }));
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
    fetchLocations();
    fetchBuses();
  }, []);

  const handleOpen = (location = null) => {
    if (location) {
      setEditing(location.id);
      setForm({
        bus: location.bus || location.bus_id || '',
        latitude: location.latitude || '',
        longitude: location.longitude || '',
        altitude: location.altitude || 0,
        speed: location.speed || 0,
        heading: location.heading || 0,
        accuracy: location.accuracy || 0,
        satellites: location.satellites || 0,
        timestamp: location.timestamp ? new Date(location.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      });
    } else {
      setEditing(null);
      setForm({
        bus: '',
        latitude: '',
        longitude: '',
        altitude: 0,
        speed: 0,
        heading: 0,
        accuracy: 0,
        satellites: 0,
        timestamp: new Date().toISOString().slice(0, 16),
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
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        bus: form.bus || null,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        altitude: form.altitude,
        speed: form.speed,
        heading: form.heading,
        accuracy: form.accuracy,
        satellites: form.satellites,
        timestamp: new Date(form.timestamp).toISOString(),
      };

      if (editing) {
        await updateLocation(editing, payload);
        setSnackbar({ open: true, message: 'Location updated successfully', severity: 'success' });
      } else {
        await addLocation(payload);
        setSnackbar({ open: true, message: 'Location added successfully', severity: 'success' });
      }
      
      fetchLocations();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      console.error('Error saving bus location:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location record?')) {
      try {
        await deleteLocation(id);
        setSnackbar({ open: true, message: 'Location deleted successfully', severity: 'success' });
        fetchLocations();
      } catch (err) {
        setError('Failed to delete location.');
        console.error('Error deleting location:', err);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCoordinate = (coord) => {
    return parseFloat(coord).toFixed(6);
  };

  if (loading.locations || loading.buses) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, md: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" gutterBottom>
          Bus Locations Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Location
        </Button>
      </Box>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bus</TableCell>
                <TableCell>Coordinates</TableCell>
                <TableCell>Speed</TableCell>
                <TableCell>Heading</TableCell>
                <TableCell>Accuracy</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.length > 0 ? (
                locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {location.bus_number || `Bus ${location.bus_id || location.id}`}
                          </Typography>
                          {location.driver_name && (
                            <Typography variant="caption" color="text.secondary">
                              {location.driver_name}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          Lat: {formatCoordinate(location.latitude)}
                        </Typography>
                        <Typography variant="body2">
                          Lng: {formatCoordinate(location.longitude)}
                        </Typography>
                        {location.altitude > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Alt: {location.altitude}m
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${location.speed} km/h`} 
                        size="small" 
                        color={location.speed > 0 ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {location.heading > 0 && (
                        <Typography variant="body2">
                          {location.heading}°
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {location.accuracy > 0 && (
                        <Typography variant="body2">
                          {location.accuracy}m
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTimestamp(location.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpen(location)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(location.id)} 
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No location records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Location' : 'Add New Location'}</DialogTitle>
        <Divider />
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Select Bus</InputLabel>
              <Select
                value={form.bus || ''}
                onChange={handleChange}
                name="bus"
                label="Select Bus"
                disabled={loading.buses}
              >
                {buses.map((bus) => (
                  <MenuItem key={bus.id} value={bus.id}>
                    {bus.bus_number} - {bus.driver_name || 'No Driver'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="Latitude"
                name="latitude"
                type="number"
                value={form.latitude}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ step: 0.000001, min: -90, max: 90 }}
              />
              <TextField
                label="Longitude"
                name="longitude"
                type="number"
                value={form.longitude}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ step: 0.000001, min: -180, max: 180 }}
              />
            </Box>

            <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
              <TextField
                label="Speed (km/h)"
                name="speed"
                type="number"
                value={form.speed}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Heading (degrees)"
                name="heading"
                type="number"
                value={form.heading}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, max: 360 }}
              />
              <TextField
                label="Altitude (m)"
                name="altitude"
                type="number"
                value={form.altitude}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Box>

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="Accuracy (m)"
                name="accuracy"
                type="number"
                value={form.accuracy}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Satellites"
                name="satellites"
                type="number"
                value={form.satellites}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, max: 32 }}
              />
            </Box>

            <TextField
              label="Timestamp"
              name="timestamp"
              type="datetime-local"
              value={form.timestamp}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BusLocations;
